---
phase: 04-input-form
plan: 02
subsystem: ui
tags: [react, tailwind, form, accessibility, sessionStorage, next-image]

requires:
  - phase: 04-input-form-01
    provides: Tailwind v4 design tokens, Noto Serif + Plus Jakarta Sans fonts, themeToFilename, /story stub, rate limiter
  - phase: 02-core-generation-pipeline
    provides: /api/generate POST route, schemas.ts with VALID_THEMES and VALID_DURATIONS

provides:
  - NameInput — pill input with real-time letter/space validation and accessible error state
  - AgeStepper — 44px circle buttons, 0-10 range, aria-label accessibility
  - DurationToggle — segmented radiogroup with gradient selected state for 5/10/15 min
  - ThemeGrid — 2-column SVG tile grid with tonal selected state and unoptimized next/image
  - LoadingOverlay — fixed full-screen overlay with CSS moon/stars animation and personalized copy
  - StoryForm — main orchestrator: state management, validation, fetch, sessionStorage handoff, error handling
  - page.tsx — landing page renders StoryForm with no auth gate (INFRA-01)

affects: [05-reading-experience]

tech-stack:
  added: []
  patterns:
    - Controlled form components: all sub-components are presentational, state lives in StoryForm
    - sessionStorage handoff: story text + name stored before navigating to /story
    - CSS keyframe animation inline via <style> tag in LoadingOverlay (no external libraries)
    - next/image unoptimized for SVGs to avoid rasterization

key-files:
  created:
    - src/components/name-input.tsx
    - src/components/age-stepper.tsx
    - src/components/duration-toggle.tsx
    - src/components/theme-grid.tsx
    - src/components/loading-overlay.tsx
    - src/components/story-form.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "All sub-components are controlled (props in, onChange out) — state centralized in StoryForm"
  - "window.location.href used for /story navigation to ensure sessionStorage is written before page unloads"
  - "canSubmit derived: name.trim() non-empty, passes NAME_REGEX, theme non-null — matches schemas.ts validation"
  - "LoadingOverlay uses inline <style> for @keyframes breathe and @keyframes twinkle (Tailwind cannot express custom keyframes without config)"

patterns-established:
  - "CSS keyframe animation: define via inline <style> in client component when Tailwind arbitrary values are insufficient"
  - "Controlled form pattern: all field components accept value + onChange, parent owns all state"

requirements-completed: [INFRA-01]

duration: 4min
completed: 2026-03-25
---

# Phase 4 Plan 02: Parent-Facing Input Form Summary

**Six UI components (NameInput, AgeStepper, DurationToggle, ThemeGrid, LoadingOverlay, StoryForm) implementing the complete bedtime story input form with real-time validation, gradient CTA, full-screen loading overlay, and sessionStorage story handoff**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-25T08:25:46Z
- **Completed:** 2026-03-25T08:30:00Z
- **Tasks:** 3 of 3 completed
- **Files modified:** 7

## Accomplishments

- Five presentational sub-components built with DESIGN.md tokens: no borders, no #000000, no sharp corners, all transitions 300ms ease-in-out
- StoryForm orchestrates all state: validates name in real-time, requires theme selection, handles 429 rate-limit and generic errors inline, shows LoadingOverlay during generation
- page.tsx renders StoryForm as the landing page with no login/signup — satisfies INFRA-01

## Task Commits

1. **Task 1: Create all form sub-components** - `ef0f407` (feat)
2. **Task 2: Create StoryForm and wire page.tsx** - `3cae5d0` (feat)
3. **Task 3: Visual and functional verification** - human-approved (checkpoint:human-verify passed)

## Files Created/Modified

- `src/components/name-input.tsx` — Pill-shaped input with real-time /^[a-zA-Z\s]{1,30}$/ validation, error text
- `src/components/age-stepper.tsx` — 44x44px circle buttons, 0-10 range, aria-label, disabled at boundaries
- `src/components/duration-toggle.tsx` — radiogroup with gradient selected state for 5/10/15 min
- `src/components/theme-grid.tsx` — 2-column grid with next/image unoptimized SVG tiles, tonal selected state
- `src/components/loading-overlay.tsx` — fixed inset-0 overlay, CSS breathe/twinkle keyframes, personalized headline
- `src/components/story-form.tsx` — main form: useState for all fields, canSubmit derivation, handleSubmit async, error handling
- `src/app/page.tsx` — imports and renders StoryForm (no 'use client' needed)

## Decisions Made

- All sub-components are controlled (presentational) — state centralized in StoryForm parent
- `window.location.href` used for navigation to ensure sessionStorage is committed before page unloads
- `canSubmit` logic mirrors schemas.ts NAME_REGEX so UI and API validate identically
- Inline `<style>` tag used in LoadingOverlay for CSS @keyframes (Tailwind v4 cannot express custom keyframes without config file)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- Theme SVGs (`public/themes/*.svg`) are referenced but must be provided externally. The ThemeGrid renders with broken image placeholders until SVGs are placed in `public/themes/`. This is by design — SVG illustrations are a separate asset delivery concern outside this plan's scope.

## Self-Check: PASSED

Files verified present on disk:
- `src/components/name-input.tsx` — FOUND
- `src/components/age-stepper.tsx` — FOUND
- `src/components/duration-toggle.tsx` — FOUND
- `src/components/theme-grid.tsx` — FOUND
- `src/components/loading-overlay.tsx` — FOUND
- `src/components/story-form.tsx` — FOUND
- `src/app/page.tsx` — FOUND

Commits verified:
- `ef0f407` — feat(04-02): create all form sub-components
- `3cae5d0` — feat(04-02): create StoryForm and wire page.tsx

All 81 tests pass. Next.js build succeeds.

---
*Phase: 04-input-form*
*Completed: 2026-03-25*
