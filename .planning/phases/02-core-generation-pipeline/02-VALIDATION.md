---
phase: 2
slug: core-generation-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | INFRA-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | STORY-01, SAFE-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | STORY-02 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | STORY-03, STORY-04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | STORY-01..04 | manual + unit | `npx vitest run` + curl | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` and `@vitest/coverage-v8` installed as dev dependencies
- [ ] `vitest.config.ts` created at project root
- [ ] `src/__tests__/generate.test.ts` — stubs for STORY-01..04, SAFE-04, INFRA-02

*These are prerequisites before any Wave 1+ tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| API key not in client bundle | INFRA-02 | Bundle inspection required | Run `npx next build`, inspect `.next/static` directory — grep for ANTHROPIC_API_KEY |
| Streaming response with `curl -N` | STORY-01..04 | Live HTTP streaming | `curl -N -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d '{"name":"Lily","age":5,"theme":"Dragons","duration":5}'` — chunks must arrive incrementally |
| Word count scales with duration | STORY-04 | Requires running generation | Generate for 5/10/15 min durations; word count each response |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
