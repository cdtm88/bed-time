---
phase: 04-input-form
plan: 01
subsystem: infra
tags: [tailwind, google-fonts, rate-limiting, design-tokens, next-font]

requires:
  - phase: 01-project-scaffolding
    provides: Next.js app with Tailwind v4, tsconfig @/* alias, edge runtime
  - phase: 02-core-generation-pipeline
    provides: schemas.ts with VALID_THEMES, generate API route
provides:
  - Tailwind v4 design tokens (9 colors, 7 spacing, 2 font aliases)
  - Noto Serif and Plus Jakarta Sans loaded via next/font/google with CSS variables
  - checkRateLimit() — in-memory IP rate limiter, 10 req/hour
  - themeToFilename() — theme name to kebab-case SVG filename
  - /api/generate rate limiting integration (429 before processing)
  - /story stub page reading from sessionStorage
affects: [04-input-form-02, 05-reading-experience]

tech-stack:
  added: [next/font/google (Noto Serif, Plus Jakarta Sans)]
  patterns:
    - Tailwind v4 CSS-first @theme block for design tokens (no tailwind.config.js)
    - next/font CSS variable bridge via @theme inline
    - In-memory Map for stateful rate limiting (edge-compatible)

key-files:
  created:
    - src/lib/rate-limit.ts
    - src/lib/theme-utils.ts
    - src/lib/__tests__/rate-limit.test.ts
    - src/lib/__tests__/theme-utils.test.ts
    - src/app/story/page.tsx
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/api/generate/route.ts

key-decisions:
  - "In-memory Map for rate limiter: edge-compatible, no external dependency, resets on redeploy (acceptable for MVP)"
  - "cleanup() called on each checkRateLimit to prevent unbounded Map growth"
  - "Rate limit check is first operation in POST handler before JSON parsing to avoid wasting compute"
  - "themeToFilename strips & with surrounding whitespace then replaces remaining spaces with hyphens"
  - "/story is a minimal stub — will be fully replaced in Phase 5 reading experience"

patterns-established:
  - "Design tokens: define in @theme block in globals.css, reference via Tailwind utility classes"
  - "Font loading: next/font/google with variable option, bridge via @theme inline in globals.css"

requirements-completed: [INFRA-01, INFRA-03]

duration: 2min
completed: 2026-03-25
---

# Phase 4 Plan 01: Design System Foundation and Infrastructure Summary

**Tailwind v4 design tokens (9 colors, 7 spacing), Noto Serif + Plus Jakarta Sans via next/font, in-memory IP rate limiter (10 req/hr), theme-to-filename utility, and /story stub page**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T08:20:44Z
- **Completed:** 2026-03-25T08:22:43Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Tailwind v4 design token system established: 9 color tokens, 7 spacing tokens, font bridge via @theme inline — all accessible as Tailwind utility classes (bg-surface, text-on-surface, text-primary, p-md, font-serif, etc.)
- Google Fonts loaded via next/font/google with CSS variables applied to html element; body defaults to bg-surface text-on-surface
- Rate limiter library with 12 passing tests: blocks 11th request per IP per hour, different IPs independent, window reset verified
- Theme-to-filename utility covering all 18 VALID_THEMES; all 18 names verified against expected kebab-case filenames
- /api/generate POST handler now rate-limits before JSON parsing — returns 429 with friendly message
- /story page stub exists as client component reading from sessionStorage, styled with design tokens

## Task Commits

Each task was committed atomically:

1. **Task 1: Design tokens, fonts, rate-limit library, theme-utils library** - `221a84f` (feat)
2. **Task 2: Rate-limit route integration and /story stub page** - `4627d15` (feat)

**Plan metadata:** (docs commit — pending)

_Note: Task 1 used TDD (RED: failing tests, GREEN: implementations passing)_

## Files Created/Modified

- `src/app/globals.css` — Tailwind v4 @theme block with 9 color tokens, 7 spacing tokens, @theme inline font bridge
- `src/app/layout.tsx` — Noto Serif + Plus Jakarta Sans loaded via next/font/google, CSS variables applied to html
- `src/lib/rate-limit.ts` — In-memory IP rate limiter: 10 req/hour, auto-cleanup expired entries
- `src/lib/theme-utils.ts` — themeToFilename() converting theme names to kebab-case SVG filenames
- `src/lib/__tests__/rate-limit.test.ts` — 5 tests covering all rate-limit behaviors including window reset
- `src/lib/__tests__/theme-utils.test.ts` — 7 tests covering individual conversions and all 18 VALID_THEMES
- `src/app/api/generate/route.ts` — Rate limit check added before JSON parsing; 429 response with friendly message
- `src/app/story/page.tsx` — Client component stub reading sessionStorage, rendering with design tokens

## Decisions Made

- In-memory Map for rate limiter: edge-compatible, no external dependency needed; resets on redeploy (acceptable for MVP)
- cleanup() called on each checkRateLimit() call to prevent unbounded Map growth without a cron job
- Rate limit check placed before JSON parsing to avoid wasting compute on blocked requests
- /story is intentionally minimal — it will be fully replaced in Phase 5 with the reading experience

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Design tokens are live: Plan 02 (input form UI) can immediately use bg-surface, text-primary, font-serif, p-md, etc.
- Rate limiting is active: no additional setup needed
- /story stub destination exists for form submission flow
- All 81 tests pass, Next.js build succeeds

## Self-Check: PASSED

All files verified present on disk. All commits verified in git log.
- `221a84f` — feat(04-01): design tokens, Google Fonts, rate-limit library, theme-utils library
- `4627d15` — feat(04-01): rate-limit route integration and /story stub page

---
*Phase: 04-input-form*
*Completed: 2026-03-25*
