# Phase 12: Streaming & Reading UX - Research

**Researched:** 2026-04-04
**Domain:** Client-side streaming text delivery, Screen Wake Lock API
**Confidence:** HIGH

## Summary

Phase 12 transforms the story delivery from a full-buffer JSON response to a buffer-validate-then-stream pipeline. The server still fully generates and validates the story via `generateSafeStory()` (no change to safety), but then streams the validated text to the client for progressive paragraph-by-paragraph rendering. The second feature is Screen Wake Lock to prevent the device from sleeping during reading.

The primary architectural challenge is the **navigation gap**: the form lives on `/` and the reading view on `/story`. A live `ReadableStream` cannot survive a `window.location.href` navigation. The recommended approach (detailed below) is to have the **reading view initiate its own fetch** after navigation, with form parameters passed via `sessionStorage`. This avoids complex stream-bridging while keeping the loading overlay visible during the full generation+validation window.

**Primary recommendation:** Restructure the flow so the form stores params in sessionStorage and navigates to `/story`, where the reading view component initiates the streaming fetch itself, showing the loading overlay until first bytes arrive.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Server must fully generate and validate the story with Haiku before any text is sent to the client. Reuse `generateSafeStory()` in the API route.
- **D-02:** After validation passes, server streams the validated story text to the client (not a buffered JSON response).
- **D-03:** Dark navy loading overlay stays up during the entire generation + validation window. Drops only when first bytes of validated story text begin arriving.
- **D-04:** User navigates to `/story` and text appears progressively, not all at once.
- **D-05:** Page navigation breaks ReadableStream continuity. Mechanism for bridging is an implementation concern (Claude's discretion).
- **D-06:** Paragraph-by-paragraph reveal. Buffer incoming stream chunks until `\n\n` boundary, then render complete paragraph.
- **D-07:** Each new paragraph fades in with short opacity transition (300-500ms).
- **D-08:** No mid-sentence or word-by-word rendering.
- **D-09:** Acquire Screen Wake Lock on reading view mount.
- **D-10:** Release on component unmount (covers nav back, tab switch, browser close).
- **D-11:** If Wake Lock unsupported or denied, silently skip. Log console warning at most.
- **D-12:** Literata font change is **deferred to backlog**. Font stays as Noto Serif. STREAM-03 not implemented.

### Claude's Discretion
- Exact timing and easing of paragraph fade-in (300ms vs 500ms)
- Whether to show a subtle loading indicator within the reading view during pre-stream validation
- Error handling for mid-stream failures (stream drops after partial story delivered)

### Deferred Ideas (OUT OF SCOPE)
- Literata font (STREAM-03) -- Noto Serif stays. Backlog item.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STREAM-01 | Story text streams progressively to the reading view (buffer-validate-then-stream) | Architecture Pattern 1 (streaming pipeline), Pattern 2 (paragraph buffering), Code Examples section |
| STREAM-02 | Device screen stays awake throughout reading session (Screen Wake Lock API) | Architecture Pattern 3 (Wake Lock), Code Examples section, MDN API reference |
| STREAM-03 | Reading view uses Literata font | **DEFERRED per D-12** -- not implemented in this phase |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | Framework (already installed) | Project framework |
| react | 19.2.4 | UI (already installed) | Project UI library |
| @anthropic-ai/sdk | ^0.80.0 | Claude API (already installed) | Story generation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Web Streams API | Browser built-in | ReadableStream consumption on client | Reading streamed response |
| Screen Wake Lock API | Browser built-in | Prevent screen dimming | Reading view mount |
| TextDecoder | Browser built-in | Decode stream chunks to text | Stream processing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw ReadableStream | Vercel AI SDK `useChat`/`streamText` | AI SDK adds unnecessary abstraction -- we stream pre-validated text, not an active LLM conversation. Raw streams are simpler and avoid a new dependency. |
| TextDecoder + manual buffering | TextDecoderStream (pipeTo) | TextDecoderStream is cleaner but less explicit for paragraph boundary detection. Manual TextDecoder gives direct control over `\n\n` buffering. |

**Installation:** No new packages required. All APIs are browser built-ins or already installed.

## Architecture Patterns

### Recommended Flow (Navigation Gap Solution)

```
1. User fills form on /
2. handleSubmit() stores {name, age, theme, duration} in sessionStorage
3. handleSubmit() navigates to /story (window.location.href = '/story')
4. ReadingView mounts, reads params from sessionStorage
5. ReadingView shows LoadingOverlay
6. ReadingView calls fetch('/api/generate', { body: params })
7. API route: calls generateSafeStory() (full buffer + validate)
8. API route: streams validated story text back as ReadableStream
9. ReadingView: consumes stream with getReader(), buffers to \n\n boundaries
10. ReadingView: drops LoadingOverlay on first complete paragraph
11. ReadingView: renders each paragraph with fade-in animation
12. ReadingView: stores completed story in sessionStorage (for refresh resilience)
```

This approach is recommended because:
- No stream bridging needed -- reading view owns the entire fetch lifecycle
- Loading overlay naturally covers the validation window
- sessionStorage already used for form-to-reading data handoff (established pattern)
- Refresh of `/story` page can re-read completed story from sessionStorage

### Recommended Project Structure
```
src/
  app/
    api/generate/route.ts       # Updated: generateSafeStory() + stream response
  components/
    reading-view.tsx            # Updated: streaming fetch, paragraph accumulation, wake lock
    loading-overlay.tsx         # Unchanged (reused within reading view)
    story-form.tsx              # Simplified: store params + navigate (no fetch)
  lib/
    safety.ts                   # Unchanged (generateSafeStory reused as-is)
    stream-utils.ts             # NEW: paragraph buffering logic (pure functions, testable)
    use-wake-lock.ts            # NEW: custom hook for Wake Lock
```

### Pattern 1: Server-Side Buffer-Then-Stream

**What:** API route calls `generateSafeStory()` to get the full validated story, then streams it character-by-character (or chunk-by-chunk) to the client as a `ReadableStream`.
**When to use:** After validation passes, to deliver text progressively.

```typescript
// Source: Web Streams API + existing generateSafeStory()
// In route.ts POST handler:

const result = await generateSafeStory(client, params)
if (!result.ok) {
  return new Response(JSON.stringify({ error: '...' }), { status: 500 })
}

const encoder = new TextEncoder()
const story = result.story

const readable = new ReadableStream({
  async start(controller) {
    // Stream paragraph by paragraph with small delays for visual effect
    const paragraphs = story.split('\n\n')
    for (let i = 0; i < paragraphs.length; i++) {
      const chunk = i > 0 ? '\n\n' + paragraphs[i] : paragraphs[i]
      controller.enqueue(encoder.encode(chunk))
      // Small delay between paragraphs for progressive reveal effect
      if (i < paragraphs.length - 1) {
        await new Promise(r => setTimeout(r, 80))
      }
    }
    controller.close()
  },
})

return new Response(readable, {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
})
```

**Note on Edge Runtime:** The current API route uses `export const runtime = "edge"`. Edge Runtime fully supports `ReadableStream`, `TextEncoder`, and `setTimeout` (via `waitUntil` or inline). The `generateSafeStory()` function uses `@anthropic-ai/sdk` which works on Edge. No runtime change needed.

### Pattern 2: Client-Side Paragraph Buffering

**What:** Client reads stream chunks, accumulates text in a buffer, and emits complete paragraphs when `\n\n` boundary is detected.
**When to use:** In the reading view to implement D-06 (paragraph-by-paragraph reveal).

```typescript
// Source: Web Streams API (MDN ReadableStreamDefaultReader)
// In stream-utils.ts:

export async function* readParagraphs(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Emit complete paragraphs
    let boundary: number
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const paragraph = buffer.slice(0, boundary).trim()
      if (paragraph) yield paragraph
      buffer = buffer.slice(boundary + 2)
    }
  }

  // Emit any remaining text after stream ends
  const remaining = buffer.trim()
  if (remaining) yield remaining
}
```

### Pattern 3: Wake Lock Hook

**What:** Custom React hook that acquires Screen Wake Lock on mount and releases on unmount.
**When to use:** In reading view component.

```typescript
// Source: MDN Screen Wake Lock API
// In use-wake-lock.ts:

import { useEffect } from 'react'

export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null

    async function acquire() {
      if (!('wakeLock' in navigator)) {
        console.warn('Screen Wake Lock API not supported')
        return
      }
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.warn('Wake Lock request failed:', err)
      }
    }

    acquire()

    return () => {
      sentinel?.release()
    }
  }, [])
}
```

### Pattern 4: Paragraph Fade-In Animation

**What:** CSS transition for each new paragraph appearing.
**When to use:** When a new paragraph is added to the rendered list.

```css
/* Tailwind v4 approach -- add to globals.css or inline style */
@keyframes paragraphFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

```tsx
// In reading view, each paragraph gets the animation:
<p
  key={index}
  style={{ animation: 'paragraphFadeIn 300ms ease-out forwards' }}
  className="font-serif text-[1.25rem] ..."
>
  {paragraph}
</p>
```

### Anti-Patterns to Avoid
- **Streaming before validation:** Never send text to the client before `generateSafeStory()` returns `ok: true`. The entire point of the buffer-validate-then-stream pattern is safety-first.
- **Passing a live stream across navigation:** `window.location.href` kills the page context. Do not try to store a ReadableStream in sessionStorage or pass it via URL params.
- **Word-by-word reveal:** D-08 explicitly forbids this. Buffer to `\n\n` boundaries only.
- **Re-acquiring Wake Lock on visibilitychange:** Not needed per D-10. The requirement is release on unmount only. If the user tabs away and comes back, the story is still there. A fresh acquire on mount is sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screen wake lock | Custom `setInterval` no-sleep hack | `navigator.wakeLock.request('screen')` | Standard API, 88% browser compat, no hacks needed |
| Stream text decoding | Manual charCode parsing | `TextDecoder` with `{ stream: true }` | Handles multi-byte UTF-8 correctly across chunk boundaries |
| Paragraph boundary detection | Regex-based post-hoc splitting | Incremental buffer + `indexOf('\n\n')` | Must work on partial chunks; regex on incomplete text is fragile |

**Key insight:** Both streaming and Wake Lock use standard Web APIs with excellent browser support. No third-party libraries needed.

## Common Pitfalls

### Pitfall 1: Multi-Byte Character Split Across Chunks
**What goes wrong:** A UTF-8 multi-byte character (e.g., em-dash, curly quote) gets split across two stream chunks, producing garbled text.
**Why it happens:** `ReadableStream` chunks are byte-oriented, not character-oriented. A chunk boundary can fall in the middle of a multi-byte character.
**How to avoid:** Always use `TextDecoder` with `{ stream: true }` option. This tells the decoder to buffer incomplete multi-byte sequences until the next chunk arrives.
**Warning signs:** Garbled characters appearing mid-sentence, especially with punctuation.

### Pitfall 2: Wake Lock Fails Silently on Older iOS
**What goes wrong:** `navigator.wakeLock` exists but `request()` throws `NotAllowedError` on some older iOS versions (Safari < 16.6).
**Why it happens:** Feature detection (`'wakeLock' in navigator`) passes but the actual request is denied.
**How to avoid:** Wrap `request()` in try/catch (already in the recommended pattern). Per D-11, log warning and continue.
**Warning signs:** Screen dims during reading on iOS devices.

### Pitfall 3: Loading State Flash After Navigation
**What goes wrong:** User navigates to `/story`, sees a brief flash of "No story yet" empty state before the streaming fetch starts.
**Why it happens:** React renders the initial state before `useEffect` fires and initiates the fetch.
**How to avoid:** Default the component state to "loading" (show `LoadingOverlay`) rather than "empty". Only show "No story yet" if sessionStorage has no params AND no active fetch.
**Warning signs:** Brief white flash or "No story yet" text before the loading overlay appears.

### Pitfall 4: Stale SessionStorage on Refresh
**What goes wrong:** User refreshes `/story` during streaming. The partial story in state is lost, but sessionStorage may have stale data from a previous story.
**Why it happens:** Story params and completed story share sessionStorage; refresh triggers a new mount.
**How to avoid:** Store params and completed story under separate keys. On mount: if completed story exists, render it immediately. If only params exist, initiate a new fetch.
**Warning signs:** Old story appearing after a new generation, or infinite loading on refresh.

### Pitfall 5: Edge Runtime setTimeout in ReadableStream
**What goes wrong:** The inter-paragraph delay in the streaming response might not work as expected on Edge Runtime.
**Why it happens:** Edge Runtime supports `setTimeout` but some older Vercel Edge deployments had quirks.
**How to avoid:** Use a simple `await new Promise(r => setTimeout(r, N))` pattern -- this is standard and works on current Vercel Edge Runtime (Next.js 16). If issues arise, the delay can be removed (client-side animation provides the visual pacing).
**Warning signs:** All paragraphs arriving instantly despite server-side delays.

## Code Examples

### Complete Client-Side Stream Consumer

```typescript
// Source: Web Streams API (MDN) + project conventions
// Reading view streaming fetch pattern:

const [paragraphs, setParagraphs] = useState<string[]>([])
const [isStreaming, setIsStreaming] = useState(false)
const [isComplete, setIsComplete] = useState(false)

useEffect(() => {
  const params = sessionStorage.getItem('nightlight-params')
  if (!params) return

  async function streamStory() {
    setIsStreaming(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: params,
    })

    if (!res.ok || !res.body) {
      // Handle error
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let boundary: number
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const para = buffer.slice(0, boundary).trim()
        if (para) {
          setParagraphs(prev => [...prev, para])
        }
        buffer = buffer.slice(boundary + 2)
      }
    }

    // Final paragraph
    const remaining = buffer.trim()
    if (remaining) {
      setParagraphs(prev => [...prev, remaining])
    }

    setIsStreaming(false)
    setIsComplete(true)
  }

  streamStory()
}, [])
```

### Wake Lock TypeScript Types

```typescript
// Source: MDN WakeLock API
// TypeScript types are included in lib.dom.d.ts (TypeScript 5+)
// No additional @types package needed.
// navigator.wakeLock is typed as WakeLock
// request('screen') returns Promise<WakeLockSentinel>
```

### Updated Story Form (Simplified)

```typescript
// Source: Existing story-form.tsx pattern
// Form no longer fetches -- just stores params and navigates

