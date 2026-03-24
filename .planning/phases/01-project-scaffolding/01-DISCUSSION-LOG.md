# Phase 1: Project Scaffolding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 01-project-scaffolding
**Areas discussed:** Design system scope, Deployment pipeline, Vercel timeout blocker, Route scaffolding depth

---

## Design System Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full tokens now | Configure all DESIGN.md color tokens, load Noto Serif + Plus Jakarta Sans via Google Fonts, set up typography scale and spacing in Phase 1 | |
| Just install + verify | Install Tailwind and confirm it renders one styled element; tokens, fonts, and full scale deferred to Phase 4 | ✓ |

**User's choice:** Just install + verify
**Notes:** Design tokens are deferred to Phase 4/5 when UI work begins. No additional follow-up.

---

## Deployment Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub → Vercel auto-deploy | Connect GitHub repo to Vercel; every push to main auto-deploys. Right long-term setup. | ✓ |
| Manual vercel CLI deploy | Run `vercel` from CLI; no pipeline setup; faster to get a public URL | |

**User's choice:** GitHub → Vercel auto-deploy
**Notes:** Set up the proper pipeline in Phase 1, not a one-off CLI deploy.

---

## Vercel Timeout Blocker

| Option | Description | Selected |
|--------|-------------|----------|
| Streaming (Edge Runtime) | Plan for streaming API responses from start; Edge Runtime has no timeout; works on free tier | ✓ |
| Vercel Pro account | Pro allows 60s function duration; simpler standard serverless, no streaming required | |
| Decide in Phase 2 | Defer — Phase 1 is static placeholder, let Phase 2 figure out API approach | |

**User's choice:** Streaming (Edge Runtime)
**Notes:** This locks the Phase 2 API architecture: generation endpoint must be an Edge Runtime streaming route.

---

## Route Scaffolding Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Bare minimum | Default create-next-app output only; later phases add their own folders | |
| Pre-establish structure | Full folder skeleton now; later phases slot into defined places | ✓ |

**User's choice:** Pre-establish project structure

### Follow-up: Folder layout

| Option | Description | Selected |
|--------|-------------|----------|
| src/ wrapper | All app code under `src/`: `src/app/`, `src/components/`, `src/lib/` | ✓ |
| Flat (no src/) | `app/` and `components/` at project root | |

### Follow-up: API route stub

| Option | Description | Selected |
|--------|-------------|----------|
| app/api/generate/route.ts | Edge Runtime stub with placeholder streaming response; Phase 2 fills in | ✓ |
| No API stubs | Phase 2 creates API route from scratch | |

**Notes:** `src/` wrapper is the standard Next.js convention. API stub pre-declares the Edge Runtime — important signal for Phase 2.

---

## Claude's Discretion

- TypeScript (standard, not discussed)
- Turbopack for local dev (specified in success criteria)
- `.env.local.example` with `ANTHROPIC_API_KEY=` placeholder

## Deferred Ideas

- Full DESIGN.md token configuration — Phase 4/5
