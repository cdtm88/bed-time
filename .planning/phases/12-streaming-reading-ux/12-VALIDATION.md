---
phase: 12
slug: streaming-reading-ux
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest --run` |
| **Full suite command** | `npx vitest --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest --run`
- **After every plan wave:** Run `npx vitest --run`
- **Before `/gsd:verify-work`:** Full suite must be green (113 existing + new tests)
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01a | stream-utils | W0 | STREAM-01 | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "paragraph"` | ❌ W0 | ⬜ pending |
| 12-01b | stream-utils | W0 | STREAM-01 | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "partial"` | ❌ W0 | ⬜ pending |
| 12-01c | stream-utils | W0 | STREAM-01 | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "trailing"` | ❌ W0 | ⬜ pending |
| 12-01d | api-route | W0 | STREAM-01 | unit | `npx vitest --run src/lib/__tests__/generate-route.test.ts` | ❌ W0 | ⬜ pending |
| 12-01e | stream-utils | W0 | STREAM-01 | unit | `npx vitest --run src/lib/__tests__/stream-utils.test.ts -t "multi-byte"` | ❌ W0 | ⬜ pending |
| 12-02a | wake-lock | W0 | STREAM-02 | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | ❌ W0 | ⬜ pending |
| 12-02b | wake-lock | W0 | STREAM-02 | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | ❌ W0 | ⬜ pending |
| 12-02c | wake-lock | W0 | STREAM-02 | unit | `npx vitest --run src/__tests__/use-wake-lock.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/stream-utils.test.ts` — stubs for STREAM-01 (paragraph buffering: split, partial chunks, trailing text, multi-byte characters)
- [ ] `src/__tests__/use-wake-lock.test.ts` — stubs for STREAM-02 (wake lock: acquire on mount, release on unmount, silent fail on unsupported browser)
- [ ] Mock for `navigator.wakeLock` in jsdom environment (jsdom does not implement Wake Lock API)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Loading overlay drops on first complete paragraph | STREAM-01 | Requires browser rendering and timing observation | Generate a story; confirm overlay disappears when first paragraph text appears (not before, not after) |
| Paragraphs appear progressively with 300ms fade-in | STREAM-01 | Visual animation requires browser observation | Generate a story; confirm paragraphs appear one at a time with smooth fade-in, not all at once |
| Screen stays awake during story reading | STREAM-02 | Requires physical device testing (screen-off timeout) | Read a story for 2+ minutes on mobile device with short auto-lock setting; confirm screen stays on |
| Wake Lock fails silently on unsupported/denied browser | STREAM-02 | Requires controlled environment or browser flag | Disable Wake Lock in browser (or use Firefox private mode); confirm story still loads and reads without errors |
| Story form stores params and navigates (no fetch) | STREAM-01 | E2E flow requires browser interaction | Submit form; confirm Network tab shows no `/api/generate` request from `/`; confirm redirect to `/story` |
| Refresh of /story re-renders completed story | STREAM-01 | Requires sessionStorage state verification | Complete a story, refresh the page; confirm story re-renders without re-fetching from API |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