async function handleSubmit() {
  if (isLoading || !canSubmit) return
  setIsLoading(true)

  sessionStorage.setItem('nightlight-params', JSON.stringify({
    name: name.trim(),
    age,
    theme,
    duration,
  }))

  window.location.href = '/story'
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `await res.text()` full buffer | `res.body.getReader()` streaming | Phase 12 | Progressive text reveal |
| Form fetches, stores story, navigates | Form stores params, navigates; reading view fetches | Phase 12 | Cleaner separation of concerns |
| No wake lock | `navigator.wakeLock.request('screen')` | Phase 12 | Screen stays awake during reading |

**Current project pattern being replaced:**
- `story-form.tsx` currently does `await res.text()` then `sessionStorage.setItem('nightlight-story', ...)` then `window.location.href = '/story'`. This is replaced by storing params + navigating; reading view handles the fetch.

## Open Questions

1. **Server-side paragraph delay timing**
   - What we know: A small delay (50-100ms) between paragraph chunks on the server side creates a more natural progressive reveal.
   - What's unclear: Whether Edge Runtime handles many small delays efficiently, or if it is better to send all at once and let client-side animation handle pacing.
   - Recommendation: Start with 80ms server-side delay. If it causes issues on Edge, remove it -- the 300ms CSS fade-in per paragraph provides visual pacing regardless.

2. **SessionStorage key migration**
   - What we know: Current code uses `nightlight-story` key for the completed story data. New flow needs a `nightlight-params` key for form params.
   - What's unclear: Whether to keep both keys or merge into a single key with a status field.
   - Recommendation: Use two keys: `nightlight-params` (form inputs for fetch) and `nightlight-story` (completed story for refresh resilience). Clean up `nightlight-params` after successful stream completion.

3. **Mid-stream error recovery**
   - What we know: If the stream drops after some paragraphs have been rendered, the user sees a partial story.
   - What's unclear: Best UX for partial failure -- show error below partial text? Offer retry?
   - Recommendation: Show a gentle error message below the last rendered paragraph ("The story couldn't be completed. Tap to try again.") with a retry button. This is Claude's discretion per CONTEXT.md.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest --run` |
| Full suite command | `npx vitest --run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STREAM-01a | Paragraph buffer splits on `\n\n` correctly | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "paragraph"` | No -- Wave 0 |
| STREAM-01b | Paragraph buffer handles partial chunks | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "partial"` | No -- Wave 0 |
| STREAM-01c | Paragraph buffer handles trailing text without `\n\n` | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "trailing"` | No -- Wave 0 |
| STREAM-01d | API route returns ReadableStream after validation | unit | `npx vitest --run src/lib/__tests__/generate-route.test.ts` | No -- Wave 0 |
| STREAM-01e | Multi-byte characters across chunk boundaries | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "multi-byte"` | No -- Wave 0 |
| STREAM-02a | useWakeLock acquires lock on mount | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | No -- Wave 0 |
| STREAM-02b | useWakeLock releases lock on unmount | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | No -- Wave 0 |
| STREAM-02c | useWakeLock silently handles unsupported browser | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest --run`
- **Per wave merge:** `npx vitest --run`
- **Phase gate:** Full suite green (113 existing + new tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/stream-utils.test.ts` -- covers STREAM-01a through STREAM-01e (paragraph buffering logic)
- [ ] `src/__tests__/use-wake-lock.test.ts` -- covers STREAM-02a through STREAM-02c (wake lock hook with mocked navigator)
- [ ] Mock for `navigator.wakeLock` in jsdom environment (jsdom does not implement Wake Lock)

## Sources

### Primary (HIGH confidence)
- [MDN WakeLock.request()](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request) -- API signature, parameters, exceptions, browser compat
- [MDN WakeLockSentinel](https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel) -- release() method, events, auto-release triggers
- [MDN ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) -- getReader(), read() loop pattern
- [MDN Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) -- TextDecoder stream option
- [MDN TextDecoderStream](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream) -- streaming text decode alternative
- [Can I Use: Screen Wake Lock](https://caniuse.com/wake-lock) -- 88% global support, baseline 2025

### Secondary (MEDIUM confidence)
- [web.dev: Screen Wake Lock supported in all browsers](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers) -- Chrome 85+, Firefox 124+, Safari 16.6+
- [Next.js Streaming Guide](https://nextjs.org/docs/app/guides/streaming) -- Next.js streaming patterns
- [Streaming HTTP Responses using fetch](https://stack.convex.dev/streaming-http-using-fetch) -- Client-side consumption patterns

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all browser built-ins verified on MDN
- Architecture: HIGH -- pattern follows established project conventions (sessionStorage handoff) and standard Web APIs
- Pitfalls: HIGH -- multi-byte chunk splitting and Wake Lock iOS quirks are well-documented

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable Web APIs, unlikely to change)
