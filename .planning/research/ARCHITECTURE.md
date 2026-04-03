# Architecture Patterns

**Domain:** Bedtime story generator v2.0 feature integration
**Researched:** 2026-04-03
**Confidence:** HIGH (grounded in actual codebase review + verified web sources)

---

## Current Architecture (v1.0 Shipped)

### Actual Code Flow

```
[StoryForm]
  |
  POST /api/generate {name, age, theme, duration}
  |
[/api/generate (Edge Runtime)]
  |
  client.messages.stream() -> Claude Sonnet
  |
  ReadableStream pipes raw text chunks to client
  |                    (NO safety validation in this path)
  |
[StoryForm]
  |
  await res.text()   <-- buffers entire stream client-side
  |
  sessionStorage.setItem('nightlight-story', JSON.stringify({story, name, theme}))
  |
  window.location.href = '/story'
  |
[ReadingView]
  |
  reads sessionStorage on mount -> renders paragraphs
```

### Key Observations from Code Review

1. **`/api/generate/route.ts` streams raw Sonnet output with NO Haiku validation.** The route uses `client.messages.stream()` and pipes `text_delta` events directly to the client via a `ReadableStream`. The `generateSafeStory()` function in `safety.ts` (which does Haiku validation + 3-attempt retry) exists and is tested but is NOT called by the route handler.

2. **`StoryForm` buffers everything anyway.** Despite the server streaming, the client calls `await res.text()` which buffers the entire response before storing to sessionStorage and navigating. There is zero progressive display in v1.0.

3. **`ReadingView` is a one-shot render.** It reads from sessionStorage on mount, splits by `\n\n`, and renders all paragraphs immediately. No animation, no progressive reveal.

4. **Data shape in sessionStorage:** `{story: string, name: string, theme: string}` -- notably missing `age` and `duration`.

5. **Upstash Redis** is used only for rate limiting (10 req/hr/IP) at `/api/generate`. The `@upstash/redis` package is already installed.

6. **Edge Runtime** is declared on the generate route. The Anthropic SDK is confirmed Edge-compatible.

### Critical Finding: Safety Gap

The v1.0 route streams from Sonnet but does NOT run Haiku validation. The `generateSafeStory` function with its 3-attempt loop uses `client.messages.create` (non-streaming, buffered). The safety guarantee documented in PROJECT.md ("all stories pass safety validation before display") is NOT enforced at the API level -- it relies on the unverified assumption that Sonnet's own alignment is sufficient.

**This must be reconciled as the first v2.0 task.** Restoring safety validation is prerequisite to all other features.

---

## Streaming + Safety: The Central Design Decision

### The Constraint

PROJECT.md states: "Safety is non-negotiable: the app must never surface a story with any doubt about its appropriateness." This means the Haiku classifier must see the COMPLETE story text before any content reaches the user's screen.

### Recommended Approach: Server-Side Buffer-Validate-Restream

Generate the full story server-side, validate with Haiku, then re-stream the validated text to the client in chunks. The client navigates to the reading view immediately and renders text progressively as it arrives from the re-stream.

```
[Client POSTs /api/generate]
         |
[Server: rate limit check, input validation]
         |
[Server: generateSafeStory() -- Sonnet creates full story into buffer]
         |  (~8-12 seconds for 10-min story)
[Server: Haiku validates full buffered story]
         |  (~1-2 seconds)
    +----+----+
  UNSAFE     SAFE
    |          |
[retry up   [Server re-streams validated text to client
 to 2x]      via ReadableStream in paragraph-sized chunks]
                |
          [Client renders paragraphs progressively
           with fade-in animation as they arrive]
```

### Why Not Other Approaches

| Approach | Why Rejected |
|----------|-------------|
| Stream directly, validate in parallel, abort if unsafe | A parent may have already read unsafe content aloud. One flash of inappropriate text destroys trust permanently. |
| Stream directly with Claude's built-in refusal mechanism | Claude's streaming refusals (stop_reason: "refusal") only catch Claude's own policy violations, not the custom Haiku bedtime-safety classifier which has stricter criteria (no mild peril, no friendly monsters, etc.). |
| Generate a safe summary first, then swap in full story | Doubles API calls, adds cost, and the visible content swap mid-read is jarring. |
| Client-only progressive reveal (no server re-stream) | Viable alternative -- buffer full JSON response, then animate reveal client-side. Simpler than server re-streaming but means the entire response must arrive before any text appears. See "Alternative" below. |

