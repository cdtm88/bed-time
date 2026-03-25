# Phase 4: Input Form - Research

**Researched:** 2026-03-25
**Domain:** Next.js 16 App Router UI, Tailwind v4 design tokens, form state management, IP rate limiting
**Confidence:** HIGH

## Summary

Phase 4 builds the first user-facing UI for Nightlight Tales: a single-page input form at `/` where a parent enters a child's name, age, theme, and duration, then submits to generate a story. This phase also establishes the design system foundation (DESIGN.md tokens in Tailwind v4 CSS custom properties, Google Fonts via `next/font/google`), implements IP-based rate limiting (INFRA-03), and creates a minimal `/story` stub route.

The technical surface is well-defined: React 19 with Next.js 16 App Router, Tailwind v4 CSS-first configuration (`@theme` directive for design tokens), `next/font/google` for self-hosted Noto Serif + Plus Jakarta Sans, and a `'use client'` form component that manages local state with `useState`. The API endpoint (`/api/generate`) already exists and returns plain text. Rate limiting must use an in-memory Map approach in the route handler, with the caveat that Vercel Edge Runtime distributes across nodes (acceptable for v1 abuse prevention, not a security boundary).

**Primary recommendation:** Build a single client component (`StoryForm`) that owns all form state, validates in real-time using the existing `schemas.ts` utilities, and calls `/api/generate` via `fetch`. Rate limiting lives in the route handler (not middleware) using an in-memory Map with IP keyed from `x-forwarded-for`. Design tokens go into `globals.css` using Tailwind v4's `@theme` directive so they generate utility classes automatically.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Single-scroll page -- all 4 fields visible at once, no wizard/steps.
- **D-02:** Field order (top to bottom): Name -> Age -> Duration -> Themes
- **D-03:** Name field: free text input with real-time validation (letters/spaces only, max 30 chars -- SAFE-04 constraint already implemented in `src/lib/schemas.ts`)
- **D-04:** Age field: stepper control -- `[ - ]  [ 5 ]  [ + ]` -- not a plain number input. Range: 0-10.
- **D-05:** Duration field: three option/toggle buttons -- `[ 5 min ]  [ 10 min ]  [ 15 min ]`
- **D-06:** Theme field: 2-column tile grid, one tile per theme (18 tiles total). Each tile shows an SVG illustration + theme name label below it.
- **D-07:** User-supplied SVG illustrations. Stored in `public/themes/` as kebab-case filenames. Full list of 18 filenames specified in CONTEXT.md.
- **D-08:** SVG spec: 200x200px artboard, warm storybook style using DESIGN.md palette, rounded strokes 2-3px.
- **D-09:** Wire up with Next.js `<Image>` component. Theme tiles reference `/themes/{filename}.svg`.
- **D-10:** Full-screen loading overlay on submit with personalised copy using child's name.
- **D-11:** Overlay covers full viewport. Form is hidden/unmounted while loading is active.
- **D-12:** Animation: calm and magical (stars, gentle glow, moon motif), CSS animation only.
- **D-13:** On success, navigate to `/story` with story text passed via route state or URL-safe mechanism.
- **D-14:** `/story` page is a minimal stub in Phase 4 -- just renders raw story text.
- **D-15:** Rate limit errors surface inline below Generate button with friendly copy. Form stays visible.
- **D-16:** Rate limit is IP-based (INFRA-03). Implementation detail (middleware vs. route handler) is Claude's discretion.
- **D-17:** Configure Tailwind v4 CSS custom properties in `globals.css` -- color tokens, typography scale, spacing.
- **D-18:** Load Noto Serif and Plus Jakarta Sans via `next/font/google`. Apply font variables to `<body>` in `layout.tsx`.

### Claude's Discretion
- Exact loading animation implementation (CSS keyframes, SVG animation, or Tailwind animate utilities)
- Rate limiting implementation location (Next.js middleware vs. route handler)
- Story text passing mechanism to `/story` (sessionStorage, URL param, or React state with router)
- Exact copy for loading overlay and rate limit message
- Input field focus/validation error styling details (within DESIGN.md pill-input pattern)
- Selected state appearance for theme tiles and duration buttons

