# Milestones

## v1.0 MVP (Shipped: 2026-04-01)

**Phases completed:** 14 phases, 21 plans, 35 tasks

**Key accomplishments:**

- Next.js 16.2.1 app scaffolded with Tailwind CSS v4, Edge Runtime stub at /api/generate, deployed to Vercel at https://bed-time-nu.vercel.app/ with automatic GitHub deploys
- Input validation, age-to-reading-level mapping, and prompt construction modules with 46 passing Vitest tests via TDD
- Anthropic SDK wired into Edge Runtime route handler with Claude streaming, producing personalized bedtime stories via plain text ReadableStream
- TDD safety validation with parseValidationResponse (fail-closed), Haiku-based validateStory, and 3-attempt generateSafeStory retry orchestration with reinforced prompts
- Buffered safety-validated /api/generate replacing streaming with generate-validate-return flow via generateSafeStory
- Tailwind v4 design tokens (9 colors, 7 spacing), Noto Serif + Plus Jakarta Sans via next/font, in-memory IP rate limiter (10 req/hr), theme-to-filename utility, and /story stub page
- Six UI components (NameInput, AgeStepper, DurationToggle, ThemeGrid, LoadingOverlay, StoryForm) implementing the complete bedtime story input form with real-time validation, gradient CTA, full-screen loading overlay, and sessionStorage story handoff
- Vitest jsdom environment, 8 TDD unit tests for reading utilities, 5 dark reading mode CSS tokens, and JSON sessionStorage contract ({ story, name, theme })
- 1. [Checkpoint Feedback] Gold scroll progress bar
- System prompt rewritten with three-part narrative arc, wonder-framed middle, sentence-taper wind-down with sleepy cues, four opening styles for variation, and global sensory grounding (D-01 through D-07, D-09)
- One-liner:
- Package renamed to nightlight-tales with full README, Open Graph social tags, and moon emoji favicon via next/og
- One-liner:
- onError fallback added to theme-grid.tsx using a Set-based useState pattern, preventing broken image icons when any SVG fails to load — visually verified with all 18 tiles displaying correctly
- 1. [Structural] Tasks 1 and 2 merged during TDD execution
- Decorative moon/stars hero illustration with breathing animation above form title, solid teal Generate button replacing gradient
- Gold-accented theme tile selection ring and dark navy loading overlay with reading-mode tokens, plus visual verification of all Phase 11 polish changes

---
