---
phase: 06-story-quality-tuning
plan: 02
subsystem: story-generation
tags: [prompt-engineering, narrative-arc, wind-down, sensory, variation, tdd]
dependency_graph:
  requires:
    - phase: 06-01
      provides: per-age-sensory-descriptions in ReadingLevelConfig
  provides:
    - rewritten-buildSystemPrompt-with-quality-decisions
    - narrative-arc-guidance
    - wind-down-ending-pattern
    - opening-style-variation
  affects: [system-prompt-via-buildReinforcedSystemPrompt, story-output-quality]
tech_stack:
  added: []
  patterns: [tdd-red-green, structured-prompt-sections]
key_files:
  created: []
  modified:
    - src/lib/prompts.ts
    - src/lib/__tests__/prompts.test.ts
key_decisions:
  - "Prompt organized into labeled sections (Story structure, Opening variety, Voice and craft) for Claude readability"
  - "Sleepy cues and sentence taper placed in Ending subsection rather than separate section to keep prompt concise (266 words)"
patterns-established:
  - "Structured system prompt: role line, reading level, length, story structure, opening variety, voice and craft"
requirements-completed: [STORY-05, STORY-06, STORY-07]
metrics:
  duration_minutes: 2
  completed: "2026-03-26T03:31:16Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 06 Plan 02: Rewrite System Prompt with Quality Decisions Summary

**System prompt rewritten with three-part narrative arc, wonder-framed middle, sentence-taper wind-down with sleepy cues, four opening styles for variation, and global sensory grounding (D-01 through D-07, D-09)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-26T03:29:32Z
- **Completed:** 2026-03-26T03:31:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Rewrote buildSystemPrompt to implement 8 prompt quality decisions (D-01 through D-07, D-09) in a concise 266-word prompt
- Added 8 new test assertions covering every decision, all passing alongside 17 existing tests (25 total, 100 full suite)
- Preserved function signature, word-count interpolation, and readingLevel.description integration so buildReinforcedSystemPrompt cascades correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: RED -- Add prompt quality test assertions** - `44efdbb` (test)
2. **Task 2: GREEN -- Rewrite buildSystemPrompt** - `5b7ca1f` (feat)

## Files Created/Modified
- `src/lib/__tests__/prompts.test.ts` - Added `describe('buildSystemPrompt quality tuning (Phase 6)')` block with 8 tests for D-01 through D-09
- `src/lib/prompts.ts` - Rewrote buildSystemPrompt return string with structured sections: story structure (arc, wonder, wind-down), opening variety (4 styles), voice and craft (sensory, name weaving, formatting)

## Decisions Made
- Organized prompt into labeled sections (Story structure, Opening variety, Voice and craft) for Claude readability
- Combined sleepy cues (D-04) and sentence taper (D-03) into the Ending subsection of Story structure rather than a separate section, keeping prompt concise at 266 words
- D-05 (sleep invitation) already existed in the original prompt; strengthened by placing it within the structured ending context alongside sensory cues

## Deviations from Plan

None -- plan executed exactly as written.

Note: D-05 test passed even against the old prompt because the existing prompt already contained "close their eyes and drift off to sleep". This is expected behavior, not a deviation -- the plan describes D-05 as "strengthen existing instruction."

## Known Stubs

None -- all prompt instructions contain real guidance content.

## Verification

- `npx vitest run src/lib/__tests__/prompts.test.ts` -- 25 tests pass (17 existing + 8 new quality tuning)
- `npx vitest run` -- full suite 100/100 pass, zero regressions
- Prompt word count: 266 (under 400 limit)
- buildSystemPrompt signature unchanged: `(readingLevel: ReadingLevelConfig, targetWords: number): string`
- buildReinforcedSystemPrompt, buildUserMessage, buildValidationPrompt, getWordCount, getMaxTokens unchanged

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 06 story quality tuning complete (both plans done)
- System prompt now implements all quality decisions from research phase
- Ready for Phase 06.1 (3-minute duration option) or next milestone phase

---
*Phase: 06-story-quality-tuning*
*Completed: 2026-03-26*
