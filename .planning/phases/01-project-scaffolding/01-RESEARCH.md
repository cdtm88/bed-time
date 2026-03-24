# Phase 1: Project Scaffolding - Research

**Researched:** 2026-03-24
**Domain:** Next.js 16 + Tailwind CSS v4 + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Install Tailwind and verify it renders styles correctly. Do NOT configure design tokens (colors, fonts, spacing scale) from DESIGN.md in this phase — that work belongs to Phase 4/5 when UI work begins.
- **D-02:** Connect the GitHub repo to Vercel for automatic deploys on push to main. Not a manual `vercel` CLI one-off — set up the pipeline properly in Phase 1.
- **D-03:** Plan for streaming responses using Next.js Edge Runtime from the start. Story generation will take 10–30s; Vercel free tier serverless functions time out at 10s. The Edge Runtime has no timeout and is the right architectural choice. Phase 2 builds the generation API as a streaming Edge route — this decision is locked now so Phase 2 knows the approach.
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

### Deferred Ideas (OUT OF SCOPE)

- Full design token configuration (DESIGN.md colors, Noto Serif + Plus Jakarta Sans fonts, spacing scale) — Phase 4/5 when UI work begins.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-04 | App is deployed on Vercel with zero-config hosting and edge functions | Next.js 16 deploys to Vercel with auto-detection; Edge Runtime enabled via `export const runtime = "edge"` in route handlers |
</phase_requirements>

---

## Summary

Next.js has released version 16 (latest: 16.2.1) with Turbopack now stable as the **default bundler** — no flags or configuration required. Tailwind CSS has also released version 4 (latest: 4.2.2), which uses a fundamentally different configuration approach: no `tailwind.config.js`, no content array, no explicit PostCSS config file path — instead a single `@import "tailwindcss"` in the global CSS file and the `@tailwindcss/postcss` PostCSS plugin. Both changes are significant departures from training-data knowledge.

The `create-next-app@latest` scaffold in Next.js 16 includes TypeScript, Tailwind CSS v4, ESLint, App Router, Turbopack, and a `src/` directory layout by default when using recommended defaults. This aligns almost exactly with the locked decisions from CONTEXT.md. The Edge Runtime is declared with `export const runtime = "edge"` (the old `experimental-edge` string was deprecated in Next.js 15 and removed in 16). Vercel deployment via GitHub repo connection is the standard zero-config path: connect repo in Vercel dashboard, push to main, auto-deploy triggers.

**Primary recommendation:** Run `npx create-next-app@latest` with recommended defaults (TypeScript, Tailwind, ESLint, App Router, Turbopack, src/ layout), then add the Edge Runtime stub at `src/app/api/generate/route.ts` and a `.env.local.example` file. Connect the GitHub repo to Vercel via the dashboard for automatic deploys.

---

## Project Constraints (from CLAUDE.md)

No CLAUDE.md found in project root. No project-specific constraints beyond those in CONTEXT.md.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App framework (App Router, Edge Runtime, routing) | Project decision; latest stable |
| react | 19.2.4 | UI rendering | Bundled with Next.js 16 |
| react-dom | 19.2.4 | DOM rendering | Bundled with Next.js 16 |
| tailwindcss | 4.2.2 | Utility-first CSS | Project decision; latest stable (v4 is major rewrite) |
| @tailwindcss/postcss | 4.2.2 | PostCSS plugin for Tailwind v4 | Required by Tailwind v4 architecture |
| postcss | (latest) | CSS transform pipeline | Required by Tailwind v4 |
| typescript | 5.x | Type safety | Next.js 16 requires TS 5.1.0+ minimum |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint | 9.x | Linting | Default from create-next-app; keep in scaffolding |
| @next/eslint-plugin-next | (latest) | Next.js-specific lint rules | Included automatically |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 uses tailwind.config.js with content array; v4 is zero-config CSS-first — v4 is the current `latest` tag and what create-next-app installs |
| ESLint | Biome | Next.js 16 offers Biome as an option; ESLint is safer default with more community rules; discretion area |

**Installation (via create-next-app — recommended):**
```bash
npx create-next-app@latest my-project --yes
```
The `--yes` flag accepts all recommended defaults: TypeScript, Tailwind CSS, ESLint, App Router, Turbopack, `src/` directory, `@/*` import alias.

