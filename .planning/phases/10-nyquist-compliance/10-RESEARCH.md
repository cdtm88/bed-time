# Phase 10: Nyquist Compliance - Research

**Researched:** 2026-03-30
**Domain:** Documentation gap closure -- VALIDATION.md evidence backfill
**Confidence:** HIGH

## Summary

Phase 10 is a documentation-only phase. All 9 existing VALIDATION.md files (Phases 1-9) need to be updated from `status: draft` to `status: complete` with real test evidence, and a new Phase 06.1 VALIDATION.md must be created from scratch. No production code changes are required.

The test suite is fully green: 113 tests across 8 files, all passing (verified 2026-03-30). Per-phase test file runs have been individually verified, providing the exact pass counts needed for evidence notes. The work is mechanical -- run each phase's test files, record results, update frontmatter and status fields, fix command references, and mark manual verifications with backdated evidence from phase execution.

**Primary recommendation:** Structure as a single plan with one task per VALIDATION.md file (10 tasks total). Each task runs the phase-specific tests, records evidence, updates all fields per the decision template, and corrects any `npm test -- --run` references to `npx vitest run`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Evidence = per-phase test file runs. Run each phase's specific test file(s) and capture the actual pass count + output. Each VALIDATION.md gets evidence from its own tests, not just a reference to the full suite.
- **D-02:** Task status rows: if the specific test file for that task passes, mark it `green` with a note showing pass count. If no automated test maps to a task (Wave 0 / manual-only), handle separately per D-03.
- **D-03:** Frontmatter updates: set `status: complete`, `nyquist_compliant: true`, `wave_0_complete: true`, and add `**Approval:** verified` to the sign-off section.
- **D-04:** Manual-only verifications for already-deployed phases: mark as `verified` with a backdated note -- "Verified during Phase N execution -- [brief evidence]". Honest, closes the loop.
- **D-05:** Phase 9 production rate-limit check (requires live Upstash + Vercel): mark as `verified`, cite commit `344e5d3` with note "Confirmed in production during Phase 09 execution".
- **D-06:** All VALIDATION.md files reference `npm test -- --run` but there's no `test` script in `package.json`. Correct all test commands to `npx vitest run` (and per-file variants like `npx vitest run src/lib/__tests__/rate-limit.test.ts`) when touching each file.
- **D-07:** Create a full-template, evidence-filled `06.1-VALIDATION.md` for the 3-minute duration insertion phase. Map tasks to `prompts.test.ts` (word count / prompt construction for 3-min) and `schemas.test.ts` (duration validation), which already pass. Mark evidence as `green`.

### Claude's Discretion
- The exact structure of the per-phase evidence note (pass count format, date stamp format) -- use a consistent format across all files.
- Whether Phase 1 (no unit tests, only build checks) gets a different evidence note format -- handle as appropriate given it's a build-only phase.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Architecture Patterns

### Per-VALIDATION.md Update Pattern

Each VALIDATION.md update follows the same mechanical sequence:

1. **Run phase-specific tests** -- `npx vitest run <file(s)>` and record pass count
2. **Update frontmatter** -- set `status: complete`, `nyquist_compliant: true`, `wave_0_complete: true`
3. **Update Per-Task Verification Map** -- change `pending` to `green` with evidence note
4. **Fix command references** -- replace any `npm test -- --run` with `npx vitest run`
5. **Update Wave 0 Requirements** -- check all boxes
6. **Update Manual-Only Verifications** -- add backdated evidence notes
7. **Update Validation Sign-Off** -- check all boxes, set `**Approval:** verified`

### Evidence Note Format (Discretion Area)

Recommended consistent format across all files:

```
[pass_count] tests passing -- npx vitest run [file] -- 2026-03-30
```

For manual verifications:
```
Verified during Phase [N] execution -- [brief evidence]. 2026-03-30
```

For Phase 1 (build-only, no unit tests):
```
Build verification: npm run build succeeds (0 errors). Deployed at bed-time-nu.vercel.app. 2026-03-30
```

### Recommended Project Structure for Tasks

```
Phase 1:  Build-only -- npm run build (no vitest files)
Phase 2:  prompts.test.ts (32), schemas.test.ts (22), age-levels.test.ts (12)
Phase 3:  safety.test.ts (23)
Phase 4:  theme-utils.test.ts (7), rate-limit.test.ts (4), schemas.test.ts (22)
Phase 5:  reading-view.test.ts (8)
Phase 6:  prompts.test.ts (32), age-levels.test.ts (12)
Phase 06.1: prompts.test.ts (32), schemas.test.ts (22) [NEW file to create]
Phase 7:  No unit tests -- manual/visual only
Phase 8:  theme-svg-assets.test.ts (5)
Phase 9:  rate-limit.test.ts (4)
```

