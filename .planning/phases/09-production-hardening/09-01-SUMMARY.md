---
phase: 09-production-hardening
plan: "01"
subsystem: infrastructure
tags: [rate-limiting, upstash, redis, type-safety]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [upstash-rate-limiting, duration-type-narrowing]
  affects: [src/lib/rate-limit.ts, src/app/api/generate/route.ts, src/lib/schemas.ts]
tech_stack:
  added: ["@upstash/ratelimit", "@upstash/redis"]
  patterns: [lazy-init, dev-bypass, sliding-window]
key_files:
  created: []
  modified:
    - src/lib/rate-limit.ts
    - src/lib/__tests__/rate-limit.test.ts
    - src/lib/schemas.ts
    - src/app/api/generate/route.ts
    - package.json
    - package-lock.json
decisions:
  - "Upstash lazy-init pattern: getRatelimit() guards on UPSTASH_REDIS_REST_URL to avoid module-scope throws in dev/test"
  - "Dev bypass returns { allowed: true } when no Upstash env vars — zero friction for local development"
  - "TDD tasks 1 and 2 merged: tests written as RED phase of Task 1, implementation as GREEN phase"
metrics:
  duration_minutes: 7
  completed: "2026-03-29T13:22:13Z"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 6
  tests_added: 4
  tests_removed: 5
  tests_total: 113
---

# Phase 09 Plan 01: Upstash Rate Limiting and Duration Type Narrowing Summary

Replaced non-functional in-memory Map rate limiter with Upstash Redis sliding-window (10 req/hr/IP) using lazy init and dev bypass; narrowed GenerateInput.duration to literal union eliminating three type casts in route.ts.

## What Was Done

### Task 1: Install Upstash packages and rewrite rate-limit.ts (TDD)
- Installed `@upstash/ratelimit` and `@upstash/redis` npm packages
- Rewrote `src/lib/rate-limit.ts`: replaced in-memory Map with Upstash Redis sliding-window limiter
- `checkRateLimit` changed from sync to async (`Promise<{ allowed: boolean }>`)
- `getRatelimit()` lazy-initializes only when `UPSTASH_REDIS_REST_URL` env var is present
- Prefix `nightlight-tales` scopes keys in shared Redis database
- Wrote 4 new tests with Upstash mocks (vi.mock) replacing 5 old in-memory tests
- **Commit:** `b181703`

### Task 2: Rewrite rate-limit tests for Upstash mocks
- Completed as part of Task 1's TDD RED phase (tests written before implementation)
- Tests cover: dev bypass (no env var), allow path (success: true), deny path (success: false), IP passthrough
- Old timer-based tests fully replaced with Upstash mock-based tests
- **Commit:** `b181703` (merged with Task 1)

### Task 3: Update route.ts and schemas.ts
- `schemas.ts`: Changed `GenerateInput.duration` from `number` to `(typeof VALID_DURATIONS)[number]` (resolves to `3 | 5 | 10 | 15`)
- `route.ts`: Changed `checkRateLimit(ip)` to `await checkRateLimit(ip)`
- `route.ts`: Removed three `as 3 | 5 | 10 | 15` type casts (no longer needed with narrowed type)
- TypeScript compiles clean (`npx tsc --noEmit` exits 0)
- Full test suite green: 113 tests passing
- **Commit:** `31abd01`

## Verification Results

| Check | Result |
|-------|--------|
| `npx vitest run` | 113 tests passing |
| `npx tsc --noEmit` | Clean (exit 0) |
| `await checkRateLimit` in route.ts | Found at line 18 |
| `as 3 \| 5 \| 10 \| 15` in route.ts | None (removed) |
| `typeof VALID_DURATIONS` in schemas.ts | Found at line 28 |
| `getRatelimit` in rate-limit.ts | Found at lines 8, 24 |
| `vi.mock.*upstash` in tests | 2 matches |

## Deviations from Plan

### Merged Tasks

**1. [Structural] Tasks 1 and 2 merged during TDD execution**
- **Reason:** Task 1 is TDD (`tdd="true"`), which requires writing failing tests (RED) before implementation (GREEN). The test rewrite specified in Task 2 is the natural RED phase of Task 1.
- **Impact:** Two commits instead of three; all done criteria for both tasks are met.
- **Files:** `src/lib/rate-limit.ts`, `src/lib/__tests__/rate-limit.test.ts`

### Test Count Note

Plan expected 114+ tests; actual count is 113. The old rate-limit test file had 5 tests; the new one has 4. Net change: -1 test. This is correct — the old tests tested in-memory Map behaviors (window reset, IP isolation, sequential exhaustion) that no longer apply to the Upstash implementation.

## Decisions Made

1. **Upstash lazy-init pattern**: `getRatelimit()` checks `process.env.UPSTASH_REDIS_REST_URL` on every call; only creates the Ratelimit instance once. This avoids module-scope `Redis.fromEnv()` which would throw in environments without Upstash credentials.
2. **Dev bypass**: When `UPSTASH_REDIS_REST_URL` is absent, `checkRateLimit` returns `{ allowed: true }` without touching Redis. Local development has no rate limiting friction.
3. **Duration type uses parenthesized form**: `(typeof VALID_DURATIONS)[number]` rather than `typeof VALID_DURATIONS[number]` to avoid TypeScript precedence ambiguity.

## Known Stubs

None. All functionality is fully wired. Production enforcement depends on Upstash credentials being set in Vercel environment variables (Plan 02 scope).

## Self-Check: PASSED

All files exist. All commits verified. 113 tests passing. TypeScript clean.
