---
phase: 5
slug: reading-experience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

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
| 5-01-01 | 01 | 0 | READ-01a–e | unit | `npx vitest run src/__tests__/reading-view.test.ts` | ❌ W0 | ⬜ pending |
| 5-xx-xx | TBD | 1 | READ-01f | manual | Visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/reading-view.test.ts` — stubs for READ-01a through READ-01e (sessionStorage parse, empty state, error state, paragraph splitting, scroll progress)
- [ ] Vitest jsdom/happy-dom environment configured for browser API testing (sessionStorage, scroll events)

*Note: Vitest 3.2.4 already installed. Wave 0 creates test file and ensures environment config.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark background, serif font, no navigation chrome, 3px scroll bar | READ-01f | Visual/CSS rendering cannot be automatically asserted without snapshot testing infrastructure | Open `/story` after generating a story; verify deep navy bg, warm off-white text, large serif font, no nav elements visible, 3px scroll indicator at top |
| Readable on phone in dim room | READ-01 (mobile) | Requires physical device or mobile emulation | Test in Chrome DevTools mobile emulation (375px width); verify font size ≥ 1.25rem, line length ≤ 65ch, no horizontal scroll |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