**Version verification (confirmed 2026-03-24):**
```bash
npm view next version       # 16.2.1
npm view tailwindcss version # 4.2.2
npm view react version       # 19.2.4
```

---

## Architecture Patterns

### Recommended Project Structure

The locked decision D-04 specifies `src/` layout. `create-next-app` with recommended defaults produces this structure, which must be augmented with placeholder directories and the Edge Route stub:

```
my-project/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (html, body tags)
│   │   ├── page.tsx            # Landing page placeholder
│   │   ├── globals.css         # @import "tailwindcss" lives here
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts    # Edge Runtime stub (Phase 2 fills in)
│   ├── components/             # Empty directory (placeholder for Phase 4+)
│   │   └── .gitkeep
│   └── lib/                    # Empty directory (placeholder for Phase 2+)
│       └── .gitkeep
├── public/                     # Static assets
├── .env.local.example          # ANTHROPIC_API_KEY= placeholder
├── .env.local                  # gitignored — never committed
├── postcss.config.mjs          # @tailwindcss/postcss plugin
├── next.config.ts              # TypeScript config (Next.js 16 supports .ts)
├── tsconfig.json               # TypeScript config with @/* alias
├── eslint.config.mjs           # ESLint flat config (Next.js 16 default)
└── package.json
```

### Pattern 1: Edge Runtime Route Handler Declaration

**What:** Exporting `runtime = "edge"` from a route file opts the entire route into the Edge Runtime. The Edge Runtime has no execution timeout on Vercel (unlike serverless functions which time out at 10s on the free tier). This is the lock-in decision for story generation streaming.

**When to use:** Any route that will stream long-running responses (Phase 2 story generation). Declare it in Phase 1 as a stub so the architectural decision is enforced from day one.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// src/app/api/generate/route.ts — Phase 1 stub

export const runtime = "edge"

