# Roadmap: Nightlight Tales

## Overview

This roadmap delivers a web app that lets parents generate safe, personalized bedtime stories in under a minute. The work flows from project scaffolding through a backend generation pipeline (with safety validation), then into the parent-facing UI (input form and reading experience), and finally into story quality tuning. The pipeline is built and proven before any UI work begins, because the generation logic is the core product risk. The reading experience gets its own phase because parents spend 5-15 minutes on that screen and 30 seconds on the form.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffolding** - Next.js project setup with Vercel deployment pipeline (completed 2026-03-24)
- [ ] **Phase 2: Core Generation Pipeline** - Input validation, age/duration mapping, prompt construction, and Claude API integration testable via curl
- [ ] **Phase 3: Safety Validation Layer** - Post-generation content filtering with retry logic and graceful failure
- [x] **Phase 4: Input Form** - Parent-facing web form with no-login flow and rate limiting (completed 2026-03-25)
- [ ] **Phase 5: Reading Experience** - Fullscreen dim-room reading mode optimized for parents reading aloud
- [ ] **Phase 6: Story Quality Tuning** - Narrative arc, calming language, and varied story structures
- [x] **Phase 7: Nightlight Tales Branding** - Audit and update app name, metadata, and strings to "Nightlight Tales" consistently (completed 2026-03-26)
- [ ] **Phase 8: Theme SVG Assets** - Add 17 missing SVG illustration files to restore full theme grid visual display (closes STORY-03)
- [ ] **Phase 9: Production Hardening** - Fix Edge Runtime rate limiting, verify Haiku model ID, clean up duration type casts (closes INFRA-03)
- [ ] **Phase 10: Nyquist Compliance** - Fill all draft VALIDATION.md files with real test sampling evidence
- [ ] **Phase 11: UI Polish and Tidy Up** - Visual polish pass across the app for a cohesive, refined feel

## Phase Details

### Phase 1: Project Scaffolding
**Goal**: A deployed Next.js application with the foundational project structure in place
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-04
**Success Criteria** (what must be TRUE):
  1. Next.js app is deployed on Vercel and accessible via a public URL
  2. The development environment runs locally with hot reload via Turbopack
  3. Tailwind CSS is configured and rendering styles correctly
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 16 with Tailwind v4, Edge Runtime stub, and Vercel deployment

### Phase 2: Core Generation Pipeline
**Goal**: A parent's inputs (name, age, theme, duration) produce a personalized story via Claude, callable and testable through an API endpoint
**Depends on**: Phase 1
**Requirements**: STORY-01, STORY-02, STORY-03, STORY-04, SAFE-04, INFRA-02
**Success Criteria** (what must be TRUE):
  1. A curl request with name, age, theme, and duration returns a generated story
  2. The child's name appears naturally woven into the story text
  3. Story vocabulary and complexity differ observably between a toddler (age 2) and an older child (age 9)
  4. Story length scales proportionally with the selected duration (5/10/15 min)
  5. The API key is never present in client-side code or network responses
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Test infra (Vitest) + library modules: input validation, age-level mapping, prompt construction (TDD)
- [x] 02-02-PLAN.md — Anthropic SDK integration, route handler wiring, curl verification checkpoint

### Phase 3: Safety Validation Layer
**Goal**: Every generated story is verified safe before it can reach a parent, with automatic retry on failure and graceful error handling
**Depends on**: Phase 2
**Requirements**: SAFE-01, SAFE-02, SAFE-03
**Success Criteria** (what must be TRUE):
  1. A generated story passes through a separate validation model (Haiku) that classifies it as safe or unsafe before display
  2. If validation flags a story as unsafe, the system silently retries generation (up to 2 retries) without the parent seeing anything
  3. If all retries fail, the parent sees a friendly error message -- never an unsafe story
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Safety validation library with TDD: validation parsing, Haiku classification, retry orchestration, prompt builders
- [x] 03-02-PLAN.md — Route handler integration: replace streaming with buffered safety-validated response, live verification

### Phase 4: Input Form
**Goal**: A parent can visit the app, enter their child's details, and trigger story generation with zero friction
**Depends on**: Phase 2
**Requirements**: INFRA-01, INFRA-03
**Success Criteria** (what must be TRUE):
  1. A parent can visit the app and immediately start entering details -- no login, no signup, no account required
  2. The form validates inputs in real-time (name: letters/spaces only, max 30 chars; age: 0-10; theme: preset list; duration: 5/10/15)
  3. Submitting the form triggers story generation and transitions to a loading/reading state
  4. Excessive requests from a single IP are rate-limited with a clear, friendly message
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 04-01-PLAN.md — Design system tokens, Google Fonts, rate-limit library (TDD), theme-utils, route integration, /story stub
- [x] 04-02-PLAN.md — Input form UI components (NameInput, AgeStepper, DurationToggle, ThemeGrid, LoadingOverlay, StoryForm) and page wiring

