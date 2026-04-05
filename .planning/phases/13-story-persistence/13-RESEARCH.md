# Phase 13: Story Persistence - Research

**Researched:** 2026-04-05
**Domain:** IndexedDB persistence, Upstash Redis share links, Next.js dynamic routes
**Confidence:** HIGH

## Summary

Phase 13 adds three capabilities: (1) auto-saving stories to device-local IndexedDB via `idb-keyval`, (2) re-reading saved stories from a library page, and (3) sharing stories via expiring Upstash Redis links. The project already has `@upstash/redis` installed and configured for rate limiting, so share link storage reuses the same connection pattern. `idb-keyval` is a new dependency (573 bytes for the full API) that wraps IndexedDB with a simple promise-based key-value interface.

The existing `ReadingView` component has clear integration points: `isComplete` state for triggering auto-save, and `sessionStorage('nightlight-story')` for the re-read data handoff pattern. The share link flow requires two new API routes (create + retrieve) and one new dynamic route (`/story/[shareId]`) for rendering shared stories server-side.

**Primary recommendation:** Use `idb-keyval` with a custom store named `nightlight-library` for all local persistence. Use `@upstash/redis` `.set()` with `{ ex: 604800 }` (7 days in seconds) for share link TTL. Generate share IDs with `crypto.randomUUID()` (available in Node.js and all modern browsers). Keep the library page as a simple client component that reads from IndexedDB on mount.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Library is accessible via a persistent button/link on the home screen (story form page). Always visible, no new nav bar needed.
- **D-02:** Library route: a new page (e.g. `/library`) accessible from the home screen button.
- **D-03:** Each saved story card shows: title (e.g. "Ella's Dragon Story"), theme chip, and date saved. Compact and scannable -- no paragraph preview.
- **D-04:** User can delete stories from the library via swipe or long-press gesture (standard mobile pattern).
- **D-05:** Story auto-saves to IndexedDB (idb-keyval) when streaming completes. No user action required. This hooks into the existing "stream complete" moment in ReadingView (where isComplete becomes true).
- **D-06:** No save confirmation toast or prompt needed -- auto-save is silent.
- **D-07:** idb-keyval is specified in REQUIREMENTS.md (PERSIST-01) -- use it directly. Do not use a different IndexedDB wrapper.
- **D-08:** Share is triggered from a button on the library card (not from the reading view). Clicking share generates a link and copies it to the clipboard.
- **D-09:** Share links have a 7-day TTL. Upstash Redis (already installed: @upstash/redis) handles storage with TTL-based expiry.
- **D-10:** Share link route: `/story/[shareId]` -- recipient sees the full ReadingView with the shared story. Same dark navy reading experience, no generation required.
- **D-11:** When a share link has expired (or shareId not found in Redis), show a friendly expired page: "This story has expired. Create your own at Nightlight Tales." with a link to the home screen. Not a 404.
- **D-12:** Re-reading a saved story uses the same `/story` route and ReadingView. The library navigates to `/story` with the story pre-populated in sessionStorage ('nightlight-story' key). ReadingView already detects a completed story in sessionStorage and renders immediately without streaming.
- **D-13:** No streaming simulation on re-reads -- story renders immediately (already how ReadingView handles the nightlight-story sessionStorage key).
- **D-14:** At the end of a re-read, show two buttons: NEW STORY (existing) and BACK TO LIBRARY (new). Both appear in the isComplete section of ReadingView.

