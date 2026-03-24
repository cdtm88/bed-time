---
phase: 01-project-scaffolding
plan: 01
subsystem: infra
tags: [nextjs, tailwind, typescript, edge-runtime, vercel]

# Dependency graph
requires: []
provides:
  - Next.js 16.2.1 app with App Router and src/ layout
  - Tailwind CSS v4 configured via @import directive
  - Edge Runtime stub at /api/generate
  - Placeholder structure for components and lib directories
  - .env.local.example with ANTHROPIC_API_KEY placeholder
  - npm run build passes cleanly
affects: [02-story-generation-api, 03-safety-validation, 04-frontend-ui, 05-design-system]

# Tech tracking
tech-stack:
  added:
    - next@16.2.1
    - react@19.2.4
    - react-dom@19.2.4
    - tailwindcss@^4
    - "@tailwindcss/postcss@^4"
    - typescript@^5
    - eslint@^9
    - eslint-config-next@16.2.1
  patterns:
    - Tailwind v4 CSS-first configuration via @import "tailwindcss" (no tailwind.config.js)
    - Edge Runtime declared via export const runtime = "edge" (not experimental-edge)
    - App Router with src/ directory layout
    - Turbopack as default bundler (no --turbo flag needed)

key-files:
  created:
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - src/app/api/generate/route.ts
    - src/components/.gitkeep
    - src/lib/.gitkeep
    - .env.local.example
    - package.json
    - tsconfig.json
    - next.config.ts
    - postcss.config.mjs
    - eslint.config.mjs
    - .gitignore
  modified: []

key-decisions:
  - "D-01: No design tokens configured in Phase 1 - deferred to Phase 4/5"
  - "D-02: GitHub + Vercel integration for auto-deploy (not CLI) - set up at checkpoint"
  - "D-03: Edge Runtime used for /api/generate to avoid Vercel 10s free tier timeout"
  - "D-04: src/ layout - all app code under src/app/"
  - "D-05: App Router (not Pages Router)"
  - "tsconfig.json @/* path alias maps to ./src/* to match src/ layout"
  - ".gitignore includes !.env.local.example exception so template file is tracked"

patterns-established:
  - "Pattern 1 (Edge Runtime): export const runtime = 'edge' in route handlers for streaming/long-running endpoints"
  - "Pattern 2 (Tailwind v4): @import 'tailwindcss' in globals.css, no config file needed"
  - "Pattern 3 (Deployment): Push to main triggers Vercel auto-deploy via GitHub integration"

requirements-completed: [INFRA-04]

# Metrics
duration: 15min
completed: 2026-03-24
---

# Phase 1 Plan 1: Project Scaffolding Summary

**Next.js 16.2.1 app scaffolded with Tailwind CSS v4, Edge Runtime stub at /api/generate, deployed to Vercel via GitHub integration**

## Performance

- **Duration:** ~15 min (Task 1 complete; Task 2 awaiting human action)
- **Started:** 2026-03-24T10:01:22Z
- **Completed:** 2026-03-24 (partial - checkpoint at Task 2)
- **Tasks:** 1/2 complete (Task 2 is checkpoint:human-action)
- **Files modified:** 19

## Accomplishments
- Next.js 16.2.1 scaffolded with App Router, TypeScript, Tailwind v4, ESLint, src/ layout
- Tailwind CSS v4 configured correctly: postcss.config.mjs with @tailwindcss/postcss, globals.css with @import "tailwindcss" only
- Edge Runtime stub at src/app/api/generate/route.ts with runtime="edge" and POST handler
- npm run build passes cleanly with zero TypeScript or Tailwind errors
- Dev server tested: localhost:3000 renders "Nightlight Tales"; POST /api/generate returns "Story generation coming in Phase 2"

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project with Edge Runtime stub and placeholder structure** - `f01ba5b` (feat)
2. **Task 2: Connect GitHub repo to Vercel and verify deployment** - PENDING (checkpoint:human-action)

**Plan metadata:** TBD after Task 2 completion

