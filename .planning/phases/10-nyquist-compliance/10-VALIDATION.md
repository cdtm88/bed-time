---
phase: 10
slug: nyquist-compliance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | N/A | manual | `cat .planning/phases/01-*/01-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | N/A | manual | `cat .planning/phases/02-*/02-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-03 | 01 | 1 | N/A | manual | `cat .planning/phases/03-*/03-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-04 | 01 | 1 | N/A | manual | `cat .planning/phases/04-*/04-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-05 | 01 | 1 | N/A | manual | `cat .planning/phases/05-*/05-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-06 | 01 | 1 | N/A | manual | `cat .planning/phases/06-*/06-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-07 | 01 | 1 | N/A | manual | `test -f .planning/phases/06.1-*/06.1-VALIDATION.md && echo EXISTS` | ✅ | ⬜ pending |
| 10-01-08 | 01 | 1 | N/A | manual | `cat .planning/phases/07-*/07-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-09 | 01 | 1 | N/A | manual | `cat .planning/phases/08-*/08-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |
| 10-01-10 | 01 | 1 | N/A | manual | `cat .planning/phases/09-*/09-VALIDATION.md \| grep nyquist_compliant` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — this is a documentation-only phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| VALIDATION.md files updated with real evidence | N/A | Documentation content review | Check each file has `nyquist_compliant: true` and `status: complete` in frontmatter |
| Phase 06.1 VALIDATION.md created | N/A | New file creation | `test -f .planning/phases/06.1-3-minute-duration-option/06.1-VALIDATION.md` |
| Phase 9 test commands corrected | N/A | Content review | `grep -c "npm test -- --run" .planning/phases/09-*/09-VALIDATION.md` should show no incorrect variants |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
