# Phase 7: Nightlight Tales Branding - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and update all app name references, metadata, and strings to consistently use "Nightlight Tales". Scope covers: package.json name field, HTML title/metadata tags, README, Open Graph tags, and favicon. Does NOT include visual redesign, logo creation, or new UI components.

</domain>

<decisions>
## Implementation Decisions

### package.json
- **D-01:** Change `"name": "bed-time"` to `"nightlight-tales"` (npm kebab-case convention)

### README
- **D-02:** Full README rewrite — title `# Nightlight Tales`, plus key features section and local setup/run instructions. Not a one-liner; should be informative enough for anyone cloning the repo.

### Open Graph Metadata
- **D-03:** Add minimal Open Graph tags to `layout.tsx` — `og:title` and `og:description` at minimum. Low effort; makes shared links display properly.

### Favicon
- **D-04:** Replace the default Next.js favicon with a simple moon emoji placeholder (`🌙`). No design work required; removes the generic Next.js default while we defer a proper branded icon.

### Claude's Discretion
- `layout.tsx` title is already `"Nightlight Tales"` — no change needed
- `story-form.tsx` already displays `Nightlight Tales` — no change needed
- `.claude/settings.local.json` references to `bed-time` are historical shell command permissions — do NOT modify
- `package-lock.json` name field should be updated to match `package.json`

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/layout.tsx` — Next.js `Metadata` export; already has `title` and `description`; this is where OG tags get added
- `public/` directory — where favicon files live (Next.js reads `public/favicon.ico` and `app/favicon.ico` automatically)

### Established Patterns
- Next.js App Router `metadata` export pattern used in `layout.tsx` — OG tags extend this same object
- Tailwind v4 CSS-first config (no `tailwind.config.js`) — no impact on this phase

### Integration Points
- `package.json` name change has no runtime impact; purely cosmetic/metadata
- `public/` favicon file replacement is the only file addition in this phase

</code_context>

<specifics>
## Specific Ideas

- Moon emoji (`🌙`) for favicon placeholder — user's choice, avoids needing design assets now

</specifics>

<deferred>
## Deferred Ideas

- Proper branded favicon/icon — needs real design work; defer to a future visual identity phase
- Twitter/X Card metadata — can extend OG tags later if social sharing becomes a priority
- OG image — requires a designed image asset; not part of this phase

</deferred>

---

*Phase: 07-nightlight-tales-branding*
*Context gathered: 2026-03-26*
