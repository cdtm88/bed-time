# Requirements: Nightlight Tales

**Defined:** 2026-03-23
**Core Value:** A parent can generate a safe, personalized bedtime story in under a minute and read it aloud to their child tonight.

## v1 Requirements

### Story Generation (STORY)

- [x] **STORY-01**: Parent can enter a child's name (letters only, max 30 characters)
- [x] **STORY-02**: Parent can enter a child's exact age; app maps age to reading level band internally (0–3 toddler, 4–6 young child, 7–10 older child) to calibrate vocabulary and sentence complexity
- [x] **STORY-03**: Parent can select a theme from a preset curated list of 15–20 options (e.g. dinosaurs, space, ocean, fairy tales, animals, etc.)
- [x] **STORY-04**: Parent can select a reading duration (5, 10, or 15 minutes); app maps selection to a target word count
- [ ] **STORY-05**: Generated story follows a complete narrative arc with a beginning, conflict, and resolution
- [ ] **STORY-06**: Generated story uses calming, wind-down language designed to ease children toward sleep
- [ ] **STORY-07**: Generated stories use varied narrative structures (not the same template each time), incorporate sensory language and descriptive imagery, and integrate the child's name naturally throughout

### Safety (SAFE)

- [ ] **SAFE-01**: Every generated story passes multi-layer content filtering: prompt-level safety constraints baked into the system prompt, plus a separate post-generation validation call using a lightweight model to classify the story as safe or unsafe before display
- [ ] **SAFE-02**: If the post-generation validation flags a story as uncertain or unsafe, the app silently retries story generation with a modified prompt that reinforces safety constraints (up to 2 retries)
- [ ] **SAFE-03**: If a safe story cannot be produced after all retries, the app displays a graceful, friendly error message — the unsafe story is never shown to the parent
- [x] **SAFE-04**: The child's name input is strictly validated (letters and spaces only, max 30 characters) and XML-delimited within the prompt to prevent prompt injection attacks

### Reading Experience (READ)

- [ ] **READ-01**: After generation completes, the story is displayed in a fullscreen, distraction-free reading mode with a large serif font, warm/dark background, and no navigation chrome — optimised for a parent reading aloud in a dim bedroom

### Infrastructure (INFRA)

- [ ] **INFRA-01**: No login or account required — any parent can visit, enter details, and get a story immediately
- [x] **INFRA-02**: All Claude API calls are made server-side; the API key is never exposed to the frontend
- [ ] **INFRA-03**: App enforces IP-based rate limiting to prevent abuse in the absence of user authentication
- [x] **INFRA-04**: App is deployed on Vercel with zero-config hosting and edge functions

## v2 Requirements

### Reading Experience

- **READ-02**: Story text streams to the reading screen progressively (first words appear within 1–2 seconds of generation starting)
- **READ-03**: Screen Wake Lock prevents the device from sleeping while the parent is reading
- **READ-04**: Dim-room brightness and colour temperature controls (amber mode, brightness presets)

### History & Profiles

- **HIST-01**: Parent can view a history of previously generated stories (stored locally in the browser)
- **HIST-02**: Parent can save a story to favourites for later re-reading
- **PROF-01**: Parent can save multiple child profiles (name, age) to avoid re-entering details each time
- **PROF-02**: App supports generating a story for a second child in the same session (sibling support)

### Accounts (v3+)

- **AUTH-01**: Parent can create an account to sync profiles and story history across devices
- **AUTH-02**: Parent can log in and access saved stories from any browser

## Out of Scope

| Feature | Reason |
|---------|--------|
| Text-to-speech / audio narration | Must be done excellently (multiple voices, ambient sounds) to be worth shipping — deferred until the core product is validated |
| Native iOS app | Deferred until the web MVP is validated; PWA path available if needed |
| Freeform theme input | Preset list keeps output quality and safety more predictable; freeform dramatically increases safety edge cases |
| Social sharing of stories | Moderation burden; stories contain children's names — privacy concern |
| Gamification / streaks | Undermines the calm wind-down purpose |
| Interactive / branching stories | Extends bedtime, breaks the wind-down arc |
| Child-facing UI | COPPA complexity, screen-time concerns — app is for parents only |
| Story editing or regeneration controls | Keep MVP flow simple; add if users request it |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STORY-01 | Phase 2 | Complete |
| STORY-02 | Phase 2 | Complete |
| STORY-03 | Phase 2 | Complete |
| STORY-04 | Phase 2 | Complete |
| STORY-05 | Phase 6 | Pending |
| STORY-06 | Phase 6 | Pending |
| STORY-07 | Phase 6 | Pending |
| SAFE-01 | Phase 3 | Pending |
| SAFE-02 | Phase 3 | Pending |
| SAFE-03 | Phase 3 | Pending |
| SAFE-04 | Phase 2 | Complete |
| READ-01 | Phase 5 | Pending |
| INFRA-01 | Phase 4 | Pending |
| INFRA-02 | Phase 2 | Complete |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16/16
- Unmapped: 0

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*
