---
phase: 8
slug: theme-svg-assets
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 0 | STORY-03 | file-check | `npx vitest run src/__tests__/theme-svg-assets.test.ts` | ❌ W0 | ⬜ pending |
| 8-02-01 | 02 | 1 | STORY-03 | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts` | ❌ W0 | ⬜ pending |
| 8-03-01 | 03 | 2 | STORY-03 | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/theme-svg-assets.test.ts` — stubs for STORY-03: SVG existence, viewBox, palette, file size, prohibited elements, onError fallback

*Note: Wave 0 creates the test file; Wave 1 (SVG creation) + Wave 2 (onError component) will make them green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SVG illustrations render visually correct per UI-SPEC concepts | STORY-03 | Visual aesthetic cannot be automated | Open `/themes` grid in browser; verify each tile displays a recognizable illustration matching its theme concept |
| Tonal placeholder shows on image load error | STORY-03 | Requires simulating network failure | Temporarily rename an SVG file; confirm broken tile shows tonal placeholder, not a broken image icon |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
