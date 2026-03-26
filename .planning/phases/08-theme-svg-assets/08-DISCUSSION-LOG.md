# Phase 8: Theme SVG Assets - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 08 — Theme SVG Assets

---

## Gray Areas Selected

User selected all three presented areas: SVG creation approach, Illustration style & quality bar, Broken image fallback.

---

## Area 1: SVG Creation Approach

**Question:** How will the 17 missing SVGs be created?

**Options presented:**
- Claude codes them (Recommended) — Claude generates clean SVG code for all 17 themes. Lightweight vector illustrations using DESIGN.md palette. Simpler than 451KB dinosaurs.svg but consistent and on-brand.
- I'll supply the assets — User provides the 17 SVG files. Phase 8 scope = wiring them up and verifying the grid.
- Claude codes them, I review each — Claude generates one at a time, user approves before proceeding.

**Selected:** Claude codes them (Recommended)

---

## Area 2: Illustration Style & Quality Bar

**Question:** What illustration style and quality bar should Claude target for the 17 new SVGs?

**Options presented:**
- Match dinosaurs.svg style closely — Study the existing 451KB illustration and replicate its visual character and scene-setting detail.
- Simpler is fine — clean, iconic (Recommended) — Lighter-weight storybook icon style. 3–5 recognizable shapes per theme, warm palette, no complex paths. Fast to generate, easy to tweak.

**Selected:** Simpler is fine — clean, iconic (Recommended)

**Context note:** The existing `dinosaurs.svg` at 451KB is impractical as a style target for batch generation. Simpler icons accepted for MVP.

---

## Area 3: Broken Image Fallback

**Question:** How should the theme grid handle missing SVGs during development (or if a file ever fails to load)?

**Options presented:**
- Add a graceful placeholder (Recommended) — Show a simple colored tile with the theme's initial or a generic icon if an SVG is missing/fails to load.
- Leave as-is — no fallback needed — Once all 17 SVGs are created in this phase, there won't be missing files.

**Selected:** Add a graceful placeholder (Recommended)

---

*Discussion conducted: 2026-03-26 via /gsd:discuss-phase 8*