### Deferred Ideas (OUT OF SCOPE)
- None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | No login or account required -- any parent can visit, enter details, and get a story immediately | Form is the landing page at `/`. No auth, no signup. The page component renders the form directly. |
| INFRA-03 | App enforces IP-based rate limiting to prevent abuse in the absence of user authentication | In-memory Map rate limiter in the `/api/generate` route handler, keyed by IP from `x-forwarded-for` header. Returns 429 with JSON error body. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, SSR, routing | Already installed, project foundation |
| React | 19.2.4 | UI components, state management | Already installed |
| Tailwind CSS | 4.x | Utility-first CSS, design token system | Already installed, CSS-first `@theme` directive |
| TypeScript | 5.x | Type safety | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | (bundled) | Self-hosted Google Fonts | Loading Noto Serif + Plus Jakarta Sans |
| next/image | (bundled) | Optimized image loading | Theme tile SVG illustrations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory Map rate limiter | @upstash/ratelimit + Redis | More robust for distributed edge, but adds external dependency and cost. In-memory is acceptable for v1 MVP. |
| sessionStorage for story handoff | URL search params | URL params expose story text in URL; sessionStorage is private to tab, survives client-side navigation |
| CSS keyframe animations | framer-motion | Framer adds ~30KB bundle. CSS keyframes are sufficient for the loading overlay and fully align with D-12. |

**Installation:**
No new packages needed. Everything required is already in `package.json`.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Add font imports, CSS variables on <html>
│   ├── page.tsx            # Replace placeholder with StoryForm
│   ├── globals.css         # Add @theme tokens, typography, spacing
│   └── story/
│       └── page.tsx        # Minimal stub: read story from sessionStorage, render
├── components/
│   ├── story-form.tsx      # 'use client' - main form component
│   ├── name-input.tsx      # Pill-shaped text input with validation
│   ├── age-stepper.tsx     # [ - ] 5 [ + ] stepper control
│   ├── duration-toggle.tsx # Segmented pill radio group
│   ├── theme-grid.tsx      # 2-column tile grid with single-select
│   └── loading-overlay.tsx # Full-screen loading with animation
└── lib/
    ├── schemas.ts          # EXISTING - reuse validateInput, VALID_THEMES, etc.
    ├── rate-limit.ts       # NEW - in-memory Map rate limiter utility
    └── theme-utils.ts      # NEW - theme name to kebab-case filename mapping
```

### Pattern 1: Client Component Form with Server API
**What:** A `'use client'` component manages all form state with `useState`, validates inputs in real-time using imported `schemas.ts` functions, and submits to the existing `/api/generate` POST endpoint via `fetch`.
**When to use:** When the form needs interactive controls (stepper, tile grid) with real-time validation feedback.
**Example:**
```typescript
// Source: Next.js App Router docs
'use client'

import { useState } from 'react'
import { VALID_THEMES, VALID_DURATIONS } from '@/lib/schemas'

export function StoryForm() {
  const [name, setName] = useState('')
  const [age, setAge] = useState(5)
  const [duration, setDuration] = useState<number>(10)
  const [theme, setTheme] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time name validation
  const nameError = name.length > 0 && !/^[a-zA-Z\s]{1,30}$/.test(name)
    ? 'Letters and spaces only, up to 30 characters'
    : null

  const canSubmit = name.length > 0 && !nameError && theme !== null

  async function handleSubmit() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), age, theme, duration }),
      })
      if (res.status === 429) {
        setIsLoading(false)
        setError("You've created a few stories recently. Try again in a bit.")
        return
      }
      if (!res.ok) {
        setIsLoading(false)
        setError('Something went wrong creating the story. Please try again.')
        return
      }
      const storyText = await res.text()
      sessionStorage.setItem('nightlight-story', storyText)
      window.location.href = '/story'
    } catch {
      setIsLoading(false)
      setError('Something went wrong creating the story. Please try again.')
    }
  }

  if (isLoading) {
    return <LoadingOverlay name={name} />
  }

  return (/* form fields */)
}
```

### Pattern 2: Tailwind v4 @theme Directive for Design Tokens
**What:** Use the `@theme` directive in `globals.css` to define color, font, and spacing tokens as CSS custom properties that automatically generate Tailwind utility classes.
**When to use:** Tailwind v4 CSS-first configuration (no `tailwind.config.js`).
**Example:**
```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-surface: #fbf9f1;
  --color-surface-container-low: #f5f4ec;
  --color-surface-container-highest: #e4e3db;
  --color-on-surface: #1b1c17;
  --color-primary: #0c6681;
  --color-primary-container: #9ae1ff;
  --color-secondary: #705d00;
  --color-secondary-container: #fcd400;
  --color-destructive: #b3261e;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
}

