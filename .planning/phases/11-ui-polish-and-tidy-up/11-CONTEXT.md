# Phase 11: UI Polish and Tidy Up - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual polish pass across the app — typography, spacing, colour, and interaction details refined for a polished, cohesive feel. No new features, no API changes, no new routes. Covers: form page hero area, CTA button styling, theme tile selection state, loading overlay atmosphere, and overall form page layout/centering.

</domain>

<decisions>
## Implementation Decisions

### Form Hero Area
- **D-01:** Add a decorative moon + stars illustration above the title on the form page. Use the existing design palette (primary, primary-container, secondary-container) — no new colors. The illustration should echo the loading overlay moon/stars aesthetic: simple, warm, not heavy.
- **D-02:** The illustration replaces empty vertical space above the title — it doesn't replace the title or tagline text.

### Form Page Layout
- **D-03:** Center the form content horizontally within the viewport with a clear max-width (existing `max-w-[480px]` is correct). Ensure the left/right padding creates balanced breathing room. Alignment is horizontal-only, top-anchored — content starts near the top and scrolls naturally on mobile.
- **D-04:** Review and tighten vertical spacing and rhythm across the form (title, tagline, form fields, theme grid, button). Apply design best practices: consistent gap scale, comfortable breathing room between sections.

### Generate Button
- **D-05:** Replace the teal gradient (`from-primary to-primary-container`) with a solid flat teal (`bg-primary`). Cleaner, more mature look on the light cream background. Keep the `rounded-full` pill shape and uppercase tracking.
- **D-06:** Update hover/focus state to match (e.g., `hover:brightness-110` on solid teal is fine).

### Theme Selection State
- **D-07:** Replace the current faint `bg-primary-container/15 ring-2 ring-primary/30` selected state with a gold-accented selected state: visible `ring-2` using `secondary-container` (#fcd400) + a light gold background tint. Creates a clear, satisfying selection that aligns with the gold accent used throughout the reading mode.

### Loading Overlay Atmosphere
- **D-08:** Switch the loading overlay background from `bg-surface` (light cream) to `bg-reading-surface` (dark navy #1a1a2e). The moon + stars animation is already well-suited to a dark sky. Adjust text colors to `text-reading-on-surface` and `text-reading-on-surface-muted` to match. Creates a seamless visual transition into the reading experience.

### Claude's Discretion
- Exact size and composition of the hero moon/stars illustration (SVG inline or component, exact star positions)
- Whether the moon illustration uses animation (subtle breathe, like the loading overlay) or is static
- Exact gold tint opacity for theme tile selected background (light enough not to obscure the SVG illustration)
- Any micro-detail typography refinements (letter-spacing, line-height tweaks) within established patterns
- Whether to update the loading overlay's text color (`text-on-surface` → `text-reading-on-surface`) — it should be legible on the dark background

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN.md` — Color token system and palette. All new colors must use established tokens.

### Prior Phase Context
- `.planning/phases/05-reading-experience/05-CONTEXT.md` — Reading view decisions (dark navy, gold CTA, minimal chrome). D-05/D-06 (back nav), the chrome-free philosophy.
- `.planning/phases/04-input-form/04-CONTEXT.md` — Tailwind v4 setup, token structure, inline `<style>` pattern for @keyframes (required for Tailwind v4 compatibility).

### Existing Implementation
- `src/components/story-form.tsx` — Form page entry point. Hero area, Generate button, layout.
- `src/components/loading-overlay.tsx` — Loading screen. D-08 changes apply here.
- `src/components/theme-grid.tsx` — Theme tile grid. D-07 selected state changes apply here.
- `src/app/globals.css` — Design tokens. Reading mode tokens (`--color-reading-surface`, `--color-reading-on-surface`, `--color-reading-on-surface-muted`) already defined here.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `loading-overlay.tsx` — Moon + stars animation (breathe + twinkle @keyframes). The hero illustration should use the same visual language. Inline `<style>` block pattern required for Tailwind v4.
- `globals.css` — `--color-reading-surface: #1a1a2e`, `--color-secondary-container: #fcd400` — both tokens already exist and can be used directly.

### Established Patterns
- Tailwind v4 CSS custom properties: colors referenced as `bg-reading-surface`, `text-reading-on-surface`, `bg-secondary-container` etc.
- `@keyframes` defined in inline `<style>` tags (not in globals.css) — Tailwind v4 cannot express custom keyframes without a config file.
- All components are `'use client'` with no third-party UI libraries.

### Integration Points
- `story-form.tsx` — Hero illustration goes above the `<h1>` inside the form's `<div>` container. Layout centering adjustments also here.
- `loading-overlay.tsx` — Background color swap from `bg-surface` to `bg-reading-surface`; text color swap.
- `theme-grid.tsx` — Selected tile className update for D-07.

</code_context>

<specifics>
## Specific Ideas

- Moon illustration should echo the existing loading overlay moon (gradient circle) — keep visual consistency between the two screens.
- The loading overlay transition to dark navy creates a "stepping into the story world" feel — intentional atmospheric shift.
- Gold theme selection ring aligns with the gold used in the reading mode CTA and scroll progress bar — unifies the gold accent role as "the active/selected thing" across both screens.

</specifics>

<deferred>
## Deferred Ideas

- Vertical viewport centering of the form (user confirmed horizontal-only, top-anchored)
- Reading view typography refinements (line-height, font-size tweaks) — not raised during discussion; keep Phase 5 decisions
- Loading overlay animation changes — only background/color change, animation stays as-is

</deferred>

---

*Phase: 11-ui-polish-and-tidy-up*
*Context gathered: 2026-03-31*
