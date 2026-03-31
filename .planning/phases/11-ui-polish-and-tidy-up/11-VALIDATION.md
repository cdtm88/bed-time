---
phase: 11
slug: ui-polish-and-tidy-up
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (via `npm test`) |
| **Config file** | `vite.config.ts` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10 seconds |

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
| 11-01-01 | 01 | 1 | D-01 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | D-02 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | D-03 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | D-04 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 1 | D-05 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-02-03 | 02 | 1 | D-06 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 2 | D-07 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |
| 11-03-02 | 03 | 2 | D-08 | visual/manual | `npm test -- --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero illustration renders with moon/stars + breathing animation | D-01 | Visual CSS animation, not unit-testable | Open app, verify hero section shows animated illustration |
| Typography hierarchy correct across all pages | D-02 | Visual comparison required | Check heading sizes, font-weight, letter-spacing on each screen |
| Theme selector tiles show gold tint on selection | D-03 | CSS visual state | Select each theme, verify selected tile has gold overlay |
| Loading overlay uses dark background with light text | D-08 | Visual contrast check | Trigger loading state, verify text is readable on dark background |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
