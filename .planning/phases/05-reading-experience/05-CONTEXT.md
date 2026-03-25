# Phase 5: Reading Experience - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the `/story` stub with a fullscreen, dim-room reading experience. A parent arrives at `/story` after story generation completes, sees their child's personalized story in a calm, chrome-free layout optimized for a dark bedroom, and has a clear exit back to the home page. The visual and interaction contract is fully locked in the UI-SPEC — this phase implements it.

</domain>

<decisions>
## Implementation Decisions

### Story Title Data Source
- **D-01:** Extend the sessionStorage payload from raw story text to a JSON object: `{ story: string, name: string, theme: string }`.
- **D-02:** Phase 5 updates `src/components/story-form.tsx` to write `JSON.stringify({ story, name, theme })` under the `nightlight-story` key (currently writes raw text). The `name` and `theme` values are already in StoryForm state when sessionStorage is written.
- **D-03:** The reading page assembles the display title as `{Name}'s {Theme} Story` using the stored `name` and `theme` fields, matching the UI-SPEC copywriting contract.
- **D-04:** If parsing fails or the key is missing, fall back to the empty state (no story found). The UI-SPEC specifies the error copy: "Something went wrong loading the story. Please try generating a new one."

### Navigation and Chrome
- **D-05:** No floating toolbar. The reading experience is intentionally chrome-free — only the scroll progress indicator (top 3px bar) is visible during reading.
- **D-06:** Back-to-home navigation appears at the end of the page only, near the gold "New Story" button. Implement as a small secondary text link (e.g., "← Home" or "← Back") in `reading-on-surface-muted` color. No pinned/floating back button during reading.

### Claude's Discretion
- Exact label copy for the back link ("← Home" vs "← Back to home" etc.)
- Whether back link is an `<a>` or `<button>` (semantically an `<a>` is correct)
- Exact vertical spacing between "New Story" button and back link
- CSS animation implementation for the 600ms page entry fade-in (from UI-SPEC)
- Story text paragraph splitting logic (split on `\n\n` as per UI-SPEC)
- `<meta name="theme-color">` placement (layout.tsx vs page-level — use Next.js `<head>` or metadata API)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Contract (Primary Source)
- `.planning/phases/05-reading-experience/05-UI-SPEC.md` — Full visual and interaction contract. All colors, typography, spacing, components, states, and copywriting are locked here. This is the authoritative spec for Phase 5 implementation.

### Design System
- `.planning/DESIGN.md` — Base design system (if it exists). The UI-SPEC inherits from this.

### Requirements
- `.planning/REQUIREMENTS.md` — READ-01: fullscreen distraction-free mode, large serif font, warm/dark background
- `.planning/ROADMAP.md` — Phase 5 success criteria (no navigation chrome, large serif font, warm/dark colors, mobile-optimized)

### Prior Phase Context
- `.planning/phases/04-input-form/04-CONTEXT.md` — D-13/D-14 (story handoff pattern: sessionStorage key `nightlight-story`, `window.location.href` navigation), D-17/D-18 (Tailwind v4 token setup, font loading in layout.tsx)

### Existing Implementation
- `src/app/story/page.tsx` — Current stub; Phase 5 replaces this entirely. Currently reads `nightlight-story` as a raw string.
- `src/components/story-form.tsx` — Phase 5 updates this to write `JSON.stringify({ story, name, theme })` instead of raw text.
- `src/app/globals.css` — Phase 5 adds 5 dark reading mode tokens here (listed in UI-SPEC §CSS Token Additions).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/globals.css` — Existing tokens (`--color-secondary-container: #fcd400`, `--color-destructive: #b3261e`) are reused by the reading page; no duplication needed. Phase 5 appends 5 new dark tokens.
- `src/app/layout.tsx` — `next/font/google` fonts (Noto Serif + Plus Jakarta Sans) already loaded and applied as CSS variables. Reading page inherits them via `font-serif` / `font-sans` Tailwind utilities.
- `src/components/loading-overlay.tsx` — Reference for CSS `@keyframes` pattern used in Phase 4 (inline `<style>` block for Tailwind v4 compatibility — same approach may be needed for the page fade-in).

### Established Patterns
- `'use client'` required for hooks (`useEffect`, `useState`) — story page already uses this pattern.
- Tailwind v4 CSS custom properties referenced as `bg-reading-surface`, `text-reading-on-surface`, etc. (mapped via `--color-*` tokens in `@theme`).
- No third-party component libraries — all components hand-built (consistent with Phase 4).

### Integration Points
- `src/app/story/page.tsx` — Phase 5 fully replaces this file.
- `src/components/story-form.tsx` — Phase 5 updates the sessionStorage write (single targeted change: wrap story in JSON object with name + theme).
- `src/app/globals.css` — Phase 5 appends dark reading mode tokens to the existing `@theme` block.

</code_context>

<specifics>
## Specific Ideas

- The reading experience should feel calm and minimal — no distractions. UI-SPEC sets the tone: deep warm navy background, warm off-white text, no chrome.
- The "New Story" gold button appears at the natural end of the story — not floating. It's the completion moment.
- Back navigation is understated: a small secondary link near the "New Story" button, not a prominent button. Parents are focused on reading, not on escaping.
- Scroll progress indicator is subtle (3px, 40% opacity muted tone) — visible enough to orient, invisible enough not to distract.

</specifics>

<deferred>
## Deferred Ideas

- Screen Wake Lock (READ-03) — v2 requirement, explicitly out of scope for v1
- Fade-in on tap to reveal controls — considered and rejected; end-of-page navigation is sufficient
- Floating toolbar with controls — considered and rejected; chrome-free reading was the goal

</deferred>

---

*Phase: 05-reading-experience*
*Context gathered: 2026-03-25*
