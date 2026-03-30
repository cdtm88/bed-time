---
phase: 9
slug: production-hardening
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-27
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | INFRA-03 | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts` | ✅ | ✅ 4 tests passing -- npx vitest run src/lib/__tests__/rate-limit.test.ts -- 2026-03-30 |
| 9-01-02 | 01 | 1 | INFRA-03 | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts` | ✅ | ✅ 4 tests passing -- npx vitest run src/lib/__tests__/rate-limit.test.ts -- 2026-03-30 |
| 9-01-03 | 01 | 2 | INFRA-03 | integration | manual — verify 429 from curl after 10 requests | — | ✅ Verified during Phase 9 execution -- confirmed 429 in production. Commit 344e5d3. 2026-03-30 |
| 9-02-01 | 02 | 1 | tech-debt | unit | `npx vitest run` | ✅ | ✅ 113 tests passing -- npx vitest run -- 2026-03-30 |
| 9-02-02 | 02 | 1 | tech-debt | unit | `npx vitest run` | ✅ | ✅ 113 tests passing -- npx vitest run -- 2026-03-30 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `src/lib/__tests__/rate-limit.test.ts` already exists and will be rewritten for the Upstash implementation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|------------------|
| Rate limit enforced in production on Vercel Edge | INFRA-03 | Requires production deployment and live Upstash Redis | Deploy to Vercel; curl POST /api/generate 11 times from same IP; 11th request must return 429 -- ✅ Confirmed in production during Phase 09 execution. Commit 344e5d3. 2026-03-30 |
| Local dev bypasses rate limit when no Upstash creds | D-03 | Requires unset env vars | Remove UPSTASH_REDIS_REST_URL from .env.local; verify story generation succeeds -- ✅ Verified during Phase 9 execution. 2026-03-30 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified (2026-03-30)
