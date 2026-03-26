---
phase: 06-story-quality-tuning
plan: 01
subsystem: story-generation
tags: [prompt-engineering, sensory-guidance, age-levels, tdd]
dependency_graph:
  requires: []
  provides: [per-age-sensory-descriptions]
  affects: [system-prompt-via-readingLevel-description]
tech_stack:
  added: []
  patterns: [tdd-red-green]
key_files:
  created: []
  modified:
    - src/lib/age-levels.ts
    - src/lib/__tests__/age-levels.test.ts
decisions:
  - "D-08: Sensory guidance added per age level in description field, not as global prompt instruction"
metrics:
  duration_minutes: 1
  completed: "2026-03-26T03:27:53Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 06 Plan 01: Per-Age Sensory Guidance Summary

Per-age sensory vocabulary added to ReadingLevelConfig descriptions so system prompt instructs Claude with age-appropriate tactile, auditory, and visual imagery cues.

## What Was Done

### Task 1: RED -- Failing sensory guidance tests (D-08)

Added `describe('getReadingLevel sensory guidance (D-08)')` block with 3 tests asserting sensory keywords in each age band's description. All 3 failed as expected (RED), 9 existing tests passed.

**Commit:** `79d7334` -- `test(06-01): add failing sensory guidance tests for age levels (D-08)`

### Task 2: GREEN -- Expand descriptions with sensory guidance

Appended 1 sentence of sensory guidance to each reading level description:

- **Toddler:** "Use soft, warm, fluffy sensory words and simple sounds like splashing and humming to make the world feel cozy and real."
- **Young child:** "Weave in gentle multi-sense details -- the smell of rain, the feel of cool grass, the glow of moonlight -- to ground the story in comforting sensations."
- **Older child:** "Layer vivid but calming sensory details across sight, sound, smell, and touch to create an immersive, soothing atmosphere."

All 12 age-levels tests pass. Full suite 92/92 green.

**Commit:** `b78d79d` -- `feat(06-01): add per-age sensory guidance to reading levels (D-08)`

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all descriptions contain real sensory guidance content wired into the reading level config.

## Verification

- `npx vitest run src/lib/__tests__/age-levels.test.ts` -- 12 tests pass (9 existing + 3 new sensory)
- `npx vitest run` -- full suite 92/92 pass, zero regressions
- Function signature `getReadingLevel(age: number): ReadingLevelConfig` unchanged

## Self-Check: PASSED
