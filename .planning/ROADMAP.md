# Roadmap: Nightlight Tales

## Milestones

- ✅ **v1.0 MVP** — Phases 1–11 (shipped 2026-04-01) — see [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)
- 🚧 **v2.0 Features** — Phases 12–15 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–11) — SHIPPED 2026-04-01</summary>

- [x] Phase 1: Project Scaffolding (1/1 plan) — completed 2026-03-24
- [x] Phase 2: Core Generation Pipeline (2/2 plans) — completed 2026-03-24
- [x] Phase 3: Safety Validation Layer (2/2 plans) — completed 2026-03-24
- [x] Phase 4: Input Form (2/2 plans) — completed 2026-03-25
- [x] Phase 5: Reading Experience (2/2 plans) — completed 2026-03-25
- [x] Phase 6: Story Quality Tuning (2/2 plans) — completed 2026-03-26
- [x] Phase 06.1: 3-minute Duration Option (1/1 plan) — completed 2026-03-26 (INSERTED)
- [x] Phase 7: Nightlight Tales Branding (1/1 plan) — completed 2026-03-26
- [x] Phase 8: Theme SVG Assets (2/2 plans) — completed 2026-03-26
- [x] Phase 9: Production Hardening (2/2 plans) — completed 2026-03-29
- [x] Phase 10: Nyquist Compliance (2/2 plans) — completed 2026-03-30
- [x] Phase 11: UI Polish and Tidy Up (2/2 plans) — completed 2026-03-31

**Total:** 12 phases, 21 plans, ~1,993 LOC, 9 days

</details>

### 🚧 v2.0 Features (In Progress)

**Milestone Goal:** Enrich the reading experience with progressive streaming, visuals, and story persistence.

- [ ] **Phase 12: Streaming & Reading UX** — Buffer-validate-then-stream pipeline, Wake Lock, Literata font
- [ ] **Phase 13: Story Persistence** — Device-local story library, re-reading, shareable links
- [ ] **Phase 14: AI Scene Illustrations** — fal.ai-generated scene images between story paragraphs
- [ ] **Phase 15: Theme Tile Refresh** — 18 redesigned SVG theme illustrations with warmer nighttime aesthetic

## Phase Details

### Phase 12: Streaming & Reading UX
**Goal**: Parents see story text appear progressively while reading, with the screen staying awake and a font purpose-built for dim-room reading
**Depends on**: Phase 11 (v1.0 complete)
**Requirements**: STREAM-01, STREAM-02, STREAM-03
**Success Criteria** (what must be TRUE):
  1. Story text appears progressively in the reading view after generation completes (no full-page wait), with safety validation still enforced before any text reaches the client
  2. Device screen does not dim or lock while a story is being read aloud
  3. Story text renders in Literata font on the reading screen, visually distinct from the previous Noto Serif
  4. If Wake Lock is unavailable (unsupported browser), the reading experience still works normally without errors
**Plans:** 2 plans
Plans:
- [ ] 12-01-PLAN.md — TDD stream utilities and Wake Lock hook
- [ ] 12-02-PLAN.md — Wire streaming pipeline end-to-end (API route, form, reading view)

### Phase 13: Story Persistence
**Goal**: Parents can save stories to their device, re-read them later, and share a story with anyone via a link
**Depends on**: Phase 12 (streaming pipeline provides the story data format that persistence stores)
**Requirements**: PERSIST-01, PERSIST-02, PERSIST-03
**Success Criteria** (what must be TRUE):
  1. After generating a story, user can see it saved in a library view accessible from the home screen
  2. User can tap a saved story and re-read it in full reading mode (same experience as a freshly generated story)
  3. User can copy a shareable link for any story; opening that link in another browser displays the story
  4. Shared links stop working after their TTL expires
  5. Library works offline for previously saved stories (no network needed to re-read)
**Plans**: TBD
**UI hint**: yes

### Phase 14: AI Scene Illustrations
**Goal**: Stories come alive with AI-generated illustrations that appear between paragraphs as the parent reads
**Depends on**: Phase 12 (streaming pipeline determines where illustration insertion points go)
**Requirements**: VISUAL-02
**Success Criteria** (what must be TRUE):
  1. 2-3 scene illustrations appear inline between story paragraphs during reading
  2. Illustrations load on-demand as the user scrolls (not all at once), with a visible loading state
  3. Illustrations match the story's theme and scene context (not generic stock art)
  4. If image generation fails, the story remains fully readable without broken placeholders
**Plans**: TBD
**UI hint**: yes

### Phase 15: Theme Tile Refresh
**Goal**: The theme selection grid feels warmer and more magical, setting the mood before story generation even begins
**Depends on**: Nothing (independent of other v2.0 phases; can execute in parallel)
**Requirements**: VISUAL-01
**Success Criteria** (what must be TRUE):
  1. All 18 theme tiles display new illustrations with a warmer, nighttime-whimsical aesthetic
  2. New SVGs follow the same size/viewBox constraints established in Phase 8
  3. Fallback behavior still works if any SVG fails to load
**Plans**: TBD
**UI hint**: yes

## Backlog

These ideas are parked until promoted by `/gsd:review-backlog`:

- **999.1** — Reading Font Readability Research: evaluate alternatives to Noto Serif for dim-room mobile reading
- **999.2** — Improve SVG Theme Tile Illustrations: warmer, more whimsical artwork with nighttime aesthetic

## Progress

**Execution Order:**
Phases execute in numeric order: 12 → 13 → 14 → 15 (Phase 15 has no dependency and could run earlier if desired)

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Project Scaffolding | v1.0 | 1/1 | Complete | 2026-03-24 |
| 2. Core Generation Pipeline | v1.0 | 2/2 | Complete | 2026-03-24 |
| 3. Safety Validation Layer | v1.0 | 2/2 | Complete | 2026-03-24 |
| 4. Input Form | v1.0 | 2/2 | Complete | 2026-03-25 |
| 5. Reading Experience | v1.0 | 2/2 | Complete | 2026-03-25 |
| 6. Story Quality Tuning | v1.0 | 2/2 | Complete | 2026-03-26 |
| 06.1. 3-minute Duration | v1.0 | 1/1 | Complete | 2026-03-26 |
| 7. Nightlight Tales Branding | v1.0 | 1/1 | Complete | 2026-03-26 |
| 8. Theme SVG Assets | v1.0 | 2/2 | Complete | 2026-03-26 |
| 9. Production Hardening | v1.0 | 2/2 | Complete | 2026-03-29 |
| 10. Nyquist Compliance | v1.0 | 2/2 | Complete | 2026-03-30 |
| 11. UI Polish and Tidy Up | v1.0 | 2/2 | Complete | 2026-03-31 |
| 12. Streaming & Reading UX | v2.0 | 1/2 | In Progress | - |
| 13. Story Persistence | v2.0 | 0/TBD | Not started | - |
| 14. AI Scene Illustrations | v2.0 | 0/TBD | Not started | - |
| 15. Theme Tile Refresh | v2.0 | 0/TBD | Not started | - |
