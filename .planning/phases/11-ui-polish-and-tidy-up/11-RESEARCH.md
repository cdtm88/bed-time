# Phase 11: UI Polish and Tidy Up - Research

**Researched:** 2026-03-31
**Domain:** CSS/Tailwind visual polish, SVG illustration, component styling
**Confidence:** HIGH

## Summary

Phase 11 is a visual-only polish pass across three existing components (`story-form.tsx`, `loading-overlay.tsx`, `theme-grid.tsx`) and one new decorative element (hero moon/stars illustration). No new routes, no API changes, no state management changes. All color tokens needed already exist in `globals.css`. The work is entirely CSS class swaps, a new inline SVG component, and spacing adjustments.

The scope is narrow and well-constrained by 8 locked decisions (D-01 through D-08) from CONTEXT.md. Every change targets an existing file with a known structure. The risk profile is low -- the main concern is visual regression in other areas when changing shared component styles.

**Primary recommendation:** Treat each decision (D-01 through D-08) as an atomic styling task on a known file. Group by component file for efficient execution. No new dependencies needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Add a decorative moon + stars illustration above the title on the form page. Use the existing design palette (primary, primary-container, secondary-container) -- no new colors. The illustration should echo the loading overlay moon/stars aesthetic: simple, warm, not heavy.
- **D-02:** The illustration replaces empty vertical space above the title -- it doesn't replace the title or tagline text.
- **D-03:** Center the form content horizontally within the viewport with a clear max-width (existing `max-w-[480px]` is correct). Ensure the left/right padding creates balanced breathing room. Alignment is horizontal-only, top-anchored -- content starts near the top and scrolls naturally on mobile.
- **D-04:** Review and tighten vertical spacing and rhythm across the form (title, tagline, form fields, theme grid, button). Apply design best practices: consistent gap scale, comfortable breathing room between sections.
- **D-05:** Replace the teal gradient (`from-primary to-primary-container`) with a solid flat teal (`bg-primary`). Cleaner, more mature look on the light cream background. Keep the `rounded-full` pill shape and uppercase tracking.
- **D-06:** Update hover/focus state to match (e.g., `hover:brightness-110` on solid teal is fine).
- **D-07:** Replace the current faint `bg-primary-container/15 ring-2 ring-primary/30` selected state with a gold-accented selected state: visible `ring-2` using `secondary-container` (#fcd400) + a light gold background tint. Creates a clear, satisfying selection that aligns with the gold accent used throughout the reading mode.
- **D-08:** Switch the loading overlay background from `bg-surface` (light cream) to `bg-reading-surface` (dark navy #1a1a2e). The moon + stars animation is already well-suited to a dark sky. Adjust text colors to `text-reading-on-surface` and `text-reading-on-surface-muted` to match. Creates a seamless visual transition into the reading experience.

### Claude's Discretion
- Exact size and composition of the hero moon/stars illustration (SVG inline or component, exact star positions)
- Whether the moon illustration uses animation (subtle breathe, like the loading overlay) or is static
- Exact gold tint opacity for theme tile selected background (light enough not to obscure the SVG illustration)
- Any micro-detail typography refinements (letter-spacing, line-height tweaks) within established patterns
- Whether to update the loading overlay's text color (`text-on-surface` to `text-reading-on-surface`) -- it should be legible on the dark background

### Deferred Ideas (OUT OF SCOPE)
- Vertical viewport centering of the form (user confirmed horizontal-only, top-anchored)
- Reading view typography refinements (line-height, font-size tweaks) -- not raised during discussion; keep Phase 5 decisions
- Loading overlay animation changes -- only background/color change, animation stays as-is
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4 | Utility-first styling | Already configured in project via `@tailwindcss/postcss` |
| React | 19.2.4 | Component rendering | Project standard |
| Next.js | 16.2.1 | Framework | Project standard |

### Supporting
No new libraries needed. All changes use existing Tailwind classes and inline SVG/CSS.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG for hero illustration | External .svg file in public/ | Inline SVG allows animation via CSS and uses design tokens directly; external file would need fixed colors |
| CSS animations via inline `<style>` | Tailwind `animate-*` utilities | Project established pattern: inline `<style>` for `@keyframes` (Tailwind v4 cannot express custom keyframes without config file) |

## Architecture Patterns

### File Change Map
```
src/
  components/
    story-form.tsx       # D-01, D-02, D-03, D-04, D-05, D-06 (hero illustration, layout, button)
    loading-overlay.tsx  # D-08 (dark background, text colors)
    theme-grid.tsx       # D-07 (gold selected state)
```

No new files strictly required -- the hero illustration can be either:
- **Option A:** Inline SVG directly in `story-form.tsx` (simplest, follows existing loading-overlay pattern)
- **Option B:** Extracted to a new `hero-illustration.tsx` component imported by `story-form.tsx` (cleaner separation)

**Recommendation:** Option B -- extract to `src/components/hero-illustration.tsx`. The SVG markup + optional animation styles will be ~40-60 lines, and keeping `story-form.tsx` focused on form logic is cleaner.

### Pattern: Inline `<style>` for @keyframes (Established)
**What:** Define CSS @keyframes inside a `<style>{...}</style>` JSX element within the component.
**When to use:** Any custom CSS animation in this project (Tailwind v4 constraint).
**Example (from loading-overlay.tsx):**
```tsx
<style>{`
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.08); opacity: 1; }
  }