### Phase 5: Reading Experience
**Goal**: Parents can read the generated story aloud in a calm, distraction-free environment optimized for dim bedrooms
**Depends on**: Phase 3, Phase 4
**Requirements**: READ-01
**Success Criteria** (what must be TRUE):
  1. The story displays in a fullscreen mode with no navigation chrome, no distracting UI elements
  2. Text uses a large serif font with warm/dark background colors, readable in a dim room
  3. The reading view works well on a phone held at bedside (mobile-optimized layout, appropriate line length)
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 05-01-PLAN.md — Test scaffolding, dark reading mode CSS tokens, sessionStorage JSON contract update
- [x] 05-02-PLAN.md — ReadingView client component, page.tsx server wrapper with viewport export, visual checkpoint

### Phase 6: Story Quality Tuning
**Goal**: Generated stories are genuinely engaging narratives with calming wind-down arcs, not bland AI-generated text
**Depends on**: Phase 5
**Requirements**: STORY-05, STORY-06, STORY-07
**Success Criteria** (what must be TRUE):
  1. Each generated story follows a clear narrative arc: beginning that draws the child in, a gentle conflict or adventure, and a resolution that winds down toward sleep
  2. Stories use calming, sleep-inducing language that progressively slows pace toward the ending
  3. Generating multiple stories with the same inputs produces noticeably different narratives (varied structures, openings, and imagery)
  4. Stories incorporate sensory language and descriptive imagery rather than generic narration
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — Per-age sensory guidance in reading level descriptions (TDD, D-08)
- [x] 06-02-PLAN.md — Rewrite buildSystemPrompt with narrative arc, wind-down, variation, and sensory instructions (TDD, D-01 through D-07, D-09)

### Phase 06.1: 3-minute duration option (INSERTED)

**Goal:** Add a 3-minute reading duration option with 450-word target, compact narrative arc, and UI toggle update
**Requirements**: DUR-01
**Depends on:** Phase 6
**Plans:** 1/1 plans complete

Plans:
- [x] 06.1-01-PLAN.md — Duration 3 config, validation, UI toggle, and compact narrative arc for short stories (TDD)

### Phase 7: Nightlight Tales Branding
**Goal**: All app name references, metadata, and strings consistently use "Nightlight Tales" across package.json, HTML title tags, README, Open Graph tags, and favicon
**Depends on**: Phase 6
**Requirements**: TBD
**Plans**: 1 plan

Plans:
- [x] 07-01-PLAN.md — Package rename, README rewrite, Open Graph metadata, moon emoji favicon

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding | 1/1 | Complete   | 2026-03-24 |
| 2. Core Generation Pipeline | 0/2 | Not started | - |
| 3. Safety Validation Layer | 0/2 | Not started | - |
| 4. Input Form | 2/2 | Complete   | 2026-03-25 |
| 5. Reading Experience | 0/2 | Not started | - |
| 6. Story Quality Tuning | 0/2 | Not started | - |
| 06.1 3-minute duration | 1/1 | Complete    | 2026-03-26 |
| 7. Nightlight Tales Branding | 1/1 | Complete   | 2026-03-26 |
| 8. Theme SVG Assets | 0/2 | Not started | - |
| 9. Production Hardening | 0/TBD | Not started | - |
| 10. Nyquist Compliance | 0/TBD | Not started | - |
| 11. UI Polish and Tidy Up | 0/TBD | Not started | - |

### Phase 8: Theme SVG Assets
**Goal**: All 18 theme tiles display correctly with SVG illustrations; the theme grid is fully functional visually
**Depends on**: Phase 7
**Requirements**: STORY-03
**Gap Closure**: Closes HIGH integration gap from v1.0 audit — 17/18 SVG files missing from `public/themes/`
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — SVG validation tests + create all 17 missing theme tile SVG illustrations
- [ ] 08-02-PLAN.md — onError fallback in theme-grid.tsx + visual verification checkpoint

### Phase 9: Production Hardening
**Goal**: Rate limiting is enforced in production on Vercel Edge Runtime; Haiku model ID is verified correct; duration type casts removed
**Depends on**: Phase 7
**Requirements**: INFRA-03
**Gap Closure**: Closes MEDIUM gap (rate limiting non-functional on Edge), LOW gap (Haiku model ID), tech debt (duration type cast)
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 10: Nyquist Compliance
**Goal**: All phase VALIDATION.md files are filled with real test sampling evidence; Phase 06.1 VALIDATION.md created
**Depends on**: Phase 9
**Requirements**: N/A (documentation gap)
**Gap Closure**: Closes Nyquist compliance gap across all 8 phases — draft templates replaced with exercised validation
**Plans**: TBD

Plans:
- [ ] TBD

### Phase 11: UI Polish and Tidy Up
**Goal**: Visual polish pass across the app — typography, spacing, colour, and interaction details refined for a polished, cohesive feel
**Depends on**: Phase 10
**Requirements**: TBD
**Plans**: TBD

Plans:
- [ ] TBD

## Backlog

### Phase 999.1: Reading Font Readability Research (BACKLOG)

**Goal:** Research the best font for bedtime story readability. Evaluate alternatives to Noto Serif for the reading view — consider readability in dim-room conditions, on mobile, at 20px+ sizes. Candidates include Georgia, Lora, and system serif options.
**Requirements:** TBD
**Plans:** 1/1 plans complete

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)