### Viable Alternative: Full Buffer + Client-Side Progressive Reveal

If server re-streaming adds too much complexity, a simpler approach works:

1. `/api/generate` calls `generateSafeStory()`, returns complete validated story as JSON
2. Client navigates to `/story` immediately with a loading animation
3. Once the full JSON response arrives, `TextRevealer` component animates paragraph-by-paragraph reveal

**Tradeoff:** The first visible word appears only after generation + validation completes (~10-15 seconds). But the reading EXPERIENCE feels progressive because text fades in paragraph by paragraph. For a bedtime context where the parent is settling the child, 10-15 seconds with a warm loading animation ("Weaving a tale about dragons for Emma...") is acceptable.

**Recommendation:** Start with this simpler approach. The warm loading state already exists (`LoadingOverlay` component). Server re-streaming is an optimization for later if users report the wait feels too long.

---

## Runtime Decision: Edge vs Node.js

### The Problem

`generateSafeStory()` runs synchronous buffered API calls: Sonnet generation (~8-12s) + Haiku validation (~1-2s) + potential retries. Total worst case with 2 retries: ~30-40 seconds. Edge Runtime on Vercel has a 30-second default timeout.

The v1.0 route used streaming to keep the connection alive (each chunk resets the timeout), but `generateSafeStory()` does NOT stream -- it buffers internally.

### Recommendation: Switch to Node.js Runtime with maxDuration

```typescript
// /api/generate/route.ts
export const runtime = 'nodejs'  // was 'edge'
export const maxDuration = 60    // seconds -- covers worst-case retry scenario
```

**Rationale:**
- Node.js runtime on Vercel Pro supports `maxDuration` up to 300 seconds
- The original reason for Edge was to avoid timeout issues with streaming -- but we are now buffering, so the streaming advantage is gone
- The Anthropic SDK works on both runtimes
- Upstash Redis uses HTTP/REST, works on both runtimes
- No Edge-specific APIs are used in the current route

**Keep Edge Runtime for:** `/api/illustrate` and `/api/share` which are fast, simple proxy routes that benefit from Edge latency.

---

## New Routes and Pages

| Route | Method | Runtime | Purpose | Input | Output |
|-------|--------|---------|---------|-------|--------|
| `/api/generate` | POST | **Node.js** (MODIFIED) | Generate + validate story | `{name, age, theme, duration}` | JSON `{story, metadata}` |
| `/api/illustrate` | POST | Edge | AI image generation proxy | `{excerpt, theme, sceneIndex}` | JSON `{url}` |
| `/api/share` | POST | Edge | Store story in Redis with TTL | `{story, name, theme, duration}` | JSON `{id, shareUrl}` |
| `/api/share/[id]` | GET | Edge | Retrieve shared story | path param | JSON `{story, name, theme, ...}` or 404 |

| Page | Type | Purpose |
|------|------|---------|
| `/story/[id]` | Server Component | Shared story reading view (fetches from Redis) |
| `/library` | Client Component | Story library listing from IndexedDB |

---

## Component Architecture

### Modified Components

| Component | Current | v2.0 Changes |
|-----------|---------|-------------|
| `story-form.tsx` | Fetches stream, buffers with `res.text()`, saves to sessionStorage, navigates | Fetches JSON response, saves to sessionStorage AND IndexedDB, navigates to `/story` |
| `reading-view.tsx` | Reads sessionStorage, renders all paragraphs at once | Adds: progressive text reveal, wake lock hook, illustration slots, narration controls, share button. Must handle three modes: fresh story (from sessionStorage), library story (from IndexedDB), shared story (from props/Redis) |
| `/api/generate/route.ts` | Streams raw Sonnet output, no validation | Calls `generateSafeStory()`, returns JSON with validated story. Switches to Node.js runtime |

### New Components

