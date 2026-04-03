# Research Summary: Nightlight Tales v2.0 Stack

**Domain:** AI-powered children's bedtime story app -- v2.0 feature additions
**Researched:** 2026-04-03
**Overall confidence:** HIGH

## Executive Summary

The v2.0 feature set (streaming, AI illustrations, TTS narration, Wake Lock, story persistence, shareable links) requires only four new npm packages: `@fal-ai/client`, `@fal-ai/server-proxy`, `openai`, and `idb-keyval`. Two features (Wake Lock, reading font) use browser-native APIs with zero dependencies. One feature (shareable links) reuses the existing Upstash Redis stack. The streaming enhancement requires architectural changes to the existing generation pipeline, not new libraries.

The most important architectural decision is the streaming-plus-safety pattern. The current codebase has a gap: `route.ts` streams story text directly without safety validation, while `safety.ts` buffers and validates but does not stream. The v2.0 approach must be "buffer-validate-then-stream" -- generate the full story server-side, validate with Haiku, then progressively stream the validated text to the client. This means first-word latency is 3-5 seconds (not the aspirational 1-2 seconds), but safety is non-negotiable for a children's app.

For AI illustrations, fal.ai with FLUX Dev is the clear choice: 30-50% cheaper than Replicate, built-in Next.js proxy handler, and storybook-quality output at ~$0.025/megapixel. For TTS narration, OpenAI's gpt-4o-mini-tts at $0.015/minute is the right balance of quality and cost for a free app, with browser Web Speech API as a free fallback. For local storage, idb-keyval at 573 bytes provides the exact API surface needed (get/set/del/keys) without the overhead of larger IndexedDB wrappers. For the reading font, Literata (designed for Google Play Books) is purpose-built for the exact use case of reading stories on mobile screens.

## Key Findings

**Stack:** 4 new npm packages (`@fal-ai/client`, `@fal-ai/server-proxy`, `openai`, `idb-keyval`), 2 new env vars (`FAL_KEY`, `OPENAI_API_KEY`), Literata font via `next/font/google`
**Architecture:** Buffer-validate-then-stream pattern resolves the safety/streaming tension; fal.ai proxy route for images; OpenAI TTS proxy for narration; idb-keyval for client-side story library; Upstash Redis reuse for shareable links
**Critical pitfall:** fal.ai CDN image URLs expire -- saved stories must handle stale image references gracefully, or cache image data locally

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation: Safety + Streaming + Wake Lock + Font** - Resolve the core architectural tension (safety validation + progressive streaming), add Wake Lock (trivial effort, massive UX win), and swap to Literata font
   - Addresses: Progressive streaming, Wake Lock, reading font
   - Avoids: Shipping streaming without safety validation

2. **Story Persistence: Library + Shareable Links** - Give stories identity and longevity via idb-keyval local storage, then add Redis-backed shareable links
   - Addresses: Story library, shareable story links
   - Avoids: Building sharing before stories have a stable data format

3. **Rich Media: AI Illustrations** - Add fal.ai integration for on-demand scene illustrations via IntersectionObserver
   - Addresses: AI scene illustrations, improved visual experience
   - Avoids: Paying for images during development of other features

4. **Narration: TTS** - Add OpenAI TTS with voice selection, text chunking for the 4096-char limit, and audio playback UI
   - Addresses: Text-to-speech narration
   - Avoids: Building the most complex feature before simpler features are stable

5. **Polish: SVG Illustrations** - Refresh the 18 theme tile SVGs with warmer nighttime aesthetic
   - Addresses: Improved SVG theme illustrations
   - Avoids: Design work blocking engineering work (can run in parallel)

**Phase ordering rationale:**
- Safety + streaming first because it is the architectural foundation everything else builds on
- Story library before shareable links because sharing requires a stable story data format
- Illustrations before TTS because illustrations are simpler (single API call per image vs text chunking + audio streaming)
- SVG refresh is independent design work that can ship anytime

**Research flags for phases:**
- Phase 1: Needs careful implementation of the buffer-validate-then-stream pattern -- the module singleton for passing ReadableStream across navigation is non-trivial
- Phase 3: Needs prompt engineering for consistent illustration style across scenes; fal.ai CDN URL expiry needs investigation
- Phase 4: The 4096-character TTS input limit requires paragraph-boundary chunking logic; audio streaming vs buffered playback decision

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (new packages) | HIGH | All npm versions verified, pricing confirmed from official sources |
| Streaming + safety architecture | HIGH | Pattern is well-understood; implementation verified against existing codebase |
| fal.ai for images | HIGH | Pricing, Next.js integration, and Flux model comparison all verified |
| OpenAI TTS | HIGH | Pricing ($0.015/min) and streaming support confirmed from official docs |
| idb-keyval | HIGH | Version 6.2.2 verified, 573 bytes confirmed, API surface matches needs |
| Literata font | MEDIUM | Purpose-built for the use case, but font choice is subjective -- recommend A/B test |
| Cost estimates | MEDIUM | Per-image and per-narration costs verified, but total cost depends on usage patterns |

## Gaps to Address

- fal.ai CDN URL expiry policy: need to determine how long generated image URLs remain valid, and whether to cache images in IndexedDB alongside story text
- OpenAI TTS text chunking: the 4096-character limit chunking strategy needs implementation-time testing to ensure audio continuity across chunk boundaries
- Literata vs Noto Serif: subjective preference -- recommend brief A/B test with 3-5 parents before committing
- gpt-4o-mini-tts voice selection: need to listen to each available voice and curate 3-4 that fit the "calm bedtime narration" context
- Image prompt engineering: consistent illustration style across 2-3 scenes per story requires prompt tuning at implementation time

## Sources

See STACK.md for complete source list with URLs and confidence levels.
