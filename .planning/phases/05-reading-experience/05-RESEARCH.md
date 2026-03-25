# Phase 5: Reading Experience - Research

**Researched:** 2026-03-25
**Domain:** Next.js fullscreen reading UI, dark mode CSS, scroll tracking, sessionStorage data handoff
**Confidence:** HIGH

## Summary

Phase 5 replaces the existing `/story` stub with a fullscreen, chrome-free reading experience optimized for dim bedrooms. The implementation is entirely frontend -- no new API routes, no new dependencies, no backend changes. The work involves: (1) updating the sessionStorage write in `story-form.tsx` from raw text to a JSON payload, (2) adding 5 dark reading mode CSS tokens to `globals.css`, (3) completely rewriting `src/app/story/page.tsx` with the reading container, story title, story body, scroll progress indicator, end-of-story section with "New Story" button, empty state, and error state, and (4) setting the `theme-color` meta tag to `#1a1a2e` for the story page.

The technical complexity is low -- this is a well-scoped presentational component with no external dependencies, no state management beyond sessionStorage reads, and no API calls. The main risks are getting the Tailwind v4 custom property setup right for the new dark tokens, correctly structuring the page as a server component wrapper around a client component (to support the viewport export), and ensuring the scroll progress indicator performs well.

**Primary recommendation:** Structure `/story/page.tsx` as a thin server component exporting `viewport` (for theme-color) that renders a `'use client'` `<ReadingView />` component containing all the interactive logic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Extend sessionStorage payload from raw text to JSON: `{ story: string, name: string, theme: string }`
- D-02: Phase 5 updates `src/components/story-form.tsx` to write `JSON.stringify({ story, name, theme })` under the `nightlight-story` key
- D-03: Reading page assembles display title as `{Name}'s {Theme} Story` using stored name and theme fields
- D-04: If parsing fails or key is missing, fall back to empty state with error copy from UI-SPEC
- D-05: No floating toolbar. Chrome-free reading -- only scroll progress indicator (top 3px bar) visible during reading
- D-06: Back-to-home navigation at end of page only, near gold "New Story" button. Small secondary text link in `reading-on-surface-muted` color

### Claude's Discretion
- Exact label copy for the back link ("Home" vs "Back to home" etc.)
- Whether back link is `<a>` or `<button>` (semantically `<a>` is correct)
- Exact vertical spacing between "New Story" button and back link
- CSS animation implementation for 600ms page entry fade-in
- Story text paragraph splitting logic (split on `\n\n` as per UI-SPEC)
- `<meta name="theme-color">` placement (layout.tsx vs page-level)

### Deferred Ideas (OUT OF SCOPE)
- Screen Wake Lock (READ-03) -- v2, out of scope
- Fade-in on tap to reveal controls -- rejected
- Floating toolbar with controls -- rejected
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| READ-01 | After generation completes, story displayed in fullscreen distraction-free reading mode with large serif font, warm/dark background, no navigation chrome -- optimized for dim bedroom reading | Full UI-SPEC defines all visual tokens, typography, colors, layout. Server/client component split pattern documented. Scroll progress, fade-in animation, and dark token patterns all researched. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App router, page routing, metadata/viewport API | Already installed, project foundation |
| React | 19.2.4 | Component rendering, hooks (useState, useEffect) | Already installed |
| Tailwind CSS | 4.x | Styling via `@theme` CSS custom properties | Already installed, v4 CSS-first approach established |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/font/google | (bundled) | Noto Serif + Plus Jakarta Sans font loading | Already configured in layout.tsx |

### Alternatives Considered
No new libraries needed. This phase is purely presentational using the existing stack.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    story/
      page.tsx           # Server component: exports viewport, renders ReadingView
  components/
    reading-view.tsx     # 'use client' -- all reading page logic
    story-form.tsx       # Updated: JSON.stringify write to sessionStorage
  app/
    globals.css          # Updated: 5 new dark reading mode tokens
```

### Pattern 1: Server Component Wrapper for Viewport + Client Component
**What:** Next.js `viewport` export (for `theme-color`) only works in Server Components. The reading page needs `'use client'` for `useEffect`/`useState` (sessionStorage access). Solution: split into a thin server component page that exports viewport and renders a client component.
**When to use:** Any page that needs both metadata/viewport exports AND client-side hooks.
**Example:**
```typescript
// src/app/story/page.tsx (Server Component)
import type { Viewport } from 'next'
import { ReadingView } from '@/components/reading-view'

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function StoryPage() {
  return <ReadingView />
}
```

```typescript
// src/components/reading-view.tsx (Client Component)
'use client'
import { useEffect, useState } from 'react'
// ... all interactive reading logic here
```
**Source:** [Next.js generateViewport docs](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) -- viewport export only supported in Server Components.

### Pattern 2: Inline `<style>` for CSS Keyframes (Tailwind v4)
**What:** Tailwind v4 CSS-first approach has no config file for custom keyframes. Use inline `<style>` blocks within components for `@keyframes` definitions.
**When to use:** Any component needing custom CSS animations (fade-in, etc.)
**Example:** Already established in `src/components/loading-overlay.tsx` with `breathe` and `twinkle` keyframes using inline `<style>` tags.

### Pattern 3: Scroll Progress via Scroll Event Listener
**What:** Track `window.scrollY` relative to `document.documentElement.scrollHeight - window.innerHeight` to compute scroll percentage. Render as a fixed-position bar at top of viewport.
**When to use:** Scroll progress indicators.
**Example:**
```typescript
const [progress, setProgress] = useState(0)