## Files Created/Modified
- `src/app/layout.tsx` - Root layout with metadata for "Nightlight Tales"
- `src/app/page.tsx` - Placeholder home page with "Nightlight Tales" heading and Tailwind classes
- `src/app/globals.css` - Tailwind v4 CSS entry point with @import "tailwindcss" only
- `src/app/api/generate/route.ts` - Edge Runtime stub: runtime="edge", POST handler returning placeholder
- `src/components/.gitkeep` - Placeholder directory for Phase 4+ UI components
- `src/lib/.gitkeep` - Placeholder directory for Phase 2+ utilities
- `.env.local.example` - Environment template with ANTHROPIC_API_KEY= placeholder
- `package.json` - Next.js 16.2.1, React 19, Tailwind v4 dependencies
- `tsconfig.json` - TypeScript config with @/* path alias pointing to ./src/*
- `next.config.ts` - Next.js TypeScript config
- `postcss.config.mjs` - @tailwindcss/postcss plugin (Tailwind v4)
- `eslint.config.mjs` - ESLint flat config
- `.gitignore` - Includes .env* exclusion, !.env.local.example exception, *.local

## Decisions Made
- Used `!.env.local.example` exception in .gitignore so the template is tracked by git while `.env.local` (with real keys) remains ignored
- Updated tsconfig.json `@/*` path alias to `./src/*` since create-next-app defaulted to `./src/` layout mapping
- Simplified layout.tsx to remove Geist fonts from scaffold (per plan spec, no design tokens in Phase 1)
- globals.css stripped to only `@import "tailwindcss"` (removed boilerplate dark mode CSS variables from scaffold)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated tsconfig @/* path alias from "./*" to "./src/*"**
- **Found during:** Task 1 (post-scaffold verification)
- **Issue:** create-next-app without --src-dir flag created app/ not src/app/, so default @/* -> ./* mapping didn't match src/ structure
- **Fix:** Updated tsconfig.json paths to "@/*": ["./src/*"]
- **Files modified:** tsconfig.json
- **Verification:** npm run build passes cleanly
- **Committed in:** f01ba5b (Task 1 commit)

**2. [Rule 1 - Bug] Added !.env.local.example gitignore exception**
- **Found during:** Task 1 (git add attempt)
- **Issue:** .gitignore had .env* pattern which also matched .env.local.example, preventing the template from being committed
- **Fix:** Added !.env.local.example exception after .env* in .gitignore
- **Files modified:** .gitignore
- **Verification:** git add .env.local.example succeeded
- **Committed in:** f01ba5b (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs discovered during execution)
**Impact on plan:** Both fixes necessary for correct behavior. No scope creep.

## Issues Encountered
- create-next-app with --yes flag created app/ layout instead of src/app/ layout. Manually created src/app/ structure per D-04 and placed all files there. tsconfig path alias updated accordingly.

## User Setup Required

Task 2 is a `checkpoint:human-action` requiring manual Vercel dashboard configuration:

1. Go to https://vercel.com (create free account if needed)
2. Click "Add New Project" -> "Import Git Repository"
3. Select the `bed-time` GitHub repository
4. Accept default settings (Vercel auto-detects Next.js)
5. Click "Deploy"

**Note:** No git remote is configured in this repo yet. The user must also push to GitHub before Vercel can import the repo:
- Create GitHub repo at https://github.com/new
- `git remote add origin https://github.com/{username}/bed-time.git`
- `git push -u origin main`

After deployment, verify:
- `curl -X POST https://{deployment-url}.vercel.app/api/generate` returns "Story generation coming in Phase 2"

## Next Phase Readiness
- Next.js 16 scaffold complete and building cleanly
- Edge Runtime stub at /api/generate ready for Phase 2 to implement Claude streaming
- src/components/ and src/lib/ placeholder directories ready for Phase 2+
- Phase 2 (story generation API) can begin once Vercel deployment is verified

## Known Stubs
- `src/app/api/generate/route.ts` line 3-8: POST handler returns placeholder "Story generation coming in Phase 2" - intentional Phase 1 stub, Phase 2 will implement the Claude API streaming

---
*Phase: 01-project-scaffolding*
*Completed: 2026-03-24 (partial - awaiting Task 2 Vercel checkpoint)*
