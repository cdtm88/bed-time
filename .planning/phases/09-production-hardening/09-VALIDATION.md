---
phase: 9
slug: production-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (or inline in package.json) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | INFRA-03 | unit | `npm test -- --run src/lib/__tests__/rate-limit.test.ts` | ✅ | ⬜ pending |
| 9-01-02 | 01 | 1 | INFRA-03 | unit | `npm test -- --run src/lib/__tests__/rate-limit.test.ts` | ✅ | ⬜ pending |
| 9-01-03 | 01 | 2 | INFRA-03 | integration | manual — verify 429 from curl after 10 requests | — | ⬜ pending |
| 9-02-01 | 02 | 1 | tech-debt | unit | `npm test -- --run` | ✅ | ⬜ pending |
| 9-02-02 | 02 | 1 | tech-debt | unit | `npm test -- --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `src/lib/__tests__/rate-limit.test.ts` already exists and will be rewritten for the Upstash implementation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rate limit enforced in production on Vercel Edge | INFRA-03 | Requires production deployment and live Upstash Redis | Deploy to Vercel; curl POST /api/generate 11 times from same IP; 11th request must return 429 |
| Local dev bypasses rate limit when no Upstash creds | D-03 | Requires unset env vars | Remove UPSTASH_REDIS_REST_URL from .env.local; verify story generation succeeds |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