useEffect(() => {
  function handleScroll() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### Anti-Patterns to Avoid
- **Setting `maximumScale: 1` or `userScalable: false` in viewport:** This breaks accessibility by preventing pinch-to-zoom. The UI-SPEC does not require it. Do not restrict zoom.
- **Using `whitespace-pre-wrap` on a single text block:** The UI-SPEC explicitly says to split paragraphs into separate `<p>` elements, not render as a single block.
- **Re-rendering on every scroll event:** Use `requestAnimationFrame` or throttle if performance issues arise, but `{ passive: true }` on the scroll listener is sufficient for a simple progress bar.
- **Exporting metadata/viewport from a `'use client'` component:** This silently fails. The viewport export must be in a Server Component file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme-color meta tag | Manual `<meta>` tag in JSX | Next.js `viewport` export with `themeColor` field | Next.js manages `<head>` tags; manual meta tags may conflict or duplicate |
| Font loading | Manual `@font-face` declarations | `next/font/google` (already configured) | Handles font optimization, preloading, and CSS variable injection |

**Key insight:** This phase has no complex problems requiring external solutions. Everything is achievable with CSS custom properties, React hooks, and standard HTML elements.

## Common Pitfalls

### Pitfall 1: Viewport Export in Client Component
**What goes wrong:** Exporting `viewport` or `metadata` from a file with `'use client'` directive silently fails -- the meta tags are never rendered.
**Why it happens:** Next.js metadata/viewport resolution runs on the server before hydration. Client components skip these exports.
**How to avoid:** Keep `page.tsx` as a Server Component. Move all interactive logic to a separate `'use client'` component.
**Warning signs:** `theme-color` meta tag missing from rendered HTML.

### Pitfall 2: SessionStorage JSON Migration Breaking Existing Flow
**What goes wrong:** Updating `story-form.tsx` to write JSON while the story page still reads raw text (or vice versa) creates a broken state during development.
**Why it happens:** Both sides of the sessionStorage contract must update atomically.
**How to avoid:** Update the write side (story-form.tsx) and read side (reading-view.tsx) in the same task/commit. Include fallback parsing: try `JSON.parse()` first, and if it fails, treat the value as legacy raw text or show error state.
**Warning signs:** Story page shows raw JSON text or "No story found" after generation.

### Pitfall 3: Tailwind v4 Token Registration
**What goes wrong:** New `--color-reading-*` tokens added to `globals.css` but Tailwind doesn't recognize them as color utilities (e.g., `bg-reading-surface` doesn't work).
**Why it happens:** Tailwind v4 auto-maps `--color-*` custom properties in `@theme` to color utilities. But the tokens must be inside the `@theme { }` block, not outside it.
**How to avoid:** Append new tokens inside the existing `@theme { }` block in `globals.css`. Verify that `bg-reading-surface`, `text-reading-on-surface`, etc. work after adding.
**Warning signs:** Tailwind classes produce no styling; elements have no background color.

### Pitfall 4: Scroll Progress Division by Zero
**What goes wrong:** On very short stories that don't require scrolling, `scrollHeight - innerHeight` equals zero, causing a division-by-zero resulting in `NaN` or `Infinity`.
**Why it happens:** Short content that fits within the viewport.
**How to avoid:** Guard with `docHeight > 0 ? scrollTop / docHeight : 0`. Also consider hiding the progress bar entirely when content doesn't scroll.
**Warning signs:** Progress bar shows full width or flickers on short stories.

### Pitfall 5: Body Background Color Bleed
**What goes wrong:** The `<body>` element in `layout.tsx` has `bg-surface` (cream), which shows at the edges or during overscroll on the dark reading page.
**Why it happens:** The page's dark background only covers its own container, not the full document.
**How to avoid:** Set `min-h-screen` on the reading container AND ensure the background extends to cover overscroll areas. Consider adding `bg-reading-surface` to the outermost element. The body's cream background will show behind it but `min-h-screen` prevents gaps.
**Warning signs:** Cream-colored flash or edge visible on the dark reading page, especially on iOS Safari overscroll.

## Code Examples

### SessionStorage JSON Write (story-form.tsx update)
```typescript
// Current (Phase 4):
sessionStorage.setItem('nightlight-story', storyText)

// Updated (Phase 5):
sessionStorage.setItem('nightlight-story', JSON.stringify({
  story: storyText,
  name: name.trim(),
  theme: theme,
}))
```
Note: The existing `sessionStorage.setItem('nightlight-story-name', name.trim())` line can be removed since `name` is now in the JSON payload.

### SessionStorage JSON Read (reading-view.tsx)
```typescript
interface StoryData {
  story: string
  name: string
  theme: string
}

useEffect(() => {
  const raw = sessionStorage.getItem('nightlight-story')
  if (!raw) {
    setHasStory(false)
    return
  }
  try {
    const data: StoryData = JSON.parse(raw)
    setStoryData(data)
  } catch {
    setError(true)
  }
}, [])
```

### Dark Reading Mode Tokens (globals.css addition)
```css
/* Append inside existing @theme { } block */
--color-reading-surface: #1a1a2e;
--color-reading-surface-elevated: #232340;
--color-reading-on-surface: #e8e0d0;
--color-reading-on-surface-muted: #a89f8f;
--color-on-secondary-container: #1b1c17;
```

### Paragraph Splitting
```typescript
// Split story text on double newlines, render as separate <p> elements
const paragraphs = storyData.story.split('\n\n').filter(p => p.trim())
// ...
{paragraphs.map((paragraph, index) => (
  <p key={index} className="font-serif text-[1.25rem] leading-[1.8] tracking-[0.01em] text-reading-on-surface mb-md">
    {paragraph}
  </p>
))}
```

### Fade-In Animation (inline style approach)
```typescript
// Following the established pattern from loading-overlay.tsx
<style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`}</style>
<div style={{ animation: 'fadeIn 600ms ease-in-out' }}>
  {/* story content */}
