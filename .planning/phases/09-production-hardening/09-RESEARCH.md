# Phase 9: Production Hardening - Research

**Researched:** 2026-03-27
**Domain:** Upstash Redis rate limiting on Vercel Edge Runtime; Anthropic model ID verification; TypeScript type narrowing
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Replace `src/lib/rate-limit.ts` in-memory Map with **Upstash Redis** using the `@upstash/ratelimit` and `@upstash/redis` packages.
- **D-02:** Use a **sliding window** algorithm — same semantics as the current implementation (10 requests per 1-hour window per IP).
- **D-03:** **Dev/local fallback** — if `UPSTASH_REDIS_REST_URL` env var is absent, bypass rate limiting entirely and allow all requests. Production is the enforcement layer; no local Redis required.
- **D-04:** Env vars needed in Vercel: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. The plan should include steps to obtain these from the Upstash console and add them to Vercel environment variables.
- **D-05:** Keep the existing limit: **10 requests per hour per IP**. No change to the policy.
- **D-06:** IP extraction stays the same: `x-forwarded-for` header, first IP in the list, fallback to `127.0.0.1`.
- **D-07:** **Haiku model ID** — verify `claude-haiku-4-5-20251001` is correct against current Anthropic docs. Update if needed. The model string appears in `src/lib/safety.ts` line 39.
- **D-08:** **Duration type casts** — `route.ts` has three `duration as 3 | 5 | 10 | 15` casts at lines 46, 48, 55. Fix by narrowing the type in `GenerateInput` (in `src/lib/schemas.ts`) or by extracting duration as the proper type from the validated body.

### Claude's Discretion

- Whether to keep `src/lib/rate-limit.ts` as a separate module or inline the Upstash logic into `route.ts` — keep it modular (separate file) for testability.
- Exact structure of the test updates for `src/lib/__tests__/rate-limit.test.ts` — mock Upstash in tests, test the bypass behaviour when env vars are absent.

### Deferred Ideas (OUT OF SCOPE)

None specified.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-03 | App enforces IP-based rate limiting to prevent abuse in the absence of user authentication | Upstash Redis sliding window replaces in-memory Map; `@upstash/ratelimit` 2.0.8 + `@upstash/redis` 1.37.0 are the confirmed packages; env-var fallback pattern handles local dev |
</phase_requirements>

---

## Summary

Phase 9 closes three production gaps in `src/app/api/generate/route.ts`. The most significant is that the current in-memory `Map`-based rate limiter is a no-op in production because Vercel Edge Runtime isolates are stateless and short-lived — every invocation can get a fresh process with an empty Map. The fix is to replace it with Upstash Redis using `@upstash/ratelimit`, which persists counts in Redis via HTTP (no persistent connection required — compatible with Edge Runtime).

The Haiku model ID `claude-haiku-4-5-20251001` is confirmed correct by current Anthropic docs (March 2026). It is the versioned snapshot ID for Claude Haiku 4.5; `claude-haiku-4-5` is the alias. No change needed.

The duration type-cast debt is caused by `GenerateInput.duration` being typed as `number` in `schemas.ts` while `getWordCount` and `getMaxTokens` in `prompts.ts` require `Duration` (`3 | 5 | 10 | 15`). The clean fix is to change the `duration` field in `GenerateInput` from `number` to `3 | 5 | 10 | 15` — `validateInput` already guards that only valid values reach this point, so TypeScript can be informed of this narrowing at the type level.

**Primary recommendation:** Install `@upstash/ratelimit@2.0.8` and `@upstash/redis@1.37.0`, rewrite `src/lib/rate-limit.ts` as an async function with env-var bypass, update the three call sites in `route.ts` to `await`, narrow `GenerateInput.duration` to the union type, and rewrite the rate-limit tests to mock the Upstash module.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@upstash/ratelimit` | 2.0.8 | Sliding-window rate limiter using Redis | HTTP-based, no persistent connections — designed for Edge/serverless; official Upstash SDK |
| `@upstash/redis` | 1.37.0 | HTTP Redis client for Edge Runtime | Required by `@upstash/ratelimit`; same HTTP-only design |

### No New Supporting Libraries

The three other fixes (model ID, type cast, tests) require only changes to existing files — no additional dependencies.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@upstash/ratelimit` | `ioredis` + custom sliding window | `ioredis` uses TCP sockets — incompatible with Edge Runtime |
| `@upstash/ratelimit` | Vercel KV (wraps Upstash) | Extra abstraction layer; same underlying Upstash Redis; `@upstash/ratelimit` is more direct |
| `@upstash/ratelimit` | Cloudflare KV | Not available on Vercel |

**Installation:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Version verification (confirmed 2026-03-27):**
```
@upstash/ratelimit: 2.0.8
@upstash/redis: 1.37.0
```

---

## Architecture Patterns

