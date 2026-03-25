---
phase: 03-safety-validation-layer
plan: 02
subsystem: api
tags: [safety-validation, buffered-response, route-handler, edge-runtime]

requires:
  - phase: 03-safety-validation-layer
    provides: generateSafeStory orchestrator, GenerationParams interface, SafeStoryResult type from safety.ts
provides:
  - Buffered safety-validated /api/generate endpoint (no streaming)
  - Friendly D-07 error message on generation failure
  - Thin route handler delegating to safety module
affects: [04-reading-experience-ui]

tech-stack:
  added: []
  patterns: [buffered-response-over-streaming, thin-route-handler-pattern]

key-files:
  created: []
  modified:
    - src/app/api/generate/route.ts

key-decisions:
  - "Buffered response replaces streaming: full story validated before reaching client"
  - "Route handler is thin: validates input, builds params, delegates to generateSafeStory"

patterns-established:
  - "Thin route handler: route.ts only handles HTTP concerns, delegates business logic to library modules"
  - "Discriminated union result pattern: check result.ok to branch success/failure responses"

requirements-completed: [SAFE-01, SAFE-02, SAFE-03]

duration: 1min
completed: 2026-03-25
---

# Phase 03 Plan 02: Route Handler Safety Integration Summary

**Buffered safety-validated /api/generate replacing streaming with generate-validate-return flow via generateSafeStory**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-25T03:41:39Z
- **Completed:** 2026-03-25T03:42:30Z
- **Tasks:** 1 of 2 (Task 2 is human-verify checkpoint)
- **Files modified:** 1

## Accomplishments
- Replaced streaming ReadableStream with buffered generateSafeStory call ensuring every story is validated before reaching the client
- Removed all streaming artifacts (ReadableStream, TextEncoder, stream: true)
- Updated error message to D-07 friendly text for both result.ok===false and unexpected catch cases
- Route handler reduced to ~75 lines with clean separation of concerns

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace streaming with buffered safety-validated response** - `ec7880f` (feat)

## Files Created/Modified
- `src/app/api/generate/route.ts` - Rewired to use generateSafeStory, buffered plain text response, D-07 error handling

## Decisions Made
- Buffered response replaces streaming: story must pass Haiku validation before client receives it
- Route handler kept thin: only HTTP concerns (parse body, validate input, map result to response)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - route handler is fully wired to safety module.

## Next Phase Readiness
- Safety validation layer complete: every story passes Haiku check before reaching the client
- Ready for Phase 04 reading experience UI to consume /api/generate as buffered text endpoint

---
*Phase: 03-safety-validation-layer*
*Completed: 2026-03-25*
