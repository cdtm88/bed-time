# Technology Stack

**Project:** Nightlight Tales v2.0
**Researched:** 2026-04-03

## Existing Stack (Validated in v1.0 -- Keep As-Is)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.1 | Framework, Edge Runtime on Vercel |
| React | 19.2.4 | UI |
| @anthropic-ai/sdk | ^0.80.0 | Story generation (Sonnet) + safety validation (Haiku) |
| @upstash/redis | ^1.37.0 | Rate limiting + shareable story storage (v2.0 reuse) |
| @upstash/ratelimit | ^2.0.8 | Sliding-window rate limiter |
| Tailwind CSS | v4 | Styling (CSS-first, no config file) |
| Vitest | ^3.2.4 | Testing (113 passing tests) |

## New Dependencies for v2.0

### AI Image Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @fal-ai/client | ^1.9.5 | Client SDK for fal.ai image API | Fastest inference, cheapest Flux pricing, built-in Next.js proxy |
| @fal-ai/server-proxy | latest | Server-side proxy route handler | Protects FAL_KEY from client exposure; 3-line App Router setup |

**Model:** `fal-ai/flux/dev` (FLUX.1 Dev) at ~$0.025/megapixel

**Why fal.ai over Replicate or Together AI:**
- 30-50% cheaper than Replicate for equivalent Flux models (multiple comparison sources confirm this)
- Built-in Next.js proxy handler via `createRouteHandler()` -- zero custom code for credential protection
- FLUX Dev produces illustration-quality output with soft lighting and painterly coherence suited for children's storybook aesthetic
- Pay-per-use with no subscriptions or minimums -- fits a free app with no accounts

**Why FLUX Dev over other Flux variants:**
- Schnell (1-4 steps, $0.003/MP) is fast but quality drops for illustration work
- Dev (20-50 steps, $0.025/MP) produces storybook-quality output -- the sweet spot
- Pro ($0.05/MP) is overkill; marginal quality gain for 2x the cost
- At 2-3 images per story, cost per story is ~$0.05-0.08

**Integration pattern:**
```
Client component -> fetch("/api/fal/proxy") -> fal.ai API -> CDN image URL returned
```
Images generated on-demand as user scrolls to scene markers in the story. fal.ai returns CDN URLs -- no server-side image storage needed.

### Text-to-Speech Narration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| openai | ^5.x | TTS via gpt-4o-mini-tts model | Best cost/quality ratio for pay-per-use, streaming audio, simple API |

**Model:** `gpt-4o-mini-tts` at ~$0.015/minute of generated audio

**Why OpenAI TTS over alternatives:**

| Criterion | Web Speech API | OpenAI mini-tts | ElevenLabs |
|-----------|---------------|-----------------|------------|
| Voice quality | Robotic, varies by OS | Natural, consistent | Best-in-class |
| Cost | Free | ~$0.015/min (~$0.075 for a 5-min story) | $5-330/mo subscriptions |
| Latency (TTFB) | Instant (local) | ~200ms | ~75ms |
| Offline | Yes | No | No |
| Audio streaming | N/A (local) | Yes (chunked transfer encoding) | Yes |
| Voice selection | OS-dependent, inconsistent | Multiple named voices | Extensive + voice cloning |
| Integration | 3 lines of browser JS | API route + audio streaming | API route + subscription management |

**Recommendation: OpenAI gpt-4o-mini-tts as primary, browser Web Speech API as free fallback.**

Rationale:
- ElevenLabs has the best quality but requires subscription pricing. Per-use pricing requires their Scale plan at $330/month -- absurd for a free app with zero revenue.
- OpenAI mini-tts is pay-per-use, natural-sounding, and supports streaming audio via chunked transfer encoding. A 5-minute story costs roughly $0.075 to narrate.
- Web Speech API is free and works offline but voice quality varies wildly across devices (decent on iOS, poor on many Android devices, inconsistent on desktop). Offer it as a "free voice" option alongside the API-powered voices.

