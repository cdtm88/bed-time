---
phase: 02-core-generation-pipeline
plan: 02
subsystem: api
tags: [anthropic-sdk, claude-streaming, edge-runtime, readablestream]

# Dependency graph
requires:
  - phase: 02-core-generation-pipeline
    plan: 01
    provides: "Input validation (validateInput), age-level mapping (getReadingLevel), prompt construction (buildSystemPrompt, buildUserMessage, getWordCount, getMaxTokens)"
  - phase: 01-project-scaffolding
    provides: "Next.js project with Edge Runtime route stub and tsconfig @/* alias"
provides:
  - "Working POST /api/generate endpoint that streams personalized bedtime stories from Claude"
  - "Anthropic SDK integrated with Edge Runtime streaming via ReadableStream"
  - "Input validation (400), generic error handling (500), API key never exposed"
affects: [03-safety-validation, 04-input-form, 05-reading-experience, 06-quality-tuning]

# Tech tracking
tech-stack:
  added: ["@anthropic-ai/sdk"]
  patterns: [edge-runtime-streaming, readablestream-from-async-iterable, plain-text-stream-no-sse]

key-files:
  created: []
  modified:
    - src/app/api/generate/route.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Plain text streaming (text/plain) instead of SSE (text/event-stream) per D-03 design decision"
  - "Module-level Anthropic client instantiation (reads ANTHROPIC_API_KEY from env automatically)"
  - "Generic 500 error message on Claude failures -- never expose API internals to client"

patterns-established:
  - "ReadableStream wrapping async iterable for Edge Runtime streaming"
  - "content_block_delta + text_delta event filtering for Claude stream consumption"

requirements-completed: [STORY-01, STORY-02, STORY-03, STORY-04, SAFE-04, INFRA-02]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 02 Plan 02: Route Handler Integration Summary

**Anthropic SDK wired into Edge Runtime route handler with Claude streaming, producing personalized bedtime stories via plain text ReadableStream**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T17:39:14Z
- **Completed:** 2026-03-24T17:41:00Z
- **Tasks:** 2 (1 auto + 1 checkpoint verified)
- **Files modified:** 3

## Accomplishments
- Complete POST /api/generate endpoint that accepts name, age, theme, and duration, validates inputs, constructs age-appropriate prompts, streams story text from Claude
- Anthropic SDK installed and integrated with Edge Runtime using ReadableStream pattern (no SSE framing)
- Input validation returns 400 with descriptive JSON errors; Claude failures return generic 500; API key never exposed in responses
- Live verification confirmed: stories stream correctly, child name appears in text, vocabulary differs by age, invalid inputs rejected

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Anthropic SDK and implement route handler with Claude streaming** - `221f529` (feat)
2. **Task 2: Verify live story generation via curl** - checkpoint verified by user (no separate commit)

## Files Created/Modified
- `src/app/api/generate/route.ts` - Complete Edge Runtime POST handler with Claude streaming, input validation, error handling
- `package.json` - Added @anthropic-ai/sdk dependency
- `package-lock.json` - Lock file updated

## Decisions Made
- Plain text streaming (Content-Type: text/plain; charset=utf-8) rather than SSE, per D-03 design decision -- simpler client consumption
- Module-level Anthropic client instantiation -- SDK reads ANTHROPIC_API_KEY from process.env automatically
- Generic "Story generation failed. Please try again." error message on Claude API failures -- never expose model name, error details, or API key

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
ANTHROPIC_API_KEY must be set in `.env.local` for the generation endpoint to function. Key is obtained from the Anthropic Console (https://console.anthropic.com/settings/keys).

## Next Phase Readiness
- POST /api/generate is fully functional and ready for:
  - Phase 3 to wrap with safety validation layer
  - Phase 4 to connect the input form
  - Phase 5 to pipe streaming text into the reading experience
- All Phase 2 success criteria verified: story generation, name personalization, age-appropriate vocabulary, duration scaling, API key protection

## Self-Check: PASSED

All key files verified on disk. Task commit (221f529) verified in git log.