| Component | Purpose | Dependencies |
|-----------|---------|-------------|
| `text-revealer.tsx` | Paragraph-by-paragraph fade-in animation | Receives full story text as prop |
| `illustration-slot.tsx` | Lazy AI illustration with IntersectionObserver | `/api/illustrate`, shows placeholder until image loads |
| `narration-controls.tsx` | Play/pause TTS, voice picker, sentence highlighting | Web Speech API (v2.0), upgradeable to OpenAI TTS (v3.0) |
| `share-button.tsx` | Generate shareable link, copy to clipboard | `/api/share` |
| `story-card.tsx` | Card component for library listing | `story-store.ts` |

### New Library Files

| File | Purpose |
|------|---------|
| `lib/story-store.ts` | IndexedDB CRUD via `idb-keyval` (~600B). Save, list, delete, get stories |
| `lib/wake-lock.ts` | `useWakeLock()` hook -- acquire on mount, release on unmount, re-acquire on visibility change |
| `lib/share.ts` | nanoid generation, Redis key formatting, SharedStory type, URL helpers |
| `lib/narration.ts` | Web Speech API wrapper: utterance creation, voice filtering, sentence boundary detection |
| `lib/illustration.ts` | Illustration prompt builder, paragraph-to-scene-description mapper, insertion point logic |

---

## Data Flow: Each Feature

### 1. Progressive Story Generation (modified flow)

```
StoryForm submits POST /api/generate {name, age, theme, duration}
    |
/api/generate calls generateSafeStory()
    |  Sonnet generates -> Haiku validates -> retry if unsafe
    |
Returns JSON: {
  story: string,
  metadata: { name, theme, age, duration, createdAt }
}
    |
StoryForm receives JSON:
    |-- saves to sessionStorage (for immediate reading)
    |-- saves to IndexedDB via story-store.ts (for library)
    |-- navigates to /story
    |
ReadingView:
    |-- reads from sessionStorage
    |-- TextRevealer animates paragraph-by-paragraph fade-in
    |-- useWakeLock() keeps screen on
```

### 2. Screen Wake Lock

```
ReadingView mounts
    |
useWakeLock() hook:
    |-- navigator.wakeLock.request('screen')
    |-- document.addEventListener('visibilitychange', reacquire)
    |
ReadingView unmounts or user navigates away
    |
useWakeLock() cleanup:
    |-- sentinel.release()
    |-- removeEventListener
```

Screen Wake Lock API is supported in all major browsers since early 2025 (Chrome, Firefox, Safari, Edge). HTTPS required (Vercel provides this). No polyfill needed. Silent failure for unsupported contexts.

### 3. AI Scene Illustrations

```
ReadingView identifies 2-3 insertion points (story split into thirds by paragraph count)
    |
IllustrationSlot renders at each insertion point with themed placeholder
    |
IntersectionObserver fires when slot enters viewport
    |
POST /api/illustrate {
  excerpt: "relevant paragraph text",
  theme: "Space & Stars",
  sceneIndex: 1
}
    |
/api/illustrate:
    |-- Builds safe image prompt (watercolor children's book style, no real faces)
    |-- Calls OpenAI Images API (gpt-image-1-mini at $0.005-0.052/image)
    |-- Returns {url: "https://..."}
    |
IllustrationSlot fades in the image
    |
Image URL cached in the story's IndexedDB record for re-reads
```

**Cost control:** Use `gpt-image-1-mini` (50-70% cheaper than flagship). Portrait aspect ratio (1024x1536) for mobile reading. Separate rate limit: 6 images/hr/IP. Graceful fallback if generation fails (story remains fully readable).

### 4. TTS Narration

```
NarrationControls appear as floating bar on ReadingView
    |
User taps Play:
    |-- Web Speech API: new SpeechSynthesisUtterance(paragraphText)
    |-- Utterance.voice = selected voice from picker
    |-- speechSynthesis.speak(utterance)
    |
Sentence highlighting:
    |-- utterance.onboundary event marks current word/sentence
    |-- ReadingView highlights the current paragraph
    |
Paragraph advance:
    |-- utterance.onend -> load next paragraph -> speak
    |
User taps Pause:
    |-- speechSynthesis.pause()
```

**v2.0: Web Speech API only.** Free, no server cost, works offline. Voice quality varies by device but is "good enough" for initial launch. Voice picker shows system voices filtered by language.