**Integration pattern:**
```
Client -> POST /api/tts { storyText, voice } -> OpenAI TTS API -> streamed audio -> <audio> element playback
```

### Local Storage (Story Library)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| idb-keyval | ^6.2.2 | IndexedDB key-value wrapper | 573 bytes (brotli), async API, perfect for simple story objects |

**Why idb-keyval over alternatives:**

| Option | Bundle size | API complexity | Verdict |
|--------|-------------|----------------|---------|
| localStorage | 0 | Sync, 5MB limit, no binary | Too small for stories + image data |
| idb-keyval | 573B | 5 functions: get/set/del/keys/entries | Exactly right for key-value story storage |
| localforage | ~7KB | Multi-backend (WebSQL, localStorage fallback) | 12x larger, fallback backends unnecessary in 2026 |
| Dexie | ~16KB | Full IndexedDB ORM with indexes/migrations | 28x larger, ORM features we do not need |
| Raw IndexedDB | 0 | Verbose callback-heavy API | Developer experience is terrible; not worth the pain |

Stories are simple objects -- no indexes, queries, or relationships needed. idb-keyval's `get`/`set`/`del`/`keys` is the entire API surface required.

**Storage schema (conceptual):**
```typescript
interface SavedStory {
  id: string           // crypto.randomUUID()
  name: string
  age: number
  theme: string
  duration: number
  story: string
  createdAt: number    // Date.now()
  imageUrls?: string[] // fal.ai CDN URLs (may expire -- see PITFALLS)
}
```

### Screen Wake Lock

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Screen Wake Lock API | Browser native | Prevent device sleep during reading | No npm package needed; supported in all major browsers since early 2025 |

**No dependency required.** The Screen Wake Lock API is:
- Supported in Chrome, Edge, Firefox, and Safari as of early 2025
- ~10 lines of code to implement (request on reading view mount, release on unmount)
- HTTPS-only requirement satisfied by Vercel deployment
- Gracefully degradable -- if unsupported, reading still works, screen just dims normally

```typescript
// Acquire on entering reading mode
const sentinel = await navigator.wakeLock.request('screen')

// Release on cleanup or page visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') sentinel.release()
})
```

### Reading Font

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Literata (Google Fonts) | Variable font | Story display font for dim-room mobile reading | Purpose-built for digital long-form reading by Google/TypeTogether |

**Why Literata over Noto Serif (current font):**

| Criterion | Noto Serif (current) | Literata (recommended) | Georgia |
|-----------|---------------------|------------------------|---------|
| Designed for | Universal script coverage | Digital long-form reading (Google Play Books) | Low-res screen clarity |
| Optical sizes | No | Yes -- Display, Subhead, Text, Caption | No |
| Variable font | Yes | Yes (tiny file size, infinite adjustability) | No (system font only) |
| x-height ratio | Standard | Lower x-height + higher ascenders = airy spacing | Large |
| Google Fonts | Yes | Yes | No |
| next/font support | Yes | Yes (trivial integration) | System font fallback only |
| Dim-light readability | Good | Excellent -- literally its design purpose | Excellent but dated |

**Recommendation: Literata** because it was designed for exactly this use case -- reading stories on mobile screens. The variable font with optical sizes auto-optimizes at the large body text sizes the reading view uses. Lower x-height with higher ascenders creates more airy line spacing that reduces visual fatigue in dim light.

**Fallback chain:** `Literata, Georgia, 'Noto Serif', serif`

**Confidence note:** Font choice is inherently subjective. Recommend A/B testing Literata against Noto Serif with a few real parents before committing. But the evidence strongly favors Literata for this specific use case.

## Streaming Architecture (No New Library Needed)

The existing `@anthropic-ai/sdk` already supports `client.messages.stream()` and the current `route.ts` already streams to the client. The v2.0 challenge is **architectural**, not a missing library.

