# Phase 7: Nightlight Tales Branding - Research

**Researched:** 2026-03-26
**Domain:** Next.js metadata, branding, favicon, Open Graph
**Confidence:** HIGH

## Summary

This is a straightforward metadata and branding phase with no new dependencies, no runtime changes, and no architectural complexity. The scope is limited to four files that need changes (`package.json`, `package-lock.json`, `README.md`, `layout.tsx`) plus one new file (favicon via `app/icon.tsx`).

The existing codebase already uses "Nightlight Tales" in `layout.tsx` title and `story-form.tsx` heading. The word "bedtime" appears throughout prompts and test files as a descriptive word (not a brand name) and must NOT be changed. The only "bed-time" references that need updating are in `package.json`, `package-lock.json`, and `README.md`.

**Primary recommendation:** Use Next.js App Router's `icon.tsx` code generation pattern (via `ImageResponse` from `next/og`) to render the moon emoji as a PNG favicon. Extend the existing `metadata` export in `layout.tsx` with an `openGraph` object. Update `package.json` name field and regenerate lock file. Rewrite `README.md`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Change `"name": "bed-time"` to `"nightlight-tales"` in package.json (npm kebab-case convention)
- **D-02:** Full README rewrite -- title `# Nightlight Tales`, plus key features section and local setup/run instructions. Not a one-liner; should be informative enough for anyone cloning the repo.
- **D-03:** Add minimal Open Graph tags to `layout.tsx` -- `og:title` and `og:description` at minimum. Low effort; makes shared links display properly.
- **D-04:** Replace the default Next.js favicon with a simple moon emoji placeholder. No design work required; removes the generic Next.js default while we defer a proper branded icon.

### Claude's Discretion
- `layout.tsx` title is already "Nightlight Tales" -- no change needed
- `story-form.tsx` already displays "Nightlight Tales" -- no change needed
- `.claude/settings.local.json` references to `bed-time` are historical shell command permissions -- do NOT modify
- `package-lock.json` name field should be updated to match `package.json`

### Deferred Ideas (OUT OF SCOPE)
- Proper branded favicon/icon -- needs real design work; defer to a future visual identity phase
- Twitter/X Card metadata -- can extend OG tags later if social sharing becomes a priority
- OG image -- requires a designed image asset; not part of this phase
</user_constraints>

## Standard Stack

### Core
No new libraries required. Everything uses built-in Next.js capabilities.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/og (ImageResponse) | 16.2.1 (built-in) | Generate favicon PNG from code | Official Next.js API for programmatic icon generation |
| Next.js Metadata API | 16.2.1 (built-in) | Open Graph tags | Standard metadata export in App Router layout.tsx |

### Supporting
No additional packages needed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `app/icon.tsx` (code gen) | Static `app/favicon.ico` file | Would need an external tool to convert emoji to .ico; code generation is zero-dependency and already supported |
| `app/icon.tsx` (code gen) | SVG favicon in `app/icon.svg` | SVG emoji rendering varies across browsers; ImageResponse produces a consistent PNG |

## Architecture Patterns

### Files to Change (Complete Inventory)

```
Files to MODIFY:
  package.json          # name: "bed-time" -> "nightlight-tales"
  package-lock.json     # name: "bed-time" -> "nightlight-tales" (regenerate via npm install)
  README.md             # Full rewrite
  src/app/layout.tsx    # Add openGraph to metadata export

Files to CREATE:
  src/app/icon.tsx      # Moon emoji favicon via ImageResponse

Files to NOT TOUCH:
  .claude/settings.local.json    # Historical shell permissions, not branding
  src/components/story-form.tsx  # Already says "Nightlight Tales"
  src/lib/prompts.ts             # "bedtime" is a descriptive word, not the brand name
  src/lib/__tests__/*.test.ts    # "bedtime" is descriptive, not branding
```

### Pattern 1: Next.js App Router Programmatic Icon Generation
**What:** Create `src/app/icon.tsx` that exports a function returning an `ImageResponse` with the moon emoji rendered as a 32x32 PNG.
**When to use:** When you need a favicon without external image assets.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        🌙
      </div>
    ),
    { ...size }
  )
}
```
This generates `<link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />` automatically.

### Pattern 2: Static Metadata with Open Graph
**What:** Extend the existing `metadata` export in `layout.tsx` with an `openGraph` property.
**When to use:** For static pages where metadata does not change per-request.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export const metadata: Metadata = {
  title: "Nightlight Tales",
  description: "Personalized bedtime stories for children",
  openGraph: {
    title: "Nightlight Tales",
    description: "Personalized bedtime stories for children",
    type: "website",
  },
};
```
Note: `openGraph` does NOT inherit from top-level `title`/`description` -- values must be explicitly set in both places.

