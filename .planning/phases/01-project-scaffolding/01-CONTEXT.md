# Phase 1: Project Scaffolding - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up a deployed Next.js application with Tailwind CSS configured and a pre-established folder structure — the foundation every subsequent phase builds into. No UI design tokens or API logic in scope; those belong to Phases 4/5 and Phase 2 respectively.

</domain>

<decisions>
## Implementation Decisions

### Tailwind & Design System
- **D-01:** Install Tailwind and verify it renders styles correctly. Do NOT configure design tokens (colors, fonts, spacing scale) from DESIGN.md in this phase — that work belongs to Phase 4/5 when UI work begins.

### Deployment
- **D-02:** Connect the GitHub repo to Vercel for automatic deploys on push to main. Not a manual `vercel` CLI one-off — set up the pipeline properly in Phase 1.

### API Approach (Vercel Timeout)
- **D-03:** Plan for **streaming responses using Next.js Edge Runtime** from the start. Story generation will take 10–30s; Vercel free tier serverless functions time out at 10s. The Edge Runtime has no timeout and is the right architectural choice. Phase 2 builds the generation API as a streaming Edge route — this decision is locked now so Phase 2 knows the approach.

### Folder Structure
- **D-04:** Use `src/` wrapper layout — all app code under `src/`. Full skeleton:
  - `src/app/` — App Router pages and layouts
  - `src/app/api/generate/route.ts` — Edge Runtime stub (placeholder streaming response, Phase 2 fills this in)
  - `src/components/` — UI components (empty placeholder)
  - `src/lib/` — Utilities and helpers (empty placeholder)
- **D-05:** App Router (not Pages Router). This is the modern Next.js default and aligns with the Edge Runtime streaming approach.

### Claude's Discretion
- TypeScript (standard for Next.js 14+; not discussed but assumed)
- Turbopack for local dev (already specified in success criteria)
- `.env.local.example` template with `ANTHROPIC_API_KEY=` placeholder — sensible to include in scaffolding
- ESLint configuration included in `create-next-app` defaults — keep it

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.planning/DESIGN.md` — Full color token system, typography (Noto Serif + Plus Jakarta Sans), component rules. **Phase 1 does NOT implement this** — but the researcher and planner should know it exists so Phase 4/5 can reference it. Do not configure tokens in Phase 1.

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-04 is the only v1 requirement mapped to this phase: "App is deployed on Vercel with zero-config hosting and edge functions."
- `.planning/ROADMAP.md` — Phase 1 success criteria (Next.js deployed on Vercel, Turbopack hot reload, Tailwind rendering).

### Infrastructure
- No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — this is a greenfield repo. No existing code.

### Established Patterns
- None yet — Phase 1 establishes the baseline patterns that all subsequent phases follow.

### Integration Points
- `src/app/api/generate/route.ts` — Phase 2 fills in the Claude API call here. Phase 1 creates the stub with Edge Runtime declaration and a placeholder response.
- `src/app/page.tsx` — Phase 4 replaces this placeholder with the Input Form.

</code_context>

<specifics>
## Specific Ideas

- No specific references or "I want it like X" moments came up — Phase 1 is straightforward scaffolding.

</specifics>

<deferred>
## Deferred Ideas

- Full design token configuration (DESIGN.md colors, Noto Serif + Plus Jakarta Sans fonts, spacing scale) — Phase 4/5 when UI work begins.
- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-project-scaffolding*
*Context gathered: 2026-03-24*