**Current state problem:** The route.ts streams story text directly to the client, completely bypassing safety validation. The safety.ts module uses buffered `messages.create()` with post-generation Haiku validation. These two patterns are disconnected.

**v2.0 pattern -- Stream-then-validate (recommended):**

```
Client request
  -> Edge function generates full story (streamed to server-side buffer)
  -> Haiku validates the complete buffered story
  -> If safe: stream validated story text progressively to client
  -> If unsafe: retry with reinforced prompt (up to 3 attempts, same as v1.0)
```

This means first-word latency is generation time + validation time (~3-5 seconds total), not the aspirational 1-2 seconds from the milestone target. The 1-2 second target assumed skipping safety validation during streaming, which is unacceptable for a children's app.

**Why not optimistic streaming (stream to client, validate in parallel, kill if unsafe):** The user would see partial unsafe content before the kill signal arrives. For a children's bedtime story app, this violates the project's non-negotiable safety constraint. Do not do this.

**The progressive UX improvement is still significant:** Instead of a loading spinner followed by a wall of text, the user sees text appearing word-by-word after a brief generation wait. The psychological experience of watching a story "write itself" is meaningfully better even with a 3-5 second initial delay.

## Shareable Story Links (No New Library Needed)

Reuses existing `@upstash/redis`. Store story content in Redis with a TTL:

```typescript
await redis.set(`story:${id}`, JSON.stringify(story), { ex: 60 * 60 * 24 * 7 }) // 7-day TTL
```

Shareable URL pattern: `https://bed-time-nu.vercel.app/story/[id]`

This is a new dynamic route + Redis key pattern using the existing Upstash stack. Zero new dependencies.

## Complete Installation

```bash
# New production dependencies (4 packages)
npm install @fal-ai/client @fal-ai/server-proxy openai idb-keyval

# Literata font -- loaded via next/font/google, no npm install needed
# Wake Lock API -- browser native, no install needed
# Streaming -- existing @anthropic-ai/sdk, no install needed
# Shareable links -- existing @upstash/redis, no install needed
```

**Total new npm packages: 4** -- the stack stays lean.

## New Environment Variables

| Variable | Service | Notes |
|----------|---------|-------|
| FAL_KEY | fal.ai image generation | Add to Vercel env vars and .env.local |
| OPENAI_API_KEY | OpenAI TTS narration | Add to Vercel env vars and .env.local |