**v3.0 upgrade path:** Replace Web Speech API with POST `/api/tts` proxying to OpenAI TTS (`gpt-4o-mini-tts`). Requires text chunking (4096-char limit per request), audio streaming, and `OPENAI_API_KEY` env var. The NarrationControls UI stays the same -- only the audio source changes.

### 5. Story Library

```
Story saved to IndexedDB on generation (from StoryForm):
    |
story-store.ts: set(storyId, {story, name, theme, age, duration, createdAt})
    |
/library page:
    |-- story-store.ts: entries() -> list all stories
    |-- Renders StoryCard for each: title, date, duration, theme icon, first-line preview
    |
User taps a card:
    |-- Loads story into sessionStorage
    |-- Navigates to /story (reuses ReadingView)
    |
User deletes a story:
    |-- Confirm dialog
    |-- story-store.ts: del(storyId)
```

**Storage choice: IndexedDB via `idb-keyval`.**
- localStorage: 5MB limit (~20-30 stories), synchronous, blocks main thread. Not enough.
- IndexedDB: Effectively unlimited, async, can store illustration blobs too.
- `idb-keyval` library: ~600 bytes, Promise-based get/set/del/entries. No need for heavier libraries like Dexie.

**Safari caveat:** Safari may evict IndexedDB data if no user interaction for 7 days. Mitigate with `navigator.storage.persist()` request and clear "saved on this device" labeling.

### 6. Shareable Links

```
User taps ShareButton on ReadingView:
    |
POST /api/share {story, name, theme, duration}
    |
/api/share:
    |-- Generate nanoid(10) as ID
    |-- redis.set("story:{id}", JSON.stringify({story, name, theme, duration, createdAt}), {ex: 7776000})
    |       (90-day TTL)
    |-- Return {id, shareUrl: `https://bed-time-nu.vercel.app/story/${id}`}
    |
ShareButton copies URL to clipboard, shows confirmation
    |
Recipient opens /story/{id}:
    |
/story/[id]/page.tsx (Server Component):
    |-- Reads Redis directly (no API round-trip): redis.get("story:{id}")
    |-- If found: passes story data as props to ReadingView (static mode, no animation)
    |-- If expired/missing: renders "This story has expired" with CTA to create a new one
    |-- generateMetadata() sets OG tags: title="{name}'s {theme} Story", description, theme image
```

**Redis storage details:**
- Key: `story:{nanoid(10)}` -- URL-safe, short
- Value: JSON string ~2-5KB per story
- TTL: 90 days (7,776,000 seconds) -- covers "grandparent reads it weeks later" use case
- No TTL refresh on read
- Uses existing `@upstash/redis` dependency and Upstash instance
- `nanoid` uses `crypto.getRandomValues()` -- Edge Runtime compatible

---

## File Structure Changes

```
src/
  app/
    api/
      generate/route.ts          # MODIFIED: use generateSafeStory(), return JSON, Node.js runtime
      illustrate/route.ts        # NEW: AI image generation proxy (Edge)
      share/route.ts             # NEW: POST to save story to Redis (Edge)
      share/[id]/route.ts        # NEW: GET to retrieve shared story (Edge)
    story/
      page.tsx                   # EXISTING: session-based reading (minor prop changes)
      [id]/page.tsx              # NEW: shared story page (server component -> Redis)
    library/
      page.tsx                   # NEW: story library listing
    layout.tsx                   # EXISTING: may need nav link to /library
  components/
    reading-view.tsx             # MODIFIED: three modes, wake lock, illustration slots, narration
    text-revealer.tsx            # NEW: progressive paragraph reveal animation
    illustration-slot.tsx        # NEW: lazy AI illustration with IntersectionObserver
    narration-controls.tsx       # NEW: TTS play/pause/voice picker
    share-button.tsx             # NEW: generate share link, copy to clipboard
    story-card.tsx               # NEW: library card component
    story-form.tsx               # MODIFIED: save to IndexedDB, updated response handling
    loading-overlay.tsx          # EXISTING: may update messaging
  lib/
    safety.ts                    # EXISTING: generateSafeStory (NOW USED by route)
    story-store.ts               # NEW: IndexedDB CRUD via idb-keyval
    wake-lock.ts                 # NEW: useWakeLock hook
    illustration.ts              # NEW: prompt builder, insertion point logic
    share.ts                     # NEW: nanoid, Redis key format, SharedStory type
    narration.ts                 # NEW: Web Speech API wrapper
    schemas.ts                   # EXISTING: may extend with StoryMetadata type
    prompts.ts                   # EXISTING: may add illustration prompt builder
    rate-limit.ts                # EXISTING: add separate limits for /illustrate, /share