@theme inline {
  --font-serif: var(--font-noto-serif);
  --font-sans: var(--font-plus-jakarta);
}
```

This generates utility classes like `bg-surface`, `text-on-surface`, `text-primary`, `p-md`, `gap-sm`, `font-serif`, `font-sans`, etc.

### Pattern 3: next/font/google with CSS Variables for Tailwind v4
**What:** Import Google Fonts, configure as CSS variables, apply to `<html>` element, then bridge to Tailwind via `@theme inline`.
**When to use:** When using multiple Google Fonts with Tailwind v4.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/font
import { Noto_Serif, Plus_Jakarta_Sans } from 'next/font/google'

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Both Noto Serif and Plus Jakarta Sans are variable fonts on Google Fonts, so no explicit `weight` specification is required -- the browser can use any weight within their supported ranges.

### Pattern 4: In-Memory Rate Limiter
**What:** A simple fixed-window rate limiter using a `Map<string, { count: number; resetTime: number }>` stored in module scope of the route handler file.
**When to use:** For IP-based rate limiting in Edge Runtime without external dependencies.
**Example:**
```typescript
// Source: freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 10 // per window

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return true // allowed
  }

  if (entry.count >= MAX_REQUESTS) {
    return false // rate limited
  }

  entry.count++
  return true // allowed
}
```

### Anti-Patterns to Avoid
- **Server Component for interactive form:** The form requires `useState`, event handlers, and `fetch` -- it must be a `'use client'` component. Don't try to make the form a Server Component.
- **`tailwind.config.js` for tokens:** This project uses Tailwind v4 CSS-first. All theme configuration goes in `globals.css` via `@theme`, not a JavaScript config file.
- **`useRouter().push()` from next/navigation for story handoff:** The `useRouter` from `next/navigation` does not support passing state. Use `sessionStorage` + `window.location.href` or `router.push` combined with sessionStorage.
- **Pure black text:** DESIGN.md prohibits `#000000`. Always use `on-surface` (#1b1c17).
- **Borders or dividers:** DESIGN.md prohibits 1px solid borders and horizontal rules. Use tonal stacking and spacing instead.
- **Sharp corners:** DESIGN.md prohibits 90-degree corners. Buttons are `rounded-full` (9999px), cards/tiles use `rounded-3xl` (1.5rem/24px).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input validation | Custom regex logic | Import `validateInput`, `VALID_THEMES`, `VALID_DURATIONS` from `@/lib/schemas` | Already built and tested in Phase 2 |
| Font loading | Manual `<link>` tags or CSS `@import` | `next/font/google` with `variable` option | Self-hosted, zero layout shift, build-time optimization |
| Image optimization | Raw `<img>` tags for SVGs | `next/image` with `<Image>` component | Automatic optimization, proper `alt` text, sizing |
| Theme name to filename mapping | Hardcoded mapping object | Derive programmatically from `VALID_THEMES` array | `"Space & Stars"` -> `"space-stars"` via string transform |

**Key insight:** The validation logic is the most complex piece and it already exists in `schemas.ts`. The form's job is to wire existing validation to UI state, not to re-implement it.

## Common Pitfalls

### Pitfall 1: Edge Runtime Rate Limiter State Not Shared Across Instances
**What goes wrong:** On Vercel, Edge Functions run on distributed nodes. An in-memory `Map` in one instance is not shared with other instances. A user could exceed rate limits by hitting different edge nodes.
**Why it happens:** Edge Runtime is stateless by design; each cold start creates a new `Map`.
**How to avoid:** Accept this limitation for v1 MVP. The in-memory approach still catches rapid sequential abuse from a single node. Document that a Redis-backed solution (e.g., Upstash) is the v2 upgrade path.
**Warning signs:** Rate limiting seems ineffective during load testing against Vercel.