### Claude's Discretion
- Library page layout (list vs. grid for story cards) -- pick what works best for the card content (title + theme chip + date)
- Empty library state -- design a friendly empty state for first-time library visitors
- Exact swipe/long-press delete UX implementation -- use whatever pattern is most natural for React/Next.js on mobile
- Share button placement on library card (icon vs. labeled button)
- Whether to add a brief "Copied!" feedback after clicking share

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERSIST-01 | User can access a library of previously generated stories saved on their device (IndexedDB via idb-keyval) | idb-keyval v6.2.2 API verified; custom store pattern; auto-save on stream completion via isComplete hook |
| PERSIST-02 | User can re-read any saved story from the library in full reading mode | sessionStorage handoff pattern already works in ReadingView; library sets 'nightlight-story' key then navigates to /story |
| PERSIST-03 | User can share a story via a unique link that expires after a set time (Upstash Redis, TTL-based) | @upstash/redis 1.37.0 already installed; redis.set(key, value, { ex: 604800 }) for 7-day TTL; /story/[shareId] dynamic route |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| idb-keyval | 6.2.2 | IndexedDB key-value wrapper | 573 bytes total, promise-based, specified in REQUIREMENTS.md |
| @upstash/redis | 1.37.0 | Share link storage with TTL | Already installed for rate limiting; REST-based Redis, no connection management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next (dynamic routes) | 16.2.1 | `/story/[shareId]` route | Share link rendering -- server component fetches from Redis |
| crypto (built-in) | Node.js built-in | UUID generation for share IDs | `crypto.randomUUID()` -- no additional dependency needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| idb-keyval | Dexie.js | Dexie is more powerful (queries, indexes) but far heavier; idb-keyval is specified in requirements |
| idb-keyval | Raw IndexedDB | No benefit; idb-keyval is 573 bytes and handles the transaction boilerplate |
| crypto.randomUUID() | nanoid | nanoid is shorter IDs but adds a dependency; UUIDs are fine for share links |

**Installation:**
```bash
npm install idb-keyval
```

**Version verification:** idb-keyval 6.2.2 confirmed via `npm view` on 2026-04-05. @upstash/redis 1.37.0 already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── library/
│   │   └── page.tsx           # Library page (client component)
│   ├── story/
│   │   ├── page.tsx           # Existing story page (unchanged)
│   │   └── [shareId]/
│   │       └── page.tsx       # Shared story page (server component)
│   └── api/
│       └── share/
│           └── route.ts       # POST: create share link
├── components/
│   ├── reading-view.tsx       # Modified: auto-save + BACK TO LIBRARY button
│   ├── library-view.tsx       # New: library UI with story cards
│   └── story-card.tsx         # New: individual story card component
└── lib/
    ├── story-store.ts         # New: idb-keyval wrapper for story CRUD
    └── redis.ts               # New: shared Redis client (extracted from rate-limit.ts pattern)
```

### Pattern 1: idb-keyval Custom Store
**What:** Create a dedicated IndexedDB database/store for story data, separate from any browser defaults.
**When to use:** Always -- isolates story data from other IndexedDB usage.
**Example:**
```typescript
// Source: https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md
import { get, set, del, keys, createStore } from 'idb-keyval'

const storyStore = createStore('nightlight-library', 'stories')