### Anti-Patterns to Avoid
- **Changing "bedtime" in prompts/tests:** The word "bedtime" in `src/lib/prompts.ts` and test files is a descriptive English word, not the app brand name. Do not touch these.
- **Manually editing package-lock.json:** Run `npm install` after changing `package.json` to regenerate the lock file correctly.
- **Adding `<link rel="icon">` manually in layout.tsx:** Next.js App Router handles this automatically when an `icon.tsx` or `favicon.ico` file exists in the `app/` directory.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Favicon from emoji | Convert emoji to .ico with external tools | `app/icon.tsx` with `ImageResponse` | Zero-dependency, build-time optimized, cached |
| OG meta tags | Manual `<meta>` tags in `<head>` | Next.js `Metadata` export with `openGraph` | Type-safe, SSR-compatible, no hydration issues |

## Common Pitfalls

### Pitfall 1: OpenGraph Not Inheriting from Top-Level Metadata
**What goes wrong:** Developer sets `title` and `description` at top level and expects `openGraph` to inherit them automatically.
**Why it happens:** Unlike some frameworks, Next.js requires explicit values in the `openGraph` object.
**How to avoid:** Duplicate `title` and `description` in both the top-level metadata and the `openGraph` sub-object.
**Warning signs:** Shared links on social media show no title/description.

### Pitfall 2: Editing package-lock.json Manually
**What goes wrong:** Manual edits to the `name` field in `package-lock.json` can corrupt the lock file structure.
**Why it happens:** The lock file has the package name in the root entry.
**How to avoid:** Change `package.json` name, then run `npm install` to regenerate `package-lock.json`.
**Warning signs:** `npm install` fails or warns about lock file inconsistency.

### Pitfall 3: Emoji Rendering in Favicon
**What goes wrong:** Emoji may render differently or not at all on some systems when used in `ImageResponse`.
**Why it happens:** `ImageResponse` uses Satori for rendering, which has limited emoji font support.
**How to avoid:** Test the generated favicon in multiple browsers after implementation. If the emoji does not render, fall back to a simple text character or a tiny inline SVG path.
**Warning signs:** Favicon appears as a blank square or shows a different glyph.

### Pitfall 4: Accidentally Renaming "bedtime" in Story Content
**What goes wrong:** A find-and-replace on "bed-time" or "bedtime" catches prompt text and test assertions.
**Why it happens:** Overly broad search patterns.
**How to avoid:** Only change the exact files listed in the inventory above. The word "bedtime" in prompts.ts and test files describes the genre, not the brand.
**Warning signs:** Tests fail with assertion mismatches.

## Code Examples

### package.json Name Change
```json
{
  "name": "nightlight-tales",
  "version": "0.1.0",
  "private": true
}
```

### layout.tsx with Open Graph
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export const metadata: Metadata = {
  title: "Nightlight Tales",
  description: "Personalized bedtime stories for children",
  openGraph: {
    title: "Nightlight Tales",
    description: "Personalized bedtime stories for children",
    type: "website",
  },
};
```

### README.md Structure
```markdown
# Nightlight Tales

Personalized bedtime stories for children, powered by AI.

## Features

- Generate safe, age-appropriate bedtime stories
- Personalized with your child's name and favorite themes
- Calming, wind-down language designed to ease children toward sleep
- Distraction-free reading mode optimized for dim bedrooms

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your API key:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Claude API (Anthropic)
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

This phase has no formal requirement IDs in REQUIREMENTS.md (it is a branding/metadata phase). Validation is primarily manual/visual.

| Behavior | Test Type | Automated Command | File Exists? |
|----------|-----------|-------------------|-------------|
| package.json name is "nightlight-tales" | smoke | `node -e "const p=require('./package.json'); if(p.name!=='nightlight-tales') process.exit(1)"` | N/A (inline) |
| OG tags present in metadata | smoke | `npx next build` (build succeeds) | N/A |
| Favicon renders | manual | Visual browser check | N/A |
| README has correct title | smoke | `head -1 README.md` contains "Nightlight Tales" | N/A |
| Existing tests still pass | regression | `npx vitest run` | Existing |

### Sampling Rate
- **Per task commit:** `npx vitest run` (existing tests still pass)
- **Per wave merge:** `npx vitest run && npx next build`
- **Phase gate:** Full suite green + visual favicon check

### Wave 0 Gaps
None -- no new test files needed. This is a metadata phase; validation is build success + visual verification + existing test regression.

## Sources

### Primary (HIGH confidence)
- [Next.js App Icons docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons) - favicon/icon file conventions, `icon.tsx` code generation pattern
- [Next.js generateMetadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Open Graph metadata API
- [Next.js Metadata and OG guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - metadata overview

### Secondary (MEDIUM confidence)
- Codebase audit via grep - confirmed all "bed-time" vs "bedtime" references and their contexts

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - uses only built-in Next.js features, verified against official docs
- Architecture: HIGH - file inventory verified by codebase grep; patterns verified against Next.js 16 docs
- Pitfalls: HIGH - OG inheritance behavior confirmed in official docs; emoji rendering is a known Satori limitation

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable -- no moving parts)
