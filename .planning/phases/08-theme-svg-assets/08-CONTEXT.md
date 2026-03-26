# Phase 8: Theme SVG Assets - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the 17 missing SVG theme tile illustrations for `public/themes/` — closing the visual gap so all 18 theme tiles in the theme grid display correctly. The integration layer (theme-grid.tsx, themeToFilename, Next.js Image) is already in place; this phase is purely about producing the missing assets and adding a graceful fallback for failed loads.

</domain>

<decisions>
## Implementation Decisions

### SVG Creation
- **D-01:** Claude generates SVG code for all 17 missing theme tiles. Assets are not user-supplied.
- **D-02:** Style target: **simpler, clean, iconic storybook style** — 3–5 recognizable shapes per theme using the DESIGN.md palette. Lightweight vector paths, not complex multi-layer illustrations. This is acceptable for MVP.
- **D-03:** The existing `dinosaurs.svg` is NOT the style reference (it's 451KB — a complex illustration that would be impractical to replicate for 17 themes). The new SVGs should be internally consistent with each other but need not match dinosaurs.svg fidelity.
- **D-04:** All SVGs must conform to the locked Phase 4 spec (D-08): `viewBox="0 0 200 200"`, palette colors (#0c6681 primary, #705d00 secondary/gold, #fbf9f1 background/light, #1b1c17 dark ink), rounded strokes 2–3px, no sharp corners, warm storybook tone.

### Fallback Handling
- **D-05:** Add a graceful placeholder to `theme-grid.tsx` for SVG load failures. The placeholder should show a simple tonal tile (using the DESIGN.md surface palette) so the grid layout never breaks. Implementation approach (CSS fallback, onerror handler, or next/image fallback) is Claude's discretion.

### Claude's Discretion
- Exact visual composition of each SVG (which shapes, poses, scene elements) — Claude decides what best represents each theme in 3–5 simple shapes
- Placeholder implementation detail (CSS background, inline SVG fallback, or next/image `onError` prop)
- Whether to use `<circle>`, `<rect>`, `<path>`, or a mix — whatever produces the clearest, most recognizable icon for each theme

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN.md` — Full color token system and SVG palette (#0c6681, #705d00, #fbf9f1, #1b1c17). **All SVG fill/stroke colors must use these exact hex values.**

### Phase 4 SVG Spec (locked decisions)
- `.planning/phases/04-input-form/04-CONTEXT.md` — D-07 (complete list of 17 filenames), D-08 (200×200px viewBox, palette, rounded strokes spec), D-09 (Next.js Image integration already in place)

### Existing Implementation
- `src/components/theme-grid.tsx` — The component that renders all 18 tiles. D-05 (fallback) is implemented here.
- `src/lib/theme-utils.ts` — `themeToFilename()` — the mapping from theme display name to filename slug
- `src/lib/schemas.ts` — `VALID_THEMES` — canonical list of all 18 theme names

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/themes/dinosaurs.svg` — The one existing SVG (451KB, complex illustration). Useful for understanding the integration path but NOT the style target for new SVGs.
- `src/components/theme-grid.tsx` — Already fully wired. Uses `<Image src={'/themes/' + themeToFilename(theme) + '.svg'} width={200} height={200} unoptimized />`. D-05 fallback goes here.
- `src/lib/theme-utils.ts` — `themeToFilename()` converts display names to kebab-case filenames. No changes needed.

### Established Patterns
- Next.js `<Image>` with `unoptimized` prop for SVGs — already the pattern
- DESIGN.md palette CSS variables available throughout the app (set up in Phase 4)

### Integration Points
- `public/themes/` — Drop SVG files here; they're immediately served as static assets. No code changes needed beyond the fallback.
- `src/components/theme-grid.tsx` — Add error/fallback handling (D-05). Only code change required.

</code_context>

<specifics>
## Specific Ideas

- 17 missing filenames (from Phase 4 D-07, derived via `themeToFilename()`):
  - `animals.svg`, `space-stars.svg`, `ocean-sea.svg`, `fairy-tales.svg`, `dragons.svg`
  - `knights-castles.svg`, `trains-vehicles.svg`, `superheroes.svg`, `robots.svg`
  - `forest-nature.svg`, `pirates.svg`, `magic-school.svg`, `farm-life.svg`
  - `rainforest.svg`, `underwater-adventure.svg`, `dreams-clouds.svg`, `holidays-seasons.svg`
- Each SVG: 200×200 artboard, 3–5 clean shapes, DESIGN.md hex values only, rounded corners, no sharp angles, storybook warm style.

</specifics>

<deferred>
## Deferred Ideas

- Replacing `dinosaurs.svg` with a lighter-weight version — not in scope; it's already wired and displaying
- Animated SVGs / hover animations — future enhancement, not MVP
- Illustrated scene backgrounds (vs. plain surface background in tiles) — could revisit in Phase 11 polish

</deferred>

---

*Phase: 08-theme-svg-assets*
*Context gathered: 2026-03-26*