### Anti-Patterns to Avoid
- **Running only the full suite as evidence:** D-01 explicitly requires per-phase test file runs, not just a reference to the full suite passing.
- **Leaving Wave 0 checkboxes unchecked:** Even though these were completed during original phase execution, the VALIDATION.md checkboxes were never ticked. They must be checked now.
- **Using `npm test -- --run`:** This command does not work (no `test` script in package.json). All references must be `npx vitest run`.

## Per-File Inventory

### Files Needing `npm test` Command Correction (D-06)

Only Phase 9 VALIDATION.md contains `npm test -- --run` references. Phases 1-8 already use `npx vitest run` or `npm run build` (Phase 1). However, ALL files should be audited during update since D-06 says "correct all test commands."

**Verified findings:**
- Phase 9: 8 occurrences of `npm test -- --run` -- MUST fix
- Phases 1-8: Already use `npx vitest run` or `npm run build` -- no correction needed

### Current Test Evidence (Verified 2026-03-30)

| Phase | Test File(s) | Pass Count | Notes |
|-------|-------------|------------|-------|
| 1 | N/A (build check) | N/A | `npm run build` is the verification |
| 2 | prompts.test.ts, schemas.test.ts, age-levels.test.ts | 32 + 22 + 12 = 66 | Shared files with other phases |
| 3 | safety.test.ts | 23 | All passing |
| 4 | theme-utils.test.ts, rate-limit.test.ts, schemas.test.ts | 7 + 4 + 22 = 33 | rate-limit shared with Phase 9 |
| 5 | reading-view.test.ts | 8 | All passing |
| 6 | prompts.test.ts, age-levels.test.ts | 32 + 12 = 44 | Shared files |
| 06.1 | prompts.test.ts, schemas.test.ts | 32 + 22 = 54 | New VALIDATION.md needed |
| 7 | N/A (manual/visual) | N/A | Branding phase, no unit tests |
| 8 | theme-svg-assets.test.ts | 5 | All passing |
| 9 | rate-limit.test.ts | 4 | All passing |

### Phase-Specific Notes

**Phase 1 (project-scaffolding):** Build-only phase. No vitest tests exist. Evidence should cite successful `npm run build` and the live deployment at bed-time-nu.vercel.app. Distinct evidence format is appropriate per discretion area.

**Phase 7 (nightlight-tales-branding):** No unit tests. All verifications are manual/visual (favicon, OG tags, package name). Evidence should use the backdated format per D-04: "Verified during Phase 7 execution."

**Phase 9 (production-hardening):** Has the most command corrections needed (8 `npm test` references). Also needs special handling for the production rate-limit manual verification per D-05, citing commit `344e5d3`.

**Phase 06.1 (3-minute duration):** Needs a completely new VALIDATION.md created from scratch. Should follow the same template structure as other phases. Map to prompts.test.ts (compact arc tests: 5 tests in the "compact arc" describe block) and schemas.test.ts (duration validation: `accepts duration 3` test).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test evidence | Manual pass/fail guesses | Actual `npx vitest run` output | D-01 requires real test runs as evidence |
| VALIDATION.md structure | New template | Existing 9-file template pattern | All files use identical structure |

## Common Pitfalls

### Pitfall 1: Inconsistent Evidence Notes
**What goes wrong:** Each VALIDATION.md ends up with different formats for evidence notes, making the set look unfinished.
**Why it happens:** Working through 10 files sequentially, drift accumulates.
**How to avoid:** Define the evidence note format before starting. Use copy-paste for the structural parts, only changing phase-specific data.
**Warning signs:** Different date formats, different wording for pass counts, inconsistent use of checkmarks.

### Pitfall 2: Missing Command Correction in Phase 9
**What goes wrong:** The `npm test -- --run` commands in Phase 9 are left uncorrected, breaking the D-06 requirement.
**Why it happens:** Phase 9 is the only file with this problem, easy to miss if not specifically audited.
**How to avoid:** Phase 9 task explicitly includes command correction as a step.
**Warning signs:** Any occurrence of `npm test` in the final VALIDATION.md files.

