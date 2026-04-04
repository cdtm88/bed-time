---
phase: 12-streaming-reading-ux
plan: 02
subsystem: ui
tags: [streaming, per-paragraph-validation, reading-view, wake-lock, session-persistence, ux]

# Dependency graph
requires: ["12-01"]
provides:
  - "Per-paragraph streaming API with inline safety validation"
  - "Streaming reading view with progressive paragraph reveal"
  - "Session-persisted child name for form convenience"
affects: [13-story-persistence]

# Tech tracking
tech-stack:
  added: []
  patterns: ["per-paragraph inline validation during LLM stream", "sessionStorage name persistence", "progressive paragraph reveal with fade-in animation"]

key-files:
  created: []
  modified:
    - src/app/api/generate/route.ts
    - src/lib/safety.ts
    - src/components/story-form.tsx
    - src/components/reading-view.tsx
    - src/components/loading-overlay.tsx
    - src/app/globals.css

key-decisions:
  - "Per-paragraph validation instead of buffer-validate-then-stream -- first text appears in ~5-8s instead of ~30s"
  - "Child name persisted via sessionStorage key 'nightlight-name' -- only name remembered, not age/theme/duration"
  - "Loading overlay copy changed from '30 seconds' to 'Just a moment' to match faster streaming"

metrics:
  completed: "2026-04-04"
---

# Phase 12 Plan 02: Wire Streaming Pipeline End-to-End Summary

Per-paragraph streaming with inline safety validation, progressive reading view with Wake Lock, and child name persistence across sessions.

## What Was Done

### Task 1: API Route - Buffer-Validate-Then-Stream (original plan)
Rewrote `src/app/api/generate/route.ts` to use `generateSafeStory()` for full story generation and validation, then stream the validated text paragraph-by-paragraph with 80ms inter-paragraph delay.

### Task 2: Form Simplification + Reading View Rewrite (original plan)
- **Story form**: Stores params to `nightlight-params` sessionStorage and navigates to `/story` instead of fetching inline
- **Reading view**: Initiates streaming fetch from `/api/generate`, consumes stream with `readParagraphs`, shows `LoadingOverlay` during generation, reveals paragraphs with 300ms fade-in animation, acquires Wake Lock
- **Loading overlay**: Updated heading to 32px consolidated tier
- **Globals CSS**: Added `paragraphFadeIn` keyframe

### Task 3 (Checkpoint): User Review Feedback
User identified two issues after visual review:

### Fix 1: Per-Paragraph Streaming (post-checkpoint)
Switched from buffer-validate-then-stream to per-paragraph inline validation:
- API route now streams directly from Claude, buffers until paragraph boundary (`\n\n`), validates each paragraph with `validateParagraph()`, and emits to client immediately upon passing
- Added `validateParagraph()` function to `src/lib/safety.ts`
- First paragraph appears in ~5-8s instead of ~30s
- If any paragraph fails validation, stream aborts immediately
- Updated loading overlay copy from "This takes about 30 seconds" to "Just a moment..."

### Fix 2: Name Persistence (post-checkpoint)
- On form mount, reads `nightlight-name` from sessionStorage and pre-fills the name field
- On every name change, persists to sessionStorage
- Only name is remembered -- age, theme, and duration reset each visit

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Streaming latency too high**
- **Found during:** Task 3 checkpoint review (user feedback)
- **Issue:** Buffer-validate-then-stream caused ~30s wait before any text appeared
- **Fix:** Switched to per-paragraph inline validation -- validate each paragraph as it arrives from LLM, stream to client immediately
- **Files modified:** src/app/api/generate/route.ts, src/lib/safety.ts
- **Commit:** 551e9a8

**2. [Rule 2 - Missing functionality] Child name not remembered**
- **Found during:** Task 3 checkpoint review (user feedback)
- **Issue:** Returning to form after "NEW STORY" required re-entering child's name
- **Fix:** Persist name to sessionStorage on change, restore on mount
- **Files modified:** src/components/story-form.tsx
- **Commit:** 551e9a8

**3. [Rule 1 - Bug] Stale loading overlay copy**
- **Found during:** Fix 1 implementation
- **Issue:** "This takes about 30 seconds" no longer accurate with per-paragraph streaming
- **Fix:** Changed to "Just a moment..."
- **Files modified:** src/components/loading-overlay.tsx
- **Commit:** 551e9a8

## Pre-existing Issues (Out of Scope)

- `src/__tests__/use-wake-lock.test.ts` fails due to missing `@testing-library/react` install (dependency declared but not installed in this branch). All other 119 tests pass. This was documented in 12-01-SUMMARY.md.

## Known Stubs

None -- all data paths are fully wired.

## Commits

| Hash | Message |
|------|---------|
| 551e9a8 | fix(12-02): per-paragraph streaming and name persistence |

Note: Tasks 1-2 were committed in a previous agent session and merged via `8fdb05e`.