### Current vs. Target: `src/lib/rate-limit.ts`

**Current (broken on Edge):**
```typescript
// Synchronous in-memory Map — resets on every cold start
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string): { allowed: boolean } {
  // ...
}
```

**Target (Upstash, with dev fallback per D-03):**
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Lazy-initialized — only created when env vars are present
let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "nightlight-tales",
    })
  }
  return ratelimit
}

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const limiter = getRatelimit()
  if (!limiter) return { allowed: true }   // D-03: bypass when no creds
  const { success } = await limiter.limit(ip)
  return { allowed: success }
}
```

Key implementation notes:
- `Ratelimit.slidingWindow(10, "1 h")` — 10 requests per 1-hour window, matching D-02/D-05.
- The `prefix` scopes keys in Redis so multiple apps can share a database.
- `checkRateLimit` becomes `async` — all three call sites in `route.ts` must be `await`-ed.
- `Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

### Call Site Update: `src/app/api/generate/route.ts`

Current (line 18):
```typescript
const { allowed } = checkRateLimit(ip)
```

Must become:
```typescript
const { allowed } = await checkRateLimit(ip)
```

The `POST` handler is already `async`, so no further change is needed at the handler level.

### Duration Type Narrowing: `src/lib/schemas.ts`

**Root cause:** `GenerateInput.duration` is `number`, but `getWordCount`/`getMaxTokens` in `prompts.ts` expect `Duration` = `3 | 5 | 10 | 15`.

**Fix — narrow the type in `GenerateInput`:**

Current:
```typescript
export interface GenerateInput {
  name: string
  age: number
  theme: string
  duration: number
}
```

Target:
```typescript
export type ValidDuration = 3 | 5 | 10 | 15

export interface GenerateInput {
  name: string
  age: number
  theme: string
  duration: ValidDuration
}
```

This lets the three casts in `route.ts` be removed cleanly:
```typescript
// Before:
const targetWords = getWordCount(duration as 3 | 5 | 10 | 15)
const maxTokens = getMaxTokens(duration as 3 | 5 | 10 | 15)
// ...
duration: duration as 3 | 5 | 10 | 15,

// After (no casts):
const targetWords = getWordCount(duration)
const maxTokens = getMaxTokens(duration)
// ...
duration,
```

The `validateInput` function already enforces `VALID_DURATIONS.includes(duration)` at runtime, so the type assertion at the destructuring site (`body as GenerateInput`) remains sound.

Note: `prompts.ts` defines `type Duration = keyof typeof DURATION_CONFIG` locally. Consider exporting this as `ValidDuration` from `schemas.ts` and importing it in `prompts.ts` to keep the type definition canonical, OR just change `GenerateInput.duration` to `typeof VALID_DURATIONS[number]` which TypeScript will infer as `3 | 5 | 10 | 15`. Either approach eliminates the casts.

### Haiku Model ID: No Change Required

Verified against Anthropic's models overview (March 2026):

| Property | Value |
|----------|-------|
| Versioned API ID | `claude-haiku-4-5-20251001` |
| Alias | `claude-haiku-4-5` |
| Status | Current (not deprecated) |

The string in `src/lib/safety.ts` line 39 — `"claude-haiku-4-5-20251001"` — is correct. No code change required for D-07; the task is verify-and-document only.

### Recommended Project Structure (no change)

The separation of `src/lib/rate-limit.ts` stays the same — just the implementation inside changes. No new files or directories needed.

### Anti-Patterns to Avoid

- **Creating the Redis client at module scope unconditionally:** `const redis = Redis.fromEnv()` at the top level will throw during import if env vars are absent (breaks local dev and test environments). Use the lazy init pattern above.
- **Sharing a module-level `Ratelimit` instance across tests without mocking:** The Upstash SDK makes real HTTP calls. All tests must mock `@upstash/ratelimit` and `@upstash/redis`.
- **Forgetting to `await` the updated `checkRateLimit`:** The function signature changes from sync to async. If the call site is not awaited, the rate limit is silently bypassed (truthy Promise is always "allowed").

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sliding window counting in Redis | Manual ZADD/ZRANGEBYSCORE Lua scripts | `Ratelimit.slidingWindow()` in `@upstash/ratelimit` | Sliding window with atomic operations is subtle to implement correctly; SDK handles atomicity, expiry, and edge cases |
| HTTP Redis client for Edge | Custom `fetch`-based Redis protocol | `@upstash/redis` | Upstash REST API has specific auth headers and serialization; the SDK handles this |

**Key insight:** The `@upstash/ratelimit` package is purpose-built for exactly this use case (Edge Runtime, IP-based limits, sliding window). Rolling a custom implementation would reproduce it incorrectly or incompletely.

---

## Common Pitfalls

### Pitfall 1: Module-scope Redis initialization breaks local dev and tests

