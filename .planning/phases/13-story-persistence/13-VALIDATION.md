---
phase: 13
slug: story-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 + jsdom |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-??-01 | TBD | 0 | PERSIST-01 | unit | `npx vitest run src/lib/__tests__/story-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 13-??-02 | TBD | 0 | PERSIST-02 | unit | `npx vitest run src/lib/__tests__/story-store.test.ts -x` | ❌ W0 | ⬜ pending |
| 13-??-03 | TBD | 0 | PERSIST-03 | unit | `npx vitest run src/lib/__tests__/share.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/story-store.test.ts` — stubs for PERSIST-01 (idb-keyval save/read/delete) and PERSIST-02 (re-read sessionStorage handoff)
- [ ] `src/lib/__tests__/share.test.ts` — stubs for PERSIST-03 (Redis share create/retrieve/expire)
- [ ] `fake-indexeddb` devDependency — required because jsdom does not implement IndexedDB; install with `npm install -D fake-indexeddb`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe/long-press delete gesture | PERSIST-01 | Touch events are difficult to simulate reliably in jsdom | On mobile (or DevTools touch emulation): open library, swipe left on a card, confirm delete prompt appears and card is removed |
| Clipboard copy on share | PERSIST-03 | Clipboard API requires browser permissions not available in test env | Click share button on library card, verify "Copied!" feedback appears and clipboard contains a `/story/[shareId]` URL |
| Offline re-read | PERSIST-01 | Network throttle requires browser DevTools | Open library while offline (DevTools → Network → Offline), tap a saved story, confirm it renders fully without network |
| Expired share link page | PERSIST-03 | Requires waiting 7 days or manually expiring Redis key | Manually delete the Redis key via Upstash console, navigate to the share URL, confirm friendly expired message appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