Existing (unchanged): `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## What NOT to Add

| Technology | Why Not |
|------------|---------|
| **Vercel AI SDK (`ai` package)** | Adds ~50KB for abstractions over provider SDKs. We call two providers (Anthropic, OpenAI) directly with simple patterns. The AI SDK's value is multi-provider orchestration and structured output -- neither needed here. |
| **ElevenLabs SDK** | Subscription pricing model is wrong for a free app with no revenue. Would need $22-330/month plans. OpenAI mini-tts is pay-per-use at $0.015/min. |
| **Dexie / PouchDB** | ORM/sync features for IndexedDB we do not need. Stories are flat key-value objects. idb-keyval at 573 bytes is sufficient. |
| **Any wake-lock npm package** | The browser API is ~10 lines. A wrapper library adds a dependency for no value. |
| **Replicate SDK** | fal.ai is cheaper, has better Next.js integration, and equivalent model access. |
| **next-themes** | Already have dark mode as the default reading experience via Tailwind. No theme switching needed. |
| **react-query / SWR** | The app has exactly two data fetching patterns (story generation, image generation). Both are one-shot mutations, not cached queries. React's built-in fetch + useState is sufficient. |
| **Howler.js / tone.js** | Audio playback is a single `<audio>` element with a streaming source. No audio library needed. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Image API | fal.ai (Flux Dev) | Replicate | 30-50% more expensive, no built-in Next.js proxy handler |
| Image API | fal.ai (Flux Dev) | Together AI | Fewer image models, less mature image pipeline |
| Image model | Flux Dev | Flux Schnell | Quality insufficient for illustration work |
| Image model | Flux Dev | Flux Pro | 2x cost for marginal quality gain |
| TTS primary | OpenAI mini-tts | ElevenLabs | Subscription pricing, wrong for free app |
| TTS primary | OpenAI mini-tts | Web Speech API alone | Voice quality too inconsistent across devices |
| TTS primary | OpenAI mini-tts | Deepgram Aura | Less natural for storytelling narration |
| Storage | idb-keyval | localforage | 12x larger, fallback backends unnecessary |
| Storage | idb-keyval | Dexie | 28x larger, ORM features unnecessary |
| Font | Literata | Georgia | Not on Google Fonts, no variable/optical sizes |
| Font | Literata | Bitter | Less refined for long-form reading |
| Font | Literata | Keep Noto Serif | Not designed for the reading use case |

## Confidence Assessment

| Decision | Confidence | Basis |
|----------|------------|-------|
| fal.ai for images | HIGH | Multiple pricing comparisons, official Next.js integration docs, npm v1.9.5 verified |
| Flux Dev model | MEDIUM | Storybook illustration comparisons favor Dev over Schnell; confirm with real output testing |
| OpenAI mini-tts | HIGH | Official pricing ($0.015/min), streaming audio documented, pay-per-use confirmed |
| Web Speech API fallback | HIGH | Browser-native API, well-documented, zero cost, progressive enhancement |
| idb-keyval | HIGH | npm v6.2.2 verified, 573 bytes, maintained by Jake Archibald (Chrome team) |
| Literata font | MEDIUM | Designed for exactly this use case, but font preference is subjective -- A/B test recommended |
| Stream-then-validate | HIGH | Only safe pattern for children's content; optimistic streaming unacceptable |
| No new streaming library | HIGH | Existing @anthropic-ai/sdk provides streaming; change is architectural, not a dependency |
| Upstash for shareable links | HIGH | Already in the stack, TTL-based key-value is exactly what Redis does |

## Sources

- [fal.ai pricing](https://fal.ai/pricing) -- pay-per-use, Flux model pricing
- [fal.ai vs Replicate/Together comparison](https://www.teamday.ai/blog/ai-image-video-api-providers-comparison-2026) -- cost differential
- [fal.ai Next.js integration docs](https://docs.fal.ai/model-apis/integrations/nextjs/) -- proxy route pattern
- [@fal-ai/client on npm](https://www.npmjs.com/package/@fal-ai/client) -- v1.9.5 confirmed
- [Flux model comparison: Pro vs Dev vs Schnell](https://magichour.ai/blog/flux-pro-vs-dev-vs-schnell-which-image-model-is-right-for-you/)
- [Flux for children's storybook illustrations](https://z-image.ai/blog/use-flux-1-1-for-ai-storybook-and-children-s-illustrations)
- [OpenAI TTS pricing calculator](https://costgoat.com/pricing/openai-tts) -- gpt-4o-mini-tts rates
- [OpenAI TTS guide](https://platform.openai.com/docs/guides/text-to-speech) -- streaming support
- [ElevenLabs vs OpenAI TTS](https://vapi.ai/blog/elevenlabs-vs-openai) -- quality/latency/pricing
- [Best TTS APIs 2026](https://www.gladia.io/blog/best-tts-apis-for-developers-in-2026-top-7-text-to-speech-services)
- [Screen Wake Lock API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [Wake Lock supported in all browsers (2025)](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers)
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) -- size and API
- [idb-keyval on npm](https://www.npmjs.com/package/idb-keyval) -- v6.2.2 confirmed
- [Literata on Google Fonts](https://fonts.google.com/specimen/Literata)
- [Why Bookerly and Literata are great for reading](https://ebookfriendly.com/literata-bookerly-fonts/)
- [Best ebook fonts 2025](https://www.editionguard.com/learn/best-fonts-e-books/)
- [Anthropic streaming refusals](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals)
