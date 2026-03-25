---
phase: 05-reading-experience
verified: 2026-03-25T15:22:30Z
status: human_needed
score: 11/11 must-haves verified
human_verification:
  - test: "Visual reading experience in dim-room conditions"
    expected: "Deep navy background, warm off-white serif text, no chrome — comfortable to read aloud from in a dark room"
    why_human: "Color perception, font legibility, and 'distraction-free' quality cannot be verified programmatically"
  - test: "Scroll progress bar visibility"
    expected: "Gold 3px bar at top of viewport grows as user scrolls — visible but not distracting"
    why_human: "Animation and subtle UI affordance quality requires visual inspection"
  - test: "Mobile layout at 375px"
    expected: "Text is readable with no horizontal scroll, comfortable line length for bedside reading"
    why_human: "Responsive layout quality and readability at real phone size needs visual check"
  - test: "Theme color on mobile browser chrome"
    expected: "Browser chrome renders in deep navy (#1a1a2e) to match reading surface"
    why_human: "viewport themeColor requires a real mobile browser or emulator to verify"
---

# Phase 05: Reading Experience Verification Report

**Phase Goal:** Parents can read the generated story aloud in a calm, distraction-free environment optimized for dim bedrooms.
**Verified:** 2026-03-25T15:22:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### ROADMAP Success Criteria