// All operations pass the custom store as the last argument
await set('story-id', storyData, storyStore)
const story = await get('story-id', storyStore)
await del('story-id', storyStore)
const allKeys = await keys(storyStore)
```

### Pattern 2: Story Data Shape
**What:** Consistent data structure stored in IndexedDB for each story.
**When to use:** Every save and read operation.
**Example:**
```typescript
interface SavedStory {
  id: string           // crypto.randomUUID()
  name: string         // Child's name
  theme: string        // Theme slug (e.g. "dragons")
  story: string        // Full story text (paragraphs joined with \n\n)
  savedAt: number      // Date.now() timestamp
}
```

### Pattern 3: Auto-Save on Stream Completion
**What:** Hook into ReadingView's `isComplete` transition to persist to IndexedDB.
**When to use:** When streaming finishes (the same moment `sessionStorage('nightlight-story')` is set).
**Example:**
```typescript
// Inside ReadingView, after setParagraphs and setIsComplete(true):
useEffect(() => {
  if (!isComplete || !storyMeta) return
  const storyText = paragraphs.join('\n\n')
  // Save to IndexedDB (fire-and-forget, silent per D-06)
  saveStory({
    id: crypto.randomUUID(),
    name: storyMeta.name,
    theme: storyMeta.theme,
    story: storyText,
    savedAt: Date.now(),
  }).catch(() => {}) // Silent failure
}, [isComplete])
```

### Pattern 4: Re-Read via sessionStorage Handoff
**What:** Library populates `sessionStorage('nightlight-story')` with saved story data, then navigates to `/story`. ReadingView already handles this case (lines 38-48 of reading-view.tsx).
**When to use:** When user taps a saved story in the library.
**Example:**
```typescript
function handleReRead(story: SavedStory) {
  sessionStorage.setItem('nightlight-story', JSON.stringify({
    story: story.story,
    name: story.name,
    theme: story.theme,
  }))
  window.location.href = '/story'
}
```

### Pattern 5: Share Link API Route
**What:** POST endpoint that stores story in Redis with 7-day TTL, returns the share ID.
**When to use:** When user clicks share on a library card.
**Example:**
```typescript
// src/app/api/share/route.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function POST(req: Request) {
  const { story, name, theme } = await req.json()
  const shareId = crypto.randomUUID()
  
  await redis.set(`share:${shareId}`, JSON.stringify({ story, name, theme }), {
    ex: 604800, // 7 days in seconds
  })
  
  return Response.json({ shareId })
}
```

### Pattern 6: Shared Story Dynamic Route (Server Component)
**What:** `/story/[shareId]` fetches from Redis server-side, renders ReadingView with pre-populated data.
**When to use:** When someone opens a share link.
**Example:**
```typescript
// src/app/story/[shareId]/page.tsx
import { Redis } from '@upstash/redis'
import { notFound } from 'next/navigation'

const redis = Redis.fromEnv()