**What goes wrong:** `const redis = Redis.fromEnv()` or `new Ratelimit({ redis: Redis.fromEnv(), ... })` at module scope throws immediately when `UPSTASH_REDIS_REST_URL` is not set — which is the local dev environment (per D-03).

**Why it happens:** `Redis.fromEnv()` reads env vars at call time; if called during module import, it runs before any runtime env check.

**How to avoid:** Use lazy initialization — only create the Ratelimit instance inside the exported function, guarded by the env var check. See pattern in Architecture Patterns above.

**Warning signs:** `Error: UPSTASH_REDIS_REST_URL is not set` during `npm run dev` or `vitest run`.

### Pitfall 2: Forgetting to `await` the async `checkRateLimit`

**What goes wrong:** The in-memory version is synchronous. After migration `checkRateLimit` returns a `Promise`. If call sites are not updated to `await`, TypeScript will type-check it as `{ allowed: boolean }` only if the return type annotation is updated — if it is inferred as `Promise<{ allowed: boolean }>`, the destructure `const { allowed } = checkRateLimit(ip)` without await will give `allowed: undefined` at runtime.

**Why it happens:** Forgetting to update one of the three call sites in `route.ts`.

**How to avoid:** After updating `rate-limit.ts`, do a full TypeScript compile check (`npx tsc --noEmit`) before running tests. The compiler will flag the missing `await` if return types are correctly annotated.

**Warning signs:** Rate limiting appears to work (no 429s ever returned) in production after deploy.

### Pitfall 3: Test isolation breaks when module-level state persists between tests

**What goes wrong:** The current tests use `vi.useFakeTimers()` to control time against the in-memory Map. After migration the Map is gone; the tests will import the new module which tries to reach Redis.

**Why it happens:** Vitest does not automatically reset module-level state or mock external modules.

**How to avoid:** Add `vi.mock('@upstash/ratelimit')` and `vi.mock('@upstash/redis')` at the top of the test file, or restructure tests to test the bypass path (env var absent → allowed: true) without needing Redis at all. For the Redis path, mock `Ratelimit.prototype.limit` to return `{ success: true }` or `{ success: false }`.

**Warning signs:** Tests fail with network errors or timeout trying to reach `*.upstash.io`.

### Pitfall 4: Upstash free tier cold starts

**What goes wrong:** Upstash free databases are paused after inactivity. First request after a pause will fail (or be very slow) because Redis needs to resume.

**Why it happens:** Free tier behavior.

**How to avoid:** Use a paid Upstash tier for production, or configure the `timeout` option in Ratelimit so that if the Redis call times out, the request is allowed through rather than rejected. The `@upstash/ratelimit` library has a built-in timeout mechanism that allows requests through by default if Redis is unreachable.

**Warning signs:** First story generation after a period of inactivity returns a 429 or timeout error.

---

## Code Examples

### Upstash Ratelimit: Full Initialization Pattern

```typescript
// Source: https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "nightlight-tales",
})

// Calling limit:
const identifier = "user-ip-address"
const { success } = await ratelimit.limit(identifier)

if (!success) {
  return new Response("Rate limited", { status: 429 })
}
```

### Vitest Mock Pattern for Upstash

```typescript
// In rate-limit.test.ts — mock before any imports that trigger module execution
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn()
    limit = vi.fn().mockResolvedValue({ success: true })
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}))

// Then import the module under test
import { checkRateLimit } from '@/lib/rate-limit'
```

### Duration Type: Narrowing Without Casts

```typescript
// src/lib/schemas.ts — change duration field type
export type ValidDuration = 3 | 5 | 10 | 15

export interface GenerateInput {
  name: string
  age: number
  theme: string
  duration: ValidDuration
}

// src/app/api/generate/route.ts — no more casts needed
const { name, age, theme, duration } = body as GenerateInput
const targetWords = getWordCount(duration)   // duration: ValidDuration, matches prompts.ts Duration
const maxTokens = getMaxTokens(duration)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| In-memory Map rate limiter | Upstash Redis sliding window | Phase 9 (was acceptable MVP debt in Phase 4) | Rate limiting actually enforces in production |
| `duration: number` in GenerateInput | `duration: ValidDuration` (3\|5\|10\|15) | Phase 9 | Eliminates three type casts |

**Deprecated/outdated:**
- In-memory Map for rate limiting on Edge Runtime: Stateless by design — will never work reliably in production. Acceptable for local dev only.

---

## Open Questions

1. **Upstash free tier pausing behavior**
   - What we know: Free Upstash databases pause after inactivity; first request after resume may be slow or fail.
   - What's unclear: Whether the `@upstash/ratelimit` default timeout behavior allows requests through on Redis unavailability.
   - Recommendation: Default behavior is "allow on timeout" — this is acceptable. Document in plan as a known behavior (not a bug).

2. **Whether to export `ValidDuration` from `schemas.ts` and import in `prompts.ts`**
   - What we know: `prompts.ts` currently defines `type Duration = keyof typeof DURATION_CONFIG` locally. `schemas.ts` has `VALID_DURATIONS = [3, 5, 10, 15] as const`.
   - What's unclear: Minor style preference — one canonical type vs. two equivalent types.
   - Recommendation: Change `GenerateInput.duration` to `typeof VALID_DURATIONS[number]` — this is inferred as `3 | 5 | 10 | 15` by TypeScript, eliminates the cast, and requires no cross-module type import. `prompts.ts` keeps its local `Duration` type unchanged.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@upstash/ratelimit` npm package | Rate limiter rewrite | ✗ (not installed) | — | Install: `npm install @upstash/ratelimit @upstash/redis` |