export async function POST(request: Request) {
  // Phase 2 will implement Claude API streaming here
  return new Response("Story generation coming in Phase 2", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}
```

**Critical note:** `export const runtime = "experimental-edge"` was deprecated in Next.js 15 and removed in Next.js 16. Only `"edge"` is valid.

### Pattern 2: Tailwind CSS v4 Configuration

**What:** Tailwind v4 replaces `tailwind.config.js` and an explicit content array with a single CSS import. No configuration file is needed for basic usage. The PostCSS plugin is `@tailwindcss/postcss` (not `tailwindcss` as in v3).

**When to use:** This is the only supported path in v4 — no alternative.

**Example:**
```css
/* Source: https://tailwindcss.com/docs/installation/framework-guides/nextjs */
/* src/app/globals.css */
@import "tailwindcss";

/* Add project-specific globals below (Phase 4/5 adds design tokens here) */
```

```javascript
/* postcss.config.mjs — ES Module format required by v4 */
// Source: https://tailwindcss.com/docs/installation/framework-guides/nextjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Pattern 3: Vercel GitHub Integration (Zero-Config Deploy)

**What:** Connect a GitHub repo to a Vercel project via the Vercel dashboard. Every push to `main` triggers a production deployment. Vercel auto-detects Next.js and configures the build with no `vercel.json` needed. Edge functions are automatically enabled when routes export `runtime = "edge"`.

**When to use:** This is the D-02 locked approach — not the Vercel CLI, not a GitHub Actions pipeline.

**Steps:**
1. Push the scaffolded repo to GitHub
2. Go to vercel.com → "Add New Project" → "Import Git Repository"
3. Select the GitHub repo
4. Vercel auto-detects Next.js — accept defaults
5. Deploy. Subsequent pushes to `main` auto-deploy.

### Pattern 4: Next.js 16 `create-next-app` Defaults

**What:** In Next.js 16, the `--yes` flag accepts "recommended defaults": TypeScript, Tailwind CSS, ESLint, App Router, Turbopack, `src/` directory layout, `@/*` import alias. This aligns with all locked decisions (D-04, D-05).

**When to use:** Always use for greenfield projects — it wires Turbopack, TypeScript, and Tailwind v4 correctly with no manual configuration.

### Anti-Patterns to Avoid

- **Using `experimental-edge` runtime:** Removed in Next.js 16. Only `"edge"` is valid. A codemod exists but scaffolding new code with the old value is a bug.
- **Creating `tailwind.config.js`:** Not needed or used in Tailwind v4. Adding it does nothing and creates confusion.
- **Using `postcss.config.js` (CommonJS):** Tailwind v4 requires `postcss.config.mjs` (ES Module). CommonJS config won't load the `@tailwindcss/postcss` plugin correctly.
- **Configuring design tokens in Phase 1:** CONTEXT.md D-01 locks this out. CSS custom properties and color tokens belong in Phase 4/5.
- **Using the Vercel CLI for one-off deploy:** CONTEXT.md D-02 requires the GitHub pipeline, not `vercel deploy`.
- **Running `next dev --turbo`:** In Next.js 16, Turbopack is the default. The `--turbo` flag is no longer needed (and `--webpack` opts out). Just run `next dev`.
- **Node.js < 20.9:** Next.js 16 requires Node.js 20.9.0 minimum. The local environment runs v23.11.0 — compliant.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Project scaffolding | Manual file creation | `create-next-app@latest --yes` | Wires Turbopack, TypeScript, Tailwind v4, ESLint correctly; avoids tsconfig misconfiguration |
| CSS utility classes | Custom CSS | Tailwind v4 | v4 JIT is zero-runtime; building utility classes manually recreates what Tailwind solved |
| Vercel deployment config | `vercel.json` with build settings | Zero-config GitHub integration | Next.js is auto-detected; manual config introduces drift from Vercel's optimized defaults |
| TypeScript path aliases | Manual webpack aliases | tsconfig `@/*` path (included in create-next-app) | Next.js reads tsconfig paths natively; webpack aliases are fragile and redundant |

**Key insight:** The `create-next-app@latest --yes` command produces 95% of Phase 1's deliverables. The phase work is: (1) run the command, (2) add the Edge Runtime stub, (3) add `.env.local.example`, (4) connect to Vercel. Avoid deviating from the scaffolded structure.

---

## Common Pitfalls

### Pitfall 1: Tailwind v3 vs v4 Config Confusion

**What goes wrong:** Developer creates `tailwind.config.js` with a `content` array (v3 pattern). Styles don't apply or apply inconsistently. Postcss config uses `tailwindcss` instead of `@tailwindcss/postcss`.

**Why it happens:** Training data and most online tutorials describe Tailwind v3. v4 shipped in early 2025 and is now the default.

**How to avoid:** In `postcss.config.mjs`, use `"@tailwindcss/postcss": {}`. In globals.css, use `@import "tailwindcss"`. Do not create `tailwind.config.js`.

**Warning signs:** Classes like `text-blue-500` render without styles; dev tools show no Tailwind output; PostCSS throws an error about unrecognized plugin.

### Pitfall 2: Using `runtime = "experimental-edge"`

**What goes wrong:** Route fails to compile or Vercel build errors out with an unknown runtime value.

**Why it happens:** Documentation prior to Next.js 15 used `experimental-edge`. It was deprecated in Next.js 15 and fully removed in Next.js 16.

**How to avoid:** Always use `export const runtime = "edge"` (no `experimental-` prefix).

**Warning signs:** Build output mentions "unknown runtime" or TypeScript complains about invalid string literal.

### Pitfall 3: `next dev --turbo` Flag in Next.js 16

**What goes wrong:** Scripts include `--turbo` flag. In Next.js 16, this flag no longer exists (Turbopack is the default). Running `next dev --turbo` may error or be silently ignored depending on patch version.

**How to avoid:** Use `next dev` — Turbopack runs by default. To use webpack (opt-out): `next dev --webpack`.

**Warning signs:** npm run dev script includes `--turbo` and shows a warning about unknown flag.

### Pitfall 4: `.env.local` Committed to Git

**What goes wrong:** Anthropic API key (or any secret) committed to the repo and pushed to GitHub.

**Why it happens:** Developers add `.env.local` without checking `.gitignore`. `create-next-app` correctly gitignores `.env*.local` by default.

**How to avoid:** Only commit `.env.local.example` (no values). Verify `.gitignore` includes `*.local` before first push.

**Warning signs:** `git status` shows `.env.local` as a new file; `git log` contains the file.

### Pitfall 5: Node.js Version Below 20.9

**What goes wrong:** `next dev` or `next build` fails with a Node.js version error.

**Why it happens:** Next.js 16 raised the minimum from 18.18 (Next.js 15) to 20.9.0.

**How to avoid:** Verify Node.js >= 20.9 before scaffolding. Local environment: v23.11.0 (compliant).

**Warning signs:** Next.js CLI outputs "You are using Node.js X. For Next.js, Node.js version >= 20.9.0 is required."

### Pitfall 6: `src/` Directory Inconsistency

**What goes wrong:** Some files land in `/app/` (project root) and others in `/src/app/`. Routes conflict or can't be found.

**Why it happens:** `create-next-app` prompts for `src/` preference; answering differently produces different structures. Subsequent manual file additions go to wrong location.

**How to avoid:** Use `--yes` or explicitly select `src/` layout in prompts. All app files go under `src/`.

---

## Code Examples

Verified patterns from official sources:

### Edge Runtime Stub (`src/app/api/generate/route.ts`)

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// Phase 1 stub — Phase 2 replaces body with Claude streaming implementation

export const runtime = "edge"

export async function POST(_request: Request) {
  return new Response("Story generation coming in Phase 2", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}
```

### Tailwind v4 globals.css

```css
/* Source: https://tailwindcss.com/docs/installation/framework-guides/nextjs */
@import "tailwindcss";

/* Phase 4/5 will add CSS custom properties for design tokens here */
```

### postcss.config.mjs (Tailwind v4)

```javascript
// Source: https://tailwindcss.com/docs/installation/framework-guides/nextjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Root Layout (`src/app/layout.tsx`)

```typescript
// Source: https://nextjs.org/docs/app/getting-started/installation
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Placeholder Home Page (`src/app/page.tsx`)

```typescript
// Phase 4 replaces this with the Input Form
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Nightlight Tales</h1>
    </main>
  )
}
```

### `.env.local.example`

```bash
# Copy this file to .env.local and fill in your values
# Never commit .env.local to git

