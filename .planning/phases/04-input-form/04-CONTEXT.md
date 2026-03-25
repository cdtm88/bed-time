# Phase 4: Input Form - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the parent-facing web form at `/` — the app's entry point. A parent visits, enters their child's name, age, theme, and duration, and taps Generate. The form transitions to a full-screen loading overlay while the story generates (~30s), then navigates to `/story`. No login, no friction. IP-based rate limiting enforced with an inline error message. This is also the first phase to apply the DESIGN.md token system to the UI.

</domain>

<decisions>
## Implementation Decisions

### Form Structure
- **D-01:** Single-scroll page — all 4 fields visible at once, no wizard/steps.
- **D-02:** Field order (top to bottom): **Name → Age → Duration → Themes**
- **D-03:** Name field: free text input with real-time validation (letters/spaces only, max 30 chars — SAFE-04 constraint already implemented in `src/lib/schemas.ts`)
- **D-04:** Age field: stepper control — `[ − ]  [ 5 ]  [ + ]` — not a plain number input. Range: 0–10.
- **D-05:** Duration field: three option/toggle buttons — `[ 5 min ]  [ 10 min ]  [ 15 min ]`
- **D-06:** Theme field: 2-column tile grid, one tile per theme (18 tiles total). Each tile shows an SVG illustration + theme name label below it.

### Theme Tile Illustrations
- **D-07:** User-supplied SVG illustrations. Stored in `public/themes/` as kebab-case filenames (e.g. `dinosaurs.svg`, `space-stars.svg`). Full filename list:
  - `animals.svg`, `dinosaurs.svg`, `space-stars.svg`, `ocean-sea.svg`, `fairy-tales.svg`, `dragons.svg`, `knights-castles.svg`, `trains-vehicles.svg`, `superheroes.svg`, `robots.svg`, `forest-nature.svg`, `pirates.svg`, `magic-school.svg`, `farm-life.svg`, `rainforest.svg`, `underwater-adventure.svg`, `dreams-clouds.svg`, `holidays-seasons.svg`
- **D-08:** SVG spec: 200×200px artboard (`viewBox="0 0 200 200"`), warm storybook style using DESIGN.md palette (`#0c6681`, `#705d00`, `#fbf9f1`, `#1b1c17`), rounded strokes 2–3px, no sharp corners.
- **D-09:** Wire up with Next.js `<Image>` component. Theme tiles reference `/themes/{filename}.svg`.

