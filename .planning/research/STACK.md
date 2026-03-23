# Technology Stack

**Project:** Bedtime Story Generator
**Researched:** 2026-03-23

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 16.2 | Full-stack React framework | Server-side API routes keep the Claude API key safe without a separate backend. App Router provides streaming-ready server components. Turbopack makes dev fast. The React foundation preserves optionality for React Native later. | HIGH (verified: nextjs.org/blog, March 2026) |
| TypeScript | ~5.7 | Type safety | Story generation has structured inputs (name, age, theme, duration) and structured outputs. TypeScript catches shape mismatches at build time, not at bedtime. | MEDIUM (version from training data; verify on install) |
| React | 19 (bundled with Next.js 16) | UI library | Comes with Next.js. Server Components reduce client JS. Suspense boundaries give natural loading states during story generation. | HIGH (ships with Next.js 16) |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 4.2 | Utility-first CSS | Dark mode support is critical (dim bedroom reading). Tailwind's `dark:` variants make this trivial. No runtime CSS-in-JS overhead. Typography plugin handles the reading experience. v4 is faster and CSS-native (no PostCSS config needed). | HIGH (verified: tailwindcss.com/blog) |
| @tailwindcss/typography | (bundled in v4) | Prose styling | The reading view is the entire product. Typography plugin provides beautiful, readable prose defaults out of the box -- large text, good line height, proper spacing. | HIGH |

### AI / Story Generation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @anthropic-ai/sdk | ^0.80.0 | Claude API client | This is THE Anthropic SDK. Direct usage gives full control over system prompts, temperature, max tokens, and retry logic -- all essential for story quality and safety. No abstraction layer needed for a single-model app. | HIGH (verified: GitHub releases, March 2026) |

### Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zod | ^3.25 | Input/output validation | Validate user inputs (name length, age range, theme enum, duration enum) on both client and server. Also validates the shape of Claude's response if using structured output. The SDK has Zod compatibility as of v0.79. | MEDIUM (version from SDK release notes) |

### Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | N/A (platform) | Hosting & deployment | Zero-config deployment for Next.js (they make it). Edge functions keep API routes fast globally. Built-in analytics. Free tier is generous for MVP validation. | HIGH |

### Development Tooling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^9 | Linting | Ships with Next.js. Flat config format in v9. | MEDIUM |
| Prettier | ^3 | Code formatting | Consistency. Tailwind plugin auto-sorts classes. | MEDIUM |

## What NOT to Use (and Why)

| Technology | Why Not |
|------------|---------|
| **Vercel AI SDK (`ai` package)** | Adds an abstraction layer over provider SDKs. For a single-provider app (Claude only), the direct `@anthropic-ai/sdk` is simpler, gives full control over prompts/retries, and avoids learning two APIs. The AI SDK shines for multi-provider apps -- this is not one. |
| **Database (Postgres, Supabase, etc.)** | MVP has no accounts, no saved stories, no user data. Adding a database adds schema management, migrations, connection pooling, and deployment complexity for zero user value. Add it when accounts ship. |
| **NextAuth / Auth.js** | No authentication in MVP. Zero friction to first story is an explicit requirement. |
| **Redux / Zustand / state management** | The app has minimal client state: a form with 4 fields and a generated story. React's built-in `useState` and server components handle this. State libraries solve problems this app does not have yet. |
| **Prisma / Drizzle** | No database means no ORM. |
| **Styled Components / Emotion** | Runtime CSS-in-JS adds bundle size, conflicts with server components, and does nothing Tailwind cannot do better for this use case. |
| **LangChain** | Massive dependency for what amounts to one API call with a system prompt. LangChain's abstractions add complexity without value when you are calling a single model with a single prompt pattern. |
| **Expo / React Native (for now)** | Out of scope for MVP. The web app validates the idea first. React/Next.js preserves the option to share business logic with React Native later, but building native now doubles the surface area for unproven value. |

## Intentionally Minimal Stack Rationale

This app is deceptively simple at MVP:
1. A form collects 4 inputs
2. An API route sends a prompt to Claude
3. The response streams back and displays as readable prose

There is no user data, no database, no auth, no real-time collaboration, no file uploads. The complexity lives in the **prompt engineering** and **reading experience UX**, not in the infrastructure. Every library added to the stack must earn its place by solving a problem that actually exists.

## iOS Path Strategy

The choice of React + Next.js keeps three future paths open:

| Path | Effort | When |
|------|--------|------|
| **PWA (Progressive Web App)** | Low -- add a manifest and service worker to the existing web app | First step. Test if "add to home screen" satisfies mobile users before building native. |
| **React Native** | Medium -- reuse Zod schemas, API client logic, and prompt engineering. Rebuild UI with React Native components. | If PWA is not enough and users want native feel (notifications, offline stories, etc.) |
| **Capacitor (web-to-native wrapper)** | Low-Medium -- wraps the web app in a native shell | Quick path to App Store if PWA restrictions on iOS are a blocker, but less polished than true native. |

**Recommendation:** Ship web MVP. Add PWA manifest in Phase 2. Evaluate native need based on user feedback. Do not build native until web is validated.

## Installation

```bash
# Scaffold
npx create-next-app@latest bed-time --typescript --tailwind --app --turbopack

# Core dependency
npm install @anthropic-ai/sdk zod

# Dev tooling (optional but recommended)
npm install -D prettier prettier-plugin-tailwindcss
```

## Environment Variables

```bash
# .env.local (never commit)
ANTHROPIC_API_KEY=sk-ant-...
```

Next.js server-side API routes read `process.env.ANTHROPIC_API_KEY` automatically. The key never reaches the client because it is not prefixed with `NEXT_PUBLIC_`.

## Key Architecture Decisions Driven by Stack

1. **Server Components for the form page** -- no client JS needed until the user submits. Fast initial load.
2. **API Route (`/api/generate`) as the Claude proxy** -- keeps the API key server-side, enables rate limiting, and centralizes safety validation.
3. **Streaming response** -- the Anthropic SDK supports streaming natively. Stream the story to the client so the parent sees text appearing progressively rather than waiting 10-15 seconds for a full response.
4. **Tailwind `dark` mode as default** -- the reading screen should default to dark/dim. The form can be light. Use `class` strategy for dark mode so the reading view can force dark regardless of system preference.

## Sources

- Next.js 16.2 release: https://nextjs.org/blog (verified March 2026)
- Anthropic TypeScript SDK v0.80.0: https://github.com/anthropics/anthropic-sdk-typescript/releases (verified March 2026)
- Tailwind CSS v4.2: https://tailwindcss.com/blog (verified, v4.0 released January 2025, v4.1 April 2025)
- Project requirements: .planning/PROJECT.md

### Confidence Notes

- Next.js 16.2, Anthropic SDK 0.80.0, Tailwind CSS 4.2: **verified against official sources**
- TypeScript version (~5.7): **MEDIUM confidence** -- based on training data. The exact version installed by `create-next-app` may differ; accept whatever ships with Next.js 16.
- Zod version (^3.25): **MEDIUM confidence** -- referenced in Anthropic SDK v0.79 release notes as compatible. Verify on install.
- ESLint/Prettier versions: **LOW confidence** -- versions from training data. Non-critical; accept latest stable.
