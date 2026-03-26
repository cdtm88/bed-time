# Nightlight Tales

## What This Is

A web app (with a native iOS future) that lets parents enter their child's name and age, pick a theme from a preset list, and choose a reading duration — then generates a personalized, age-appropriate bedtime story for the parent to read aloud at bedtime. Stories are calm, narrative-driven, and crafted to wind children down for sleep.

## Core Value

A parent can generate a safe, personalized bedtime story in under a minute and read it aloud to their child tonight.

## Requirements

### Validated

- [x] Parent inputs: child's name, exact age, theme (preset list), reading duration (5 / 10 / 15 min) — *Validated in Phase 02: core-generation-pipeline*
- [x] Stories are personalized — child's name, age, and chosen theme woven throughout naturally — *Validated in Phase 02: core-generation-pipeline*
- [x] Age input is mapped internally to reading level bands (Toddler 0–3, Young child 4–6, Older child 7–10) to calibrate vocabulary and complexity — *Validated in Phase 02: core-generation-pipeline*

### Active

**Story Generation**
- [x] Stories follow a real narrative arc: beginning, middle, resolution with structured wind-down — *Validated in Phase 06: story-quality-tuning*
- [x] Stories use calming, winding-down language appropriate for bedtime (sentence taper, sleepy sensory cues, sleep invitation) — *Validated in Phase 06: story-quality-tuning*
- [x] Stories use age-appropriate sensory vocabulary calibrated to reading level — *Validated in Phase 06: story-quality-tuning*
- [x] Stories vary opening styles (in medias res, wonder, setting, character voice) — *Validated in Phase 06: story-quality-tuning*

**Safety**
- [x] All generated stories are age-appropriate and strictly safe — *Validated in Phase 03: safety-validation-layer*
- [x] On any uncertainty, the system silently retries story generation (re-evaluates inputs and tries again) — *Validated in Phase 03: safety-validation-layer*
- [x] If a safe story cannot be produced after retries, the app shows a graceful, friendly error message rather than displaying an unsafe story — *Validated in Phase 03: safety-validation-layer*

**Reading Experience**
- [x] Story displayed in a distraction-free, full-screen reading mode — *Validated in Phase 05: reading-experience*
- [x] Large, high-contrast font optimized for reading aloud in a dim room — *Validated in Phase 05: reading-experience*
- [x] No accounts or login required for MVP — generate and read, no friction — *Validated in Phase 04: input-form*

**Platform**
- [ ] Web app for MVP (accessible on phone browser for bedside use)

### Out of Scope

- User accounts / saved profiles — deferred post-MVP; adds complexity before value is proven
- Text-to-speech / audio narration — planned future feature; must be excellent (multiple voices, sound effects) so not worth shipping until done right
- Native iOS app — desired long-term platform; deferred until web MVP is validated
- Custom freeform theme input — preset list keeps quality and safety more controlled; revisit if users request it
- Story editing or regeneration controls — keep MVP flow simple; add if users want it

## Context

- Stories are read **by parents to children** — not by children directly. This shapes tone, vocabulary, and UI.
- The reading screen will often be used in a dark bedroom on a phone — large text and dim-friendly design are critical.
- Future TTS feature should feel like a proper narrated audiobook (multiple voices, ambient sounds), not just text-to-speech — worth doing right or not at all.
- Target audience: initially personal use, with ambition to become a public product.
- Safety is non-negotiable: the app must never surface a story with any doubt about its appropriateness.

## Constraints

- **Safety**: All stories must pass safety validation before display — no exceptions, no unsafe fallbacks
- **Platform**: Web app first; native iOS deferred until MVP is validated
- **Accounts**: No authentication in MVP — zero friction to first story

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app before native iOS | Faster to validate the core idea; native iOS deferred until value is proven | — Pending |
| Preset theme list (not freeform) | More control over quality and safety; freeform increases unpredictable outputs | — Pending |
| No accounts in MVP | Eliminate friction to first use; save vs. not-save is a later problem | — Pending |
| Silent retry on safety failure | Better UX than an abrupt error; only surface error if retry also fails | — Pending |
| Age → reading level mapping done internally | Parent inputs natural age; app handles complexity calibration behind the scenes | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 — Phase 06 complete: story quality tuning live (narrative arc, wind-down, sensory guidance, opening variety)*
