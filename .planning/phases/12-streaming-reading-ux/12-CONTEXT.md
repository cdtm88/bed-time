# Phase 12: Streaming & Reading UX - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Buffer-validate-then-stream pipeline so story text appears progressively in the reading view, with Screen Wake Lock keeping the device awake throughout the session. Font stays as Noto Serif (Literata deferred to backlog).

Covers: STREAM-01, STREAM-02. STREAM-03 deferred.

</domain>

<decisions>
## Implementation Decisions

### Streaming Pipeline (server-side)
- **D-01:** Server must fully generate and validate the story with Haiku before any text is sent to the client. `generateSafeStory()` in `src/lib/safety.ts` already implements this — reuse it in the API route.
- **D-02:** After validation passes, server streams the validated story text to the client (not a buffered JSON response). The stream is the mechanism for progressive delivery.

### Loading → Reading Transition
- **D-03:** The dark navy loading overlay (current `LoadingOverlay` component) stays up during the entire generation + validation window. It drops only when the first bytes of validated story text begin arriving.
- **D-04:** User navigates to `/story` and text appears progressively — not all at once. The transition should feel like the story is "unfolding."
- **D-05 (implementation note):** Page navigation breaks ReadableStream continuity. Research/planner should determine the cleanest bridging mechanism (e.g., reading view initiates its own fetch with params from sessionStorage, or form relays chunks to sessionStorage as they arrive before navigating). User intent: overlay up during validation → progressive text in reading view. Mechanism is an implementation concern.

### Text Reveal
- **D-06:** Paragraph-by-paragraph reveal. Buffer incoming stream chunks until `\n\n` boundary, then render the complete paragraph. Do not render partial paragraphs.
- **D-07:** Each new paragraph fades in with a short opacity transition (300–500ms). Matches the existing 600ms `fadeIn` animation on the reading view. Calm, consistent with dim-room bedtime aesthetic.
- **D-08:** No mid-sentence or word-by-word rendering. The reading view already splits on `\n\n` — preserve that pattern for streaming.

### Wake Lock
- **D-09:** Acquire Screen Wake Lock on reading view mount (`useEffect` with empty dependency array).
- **D-10:** Release on component unmount (`useEffect` cleanup function). Covers navigating back to home, tab switch, browser close — no explicit "story ended" tracking needed.
- **D-11:** If Wake Lock is unsupported or denied by the browser, silently skip — log a console warning at most. Reading experience must continue uninterrupted. (Required by success criteria SC-4.)

### Font
- **D-12:** Literata font change is **deferred to backlog**. Font stays as Noto Serif for this phase. STREAM-03 will not be implemented in Phase 12.

### Claude's Discretion
- Exact timing and easing of paragraph fade-in (300ms vs 500ms) — pick what looks right at dim-room brightness
- Whether to show a subtle "loading" indicator within the reading view during the pre-stream validation window (if reading view initiates its own fetch)
- Error handling for mid-stream failures (stream drops after partial story delivered)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Streaming & Core UX — STREAM-01, STREAM-02 (STREAM-03 deferred)

### Existing Implementation
- `src/lib/safety.ts` — `generateSafeStory()` and `validateStory()` — reuse, do not rewrite
- `src/app/api/generate/route.ts` — current API route to be replaced/updated
- `src/components/reading-view.tsx` — reading view to be updated for streaming
- `src/components/story-form.tsx` — form to be updated for new transition flow
- `src/components/loading-overlay.tsx` — overlay component that stays up during validation

### Project Context
- `.planning/PROJECT.md` §Key Decisions — "Buffered response (not streaming): Safety validation requires full story before display" — Phase 12 changes this. The server still buffers for validation; client-side streaming is the new addition.

No external API specs — Screen Wake Lock API is a standard Web API (MDN reference sufficient).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `safety.ts: generateSafeStory()`: Full buffer+validate+retry loop. Already handles 3-attempt Haiku validation. API route should call this instead of `client.messages.stream()` directly.
- `components/loading-overlay.tsx`: Existing overlay — keep using it during validation window.
- `reading-view.tsx`: Already splits on `\n\n`, renders paragraphs in a loop. Streaming update adds state management for progressive paragraph accumulation.

### Established Patterns
- `useEffect` + `sessionStorage` for cross-page data handoff (form → reading view) — established in v1.0
- `font-serif` class = Noto Serif throughout; do not change for this phase
- Dark navy (`bg-reading-surface`) + gold accent — reading view aesthetic is fixed
- Tailwind v4 CSS-first (`@import 'tailwindcss'`) — no tailwind.config.js

### Integration Points
- API route: swap direct streaming for `generateSafeStory()` + stream-the-result pattern
- `story-form.tsx: handleSubmit()`: transition timing needs to change — navigate when stream begins, not when `res.text()` resolves
- `reading-view.tsx`: needs streaming state (`paragraphs: string[]`, `isStreaming: boolean`) instead of single `storyData` from sessionStorage
- Wake Lock: new `useEffect` in `reading-view.tsx` using `navigator.wakeLock.request('screen')`

### Key Constraint
Current `story-form.tsx` uses `await res.text()` (full buffer). Switching to progressive streaming requires consuming the response body as a `ReadableStream`. The navigation gap (form → /story) cannot pass a live stream — research needs to determine the handoff pattern.

</code_context>

<specifics>
## Specific Ideas

- No specific visual references — user accepted all recommended options
- The fade-in per paragraph should feel calm, not flashy — err on the side of shorter duration (300ms) rather than 500ms

</specifics>

<deferred>
## Deferred Ideas

- **Literata font (STREAM-03)** — User explicitly parked this. Noto Serif stays. Add to roadmap backlog for future phase.

</deferred>

---

*Phase: 12-streaming-reading-ux*
*Context gathered: 2026-04-04*