```

---

## Patterns to Follow

### Pattern 1: ReadingView Multi-Mode

ReadingView must handle three distinct data sources:

| Mode | Source | Behavior |
|------|--------|----------|
| Fresh story | sessionStorage (after generation) | Progressive text reveal animation, wake lock |
| Library re-read | sessionStorage (loaded from IndexedDB) | Full static render, wake lock |
| Shared story | Props from server component | Full static render, wake lock, "create your own" CTA |

Use a prop like `mode: 'fresh' | 'static'` and `storyData` passed directly for shared stories vs read from sessionStorage for the other two modes.

### Pattern 2: Hook-Based Wake Lock

```typescript
// lib/wake-lock.ts
export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null
    async function acquire() {
      try {
        if ('wakeLock' in navigator) {
          sentinel = await navigator.wakeLock.request('screen')
        }
      } catch { /* silent fail -- user may have denied permission */ }
    }
    acquire()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      sentinel?.release()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])
}
```

Re-acquire on visibility change is required by the spec -- the lock is released when the tab becomes hidden.

### Pattern 3: Lazy Illustration via IntersectionObserver

Only request AI illustrations when the user scrolls to that section. Avoids unnecessary API cost, does not block initial reading, and images appear naturally as the parent reads.

### Pattern 4: IndexedDB via idb-keyval

Simple Promise-based get/set/del for story library. No need for Dexie or raw IndexedDB API complexity.

### Pattern 5: Existing Redis Instance for Share Storage

No new infrastructure. The Upstash Redis instance already configured for rate limiting can store shared stories with TTL. The `@upstash/redis` package is already installed.

---

## Anti-Patterns to Avoid

### 1. Server-Side Streaming with Post-hoc Validation

Streaming tokens to the client while running validation afterward. If validation fails after the user has seen partial content, a parent may have already read unsafe text aloud to their child.

**Instead:** Buffer-validate-then-deliver. Generate and validate on server. Deliver completed story to client.

### 2. localStorage for Story Library

5MB limit, synchronous API blocks main thread, no structured querying.

**Instead:** IndexedDB via idb-keyval.

### 3. Server-Side TTS for v2.0

OpenAI TTS or ElevenLabs adds $0.01-0.10 per story narration, requires audio streaming infrastructure, and raises voice quality expectations.

**Instead:** Web Speech API for v2.0 (free, zero infra). Evaluate paid TTS for v3.0.

### 4. Eager Illustration Generation

Generating all 2-3 illustrations at story creation time adds 10-30 seconds to wait time and costs money for images the user may never scroll to.

**Instead:** Lazy-load via IntersectionObserver. Generate only when the user scrolls to that section.

### 5. Using `openai` npm Package on Edge Runtime

The `openai` npm package may have Node.js-only dependencies. For Edge Runtime routes (`/api/illustrate`, `/api/share`), use raw `fetch()` to OpenAI API endpoints.

**For Node.js routes** (`/api/generate`): the `openai` package is fine, but `generateSafeStory()` only uses the Anthropic SDK so this is not relevant there.

---

## Build Order (Dependency-Aware)

```
Phase 1: Restore Safety + Progressive Display
    |  - Switch /api/generate to Node.js runtime + generateSafeStory()
    |  - Return JSON instead of raw stream
    |  - Update StoryForm to handle JSON response
    |  - Add TextRevealer for progressive paragraph fade-in
    |  - Extend sessionStorage data shape to include metadata
    |
    v
Phase 2: Screen Wake Lock
    |  - useWakeLock() hook in ReadingView
    |  - No server changes, no dependencies on Phase 1 data shape
    |  - Very small scope (~1 day)
    |
    v