### Pitfall 2: Tailwind v4 @theme Namespace Requirements
**What goes wrong:** Defining `--surface: #fbf9f1` in `@theme` does not generate a `bg-surface` utility class.
**Why it happens:** Tailwind v4 requires specific namespaces for utility generation: `--color-*` for colors, `--font-*` for fonts, `--spacing-*` for spacing.
**How to avoid:** Always use the correct namespace prefix: `--color-surface`, `--font-serif`, `--spacing-md`.
**Warning signs:** Custom utility classes like `bg-surface` don't work in the template.

### Pitfall 3: @theme inline Required for CSS Variable References
**What goes wrong:** Using `--font-serif: var(--font-noto-serif)` inside a regular `@theme` block causes Tailwind to output the literal string `var(--font-noto-serif)` unresolved.
**Why it happens:** Standard `@theme` compiles values at build time. References to runtime CSS variables (like those injected by `next/font`) need `@theme inline`.
**How to avoid:** Use `@theme inline { --font-serif: var(--font-noto-serif); }` for any value that references a CSS variable.
**Warning signs:** Fonts don't render; inspecting CSS shows `var(--font-noto-serif)` instead of the actual font family string.

### Pitfall 4: Form Submission During Loading State
**What goes wrong:** User double-taps Generate, sending two API requests.
**Why it happens:** No guard on the submit handler.
**How to avoid:** The loading overlay unmounts the form (D-11), preventing re-submission. Additionally, check `isLoading` at the start of `handleSubmit`.
**Warning signs:** Duplicate story generations in logs.

### Pitfall 5: sessionStorage Not Available in SSR
**What goes wrong:** `sessionStorage.getItem()` throws `ReferenceError: sessionStorage is not defined` during server-side rendering of the `/story` page.
**Why it happens:** `sessionStorage` is a browser API, not available in Node.js or Edge Runtime SSR.
**How to avoid:** The `/story` page must be a `'use client'` component, and `sessionStorage` access must happen inside `useEffect` or conditionally after checking `typeof window !== 'undefined'`.
**Warning signs:** Build errors or hydration mismatches on the `/story` route.

### Pitfall 6: Next.js Image Component with SVG Files
**What goes wrong:** Using `<Image>` with SVGs and specifying `width` and `height` props can produce unexpected sizing or quality loss.
**Why it happens:** Next.js Image optimization processes images through Sharp, which may rasterize SVGs.
**How to avoid:** For SVGs, consider using `unoptimized` prop on the `<Image>` component, or use a regular `<img>` tag. Since SVGs are already optimized vectors, the Image component's optimization pipeline is unnecessary. However, D-09 explicitly calls for `<Image>`, so use `unoptimized` prop.
**Warning signs:** SVGs appear blurry or have artifacts.

## Code Examples

### Theme Name to Filename Mapping
```typescript
// Utility to convert VALID_THEMES entries to kebab-case filenames
// "Space & Stars" -> "space-stars"
// "Knights & Castles" -> "knights-castles"
export function themeToFilename(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
}

// Usage: `/themes/${themeToFilename(theme)}.svg`
```

### Loading Overlay with CSS Animation
```typescript
// Source: CONTEXT.md D-10, D-11, D-12, UI-SPEC
'use client'

interface LoadingOverlayProps {
  name: string
}

export function LoadingOverlay({ name }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
      role="alert"
      aria-live="polite"
    >
      {/* Animation element - stars/moon CSS animation */}
      <div className="loading-animation mb-xl" />
      <h2 className="font-serif text-headline-md text-on-surface">
        Crafting {name}&apos;s story&hellip;
      </h2>
      <p className="font-serif text-body-lg text-on-surface mt-md">
        This takes about 30 seconds.
      </p>
    </div>
  )
}
```

### Rate Limiter in Route Handler
```typescript
// In src/lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 10

// Cleanup stale entries periodically
function cleanup() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean } {
  cleanup()
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}
```

```typescript
// In src/app/api/generate/route.ts -- add at the top of POST handler
import { checkRateLimit } from '@/lib/rate-limit'

// Inside POST():
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
const { allowed } = checkRateLimit(ip)
if (!allowed) {
  return new Response(
    JSON.stringify({ error: "You've created a few stories recently. Try again in a bit." }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  )
}
```

