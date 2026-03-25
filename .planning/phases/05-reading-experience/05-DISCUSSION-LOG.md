# Phase 5: Reading Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

---

**Date:** 2026-03-25
**Phase:** 05 — Reading Experience

---

## Area 1: Story Title Data Source

**Q:** The reading page needs `{Name}'s {Theme} Story` for the title, but currently Phase 4 only writes raw story text to sessionStorage. How should the title data get to the reading page?

| Option | Selected |
|--------|----------|
| Extend sessionStorage payload — store `{ story, name, theme }` JSON | ✓ |
| Skip the title — text-only start | — |
| Generic title only — "Your Story" | — |

**Q:** What shape should the JSON object be?

| Option | Selected |
|--------|----------|
| `{ story, name, theme }` — three raw values | ✓ |
| `{ story, title }` — Phase 4 pre-computes title string | — |

**Outcome:** Phase 5 updates Phase 4's sessionStorage write in `story-form.tsx` to store `JSON.stringify({ story, name, theme })`. Reading page assembles title dynamically.

---

## Area 2: Floating Toolbar / Back Navigation

**Q:** Should the reading page have any floating toolbar or controls beyond the scroll progress indicator?

| Option | Selected |
|--------|----------|
| No toolbar — text-only | User noted: need a way back to homepage |
| Yes — define the toolbar | — |

**User clarification:** Not a full toolbar, but parents need a way to navigate back to the homepage.

**Q:** Where should the back-to-home control appear?

| Option | Selected |
|--------|----------|
| End of page only — near the "New Story" button | ✓ |
| Fixed top-left corner — always visible | — |
| Fade-in on tap/touch | — |

**Outcome:** Small secondary text link (e.g., "← Home") at the bottom of the page near the "New Story" button. No floating/pinned controls during reading.

---

*Discussion conducted: 2026-03-25 via /gsd:discuss-phase 5*