### Loading State
- **D-10:** On form submit, a **full-screen loading overlay** replaces the form with a calm animation and personalised copy — e.g. *"Crafting Luna's story…"* (child's name woven in). Include a reassurance line: *"This takes about 30 seconds."*
- **D-11:** The overlay covers the full viewport. The form is hidden/unmounted while loading is active.
- **D-12:** Animation: Claude's discretion — should feel calm and magical (stars, gentle glow, moon motif), aligned with DESIGN.md's warm aesthetic. Use CSS animation, no heavy libraries needed.

### Story Handoff
- **D-13:** When `/api/generate` responds successfully, **navigate to `/story`** (new route). Story text is passed via route state or URL-safe mechanism. Phase 5 builds out the `/story` reading experience — Phase 4 only needs to get the parent there with the text.
- **D-14:** The `/story` page created in Phase 4 is a minimal stub — just renders the raw story text. Phase 5 replaces it entirely.

### Rate Limiting UX
- **D-15:** Rate limit errors surface as an **inline message below the Generate button** — e.g. *"You've created a few stories recently. Try again in a bit."* Friendly, non-technical. The form stays visible so the parent can try again later.
- **D-16:** Rate limit is IP-based (INFRA-03). Implementation detail (middleware vs. route handler) is Claude's discretion.

### Design System Setup
- **D-17:** Phase 4 is the first phase to apply DESIGN.md tokens. Configure Tailwind v4 CSS custom properties in `globals.css` — color tokens, typography scale (Noto Serif + Plus Jakarta Sans), spacing. All subsequent UI phases (5+) inherit from this setup.
- **D-18:** Load Noto Serif and Plus Jakarta Sans via Google Fonts (Next.js `next/font/google`). Apply font variables to the `<body>` in `layout.tsx`.

### Claude's Discretion
- Exact loading animation implementation (CSS keyframes, SVG animation, or Tailwind animate utilities)
- Rate limiting implementation location (Next.js middleware vs. route handler)
- Story text passing mechanism to `/story` (sessionStorage, URL param, or React state with router)
- Exact copy for loading overlay and rate limit message
- Input field focus/validation error styling details (within DESIGN.md pill-input pattern)
- Selected state appearance for theme tiles and duration buttons

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN.md` — Full color token system, typography (Noto Serif + Plus Jakarta Sans), component rules (pill inputs, pill buttons, tonal stacking, no borders, no sharp corners). **Phase 4 implements this for the first time.**

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-01 (no login), INFRA-03 (IP rate limiting) are the v1 requirements mapped to this phase
- `.planning/ROADMAP.md` — Phase 4 success criteria (immediate form access, real-time validation, generate triggers loading/reading transition, rate limiting with friendly message)

### Prior Phase Context
- `.planning/phases/01-project-scaffolding/01-CONTEXT.md` — D-01 (Tailwind v4 CSS-first: `@import 'tailwindcss'` in globals.css, no tailwind.config.js), D-04 (src/ layout, App Router), D-05 (App Router)
- `.planning/phases/02-core-generation-pipeline/02-CONTEXT.md` — D-01 (18 locked themes), D-03 (plain text response — not streaming), D-06 (input validation regex already in schemas.ts)

### Existing Implementation
- `src/lib/schemas.ts` — `VALID_THEMES`, `VALID_DURATIONS`, `validateInput()` — reuse directly in the form component for client-side validation
- `src/app/page.tsx` — Phase 4 replaces this placeholder with the input form
- `src/app/layout.tsx` — Phase 4 adds Google Fonts here

### Theme Assets
- `public/themes/` — User-supplied SVG illustrations (200×200px, DESIGN.md palette). All 18 files will be present before Phase 4 execution.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/schemas.ts` — `VALID_THEMES` array (all 18 themes), `VALID_DURATIONS`, `validateInput()` function — import directly into form component for client-side field validation; no need to duplicate logic
- `src/app/api/generate/route.ts` — the POST endpoint the form submits to; returns plain text body (not streaming)

### Established Patterns
- TypeScript throughout
- Edge Runtime for API routes (`export const runtime = 'edge'`)
- `src/lib/` for utility functions
- `src/components/` is empty — Phase 4 creates the first UI components here

### Integration Points
- `src/app/page.tsx` — Phase 4 replaces this with the input form component
- `src/app/layout.tsx` — Phase 4 adds `next/font/google` font imports and CSS variable application
- `src/app/globals.css` — Phase 4 adds DESIGN.md color and typography tokens as CSS custom properties
- `src/app/story/page.tsx` — Phase 4 creates this stub route; Phase 5 replaces it
- `public/themes/` — 18 SVG files referenced by the theme tile grid

</code_context>

<specifics>
## Specific Ideas

- Age stepper: `[ − ]  5  [ + ]` — not a plain `<input type="number">`. The visual control matters for the parent-on-phone experience.
- Loading overlay copy uses the child's name: *"Crafting [Name]'s story…"* — personalised, warm.
- Theme grid is 2 columns exactly. Each tile: SVG illustration on top, theme name label below. Selected state needs a clear visual indicator (DESIGN.md tonal stacking — no hard borders).
- Duration: 3 option buttons in a row, one selected at a time. Looks like a segmented control.
- No dividers between form sections. Separate with vertical spacing (DESIGN.md: no horizontal rules).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-input-form*
*Context gathered: 2026-03-25*
