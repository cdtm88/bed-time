# Phase 13: Story Persistence - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Device-local story library backed by IndexedDB (idb-keyval), with re-reading saved stories in the full reading experience and shareable expiring links via Upstash Redis.

Covers: PERSIST-01, PERSIST-02, PERSIST-03

</domain>

<decisions>
## Implementation Decisions

### Library UI & Entry Point
- **D-01:** Library is accessible via a persistent button/link on the home screen (story form page). Always visible, no new nav bar needed.
- **D-02:** Library route: a new page (e.g. `/library`) accessible from the home screen button.
- **D-03:** Each saved story card shows: title (e.g. "Ella's Dragon Story"), theme chip, and date saved. Compact and scannable — no paragraph preview.
- **D-04:** User can delete stories from the library via swipe or long-press gesture (standard mobile pattern).

### Save Trigger & Auto-Save
- **D-05:** Story auto-saves to IndexedDB (idb-keyval) when streaming completes. No user action required. This hooks into the existing "stream complete" moment in `ReadingView` (where `isComplete` becomes `true`).
- **D-06:** No save confirmation toast or prompt needed — auto-save is silent.
- **D-07:** idb-keyval is specified in REQUIREMENTS.md (PERSIST-01) — use it directly. Do not use a different IndexedDB wrapper.

### Share Link UX & TTL
- **D-08:** Share is triggered from a button on the library card (not from the reading view). Clicking share generates a link and copies it to the clipboard.
- **D-09:** Share links have a 7-day TTL. Upstash Redis (already installed: `@upstash/redis`) handles storage with TTL-based expiry.
- **D-10:** Share link route: `/story/[shareId]` — recipient sees the full ReadingView with the shared story. Same dark navy reading experience, no generation required.
- **D-11:** When a share link has expired (or shareId not found in Redis), show a friendly expired page: "This story has expired. Create your own at Nightlight Tales." with a link to the home screen. Not a 404.

### Re-read Flow
- **D-12:** Re-reading a saved story uses the same `/story` route and `ReadingView`. The library navigates to `/story` with the story pre-populated in `sessionStorage` ('nightlight-story' key). ReadingView already detects a completed story in sessionStorage and renders immediately without streaming.
- **D-13:** No streaming simulation on re-reads — story renders immediately (already how `ReadingView` handles the `nightlight-story` sessionStorage key).
- **D-14:** At the end of a re-read, show two buttons: **NEW STORY** (existing) and **BACK TO LIBRARY** (new). Both appear in the `isComplete` section of ReadingView.

### Claude's Discretion
- Library page layout (list vs. grid for story cards) — pick what works best for the card content (title + theme chip + date)
- Empty library state — design a friendly empty state for first-time library visitors
- Exact swipe/long-press delete UX implementation — use whatever pattern is most natural for React/Next.js on mobile
- Share button placement on library card (icon vs. labeled button)
- Whether to add a brief "Copied!" feedback after clicking share

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Story Persistence — PERSIST-01 (IndexedDB/idb-keyval), PERSIST-02 (re-read), PERSIST-03 (share links/Upstash Redis)

### Existing Implementation
- `src/components/reading-view.tsx` — `isComplete` state and `nightlight-story` sessionStorage key are the save trigger hooks; also needs NEW STORY + BACK TO LIBRARY at end
- `src/app/story/page.tsx` — current story route; share link route `/story/[shareId]` adds a dynamic segment here
- `src/app/page.tsx` — home page (StoryForm); library button goes here
- `src/app/api/generate/route.ts` — existing API route; share API route will be new

### Project Context
- `.planning/PROJECT.md` §Key Decisions — "Local-first, no accounts" — library must work offline for saved stories

No external API specs needed — idb-keyval and Upstash Redis have straightforward APIs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `reading-view.tsx: isComplete` state — already fires when streaming ends; auto-save hooks here
- `reading-view.tsx: sessionStorage 'nightlight-story'` — existing key for completed story data `{ story, name, theme }`; re-read flow populates this before navigating to /story
- `@upstash/redis` — already installed and configured for rate limiting; share link storage reuses this connection
- `components/loading-overlay.tsx`, `components/story-form.tsx` — style reference for new library UI (dark navy, gold accent, Tailwind v4)

### Established Patterns
- `sessionStorage` for cross-page data handoff — established in v1.0, still the pattern for re-reads
- `useEffect` for side effects (wake lock, scroll tracking) — same pattern for auto-save on completion
- Tailwind v4 CSS-first (`@import 'tailwindcss'`) — no tailwind.config.js; use CSS variables for custom tokens
- Dark navy (`bg-reading-surface`) + gold accent (`bg-secondary-container`) — reading view aesthetic; library should feel consistent

### Integration Points
- `/story` route: needs dynamic segment `/story/[shareId]` for share links (or a separate `/shared/[shareId]` route — planner's call)
- `reading-view.tsx: isComplete` block: add auto-save effect + BACK TO LIBRARY button
- `src/app/page.tsx`: add library entry button
- New `/library` page: new route + component
- New API route for share link creation: `POST /api/share` → stores story in Redis with 7-day TTL, returns shareId
- New API route for share link retrieval: `GET /api/share/[shareId]` → fetches story from Redis

</code_context>

<specifics>
## Specific Ideas

- Share is library-first: the share button lives on the library card, not the reading view. The flow is: generate → auto-saved → go to library → share from card.
- TTL: 7 days. Aligns with "share with a grandparent later in the week" use case.
- Expired link page should feel on-brand, not a generic error — friendly message + CTA to create their own story.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-story-persistence*
*Context gathered: 2026-04-05*