export default async function SharedStoryPage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const data = await redis.get<string>(`share:${shareId}`)
  
  if (!data) {
    // Render expired/not-found page (not a 404 per D-11)
    return <ExpiredStoryView />
  }
  
  const story = typeof data === 'string' ? JSON.parse(data) : data
  // Pass story data to a client component that renders ReadingView
  return <SharedReadingView story={story} />
}
```

### Anti-Patterns to Avoid
- **Storing paragraphs as an array in IndexedDB:** Store as a single `\n\n`-joined string (matches `sessionStorage` format). Split on read in the component.
- **Using `router.push('/story')` for re-reads:** The existing pattern uses `window.location.href` for navigation to `/story` (see story-form.tsx line 55). Stick with this for consistency -- it ensures sessionStorage is read fresh on mount.
- **Fetching share link data client-side:** Use a server component for `/story/[shareId]` so the data is fetched server-side. This avoids a loading spinner and works better for link previews/SEO.
- **Bypassing Redis for share links by encoding story in URL:** Stories are too large for URL parameters. Redis is the correct approach.
- **Adding Edge runtime to share routes:** The project removed Edge runtime in Phase 12 (commit 7e0b88d) because nested function calls break. Keep Node.js runtime.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB transactions | Raw IndexedDB open/transaction/objectStore | idb-keyval `get`/`set`/`del`/`keys` | IndexedDB API is callback-heavy and error-prone; idb-keyval is 573 bytes |
| UUID generation | Custom random string generator | `crypto.randomUUID()` | Built into Node.js and browsers; RFC 4122 compliant; no collisions |
| TTL-based expiry | Custom timestamp checking + cleanup jobs | Upstash Redis `set` with `{ ex }` | Redis handles expiry natively; no cron needed |
| Clipboard copy | Custom clipboard fallback chains | `navigator.clipboard.writeText()` | Supported in all modern browsers; falls back gracefully |

**Key insight:** Every "hard" problem in this phase (IndexedDB transactions, TTL expiry, unique ID generation) has a trivial standard solution. The implementation complexity is in UI/UX wiring, not data plumbing.

## Common Pitfalls

### Pitfall 1: idb-keyval Import in Server Components
**What goes wrong:** Importing idb-keyval in a server component causes build failure because IndexedDB is browser-only.
**Why it happens:** Next.js server components run in Node.js where `indexedDB` is undefined.
**How to avoid:** Only import idb-keyval in files marked `'use client'` or in a `lib/story-store.ts` file that is only imported by client components.
**Warning signs:** Build error mentioning `indexedDB is not defined`.

### Pitfall 2: Duplicate Saves on Re-Render
**What goes wrong:** The auto-save `useEffect` fires multiple times, creating duplicate entries.
**Why it happens:** React strict mode double-invokes effects in development.
**How to avoid:** Use the story ID as the IndexedDB key (not an auto-incrementing counter). `set()` with the same key is idempotent. Alternatively, check if a story with the same content already exists before saving, or use a ref to track "already saved."
**Warning signs:** Library shows the same story twice.

### Pitfall 3: Share Link Fails Without Upstash Credentials
**What goes wrong:** Share button calls API route, which fails because `UPSTASH_REDIS_REST_URL` is not set in local dev.
**Why it happens:** Same issue as rate limiting -- Upstash env vars are only on deployed environments.
**How to avoid:** Follow the same pattern as `rate-limit.ts`: check for env vars, return a graceful fallback. For share, this could mean returning a mock shareId that works locally but won't persist.
**Warning signs:** 500 error on share button click in local development.

### Pitfall 4: sessionStorage Collision Between Fresh and Re-Read Stories
**What goes wrong:** User generates a story (sets `nightlight-story` in sessionStorage), then opens library and re-reads a different story (overwrites `nightlight-story`). If they go back, the wrong story shows.
**Why it happens:** `sessionStorage` key is shared for both flows.
**How to avoid:** This is actually fine for the current UX -- `nightlight-story` is meant to hold "the story currently being viewed." Each navigation to `/story` reads it fresh. The key is cleared when streaming starts (`nightlight-params` replaces it). No conflict in practice.

### Pitfall 5: Next.js 15+ Async Params
**What goes wrong:** `params` in dynamic routes is now a Promise in Next.js 15+.
**Why it happens:** Next.js 15 changed `params` to be async.
**How to avoid:** Always `await params` in server components: `const { shareId } = await params`.
**Warning signs:** TypeScript error about params being a Promise.

### Pitfall 6: Large Story Payloads in Redis
**What goes wrong:** Very long stories hit Redis value size limits or create slow reads.
**Why it happens:** A full story with metadata could be several KB.
**How to avoid:** Not a real concern -- Upstash Redis supports values up to 1MB. A bedtime story is typically 2-5KB. No compression needed.

## Code Examples

### Complete idb-keyval Story Store Module
```typescript
// src/lib/story-store.ts
// Source: https://github.com/jakearchibald/idb-keyval
import { get, set, del, entries, createStore } from 'idb-keyval'

const storyStore = createStore('nightlight-library', 'stories')

export interface SavedStory {
  id: string
  name: string
  theme: string
  story: string
  savedAt: number
}

export async function saveStory(story: SavedStory): Promise<void> {
  await set(story.id, story, storyStore)
}

export async function getStory(id: string): Promise<SavedStory | undefined> {
  return get(id, storyStore)
}

export async function deleteStory(id: string): Promise<void> {
  await del(id, storyStore)
}

