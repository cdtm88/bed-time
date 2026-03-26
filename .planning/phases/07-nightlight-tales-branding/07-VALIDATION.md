---
phase: 7
slug: nightlight-tales-branding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green + visual favicon check
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | branding/package | smoke | `node -e "const p=require('./package.json'); if(p.name!=='nightlight-tales') process.exit(1)"` | N/A (inline) | ⬜ pending |
| 7-01-02 | 01 | 1 | branding/og | smoke | `npx next build` | N/A | ⬜ pending |
| 7-01-03 | 01 | 1 | branding/readme | smoke | `head -1 README.md \| grep -q "Nightlight Tales"` | README.md ✅ | ⬜ pending |
| 7-01-04 | 01 | 1 | branding/favicon | manual | Visual browser check | src/app/icon.tsx ❌ W0 | ⬜ pending |
| 7-01-05 | 01 | 1 | regression | regression | `npx vitest run` | existing ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/icon.tsx` — new favicon file (created in Wave 1, no pre-stub needed)

*Note: This is a metadata/branding phase with no new test files required. Existing vitest suite provides regression coverage.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Moon emoji favicon renders correctly | D-04 | Emoji rendering in Satori/ImageResponse depends on runtime font support | Open app in browser, check browser tab shows 🌙 favicon; check in Chrome + Firefox |
| OG tags show on social preview | D-03 | Requires external social card renderer | Use https://opengraph.xyz or browser devtools to inspect meta tags |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