ANTHROPIC_API_KEY=
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with content array | No config file; `@import "tailwindcss"` in CSS | Tailwind v4 (2025) | Removes explicit configuration; scanning is automatic |
| PostCSS plugin `tailwindcss` | PostCSS plugin `@tailwindcss/postcss` | Tailwind v4 (2025) | Different package name; old plugin won't work with v4 |
| `next dev --turbo` to opt into Turbopack | `next dev` (Turbopack default) | Next.js 16 (Oct 2025) | `--turbo` flag no longer exists; webpack requires `--webpack` |
| `export const runtime = "experimental-edge"` | `export const runtime = "edge"` | Deprecated Next.js 15, removed Next.js 16 | Old string throws error in Next.js 16 |
| `next lint` command | `eslint` directly via package.json script | Next.js 16 (Oct 2025) | `next build` no longer runs lint; `next lint` removed |
| `next.config.js` (CommonJS) | `next.config.ts` (TypeScript) | Next.js 15+ | TypeScript config is now idiomatic; JS still works |
| `middleware.ts` | `proxy.ts` (deprecated `middleware.ts`) | Next.js 16 (Oct 2025) | `middleware.ts` deprecated but still works for Edge use cases; Phase 1 does not use middleware |

**Deprecated/outdated:**
- `experimental-edge` runtime string: removed in Next.js 16
- `next lint` CLI command: removed in Next.js 16; use `eslint` directly
- `tailwind.config.js` content array: not needed or used in Tailwind v4
- `--turbo` flag for `next dev`: Turbopack is now default in Next.js 16

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (min 20.9.0) | Yes | v23.11.0 | — |
| npm | Package management | Yes | 11.11.1 | — |
| Git | GitHub push for Vercel deploy | Yes (repo exists) | — | — |
| Vercel CLI | D-02 says NOT to use this | Not installed | — | Not needed — use GitHub dashboard integration |
| GitHub account | Vercel GitHub integration | Assumed (repo exists) | — | — |
| Vercel account | Deployment | Not verified locally | — | Must be created at vercel.com if not existing |

**Missing dependencies with no fallback:**
- Vercel account: Must exist at vercel.com. If not created, the implementer creates one at https://vercel.com/signup (free tier). This is a human step, not automatable.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No automated test framework needed for Phase 1 (scaffolding smoke tests) |
| Config file | None — Wave 0 gap if smoke tests are desired |
| Quick run command | `npm run dev` (manual: verify localhost:3000 loads) |
| Full suite command | `npm run build` (verifies Tailwind, TypeScript, Edge Route compile) |

