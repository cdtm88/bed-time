# Retrospective: Nightlight Tales

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-01
**Phases:** 12 | **Plans:** 21 | **Timeline:** 9 days (2026-03-23 → 2026-04-01)

### What Was Built

- Next.js 16 + Tailwind CSS v4 app deployed on Vercel with Edge Runtime
- Core generation pipeline: input validation, age→reading-level mapping, prompt construction, Claude Sonnet streaming API
- Safety layer: Haiku-based post-generation validation with 3-attempt retry and reinforced prompt on failure
- Parent-facing input form: NameInput, AgeStepper (chip grid), DurationToggle, ThemeGrid (18 SVG themes), LoadingOverlay
- Fullscreen reading experience: dark navy, Noto Serif, gold scroll progress bar, sessionStorage story handoff
- Story quality: 3-part narrative arc, 4 opening styles, sentence-taper wind-down, per-age sensory vocabulary
- Branding: "Nightlight Tales" consistently, moon emoji favicon, Open Graph social tags
- Production hardening: Upstash Redis rate limiting (replaced non-functional in-memory Map on Edge), Haiku model ID confirmed
- UI polish: hero moon/stars illustration, solid teal button, gold theme tile selection, dark navy loading overlay
- 113 passing tests across 8 test files; all 12 VALIDATION.md files with real Nyquist evidence

### What Worked

- **Pipeline-before-UI sequencing** — building and proving the generation/safety pipeline before touching the form eliminated the biggest product risk early. No UI rework due to backend surprises.
- **TDD for library modules** — phases 2, 3, 4, 6 used TDD throughout. Tests caught edge cases (fail-closed validation parsing, regex name validation) before they reached the route handler.
- **Decimal phase insertions** — Phase 06.1 (3-minute duration) was inserted mid-milestone with zero disruption to phase numbering. The decimal pattern is clean.
- **Human visual checkpoints in plans** — `autonomous: false` checkpoint tasks (phases 5, 6, 8, 11) stopped execution at the right moment for visual approval without requiring a full new session.
- **Audit-driven gap closure** — the 2026-03-26 audit (`gaps_found`) precisely identified INFRA-03 and STORY-03 as blockers. Phases 8 and 9 targeted exactly those gaps and nothing else.
- **GSD executor+verifier pattern** — parallel wave execution kept each phase fast (Phase 11 wave 1: both plans done in under 5 minutes).

### What Was Inefficient

- **ROADMAP checkbox drift** — 5 phases (2, 3, 5, 6, 9) completed without `phase complete` CLI running, leaving checkboxes stale. Root cause: these phases ran before the CLI tracking was fully in place.
- **Phase 11 verifier quota hit** — verifier spawned at session end when quota was near-exhausted. Should spawn verification earlier in the session, not at the end.
- **Age selector iteration** — went through 3 designs (original stepper → full-width pill with flex-1 → inline-flex fixed width → chip grid) before landing on the right pattern. The chip grid was the obvious choice given DurationToggle already existed — should have spotted the pattern match immediately.
- **VALIDATION.md draft state for phases 10 and 11** — VALIDATION.md files were created as drafts during planning but frontmatter never promoted to `nyquist_compliant: true` after execution. This is cosmetic but creates noise in audits.

### Patterns Established

- **Chip grid for small integer ranges** — AgeStepper redesigned to 2×5 chip grid to match DurationToggle. Rule: if a selector has ≤12 options, use direct tap targets instead of steppers.
- **Reading-mode color tokens** — `--color-reading-surface`, `--color-reading-on-surface`, `--color-reading-on-surface-muted` as a distinct token group for the dark reading view.
- **Inline `<style>` for @keyframes** — Tailwind v4 cannot express custom keyframes without config file; all animation keyframes defined via inline `<style>` tags in component (established in Phase 4, reused in Phase 11).
- **`isolation: worktree` for parallel execution** — executor agents run in isolated worktrees; orchestrator merges on wave completion. No shared state conflicts.
- **Fail-closed safety parsing** — `parseValidationResponse` treats any parse failure as UNSAFE. Zero tolerance for ambiguity.

### Key Lessons

1. **Spot the design pattern match before iterating.** Three AgeStepper designs before recognizing it should match DurationToggle. When a new UI element is similar to an existing one, ask "does this match an existing pattern?" first.
2. **Spawn verification at session start, not end.** Quota runs out at session end. The verify step should happen early while context budget is healthy.
3. **Run `phase complete` CLI immediately after execution.** Stale ROADMAP checkboxes accumulate when this is skipped.
4. **Audit gap closure is precise.** The 2026-03-26 audit identifying INFRA-03 and STORY-03 led to exactly 2 focused fix phases with no scope creep. Audit → targeted closure works well.
5. **Edge Runtime + in-memory state = silent failure.** The in-memory rate limiter worked perfectly in local dev (`next dev` = Node.js, persistent process) and failed silently in production (Edge = ephemeral isolates). This class of bug requires production testing to catch.

### Cost Observations

- Model mix: Opus for execution, Sonnet for verification and integration checks
- Sessions: ~10 sessions over 9 days
- Notable: Parallel wave execution with `isolation: worktree` was significantly faster than sequential execution for 2-plan phases

---

## Cross-Milestone Trends

| Metric | v1.0 |
|--------|------|
| Duration | 9 days |
| Phases | 12 |
| Plans | 21 |
| Tests | 113 |
| LOC (TS/TSX) | ~1,993 |
| Gaps found at audit | 2 critical (INFRA-03, STORY-03) |
| Gaps resolved | 2/2 |
| Requirements satisfied | 17/17 |