### Globals CSS Token Setup
```css
/* Source: Tailwind v4 docs, DESIGN.md, UI-SPEC */
@import "tailwindcss";

@theme {
  /* Color tokens - DESIGN.md */
  --color-surface: #fbf9f1;
  --color-surface-container-low: #f5f4ec;
  --color-surface-container-highest: #e4e3db;
  --color-on-surface: #1b1c17;
  --color-primary: #0c6681;
  --color-primary-container: #9ae1ff;
  --color-secondary: #705d00;
  --color-secondary-container: #fcd400;
  --color-destructive: #b3261e;

  /* Spacing tokens - UI-SPEC */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
}

/* Font variables bridged from next/font/google */
@theme inline {
  --font-serif: var(--font-noto-serif);
  --font-sans: var(--font-plus-jakarta);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for theme | `@theme` directive in CSS | Tailwind v4 (Jan 2025) | No JS config file; tokens are CSS custom properties |
| `@next/font` package | `next/font/google` (bundled) | Next.js 13.2 | No separate install needed |
| `experimental-edge` runtime | `export const runtime = 'edge'` | Next.js 16 | Simplified API |
| `getServerSideProps` for data | App Router Server Components | Next.js 13+ | Not relevant here (client component form) |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Form renders at `/` with no auth gate | smoke (manual) | Manual: visit `/` in browser | n/a |
| INFRA-03 | Rate limiter returns 429 after threshold | unit | `npx vitest run src/lib/__tests__/rate-limit.test.ts -x` | Wave 0 |
| FORM-VAL | Name validation matches schemas.ts regex | unit | `npx vitest run src/lib/__tests__/schemas.test.ts -x` | Exists |
| FORM-THEME | Theme name to filename mapping | unit | `npx vitest run src/lib/__tests__/theme-utils.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/rate-limit.test.ts` -- covers INFRA-03 (rate limiter returns 429 after N requests, resets after window)
- [ ] `src/lib/__tests__/theme-utils.test.ts` -- covers theme name to kebab-case filename mapping

## Open Questions

1. **Rate limit thresholds**
   - What we know: Must rate limit by IP, return 429.
   - What's unclear: Exact threshold (requests per window) and window duration are not specified in requirements.
   - Recommendation: Default to 10 requests per hour. This is generous enough for legitimate use but catches abuse. Can be tuned later.

2. **Story handoff mechanism**
   - What we know: Story text must reach `/story` page. Options: sessionStorage, URL params, React context.
   - What's unclear: User decided "Claude's discretion."
   - Recommendation: Use `sessionStorage`. It survives client-side navigation, is private to the tab, does not expose story text in the URL, and works without a global state provider. The `/story` page reads it in `useEffect`.

3. **Loading animation specifics**
   - What we know: Must be calm, magical, CSS-only (D-12). Stars, glow, moon motif suggested.
   - What's unclear: Exact animation design.
   - Recommendation: A pulsing/breathing moon glow with floating star particles using CSS `@keyframes`. Keep it simple -- 2-3 animated elements max to maintain the calm feel.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables docs](https://tailwindcss.com/docs/theme) - `@theme` directive syntax, namespace requirements, `@theme inline` for variable references
- [Next.js 16 Font Optimization docs](https://nextjs.org/docs/app/getting-started/fonts) - `next/font/google` usage, CSS variable pattern, multiple fonts
- [Next.js Font API Reference](https://nextjs.org/docs/app/api-reference/components/font) - `variable` option, Tailwind v4 integration pattern with `@theme inline`

### Secondary (MEDIUM confidence)
- [FreeCodeCamp: In-Memory Rate Limiter in Next.js](https://www.freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs/) - Fixed-window rate limiter pattern
- [BetterLink: Next.js Middleware Guide](https://eastondev.com/blog/en/posts/dev/20251225-nextjs-middleware-guide/) - Edge Runtime limitations, stateless design constraint
- [Google Fonts: Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) - Variable font, weights 200-800

### Tertiary (LOW confidence)
- Rate limit window/threshold values (10/hour) -- no project specification, based on common practice for similar apps

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already installed, versions verified in `package.json`
- Architecture: HIGH - patterns verified against official Next.js 16 and Tailwind v4 docs
- Pitfalls: HIGH - Edge Runtime limitations well-documented, Tailwind v4 `@theme` namespace verified
- Rate limiting: MEDIUM - in-memory approach is a known tradeoff on Vercel Edge; acceptable for v1

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable stack, no breaking changes expected)