Phase 1 success criteria are observable behaviors (deployed URL accessible, Tailwind rendering, Turbopack hot reload), not unit-testable logic. The appropriate "tests" are:

1. `npm run build` — passes without TypeScript or Tailwind errors
2. `npm run dev` — dev server starts, localhost:3000 renders with Tailwind styles
3. Vercel dashboard — deployment succeeds, public URL is accessible

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-04 | App deployed on Vercel with edge functions | smoke | Vercel dashboard check (manual) | N/A |
| INFRA-04 | Build compiles without errors | build | `npm run build` | Will exist after scaffold |
| INFRA-04 | Tailwind renders styles (visual check) | smoke | `npm run dev` + manual browser check | N/A |
| INFRA-04 | Edge Runtime stub compiles | build | `npm run build` (Turbopack build) | Will exist after scaffold |

### Sampling Rate

- **Per task commit:** `npm run build` (catches TypeScript and Tailwind compilation errors)
- **Per wave merge:** `npm run build` + manual verification at localhost:3000
- **Phase gate:** Public Vercel URL is accessible and renders styled content before `/gsd:verify-work`

### Wave 0 Gaps

- No formal test files needed — Phase 1 is infrastructure, not application logic
- No testing framework installation required in this phase

*(No automated unit tests: Phase 1 creates no business logic. Build-time compilation and browser smoke tests are the appropriate validation.)*

---

## Open Questions

1. **Vercel account ownership**
   - What we know: GitHub repo exists; Vercel deployment needs a Vercel account
   - What's unclear: Whether a Vercel account is already created and linked to the GitHub account
   - Recommendation: Implementer verifies at vercel.com before starting deployment task; create free account if needed

2. **`create-next-app` prompt answers vs `--yes` flag**
   - What we know: `--yes` accepts recommended defaults (src/, TypeScript, Tailwind, ESLint, App Router, Turbopack). D-04 requires src/ layout.
   - What's unclear: Whether the implementer should use `--yes` (accept all defaults) or answer prompts manually to control each option
   - Recommendation: Use `--yes` flag — recommended defaults match all locked decisions. If the planner prefers explicit prompt answers, document each: TypeScript=Yes, Linter=ESLint, Tailwind=Yes, src/=Yes, App Router=Yes, import alias=Yes

---

## Sources

### Primary (HIGH confidence)

- [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16) — Next.js 16 release notes: Turbopack default, create-next-app defaults, breaking changes
- [nextjs.org/docs/app/getting-started/installation](https://nextjs.org/docs/app/getting-started/installation) — Official install docs, create-next-app prompts, Turbopack default confirmation (version 16.2.1, updated 2026-03-20)
- [nextjs.org/docs/app/api-reference/file-conventions/route-segment-config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) — Runtime config options; confirmed `runtime = "edge"` is the only valid Edge value in Next.js 16
- [tailwindcss.com/docs/installation/framework-guides/nextjs](https://tailwindcss.com/docs/installation/framework-guides/nextjs) — Tailwind v4 + Next.js installation: `@tailwindcss/postcss`, `@import "tailwindcss"`, `postcss.config.mjs`
- npm registry — Verified versions: next@16.2.1, tailwindcss@4.2.2, react@19.2.4 (confirmed 2026-03-24)

### Secondary (MEDIUM confidence)

- [vercel.com/docs/git/vercel-for-github](https://vercel.com/docs/git/vercel-for-github) — GitHub integration for automatic deploys; verified via WebSearch with Vercel official domain
- [nextjs.org/blog/next-15](https://nextjs.org/blog/next-15) — Context for Next.js 15 changes (async params, Turbopack stable in dev, runtime deprecations)

### Tertiary (LOW confidence)

- None — all critical claims verified against official sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed directly from npm registry on 2026-03-24
- Architecture: HIGH — confirmed from official Next.js 16 and Tailwind v4 docs (both updated 2026-03-20)
- Pitfalls: HIGH — derived directly from breaking changes documented in official Next.js 15/16 release notes
- Vercel deployment: MEDIUM — standard workflow documented officially; Vercel account existence not verified locally

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (Next.js and Tailwind move fast; re-verify versions before implementing if > 30 days)