| `@upstash/redis` npm package | Required by ratelimit | ✗ (not installed) | — | Install: `npm install @upstash/ratelimit @upstash/redis` |
| `UPSTASH_REDIS_REST_URL` env var | Production rate limiting | ✗ (not set locally) | — | D-03: bypass locally; set in Vercel for production |
| `UPSTASH_REDIS_REST_TOKEN` env var | Production rate limiting | ✗ (not set locally) | — | D-03: bypass locally; set in Vercel for production |
| Node.js | Build/test | ✓ | (system) | — |
| Vitest | Tests | ✓ | 3.2.4 (in devDependencies) | — |

**Missing dependencies with no fallback:**
- None blocking local execution — the env-var bypass (D-03) means the rewritten module works locally without Upstash credentials.

**Missing dependencies with fallback:**
- `@upstash/ratelimit` and `@upstash/redis` — must be installed before implementation (Wave 0 task).
- Upstash Redis database + Vercel env vars — must be created and configured before production enforcement works (human step in plan).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/rate-limit.test.ts` |
| Full suite command | `npx vitest run` |

**Baseline:** 114 tests pass across 8 test files (confirmed 2026-03-27).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-03 | Bypass allows all requests when `UPSTASH_REDIS_REST_URL` is absent | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts` | ✅ (needs rewrite) |
| INFRA-03 | `limit()` returning `success: true` → `allowed: true` | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts` | ✅ (needs rewrite) |
| INFRA-03 | `limit()` returning `success: false` → `allowed: false` | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts` | ✅ (needs rewrite) |
| D-08 | Duration type flows without cast from `GenerateInput` → `getWordCount`/`getMaxTokens` | type-check | `npx tsc --noEmit` | ✅ (compile check) |
| D-07 | Haiku model ID verified correct | manual-only | n/a — verified in research | verified |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/__tests__/rate-limit.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (`npx vitest run`) + `npx tsc --noEmit` clean before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `npm install @upstash/ratelimit @upstash/redis` — packages must be installed before implementation
- [ ] `src/lib/__tests__/rate-limit.test.ts` — file exists but must be fully rewritten for Upstash implementation; all 5 existing tests will become invalid after `checkRateLimit` is changed

---

## Sources

### Primary (HIGH confidence)

- Anthropic Models Overview (https://platform.claude.com/docs/en/about-claude/models/overview) — verified `claude-haiku-4-5-20251001` is the current versioned ID for Claude Haiku 4.5 (March 2026)
- Upstash Ratelimit Getting Started (https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted) — confirmed `Ratelimit.slidingWindow()` API, `limit()` return shape `{ success: boolean }`, `Redis.fromEnv()` env var names
- npm registry — `@upstash/ratelimit@2.0.8`, `@upstash/redis@1.37.0` (verified 2026-03-27)
- Source file audit: `src/lib/rate-limit.ts`, `src/app/api/generate/route.ts`, `src/lib/safety.ts`, `src/lib/schemas.ts`, `src/lib/prompts.ts`, `src/lib/__tests__/rate-limit.test.ts`

### Secondary (MEDIUM confidence)

- Upstash Ratelimit overview (https://upstash.com/docs/oss/sdks/ts/ratelimit/overview) — confirmed library is designed for Edge/serverless, HTTP-based, no persistent connections

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions confirmed from registry; API confirmed from official Upstash docs
- Architecture: HIGH — patterns confirmed from official Upstash getting-started docs; code analysis of existing source files confirms exact change sites
- Haiku model ID: HIGH — confirmed from Anthropic's own models overview page (March 2026)
- Pitfalls: HIGH — async-sync mismatch and module-scope init are patterns verifiable from code analysis; Upstash free-tier behavior from official docs
- Test strategy: HIGH — existing test file examined; vitest config confirmed; all 114 baseline tests passing

**Research date:** 2026-03-27
**Valid until:** 2026-06-27 (stable libraries; Anthropic model IDs change less frequently than APIs)