export async function getAllStories(): Promise<SavedStory[]> {
  const all = await entries(storyStore)
  return (all as [string, SavedStory][])
    .map(([, story]) => story)
    .sort((a, b) => b.savedAt - a.savedAt) // Newest first
}
```

### Share Link Creation (Client-Side)
```typescript
async function handleShare(story: SavedStory) {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      story: story.story,
      name: story.name,
      theme: story.theme,
    }),
  })
  const { shareId } = await res.json()
  const url = `${window.location.origin}/story/${shareId}`
  await navigator.clipboard.writeText(url)
  // Show "Copied!" feedback (Claude's discretion)
}
```

### Expired Story View
```typescript
// Friendly expired page per D-11
function ExpiredStoryView() {
  return (
    <div className="min-h-screen bg-reading-surface flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-lg">
        <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface">
          This story has expired
        </h1>
        <p className="font-serif text-[1rem] leading-[1.6] text-reading-on-surface-muted mt-sm">
          Create your own at Nightlight Tales.
        </p>
        <a
          href="/"
          className="mt-lg bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110"
        >
          CREATE A STORY
        </a>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage for offline data | IndexedDB (via idb-keyval) | Ongoing | Structured data, larger storage limits, async API |
| Custom share link shorteners | Redis TTL-based storage | Standard practice | Native expiry, no cleanup jobs |
| `params.shareId` (sync) | `(await params).shareId` | Next.js 15 (2024) | All dynamic route params are async Promises |

**Deprecated/outdated:**
- `localStorage` for structured app data: IndexedDB is the standard for anything beyond simple key-value strings
- Sync `params` access in Next.js: Must use `await params` in Next.js 15+

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 + jsdom |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERSIST-01 | Stories saved to IndexedDB via idb-keyval; library lists them | unit | `npx vitest run src/lib/__tests__/story-store.test.ts -x` | Wave 0 |
| PERSIST-02 | Re-read populates sessionStorage and navigates to /story | unit | `npx vitest run src/lib/__tests__/story-store.test.ts -x` | Wave 0 |
| PERSIST-03 | Share API creates Redis entry with TTL; retrieval works; expired returns null | unit | `npx vitest run src/lib/__tests__/share.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/story-store.test.ts` -- covers PERSIST-01, PERSIST-02 (idb-keyval operations with fake-indexeddb or mock)
- [ ] `src/lib/__tests__/share.test.ts` -- covers PERSIST-03 (Redis mock for share create/retrieve/expire)
- [ ] `fake-indexeddb` dev dependency -- needed to test idb-keyval in Node.js/jsdom environment

**Note:** idb-keyval tests in jsdom require `fake-indexeddb` (or similar polyfill) because jsdom does not implement IndexedDB. Install as devDependency: `npm install -D fake-indexeddb`.

## Open Questions

1. **Prevent duplicate auto-saves across re-reads**
   - What we know: Auto-save fires on `isComplete`. If user re-reads a story (which also sets `isComplete`), the save effect could fire again.
   - What's unclear: Whether to track "already saved" via a ref, or to use the story ID as a deduplication key in IndexedDB.
   - Recommendation: Use the story ID as the key. On re-reads from the library, the story already has an ID -- skip the save. Only generate a new UUID + save when coming from a fresh generation (no existing ID in sessionStorage).

2. **Redis client extraction**
   - What we know: `rate-limit.ts` creates a Redis instance inline. Share link code needs the same client.
   - What's unclear: Whether to extract a shared `redis.ts` module or just duplicate the pattern.
   - Recommendation: Extract a `lib/redis.ts` that exports a lazy-initialized Redis client. Both rate-limit and share use it. This is a small refactor.

## Sources

### Primary (HIGH confidence)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) - API surface, custom stores, bundle size
- [Upstash Redis SET docs](https://upstash.com/docs/redis/sdks/ts/commands/string/set) - `set()` with `{ ex }` TTL option
- Project source code: `reading-view.tsx`, `rate-limit.ts`, `story-form.tsx` - existing patterns

### Secondary (MEDIUM confidence)
- npm registry version checks: idb-keyval 6.2.2, @upstash/redis 1.37.0

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - idb-keyval and @upstash/redis are both specified in requirements, versions verified
- Architecture: HIGH - integration points clearly identified in existing code; patterns verified against source
- Pitfalls: HIGH - based on direct code reading and known Next.js 15+ behavior

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable libraries, no rapid churn)
