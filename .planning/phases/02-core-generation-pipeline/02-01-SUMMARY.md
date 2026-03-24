---
phase: 02-core-generation-pipeline
plan: 01
subsystem: api
tags: [vitest, validation, prompt-engineering, age-mapping, tdd]

# Dependency graph
requires:
  - phase: 01-project-scaffolding
    provides: "Next.js project structure with tsconfig @/* alias and Edge Runtime route stub"
provides:
  - "Input validation module (validateInput, VALID_THEMES, VALID_DURATIONS, GenerateInput type)"
  - "Age-to-reading-level mapping (getReadingLevel with toddler/young_child/older_child bands)"
  - "Prompt construction (buildSystemPrompt, buildUserMessage, getWordCount, getMaxTokens)"
  - "Vitest test infrastructure with path alias support"
affects: [02-core-generation-pipeline, 03-safety-validation, 06-quality-tuning]

# Tech tracking
tech-stack:
  added: [vitest]
  patterns: [tdd-red-green, pure-function-modules, xml-delimited-name-injection-prevention]

key-files:
  created:
    - vitest.config.ts
    - src/lib/schemas.ts
    - src/lib/age-levels.ts
    - src/lib/prompts.ts
    - src/lib/__tests__/schemas.test.ts
    - src/lib/__tests__/age-levels.test.ts
    - src/lib/__tests__/prompts.test.ts
  modified:
    - package.json

key-decisions:
  - "System prompt uses word count range (e.g. 1400-1600) rather than exact target for more natural output"
  - "Name regex uses /^[a-zA-Z\\s]{1,30}$/ per D-06 -- letters and spaces only, no accented characters"

patterns-established:
  - "TDD workflow: write failing tests first, implement, verify green"
  - "Pure function library modules in src/lib/ with co-located __tests__ directory"
  - "Vitest configured with @/ path alias matching tsconfig"

requirements-completed: [STORY-01, STORY-02, STORY-03, STORY-04, SAFE-04]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 02 Plan 01: Core Library Modules Summary

**Input validation, age-to-reading-level mapping, and prompt construction modules with 46 passing Vitest tests via TDD**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T08:03:16Z
- **Completed:** 2026-03-24T08:05:53Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Input validation module with 18 locked themes, 3 durations, name regex, age bounds, and typed GenerateInput interface
- Age-to-reading-level mapping returning toddler/young_child/older_child configs with description strings
- Prompt construction with XML-delimited child name (SAFE-04), bedtime/calming system prompt, and duration-to-word-count/max-tokens mapping
- Vitest test infrastructure installed and configured with @/ path alias support
- 46 tests across 3 test files, all passing, covering all validation rules and boundary cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Vitest, create test config, and implement input validation module** - `8d8a608` (feat)
2. **Task 2: Implement age-level mapping and prompt construction modules with tests** - `0afc586` (feat)

## Files Created/Modified
- `vitest.config.ts` - Test runner config with @/ path alias
- `src/lib/schemas.ts` - VALID_THEMES (18), VALID_DURATIONS, GenerateInput type, validateInput function
- `src/lib/age-levels.ts` - ReadingLevel type, ReadingLevelConfig interface, getReadingLevel function
- `src/lib/prompts.ts` - buildSystemPrompt, buildUserMessage, getWordCount, getMaxTokens with DURATION_CONFIG
- `src/lib/__tests__/schemas.test.ts` - 20 tests for input validation
- `src/lib/__tests__/age-levels.test.ts` - 9 tests for age-level mapping
- `src/lib/__tests__/prompts.test.ts` - 17 tests for prompt construction
- `package.json` - Added vitest dev dependency

## Decisions Made
- System prompt uses a word count range (93%-107% of target) rather than an exact number, for more natural Claude output
- Name regex is `/^[a-zA-Z\s]{1,30}$/` per D-06 -- ASCII letters and spaces only; accented characters are not accepted (plan specifies "letters only = a-zA-Z plus spaces per D-06")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three library modules are ready for Plan 02 to wire into the route handler
- prompts.ts imports from age-levels.ts (key link established)
- schemas.ts types will be consumed by the route handler for input validation
- `npm run build` passes with no TypeScript errors

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (8d8a608, 0afc586) verified in git log.
