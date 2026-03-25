---
phase: 4
slug: input-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | INFRA-03 | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | FORM-THEME | unit | `npx vitest run src/lib/__tests__/theme-utils.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | FORM-VAL | unit | `npx vitest run src/lib/__tests__/schemas.test.ts -x` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 1 | INFRA-03 | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | INFRA-01 | smoke | Manual: visit `/` in browser, no auth gate | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/rate-limit.test.ts` — stubs for INFRA-03 (rate limiter returns 429 after N requests, resets after window)
- [ ] `src/lib/__tests__/theme-utils.test.ts` — stubs for theme name to kebab-case filename mapping

*Existing infrastructure covers schemas.test.ts; only the above two files need to be created in Wave 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Form renders at `/` with no auth gate | INFRA-01 | Browser navigation required | Visit `/` — form appears immediately, no login/signup prompt |
| Loading overlay appears on submit | D-10 | Visual interaction | Enter valid inputs, click Generate — overlay covers screen with child's name |
| CSS animation plays during loading | D-12 | Visual verification | Stars/moon animation is visible and calm during loading state |
| Theme tile selected state visible | D-06 | Visual interaction | Clicking a theme tile shows a clear selected state |
| Duration toggle updates on click | D-05 | Visual interaction | Clicking 5/10/15 min toggles the active button state |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