Phase 3: Story Library
    |  - Add idb-keyval, create story-store.ts
    |  - Save stories on generation in StoryForm
    |  - Create /library page with StoryCard components
    |  - ReadingView accepts library-loaded stories
    |
    v
Phase 4: Shareable Links
    |  - Add nanoid, create /api/share route
    |  - Create /story/[id] server component page
    |  - Add ShareButton to ReadingView
    |  - OG meta tags via generateMetadata()
    |  - Depends on: stable story data shape from Phase 3
    |
    v
Phase 5: TTS Narration
    |  - Web Speech API wrapper in narration.ts
    |  - NarrationControls component in ReadingView
    |  - Sentence/paragraph highlighting
    |  - Voice picker (filtered system voices)
    |  - Independent of Phases 3-4 but benefits from stable ReadingView
    |
    v
Phase 6: AI Scene Illustrations
       - Add /api/illustrate route (Edge, raw fetch to OpenAI)
       - Add OPENAI_API_KEY env var
       - IllustrationSlot with IntersectionObserver
       - Illustration prompt builder
       - Cache generated image URLs in IndexedDB
       - Most complex, most expensive -- build last
```

**Ordering rationale:**
- Phase 1 first because safety validation is currently missing and is the foundation
- Phase 2 is tiny and high-value, no dependencies
- Phase 3 before Phase 4 because the story data schema from the library informs the Redis schema for sharing
- Phase 5 after the reading view is stable from Phases 1-4
- Phase 6 last because it introduces a new external API dependency (OpenAI), has the highest per-use cost, and is most complex

---

## Scalability Considerations

| Concern | Current (v1.0) | v2.0 Impact | Mitigation |
|---------|----------------|-------------|------------|
| API cost per story | ~$0.01 (Sonnet stream) | +$0.005 (Haiku validation) = ~$0.015 base | Acceptable; Haiku is very cheap |
| Illustration cost | N/A | $0.005-0.052/image x 2-3 = $0.01-0.16/story | Lazy loading, gpt-image-1-mini, cap at 3 |
| Redis storage | Rate limit keys only | +2-5KB per shared story | 90-day TTL auto-cleanup |
| Function duration | ~5-15s (streaming) | ~10-20s (buffer + validate) | Node.js runtime, maxDuration=60 |
| Client storage | sessionStorage (~5KB) | IndexedDB (many stories + illustration URLs) | Persist API, offer "clear library" |
| Rate limiting | 10 req/hr for /generate | + /illustrate (6/hr), /share (10/hr) | Separate Upstash limiters per route |

---

## Critical Risk: Edge Function Timeout (RESOLVED)

The switch from Edge to Node.js runtime for `/api/generate` resolves the timeout concern. Node.js runtime on Vercel supports `maxDuration` configuration (up to 300s on Pro plan). The 60-second limit comfortably covers generation (~12s) + validation (~2s) + two retries (~28s additional) = ~42s worst case.

New Edge Runtime routes (`/api/illustrate`, `/api/share`) are simple proxy/CRUD operations that complete well within the 30-second Edge limit.

---

## Sources

- Screen Wake Lock API: https://web.dev/blog/screen-wake-lock-supported-in-all-browsers (all major browsers since early 2025)
- Wake Lock MDN reference: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- Web Speech API SpeechSynthesis: https://caniuse.com/speech-synthesis (Chrome, Edge, Safari supported)
- Web Speech API cross-browser issues: https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1
- OpenAI Images API pricing: https://platform.openai.com/docs/pricing (gpt-image-1-mini $0.005-0.052/image)
- IndexedDB vs localStorage: https://dev.to/tene/localstorage-vs-indexeddb-javascript-guide-storage-limits-best-practices-fl5
- Next.js streaming guide: https://nextjs.org/docs/app/guides/streaming
- Anthropic streaming refusals: https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals
- Upstash Redis TTL: https://upstash.com/docs/redis/sdks/py/commands/generic/ttl
- Actual codebase: `src/app/api/generate/route.ts`, `src/lib/safety.ts`, `src/components/story-form.tsx`, `src/components/reading-view.tsx`

---

*Architecture research for: Nightlight Tales v2.0*
*Updated: 2026-04-03 (supersedes 2026-04-01 version)*