</div>
```

### Scroll Progress Bar
```typescript
<div
  aria-hidden="true"
  className="fixed top-0 left-0 h-[3px] z-40 transition-opacity duration-300 ease-in-out"
  style={{
    width: `${progress * 100}%`,
    backgroundColor: 'var(--color-reading-on-surface-muted)',
    opacity: progress > 0 ? 0.4 : 0,
  }}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `export const metadata` for theme-color | `export const viewport` with `themeColor` field | Next.js 14.0.0 | theme-color moved from metadata to viewport export |
| Tailwind config file for custom colors | `@theme { --color-* }` in CSS | Tailwind v4 | No config file; tokens defined in CSS directly |
| `experimental-edge` runtime | `edge` runtime | Next.js 16 | Runtime declaration simplified |

**Deprecated/outdated:**
- Setting `themeColor` via `metadata` export -- moved to `viewport` export in Next.js 14+.

## Open Questions

1. **Body overscroll background on iOS Safari**
   - What we know: The `<body>` has `bg-surface` (cream). The reading page applies dark background to its own container. iOS Safari shows the body background during rubber-band overscroll.
   - What's unclear: Whether this creates a visible cream flash during overscroll on the dark reading page.
   - Recommendation: Test on iOS Safari. Mitigation options: set `overscroll-behavior: none` on the reading container, or dynamically apply a class to `<body>` on mount (though this adds complexity).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| READ-01a | SessionStorage JSON parse yields story data | unit | `npx vitest run src/__tests__/reading-view.test.ts -t "parses story data"` | No -- Wave 0 |
| READ-01b | Missing sessionStorage key shows empty state | unit | `npx vitest run src/__tests__/reading-view.test.ts -t "empty state"` | No -- Wave 0 |
| READ-01c | Invalid JSON shows error state | unit | `npx vitest run src/__tests__/reading-view.test.ts -t "error state"` | No -- Wave 0 |
| READ-01d | Story paragraphs split on double newlines | unit | `npx vitest run src/__tests__/reading-view.test.ts -t "paragraph splitting"` | No -- Wave 0 |
| READ-01e | Scroll progress calculates correctly | unit | `npx vitest run src/__tests__/reading-view.test.ts -t "scroll progress"` | No -- Wave 0 |
| READ-01f | Visual rendering: dark background, serif font, no chrome | manual-only | Visual inspection in browser | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/reading-view.test.ts` -- covers READ-01a through READ-01e
- [ ] Test environment setup for `sessionStorage` mocking (jsdom or happy-dom)
- [ ] Vitest environment config: may need `environment: 'jsdom'` for DOM/browser API tests

## Sources

### Primary (HIGH confidence)
- [Next.js generateViewport docs](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) -- viewport export API, themeColor configuration, Server Component requirement
- Existing codebase files: `src/app/story/page.tsx`, `src/components/story-form.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/loading-overlay.tsx` -- current implementation patterns
- `.planning/phases/05-reading-experience/05-UI-SPEC.md` -- full visual and interaction contract
- `.planning/phases/05-reading-experience/05-CONTEXT.md` -- locked decisions and discretion areas

### Secondary (MEDIUM confidence)
- [Next.js metadata in client components discussion](https://github.com/vercel/next.js/discussions/46368) -- confirms metadata/viewport exports silently fail in client components

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing
- Architecture: HIGH -- server/client component split is well-documented Next.js pattern
- Pitfalls: HIGH -- identified from codebase inspection and Next.js docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- no fast-moving dependencies)
