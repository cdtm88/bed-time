---
phase: 3
slug: safety-validation-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/lib/__tests__/safety.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/__tests__/safety.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | SAFE-01, SAFE-02, SAFE-03 | unit | `npx vitest run src/lib/__tests__/safety.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | SAFE-01 | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "validation"` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | SAFE-02 | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "retry"` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 1 | SAFE-03 | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "error"` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | SAFE-01, SAFE-02, SAFE-03 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/safety.test.ts` — stubs for SAFE-01 (validation parsing), SAFE-02 (retry orchestration), SAFE-03 (error handling on all-fail)
- [ ] Mock pattern for Anthropic SDK `messages.create()` — vi.mock or manual mock needed to test without real API calls

*Existing vitest infrastructure covers framework setup — no new install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Edge Runtime timeout with buffered response on 3 attempts (worst case ~45s) | SAFE-02 | Cannot simulate Vercel Edge timeout in unit tests | Deploy to Vercel, request a 15-minute story, force validator to return UNSAFE 3 times (mock or temporary hardcode), observe whether request times out or returns friendly error |
| Client never sees "unsafe"/"validation"/"retry" in error response | SAFE-03 | Integration behavior across HTTP response | Send request that exhausts all retries, inspect raw HTTP response body — must contain only `{"error":"We weren't able to create a story right now. Please try again."}` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