`}</style>
```

### Pattern: Design Token Colors via Tailwind Classes
**What:** Use `bg-{token}`, `text-{token}` classes that resolve to CSS custom properties defined in `globals.css`.
**When to use:** All color references.
**Available tokens for this phase:**
- `bg-reading-surface` (#1a1a2e) -- for loading overlay dark background
- `text-reading-on-surface` (#e8e0d0) -- for loading overlay text on dark background
- `text-reading-on-surface-muted` (#a89f8f) -- for loading overlay secondary text
- `bg-primary` (#0c6681) -- for solid Generate button
- `ring-secondary-container` / `bg-secondary-container` (#fcd400) -- for gold theme tile selection
- `bg-primary-container` (#9ae1ff) -- for moon/stars illustration elements

### Anti-Patterns to Avoid
- **Adding new color tokens to globals.css:** All needed colors already exist. D-01 explicitly states "no new colors."
- **Using tailwind.config.js for animations:** Project uses Tailwind v4 CSS-first approach. Custom keyframes go in inline `<style>` tags.
- **Modifying reading-view.tsx:** Deferred -- reading view typography is out of scope per CONTEXT.md deferred items.
- **Adding animation libraries (framer-motion, etc.):** Project uses zero third-party UI libraries. CSS animations only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG moon illustration | Complex path artwork | Simple geometric shapes (circles, small dots) | Loading overlay already uses `rounded-full` divs for moon/stars -- match that visual language |
| Color opacity | Manual hex+alpha values | Tailwind opacity modifiers (`bg-secondary-container/20`) | Consistent, readable, uses token system |
| Responsive spacing | Breakpoint-specific px values | Tailwind spacing scale tokens (`mt-xl`, `gap-md`, etc.) | Already defined in globals.css @theme block |

## Common Pitfalls

### Pitfall 1: Loading Overlay Text Invisible on Dark Background
**What goes wrong:** Switching `bg-surface` to `bg-reading-surface` without updating text colors makes text unreadable (dark text on dark background).
**Why it happens:** The current `text-on-surface` (#1b1c17) is near-black -- invisible on #1a1a2e.
**How to avoid:** Must update BOTH the background AND text colors in loading-overlay.tsx simultaneously. Use `text-reading-on-surface` for the heading and `text-reading-on-surface-muted` for the subtext.
**Warning signs:** If you see the overlay but no text, the color swap was incomplete.

### Pitfall 2: Gold Selected State Obscuring Theme SVG
**What goes wrong:** A gold background tint that's too opaque makes theme tile illustrations hard to see.
**Why it happens:** `bg-secondary-container` at full opacity is bright #fcd400 -- would overpower the tile content.
**How to avoid:** Use a low opacity modifier: `bg-secondary-container/10` or `bg-secondary-container/15`. Test visually against the actual SVG artwork.
**Warning signs:** Theme tile SVG illustrations looking washed out or yellowish when selected.

### Pitfall 3: Hero Illustration Breaking Mobile Layout
**What goes wrong:** A large illustration pushes the form content below the fold, requiring excessive scrolling to reach the Generate button.
**Why it happens:** Not constraining the illustration height. The form is already dense with 4 fields + theme grid.
**How to avoid:** Keep the illustration compact -- the same 128x128px (`w-32 h-32`) bounding box used by the loading overlay moon/stars is a safe reference. D-03 confirms top-anchored layout, so the illustration should add minimal vertical space.
**Warning signs:** On a 375px-wide mobile viewport, the Generate button should be reachable without excessive scrolling.

### Pitfall 4: Gradient Removal Missing Hover State
**What goes wrong:** Removing `bg-gradient-to-br from-primary to-primary-container` but leaving hover state referencing gradient properties.
**Why it happens:** The current hover is `hover:brightness-110` which works on both gradients and solid colors, but worth verifying.
**How to avoid:** D-06 explicitly says `hover:brightness-110` on solid teal is fine. Also update `disabled:opacity-40` which should still work.
**Warning signs:** Button hover looking identical to default state.

### Pitfall 5: Tailwind v4 `ring-*` Color Syntax
**What goes wrong:** Using wrong ring color syntax for Tailwind v4.
**Why it happens:** Tailwind v4 changed some utility patterns from v3.
**How to avoid:** The existing code already uses `ring-2 ring-primary/30` which confirms ring color utilities work in this project's Tailwind v4 setup. Use the same pattern: `ring-2 ring-secondary-container`.
**Warning signs:** Ring not appearing or appearing as default gray.

## Code Examples

### D-05/D-06: Generate Button (solid flat teal)
```tsx
// Current (story-form.tsx line 89):
// bg-gradient-to-br from-primary to-primary-container

// Updated:
<button
  className="mt-xl w-full h-[52px] rounded-full bg-primary font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-white transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
>
  Generate Story
</button>
```

### D-07: Theme Tile Gold Selected State
```tsx
// Current (theme-grid.tsx line 31-33):
// value === theme ? 'bg-primary-container/15 ring-2 ring-primary/30' : ''

// Updated:
value === theme
  ? 'bg-secondary-container/10 ring-2 ring-secondary-container'
  : ''
```

### D-08: Loading Overlay Dark Background
```tsx
// Current (loading-overlay.tsx line 10):
// className="... bg-surface"

// Updated:
className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-reading-surface"

// Current text colors (lines 54, 58):
// text-on-surface

// Updated:
<h2 className="font-serif text-[1.75rem] text-reading-on-surface">
  Crafting {name}&apos;s story&hellip;
</h2>
<p className="font-serif text-[1rem] leading-relaxed text-reading-on-surface-muted mt-md">
  This takes about 30 seconds.
</p>
```

### D-01/D-02: Hero Illustration Component Pattern
```tsx
// src/components/hero-illustration.tsx
'use client'

export function HeroIllustration() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-lg">
      {/* Optional: reuse breathe animation from loading overlay */}
      <style>{`
        @keyframes gentleBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* Moon - gradient circle matching loading overlay */}
      <div
        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-primary"
        style={{ animation: 'gentleBreathe 4s ease-in-out infinite' }}
      />
      {/* Stars - small dots scattered around */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-secondary-container"
        style={{ top: '8px', right: '16px', opacity: 0.7 }}
      />
      <div
        className="absolute w-1 h-1 rounded-full bg-primary-container"
        style={{ top: '16px', left: '10px', opacity: 0.5 }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-secondary-container"
        style={{ bottom: '12px', right: '12px', opacity: 0.6 }}
      />
    </div>
  )
}
```

### D-03/D-04: Form Layout Spacing Review
```tsx
// story-form.tsx current structure:
// <div className="mx-auto max-w-[480px] px-lg pt-3xl pb-3xl">
//   <h1> ... </h1>           pt-3xl above
//   <p> ... mt-sm</p>        8px gap
//   <div mt-2xl> fields </div>  48px gap
//   <div mt-2xl> themes </div>  48px gap
//   <button mt-xl> ... </button>  32px gap

// These spacing values (sm=8, xl=32, 2xl=48, 3xl=64) follow the design token scale.
// Adjust as needed for rhythm -- e.g., reducing pt-3xl to pt-2xl if hero illustration
// adds enough visual weight above the title.
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run src/__tests__/ui-polish.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

Since this phase has no formal requirement IDs (TBD), tests map to the 8 decisions:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Hero illustration renders above title | unit (DOM assertion) | `npx vitest run src/__tests__/ui-polish.test.ts -t "hero illustration"` | No -- Wave 0 |
| D-05 | Generate button uses solid bg-primary (no gradient) | unit (className assertion) | `npx vitest run src/__tests__/ui-polish.test.ts -t "generate button"` | No -- Wave 0 |
| D-07 | Selected theme tile has gold ring | unit (className assertion) | `npx vitest run src/__tests__/ui-polish.test.ts -t "theme selection"` | No -- Wave 0 |
| D-08 | Loading overlay uses dark background and light text | unit (className assertion) | `npx vitest run src/__tests__/ui-polish.test.ts -t "loading overlay"` | No -- Wave 0 |
| D-03/D-04 | Form layout centered with max-width | manual | Visual inspection | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/ui-polish.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/ui-polish.test.ts` -- covers D-01, D-05, D-07, D-08 (className/DOM assertions)
- [ ] Test rendering of `HeroIllustration`, `StoryForm`, `LoadingOverlay`, `ThemeGrid` components

Note: Visual spacing and rhythm (D-03, D-04) are inherently manual verification items -- CSS class presence can be asserted but visual correctness requires human review.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 config-based | Tailwind v4 CSS-first (@theme) | 2024-2025 | No tailwind.config.js; tokens in globals.css |
| @keyframes in globals.css | Inline `<style>` per component | Phase 4 decision | Required for Tailwind v4 compatibility |

## Open Questions

1. **Hero illustration: animated or static?**
   - What we know: CONTEXT.md lists this as Claude's discretion. Loading overlay uses `breathe` + `twinkle` animations.
   - Recommendation: Use a subtle, slower breathe animation (4s vs 3s cycle) for the hero moon. Static stars with a gentle gold glint. This creates visual coherence with the loading screen without being distracting on the form page where the user is actively making choices.

2. **Gold tint opacity for selected theme tiles**
   - What we know: Must not obscure SVG illustrations. CONTEXT.md says Claude's discretion on exact value.
   - Recommendation: Start with `bg-secondary-container/10` (10% opacity). If too subtle, try `/15`. The `ring-2 ring-secondary-container` provides the primary selection signal; the background tint is a secondary reinforcement.

3. **Loading overlay star/moon colors on dark background**
   - What we know: Stars currently use `bg-primary-container` (#9ae1ff) and moon uses gradient `from-primary-container to-primary`. These are light colors that should be visible on dark navy (#1a1a2e).
   - Recommendation: The existing moon/star colors should work well on the dark background without changes. The light blue moon on dark navy creates a natural night-sky aesthetic. No color changes needed for the animation elements -- only background and text colors change.

## Sources

### Primary (HIGH confidence)
- `src/components/story-form.tsx` -- current form layout, button styling, spacing (lines 60-106)
- `src/components/loading-overlay.tsx` -- current moon/stars pattern, animation keyframes (lines 1-62)
- `src/components/theme-grid.tsx` -- current selected state classes (lines 29-33)
- `src/app/globals.css` -- all design tokens including reading-mode colors (lines 1-33)
- `.planning/DESIGN.md` -- design system rules, do's and don'ts
- `.planning/phases/11-ui-polish-and-tidy-up/11-CONTEXT.md` -- all 8 locked decisions

### Secondary (MEDIUM confidence)
- `.planning/phases/04-input-form/04-CONTEXT.md` -- Tailwind v4 inline style pattern rationale
- `.planning/phases/05-reading-experience/05-CONTEXT.md` -- reading view design philosophy

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all tools already in use
- Architecture: HIGH -- all target files exist and are well-understood
- Pitfalls: HIGH -- identified from direct code inspection of current implementations

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable -- no external dependency changes expected)
