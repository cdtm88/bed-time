# Phase 8: Theme SVG Assets - Research

**Researched:** 2026-03-26
**Domain:** SVG asset creation, Next.js Image fallback handling
**Confidence:** HIGH

## Summary

This phase is primarily an asset creation task: produce 17 hand-coded SVG files and drop them into `public/themes/`. The integration layer (theme-grid.tsx, themeToFilename, Next.js Image) is already fully wired from Phase 4. The only code change is adding an `onError` fallback handler to the existing `<Image>` component in `theme-grid.tsx`.

The technical risk is low. SVGs are static files with a well-defined spec (200x200 viewBox, 4-color palette, 3-5 shapes, under 5KB each). The main execution risk is consistency across 17 illustrations and ensuring each SVG is valid, uses only permitted colors, and renders correctly at the target size.

**Primary recommendation:** Batch-produce all 17 SVGs as inline SVG code, write each to `public/themes/{filename}.svg`, then add the `onError` fallback to `theme-grid.tsx`. Validate each SVG against the color palette and structural constraints.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Claude generates SVG code for all 17 missing theme tiles. Assets are not user-supplied.
- D-02: Style target: simpler, clean, iconic storybook style -- 3-5 recognizable shapes per theme using the DESIGN.md palette. Lightweight vector paths, not complex multi-layer illustrations.
- D-03: The existing dinosaurs.svg is NOT the style reference (451KB complex illustration). New SVGs should be internally consistent with each other but need not match dinosaurs.svg fidelity.
- D-04: All SVGs must conform to Phase 4 spec: viewBox="0 0 200 200", palette colors (#0c6681 primary, #705d00 secondary/gold, #fbf9f1 background/light, #1b1c17 dark ink), rounded strokes 2-3px, no sharp corners, warm storybook tone.
- D-05: Add a graceful placeholder to theme-grid.tsx for SVG load failures. The placeholder shows a tonal tile using DESIGN.md surface palette so the grid never breaks.

### Claude's Discretion
- Exact visual composition of each SVG (which shapes, poses, scene elements)
- Placeholder implementation detail (CSS background, inline SVG fallback, or next/image onError prop)
- Whether to use circle, rect, path, or a mix for each theme

### Deferred Ideas (OUT OF SCOPE)
- Replacing dinosaurs.svg with a lighter-weight version
- Animated SVGs / hover animations
- Illustrated scene backgrounds (vs. plain surface background in tiles)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-03 | Parent can select a theme from a preset curated list of 15-20 options | All 17 missing SVG files produced and placed in public/themes/; fallback handler ensures grid never breaks visually even if an SVG fails to load |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Image | (project version) | Renders SVGs in theme grid | Already in use; `unoptimized` prop for SVGs |
| React useState | (project version) | Track image load errors per tile | Standard React state for conditional rendering |

### Supporting
No additional libraries needed. SVGs are hand-coded markup files. No SVG tooling, optimization libraries, or icon frameworks required.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-coded SVG | SVGO optimization | Not needed -- hand-coded SVGs at 3-5 shapes will be under 5KB without optimization |
| next/image onError | Custom error boundary | Overkill for a single image load failure; onError is simpler |

## Architecture Patterns

### File Structure
```
public/
  themes/
    dinosaurs.svg        # existing (451KB, legacy)
    animals.svg          # new (target <5KB)
    space-stars.svg      # new
    ocean-sea.svg        # new
    fairy-tales.svg      # new
    dragons.svg          # new
    knights-castles.svg  # new
    trains-vehicles.svg  # new
    superheroes.svg      # new
    robots.svg           # new
    forest-nature.svg    # new
    pirates.svg          # new
    magic-school.svg     # new
    farm-life.svg        # new
    rainforest.svg       # new
    underwater-adventure.svg  # new
    dreams-clouds.svg    # new
    holidays-seasons.svg # new
src/
  components/
    theme-grid.tsx       # modified (add onError fallback)
```

### Pattern 1: SVG File Structure
**What:** Each SVG follows a consistent template structure.
**When to use:** Every new theme SVG file.
**Example:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Background shape (optional) -->
  <rect width="200" height="200" rx="24" fill="#fbf9f1"/>
  <!-- 3-5 themed shapes using only the 4 permitted colors -->
  <circle cx="100" cy="80" r="30" fill="#0c6681" stroke="#1b1c17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- ... more shapes ... -->
</svg>
```

### Pattern 2: Next.js Image onError Fallback
**What:** React state tracks per-tile load failures, renders a placeholder div instead of the broken Image.
**When to use:** In theme-grid.tsx for D-05.
**Example:**
```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'

// Inside ThemeGrid component:
const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

// Per tile:
{failedImages.has(theme) ? (
  <div className="w-full aspect-square rounded-3xl bg-surface-container-low flex items-center justify-center">
    <div className="w-16 h-16 rounded-full bg-surface-container-highest" />
  </div>
) : (
  <Image
    src={'/themes/' + themeToFilename(theme) + '.svg'}
    width={200}
    height={200}
    alt={theme}
    className="w-full aspect-square rounded-3xl"
    unoptimized
    onError={() => setFailedImages(prev => new Set(prev).add(theme))}
  />
)}
```

### Anti-Patterns to Avoid
- **Embedding raster images inside SVGs:** Use only vector elements (path, circle, rect, ellipse, polygon, line, polyline, g). No `<image>` elements.
- **Using CSS style blocks inside SVGs:** Use inline attributes (`fill="..."`, `stroke="..."`) not `<style>` blocks. Inline attributes are more portable and avoid specificity conflicts.
- **Using text in SVGs:** Theme labels are already rendered in HTML below the image. SVG text would duplicate content and create accessibility/font issues.
- **Off-palette colors:** Every fill and stroke value must be one of exactly: #0c6681, #705d00, #fbf9f1, #1b1c17, or "none". No other hex values, no rgb(), no named colors.
- **Complex paths that balloon file size:** Target 3-5 simple shapes. If an SVG exceeds 5KB, simplify.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG optimization | Custom minification script | Keep SVGs hand-written and minimal | At 3-5 shapes per file, optimization tooling adds complexity with negligible benefit |
| Image error tracking | Global error boundary | Per-component useState with onError | Scoped, simple, and the standard React pattern for image load failures |
| Filename mapping | New mapping function | Existing `themeToFilename()` in theme-utils.ts | Already implemented and tested |

## Common Pitfalls

### Pitfall 1: Inconsistent viewBox
**What goes wrong:** SVGs render at wrong size or aspect ratio in the grid.
**Why it happens:** viewBox attribute missing or using different dimensions.
**How to avoid:** Every SVG must have exactly `viewBox="0 0 200 200"` as the first attribute after xmlns.
**Warning signs:** SVGs appear stretched, cropped, or tiny in the theme grid.

### Pitfall 2: Off-Palette Colors
**What goes wrong:** SVGs break visual consistency with the design system.
**Why it happens:** Using colors that look similar but are not the exact hex values.
**How to avoid:** Use only these four values for fill/stroke: #0c6681, #705d00, #fbf9f1, #1b1c17. Validate each file after creation.
**Warning signs:** Tiles that look "off" compared to the app's warm cream/teal palette.

### Pitfall 3: Sharp Corners
**What goes wrong:** Violates DESIGN.md "no 90-degree corners" rule.
**Why it happens:** Using `<rect>` without `rx` attribute, or using `stroke-linejoin="miter"`.
**How to avoid:** All rectangles must have `rx` attribute. All strokes must use `stroke-linecap="round"` and `stroke-linejoin="round"`.
**Warning signs:** Visual inspection shows angular shapes that feel harsh.

### Pitfall 4: Next.js Image onError Not Firing for SVGs
**What goes wrong:** The onError callback may not fire for all SVG loading failures (e.g., malformed SVG that loads but renders blank).
**Why it happens:** onError fires on network/404 errors, not on SVGs that load successfully but have rendering issues.
**How to avoid:** Ensure all SVGs are valid XML. The fallback primarily handles 404 and network errors, which is sufficient for the use case.
**Warning signs:** Blank tiles with no fallback triggering.

### Pitfall 5: File Size Bloat
**What goes wrong:** SVGs approach the size of dinosaurs.svg (451KB), slowing page load.
**Why it happens:** Complex paths with many control points, or accidentally embedding data.
**How to avoid:** Target under 5KB per file. Use simple geometric shapes (circle, rect, path with few points). The "3-5 shapes" constraint naturally limits complexity.
**Warning signs:** Any SVG over 5KB should be simplified.

## Code Examples

### Existing Integration (theme-grid.tsx, lines 33-39)
```tsx
<Image
  src={'/themes/' + themeToFilename(theme) + '.svg'}
  width={200}
  height={200}
  alt={theme}
  className="w-full aspect-square rounded-3xl"
  unoptimized
/>
```

### Existing Filename Mapping (theme-utils.ts)
```ts
export function themeToFilename(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
}
```

### Complete Theme List (schemas.ts)
```ts
export const VALID_THEMES = [
  "Animals", "Dinosaurs", "Space & Stars", "Ocean & Sea",
  "Fairy Tales", "Dragons", "Knights & Castles", "Trains & Vehicles",
  "Superheroes", "Robots", "Forest & Nature", "Pirates",
  "Magic School", "Farm Life", "Rainforest", "Underwater Adventure",
  "Dreams & Clouds", "Holidays & Seasons",
] as const
```

### Fallback Tile (per UI-SPEC)
```tsx
// Fallback: 200x200 area with surface-container-low bg, centered circle of surface-container-highest
<div className="w-full aspect-square rounded-3xl bg-surface-container-low flex items-center justify-center">
  <div className="w-16 h-16 rounded-full bg-surface-container-highest" />
</div>
```

### SVG Template (for each new file)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Optional background -->
  <rect width="200" height="200" rx="24" fill="#fbf9f1"/>
  <!-- Theme shapes: 3-5 elements using only #0c6681, #705d00, #fbf9f1, #1b1c17 -->
  <!-- All strokes: width 2-3, linecap round, linejoin round -->
  <!-- All rects: must have rx attribute -->
</svg>
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-03 | All 17 SVG files exist in public/themes/ | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts -x` | No - Wave 0 |
| STORY-03 | Each SVG has correct viewBox="0 0 200 200" | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts -x` | No - Wave 0 |
| STORY-03 | Each SVG uses only permitted palette colors | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts -x` | No - Wave 0 |
| STORY-03 | Each SVG is under 5KB | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts -x` | No - Wave 0 |
| STORY-03 | Each SVG contains no prohibited elements (image, text, style, script) | unit | `npx vitest run src/__tests__/theme-svg-assets.test.ts -x` | No - Wave 0 |
| STORY-03 | theme-grid.tsx renders fallback on image error | unit | `npx vitest run src/__tests__/theme-grid-fallback.test.ts -x` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/theme-svg-assets.test.ts` -- SVG file validation (existence, viewBox, palette, size, prohibited elements). Reads files from public/themes/ using fs and validates structure with string matching or XML parsing.
- [ ] `src/__tests__/theme-grid-fallback.test.ts` -- Tests that ThemeGrid renders fallback placeholder when Image onError fires. Requires @testing-library/react.

**Note on SVG validation tests:** These tests read static files from disk using `fs.readFileSync` and validate SVG content with regex or DOMParser. They do not require rendering. The vitest jsdom environment supports DOMParser for XML parsing if needed, but simple regex checks for viewBox, permitted hex colors, and prohibited element tags are sufficient and more robust.

**Testing library check:** @testing-library/react may not be installed. If not present, the fallback test can use vitest's jsdom environment with manual DOM assertions, or the planner should include an install step.

## Sources

### Primary (HIGH confidence)
- Source code: `src/components/theme-grid.tsx` -- current integration implementation
- Source code: `src/lib/theme-utils.ts` -- filename mapping function
- Source code: `src/lib/schemas.ts` -- canonical theme list
- Source code: `public/themes/dinosaurs.svg` -- existing SVG (451KB, confirms integration path works)
- Phase 8 CONTEXT.md -- locked decisions D-01 through D-05
- Phase 8 UI-SPEC.md -- SVG specification, fallback design, color palette

### Secondary (MEDIUM confidence)
- DESIGN.md -- color tokens and design principles

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, all integration already in place
- Architecture: HIGH - pure asset creation plus one small component modification
- Pitfalls: HIGH - well-understood domain (static SVG files), risks are straightforward to mitigate

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable -- static assets, no API dependencies)
