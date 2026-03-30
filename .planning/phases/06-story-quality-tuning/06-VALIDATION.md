---
phase: 6
slug: story-quality-tuning
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/__tests__/prompts.test.ts src/lib/__tests__/age-levels.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/__tests__/prompts.test.ts src/lib/__tests__/age-levels.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | STORY-05 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "narrative arc"` | ✅ (update) | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-02 | 01 | 1 | STORY-05 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "wonder"` | ✅ (update) | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-03 | 01 | 1 | STORY-06 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "taper"` | ✅ | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-04 | 01 | 1 | STORY-06 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sleepy"` | ✅ | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-05 | 01 | 1 | STORY-06 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sleep"` | ✅ (update) | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-06 | 01 | 1 | STORY-07 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "opening"` | ✅ | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |
| 6-01-07 | 01 | 1 | STORY-07 | unit | `npx vitest run src/lib/__tests__/age-levels.test.ts -t "sensory"` | ✅ | ✅ 12 tests passing -- npx vitest run src/lib/__tests__/age-levels.test.ts -- 2026-03-30 |
| 6-01-08 | 01 | 1 | STORY-07 | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sensory"` | ✅ | ✅ 32 tests passing -- npx vitest run src/lib/__tests__/prompts.test.ts -- 2026-03-30 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing test infrastructure (vitest, config, test files) covers all phase requirements. No new framework installation needed. New test assertions must be added to existing test files before implementing prompt changes.

- [x] `src/lib/__tests__/prompts.test.ts` — add stubs for: sentence taper (STORY-06), sleepy sensory cues (STORY-06), four opening styles (STORY-07), global sensory grounding (STORY-07)
- [x] `src/lib/__tests__/age-levels.test.ts` — add stubs for: per-age sensory guidance for toddler, young child, older child (STORY-07)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|------------------|
| Story output quality — actual narrative engages and calms | STORY-05, STORY-06 | LLM output is non-deterministic; prompt correctness verified by unit tests, but story quality requires human judgment | Generate 2-3 stories with different age/theme combos via the app; verify each has a clear arc, calming ending, and doesn't feel generic -- ✅ Verified during Phase 6 execution. 2026-03-30 |
| Variation across same inputs | STORY-07 | Non-deterministic | Generate 3 stories with identical inputs (same name, age, theme, duration); verify openings are noticeably different -- ✅ Verified during Phase 6 execution. 2026-03-30 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified (2026-03-30)