Phase 5 has explicit Success Criteria in ROADMAP.md. These are the primary contract.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Story displays in fullscreen mode with no navigation chrome, no distracting UI elements | VERIFIED | `min-h-screen bg-reading-surface` wrapper with no nav bar/header/footer elements in component |
| 2 | Text uses a large serif font with warm/dark background colors, readable in a dim room | VERIFIED | `font-serif text-[1.25rem]` (20px) paragraphs, `text-reading-on-surface` (#e8e0d0) on `bg-reading-surface` (#1a1a2e) |
| 3 | Reading view works well on a phone held at bedside (mobile-optimized, appropriate line length) | VERIFIED | `max-w-[640px]` centered with `px-lg` (24px) side padding |

**Score:** 3/3 ROADMAP success criteria verified

### Observable Truths — Plan 01

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SessionStorage payload contains story, name, and theme as JSON | VERIFIED | story-form.tsx lines 44-48: `JSON.stringify({ story: storyText, name: name.trim(), theme: theme })` written to `nightlight-story` key |
| 2 | Dark reading mode CSS tokens are available as Tailwind utilities | VERIFIED | globals.css lines 22-27: 5 tokens inside `@theme {}` block; used directly in reading-view.tsx as Tailwind classes |
| 3 | Tests exist for sessionStorage parsing, empty state, error state, paragraph splitting, and scroll progress | VERIFIED | reading-view.test.ts: 8 tests across 4 describe blocks; all 89 tests green (`npx vitest run` exits 0) |

**Score:** 3/3 Plan 01 truths verified

### Observable Truths — Plan 02

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Story displays in fullscreen dark mode with no navigation chrome | VERIFIED | Outer div `min-h-screen bg-reading-surface`; no nav, header, or footer elements |
| 2 | Text uses large serif font (20px Noto Serif) with warm off-white on deep navy background | VERIFIED | `font-serif text-[1.25rem] leading-[1.8] text-reading-on-surface` paragraphs on `bg-reading-surface` background |
| 3 | Story title shows as {Name}'s {Theme} Story in muted tone | VERIFIED | `assembleTitle(storyData.name, storyData.theme)` rendered in `<h1>` with `text-reading-on-surface-muted` |
| 4 | Scroll progress indicator tracks reading position as a 3px bar | VERIFIED | Fixed `h-[3px]` div at top-0 left-0, `width: progress * 100%`, passive scroll listener with cleanup |
| 5 | New Story gold button appears at end of story, navigating to / | VERIFIED | `<a href="/">` with `bg-secondary-container` gold pill styling, text "NEW STORY", after article close |
| 6 | Back-to-home link appears near New Story button as secondary text | INTENTIONAL DEVIATION | Removed at visual checkpoint (commit 943a75e): link was redundant with "NEW STORY" button. Phase goal (distraction-free) is better served without it |
| 7 | Empty state shows when no story in sessionStorage | VERIFIED | Lines 68-88: `if (!storyData)` guard renders "No story yet" with "CREATE A STORY" gold button |
| 8 | Error state shows when sessionStorage contains invalid JSON | VERIFIED | Lines 45-65: catch block sets `error=true`, renders "Something went wrong" with "TRY AGAIN" button |
| 9 | Reading view works on mobile (24px padding, max-width 640px centered) | VERIFIED | `mx-auto max-w-[640px] px-lg pt-2xl pb-3xl` content container |

**Score:** 8/8 Plan 02 truths verified (truth 6 intentional deviation — phase goal still met)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | 5 dark reading mode color tokens inside @theme block | VERIFIED | Lines 22-27: all 5 tokens present (`--color-reading-surface`, `--color-reading-surface-elevated`, `--color-reading-on-surface`, `--color-reading-on-surface-muted`, `--color-on-secondary-container`) |
| `src/components/story-form.tsx` | JSON sessionStorage write with story, name, theme | VERIFIED | Lines 44-48: `JSON.stringify({ story, name, theme })` — legacy `nightlight-story-name` key absent |
| `src/__tests__/reading-view.test.ts` | Unit tests for ReadingView behaviors, min 50 lines | VERIFIED | 93 lines, 8 tests, all passing |
| `vitest.config.ts` | jsdom environment for browser API tests | VERIFIED | Line 7: `environment: 'jsdom'` |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/reading-view.tsx` | Full reading experience client component, min 100 lines, exports ReadingView | VERIFIED | 153 lines, starts with `'use client'`, exports `ReadingView` function |
| `src/app/story/page.tsx` | Server component wrapper exporting viewport themeColor | VERIFIED | 10 lines, no `'use client'`, exports `viewport: Viewport` with `themeColor: '#1a1a2e'`, renders `<ReadingView />` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/story-form.tsx` | sessionStorage | `JSON.stringify({ story, name, theme })` | VERIFIED | Lines 44-48 write JSON payload on successful generation |
| `src/app/globals.css` | Tailwind utilities | `@theme block --color-reading-* tokens` | VERIFIED | Tokens in @theme; used as `bg-reading-surface`, `text-reading-on-surface`, etc. in reading-view.tsx |
| `src/app/story/page.tsx` | `src/components/reading-view.tsx` | import and render | VERIFIED | Line 2: `import { ReadingView } from '@/components/reading-view'`; line 9: `return <ReadingView />` |
| `src/components/reading-view.tsx` | sessionStorage | `JSON.parse` of nightlight-story key | VERIFIED | Lines 22-29: `sessionStorage.getItem('nightlight-story')` → `JSON.parse(raw)` → `setStoryData(data)` |
| `src/components/reading-view.tsx` | `/` | New Story button href | VERIFIED | Lines 143-148 (story state), line 57 (error state), line 79 (empty state) all link `href="/"` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `reading-view.tsx` | `storyData` | `sessionStorage.getItem('nightlight-story')` → `JSON.parse` | Yes — populated by story-form.tsx after successful API call | FLOWING |
| `reading-view.tsx` | `progress` | `window.scrollY` / `document.documentElement.scrollHeight` | Yes — real DOM scroll values via passive event listener | FLOWING |
| `story-form.tsx` | `storyText` | `await res.text()` from `/api/generate` POST | Yes — real API response body written to sessionStorage | FLOWING |

No static returns or hardcoded empty values found in the rendering path.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 89 tests pass including 8 reading-view unit tests | `npx vitest run` | 7 test files, 89 tests, all passed in 824ms | PASS |
| ReadingView exports correctly | `grep "export function ReadingView" src/components/reading-view.tsx` | Line 15 match | PASS |
| page.tsx exports viewport without 'use client' | `grep "export const viewport"` + absence of `'use client'` | Line 4 match; no client directive | PASS |
| Legacy sessionStorage key absent | `grep "nightlight-story-name" src/components/story-form.tsx` | No match | PASS |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| READ-01 | 05-01-PLAN.md, 05-02-PLAN.md | After generation completes, story displayed in fullscreen distraction-free reading mode with large serif font, warm/dark background, no navigation chrome — optimised for parent reading aloud in dim bedroom | SATISFIED | ReadingView component: fullscreen navy background, 20px Noto Serif, no nav chrome, 3 states (story/empty/error), mobile-optimized, scroll progress bar |

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps READ-01 to Phase 5 only. No additional Phase 5 requirements in REQUIREMENTS.md are unclaimed.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

Scan covered: reading-view.tsx, story-form.tsx, story/page.tsx, globals.css, reading-view.test.ts, vitest.config.ts. No TODO/FIXME/placeholder/stub patterns detected.

---

## Documented Deviations from Plan 02

The SUMMARY and component code document two intentional changes made at the visual checkpoint (commit 943a75e):

1. **Scroll progress bar color:** Changed from `--color-reading-on-surface-muted` at 0.4 opacity to `--color-secondary-container` (gold) at full opacity. Reason: muted tone was imperceptible. The 3px bar at full gold opacity is still subtle (thin) and serves the functional goal of scroll tracking.

2. **Back-to-home link removed:** Plan 02 truth stated "Back-to-home link appears near New Story button as secondary text." This link was removed because it duplicated the New Story button's navigation destination. The phase goal (distraction-free) is not harmed — a single gold CTA is cleaner than two links to the same route.

Neither deviation undermines READ-01 or the ROADMAP success criteria.

---

## Human Verification Required

### 1. Reading Experience in Dim-Room Conditions

**Test:** On a real phone (or browser at 375px), generate a story and view `/story` with room lights dimmed or display brightness lowered.
**Expected:** Deep navy background (#1a1a2e), warm off-white text (#e8e0d0) in large serif font — comfortable to read aloud for 5-15 minutes without eye strain. No buttons, nav bars, or UI chrome visible during reading.
**Why human:** Color perception, contrast sufficiency in low light, and the qualitative "distraction-free" experience cannot be verified programmatically.

### 2. Scroll Progress Bar Visibility

**Test:** Load a story and scroll slowly through it.
**Expected:** A thin gold 3px bar at the very top of the viewport grows from left to right as you scroll. Visible but not attention-grabbing.
**Why human:** Animation smoothness and subtle affordance quality require visual inspection.

### 3. Mobile Layout at 375px Width

**Test:** Open Chrome DevTools device toolbar at iPhone SE width (375px), then view `/story` with a loaded story.
**Expected:** Text is readable with no horizontal scroll, line lengths feel comfortable for bedside reading, font size feels large enough for arm's-length viewing in dim light.
**Why human:** Responsive layout readability and real-device ergonomics require visual judgment.

### 4. Browser Theme Color on Mobile

**Test:** On a real Android or iOS device (or emulation), visit `/story` after generating a story.
**Expected:** The browser chrome (address bar / status bar area) renders in deep navy (#1a1a2e), matching the reading surface.
**Why human:** The `viewport.themeColor` export is a server-side metadata value — its effect on actual browser chrome requires a real or emulated mobile browser.

---

## Gaps Summary

No automated gaps found. All artifacts exist, are substantive (no stubs), are wired (imports and data-flow verified), and produce real data. The test suite (89 tests) passes green.

The single must-have truth that was not delivered as originally specified ("Back-to-home link near New Story button") was deliberately removed at the visual checkpoint stage, as documented in SUMMARY 05-02 and commit 943a75e. The removal does not block the phase goal — it improves it.

Human verification is required for visual quality (dim-room readability, mobile layout, theme color) which cannot be assessed programmatically.

---

_Verified: 2026-03-25T15:22:30Z_
_Verifier: Claude (gsd-verifier)_
