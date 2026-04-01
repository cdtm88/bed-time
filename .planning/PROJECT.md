# Nightlight Tales

## What This Is

A web app that lets parents enter their child's name, age (1–10), and theme, choose a reading duration (3, 5, 10, or 15 minutes), and instantly generate a safe, personalized bedtime story — displayed in a fullscreen dim-room reading mode for reading aloud at bedtime. Deployed at https://bed-time-nu.vercel.app/.

## Core Value

A parent can generate a safe, personalized bedtime story in under a minute and read it aloud to their child tonight.

## Current State

**v1.0 shipped 2026-04-01.** Fully functional MVP:
- Next.js 16 + Tailwind CSS v4 + Edge Runtime on Vercel
- Claude Sonnet (generation) + Claude Haiku (safety validation) with 3-attempt retry
- Upstash Redis sliding-window rate limiting (10 req/hr/IP) in production
- 18 theme SVG illustrations with onError fallback
- Polished UI: hero illustration, gold theme selection, dark navy loading overlay
- 113 passing tests across 8 test files

## Requirements

### Validated

- ✓ Parent inputs: child's name, exact age (1–10), theme (18 presets), reading duration (3/5/10/15 min) — v1.0
- ✓ Stories are personalized — child's name, age, and chosen theme woven throughout — v1.0
- ✓ Age mapped internally to reading level bands (Toddler 0–3, Young child 4–6, Older child 7–10) — v1.0
- ✓ Stories follow a real narrative arc: beginning, middle, resolution with wind-down — v1.0
- ✓ Stories use calming, winding-down language (sentence taper, sleepy sensory cues) — v1.0
- ✓ Stories use age-appropriate sensory vocabulary calibrated to reading level — v1.0
- ✓ Stories vary opening styles (in medias res, wonder, setting, character voice) — v1.0
- ✓ All generated stories pass safety validation (Haiku classifier, fail-closed) — v1.0
- ✓ System silently retries on unsafe story (up to 2 retries with reinforced prompt) — v1.0
- ✓ Graceful friendly error if safe story cannot be produced — v1.0
- ✓ Story displayed in fullscreen distraction-free reading mode with scroll progress — v1.0
- ✓ Large serif font (Noto Serif), dark navy background, gold scroll bar — v1.0
- ✓ No login required — zero friction to first story — v1.0
- ✓ IP-based rate limiting in production (Upstash Redis, 10 req/hr/IP) — v1.0
- ✓ Web app deployed on Vercel with Edge Runtime — v1.0
- ✓ 3-minute compact story option (450 words) — v1.0

### Active (v1.1+)

- [ ] Story text streams progressively (first words appear within 1–2 seconds)
- [ ] Screen Wake Lock prevents device sleep during reading
- [ ] Improved SVG theme tile illustrations — warmer, more whimsical, nighttime aesthetic
- [ ] Reading font evaluation — assess alternatives to Noto Serif for dim-room mobile readability

### Out of Scope

- User accounts / saved profiles — deferred post-MVP; adds complexity before value is proven
- Text-to-speech / audio narration — must be excellent (multiple voices, ambient sound) to be worth shipping; deferred
- Native iOS app — deferred until web MVP is validated
- Custom freeform theme input — preset list keeps quality and safety more controlled
- Story editing or regeneration controls — keep MVP flow simple

## Context

- Stories are read **by parents to children** — not by children directly. This shapes tone, vocabulary, and UI.
- The reading screen is used in a dark bedroom on a phone — large text and dim-friendly design are critical.
- Age 0 (infant) is technically supported by the API but not selectable in the UI (chip grid shows 1–10). Accepted product decision.
- `dinosaurs.svg` is a legacy 461KB asset predating Phase 8 size constraints — renders correctly but may load slowly.
- Future TTS should feel like a proper narrated audiobook (multiple voices, ambient sounds) — worth doing right or not at all.
- Safety is non-negotiable: the app must never surface a story with any doubt about its appropriateness.

## Constraints

- **Safety**: All stories must pass safety validation before display — no exceptions, no unsafe fallbacks
- **Platform**: Web app first; native iOS deferred until MVP is validated
- **Accounts**: No authentication in MVP — zero friction to first story
- **API key**: Never exposed to client — all Claude calls are server-side (Edge Runtime)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app before native iOS | Faster to validate the core idea | ✓ Good — shipped in 9 days |
| Preset theme list (not freeform) | More control over quality and safety | ✓ Good — 18 themes, all with SVG |
| No accounts in MVP | Eliminate friction to first use | ✓ Good — zero-friction flow works |
| Silent retry on safety failure | Better UX than abrupt error | ✓ Good — 3-attempt loop reliable |
| Age → reading level mapping done internally | Parent inputs natural age | ✓ Good — transparent to user |
| Pipeline before UI | Prove generation works before building UI | ✓ Good — de-risked early |
| Buffered response (not streaming) | Safety validation requires full story before display | ✓ Good — necessary for safety guarantee |
| Upstash Redis for rate limiting | In-memory Map non-functional on Edge Runtime | ✓ Good — closed INFRA-03 gap |
| Tailwind v4 CSS-first | No tailwind.config.js needed | ✓ Good — @import 'tailwindcss' approach works cleanly |
| Edge Runtime for API route | Vercel Edge — no timeout issues | ✓ Good — streams correctly |
| Haiku for validation, Sonnet for generation | Cost/quality tradeoff | ✓ Good — Haiku fast and cheap for classification |
| Decimal phase numbering for insertions | Clear insertion semantics without renumbering | ✓ Good — Phase 06.1 pattern works |
| AgeStepper as chip grid (1–10) | Stepper paradigm too tedious on mobile | ✓ Good — matches DurationToggle pattern |

## Evolution

**After each milestone** (via `/gsd:new-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after v1.0 milestone — MVP shipped*