### Pitfall 3: Forgetting Phase 06.1 is a Create, Not Update
**What goes wrong:** Phase 06.1 task is treated as a simple update like the others, but it requires creating a new file from scratch.
**Why it happens:** Lumping it with the other 9 update tasks.
**How to avoid:** Phase 06.1 task is explicitly scoped as a create task, using an existing VALIDATION.md as template.
**Warning signs:** Missing sections, incomplete frontmatter.

### Pitfall 4: Shared Test Files Between Phases
**What goes wrong:** Reporting the same test file's pass count identically across phases without noting which tests are phase-relevant.
**Why it happens:** prompts.test.ts (32 tests) covers Phases 2, 6, and 06.1 -- but different test groups within it map to different phases.
**How to avoid:** In evidence notes, reference the specific test file and total pass count. The per-task verification map already maps tasks to specific test groups -- those test groups all pass, so the evidence is valid.
**Warning signs:** Confusion about whether a 32-test pass count "belongs to" Phase 2 or Phase 6.

## Code Examples

### Frontmatter Update Pattern
```yaml
---
phase: N
slug: phase-slug
status: complete          # was: draft
nyquist_compliant: true   # was: false
wave_0_complete: true     # was: false
created: YYYY-MM-DD
---
```

### Per-Task Status Update Pattern
```markdown
| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | INFRA-02 | unit | `npx vitest run` | ✅ | ✅ 32+22+12 tests passing (2026-03-30) |
```

### Validation Sign-Off Pattern
```markdown
- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < Ns
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified (2026-03-30)
```

### Phase 06.1 VALIDATION.md Template Skeleton
```markdown
---
phase: 6.1
slug: 3-minute-duration-option
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-30
---

# Phase 06.1 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure
[vitest framework, npx vitest run commands]

## Sampling Rate
[per-task and per-wave commands]

## Per-Task Verification Map
[Map to prompts.test.ts compact arc tests + schemas.test.ts duration 3 test]

## Wave 0 Requirements
[Existing infrastructure covers all requirements]

## Manual-Only Verifications
[None -- all verifiable via unit tests]

## Validation Sign-Off
[All boxes checked, Approval: verified]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npm test -- --run` | `npx vitest run` | Phase 4+ | No `test` script in package.json; npx vitest run is the correct command |
| Draft VALIDATION.md templates | Evidence-filled, complete VALIDATION.md | Phase 10 (now) | Closes Nyquist compliance gap |

## Open Questions

None -- all information needed is available. The decisions are locked, the test suite is verified, and the template structure is well-established across 9 existing files.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map

This phase has no requirement IDs (it is a documentation gap closure). Validation for this phase is that all 10 VALIDATION.md files reach `status: complete` and `nyquist_compliant: true`.

| Check | Behavior | Test Type | Automated Command |
|-------|----------|-----------|-------------------|
| V-01 | All 10 VALIDATION.md files have `status: complete` in frontmatter | grep check | `grep -l "status: complete" .planning/phases/*/0*-VALIDATION.md \| wc -l` (expect 10) |
| V-02 | All 10 VALIDATION.md files have `nyquist_compliant: true` | grep check | `grep -l "nyquist_compliant: true" .planning/phases/*/0*-VALIDATION.md \| wc -l` (expect 10) |
| V-03 | No files contain `npm test` | grep check | `grep -rl "npm test" .planning/phases/*/0*-VALIDATION.md` (expect no output) |
| V-04 | Full test suite still passes | test run | `npx vitest run` (113 tests, 8 files) |

### Sampling Rate
- **Per task commit:** `npx vitest run` (ensure no test regressions from doc changes -- should be no-op)
- **Per wave merge:** Grep checks V-01 through V-03
- **Phase gate:** All 4 checks green before `/gsd:verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. This phase creates/edits only markdown files.

## Sources

### Primary (HIGH confidence)
- Direct file reads of all 9 existing VALIDATION.md files (Phases 1-9)
- Direct test suite execution: `npx vitest run` -- 113 tests, 8 files, all passing
- Per-file test runs for all 8 test files -- individual pass counts verified
- CONTEXT.md decisions D-01 through D-07

### Secondary (MEDIUM confidence)
- None needed -- all information is from direct project inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no libraries involved, pure documentation
- Architecture: HIGH -- template pattern is established across 9 files
- Pitfalls: HIGH -- identified from direct file inspection

**Research date:** 2026-03-30
**Valid until:** Indefinite (documentation phase, no external dependencies)
