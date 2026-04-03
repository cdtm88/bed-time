# Feature Landscape

**Domain:** Bedtime story web app (parent reads aloud to child in dim room on mobile)
**Researched:** 2026-04-03
**Milestone:** v2.0 -- enriched reading experience

---

## Table Stakes

Features users expect once they encounter the product category. Missing = product feels incomplete for a "bedtime reading app."

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Progressive story streaming | Every AI text app streams in 2026. A 15-30s spinner before any text appears feels broken. First words in 1-2s is the baseline expectation. | Medium | Server already streams (`client.messages.stream` in route.ts). Client currently buffers full response via `await res.text()`. Restructure needed: reading view must consume the stream incrementally. |
| Screen Wake Lock | Parents hold phone in dark room for 3-15 minutes. Screen dimming mid-story is the #1 frustration for reading apps. Every e-reader and recipe app handles this. | Very Low | Wake Lock API supported in all major browsers (Chrome 85+, Firefox 124+, Safari 16.6+, ~88% global coverage). ~15 lines of code. HTTPS required (Vercel provides). |
| Story library (local storage) | Users generate stories they love and want to re-read. Without persistence, every story vanishes on page close. Any content-creation app needs a "my stuff" section. | Medium | IndexedDB over localStorage: stories with metadata will exceed 5MB limit at ~20+ stories. Safari may evict IndexedDB data after 7 days without interaction -- mitigate with `navigator.storage.persist()`. |

## Differentiators

Features that elevate beyond basic. Not expected, but valued -- especially in the bedtime niche.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI scene illustrations (2-3 per story) | Transforms "text generator" into "storybook experience." Parents show illustrations to child while reading. Emotional delight moment. | High | OpenAI GPT Image or DALL-E 3 API. On-demand via IntersectionObserver as user scrolls. ~$0.04-0.08/image. Must enforce child-safe illustration prompts. Watercolor/painterly style avoids uncanny child faces. |
| TTS narration with voice selection | Hands-free reading. Parent holds child while app reads aloud. Huge for tired parents in a dark room. | High | Three tiers: (1) Web Speech API -- free, local, inconsistent quality across devices; (2) OpenAI TTS -- $15/M chars, 11 voices, consistent quality; (3) ElevenLabs -- best naturalness (82% pronunciation accuracy vs OpenAI's lower scores), 3000+ voices, subscription model. Recommend Web Speech API as free default, cloud TTS as premium upgrade. |
| Shareable story links | "Read this to your kid" -- parents share with partner, grandparents, friends. Organic growth driver. Link previews in iMessage/WhatsApp matter enormously. | Medium | Upstash Redis already in stack. nanoid key + TTL (30-90 days). Route: `/s/[id]`. OG meta tags critical for share previews (theme SVG as OG image). |
| Improved SVG theme illustrations | Warmer, more whimsical nighttime aesthetic on theme tiles elevates the form page from functional to delightful. Sets the bedtime mood before the story even begins. | Low | Design/asset work, not engineering. Replace 18 existing SVGs. Consistent visual language: deep blues, warm golds, soft glows, stars/moons. No new dependencies. |
| Reading font optimization | Current Noto Serif may cause eye strain in dim rooms. Research shows sans-serif fonts cause 25% less eye strain in dark mode, but serif conveys "storybook" feel. | Low | Candidates: Literata (designed for e-readers), Merriweather (dark-mode variant exists), Lora (readable, open). Font size already good at 1.25rem/20px. Line height 1.8 is correct. Ship as user preference or A/B test. |

## Anti-Features

Features to explicitly NOT build in v2.0.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / cloud sync | Auth complexity delays every other feature. Core value is "zero friction to first story." Accounts create friction. | Local-first storage (IndexedDB). Cloud sync deferred to v3.0 once library proves valuable. |
| Story editing / regeneration controls | Breaks bedtime flow. Parent should not be editing text at 8pm with a tired child. Implies story is a draft, not a gift. | "Generate another" button. Each story is complete and final. |
| Custom freeform theme input | Safety risk -- user could input inappropriate themes. Preset list is a safety guardrail disguised as a feature. Harder to generate matching illustrations for freeform themes. | Keep 18 preset themes. Add more curated themes over time. |
| Character-by-character typewriter streaming | Appropriate for ChatGPT chat bubbles; actively bad for 800-word stories. Draws attention to generation process, not content. Disorienting for read-aloud tracking. | Paragraph-reveal with subtle fade-in. Sentence/paragraph chunks, not characters. |
| Auto-play TTS narration | Parent must explicitly choose TTS. Some parents read aloud themselves. Auto-play in a quiet bedroom is disruptive and startling. | Play button, clearly visible but not auto-triggered. |
| Public story index / discover stories | Shared stories contain children's names. Must only be accessible via direct link, never discoverable through search or public feed. | Direct-link-only access. No browsing, no indexing, no sitemap inclusion. |
| Permanent shareable links | Stories contain children's names. Permanent public URLs are a privacy risk. | TTL of 30-90 days. Expired link shows graceful "story has expired" message. |
| Background music / ambient sounds | Scope creep. Audio licensing complexity. Competes with TTS. Parents often run white noise machines already. | TTS narration only. No ambient audio layer. |
| Photorealistic AI illustrations of children | Uncanny valley with AI-generated child faces. Privacy/ethical concerns with realistic child imagery. | Watercolor/painterly illustration style. Scene-focused, not character-portrait-focused. |
| Auto-deletion of saved stories | High emotional attachment to children's stories. "Lila's unicorn story from her birthday" being auto-deleted destroys trust. | No auto-deletion. User-initiated delete only, with confirmation. |

## Feature Dependencies

```
INDEPENDENT (ship anytime, no prerequisites):
  - Screen Wake Lock
  - Improved SVG theme illustrations
  - Reading font evaluation

DEPENDENCY CHAIN:

  Progressive Streaming
       |
       |--- enables ---> Story Library (needs completed story to persist)
       |                      |
       |                      |--- enhances ---> Shareable Links
       |                                         (share from saved stories,
       |                                          or share directly after generation)
       |
       |--- enables ---> TTS Narration (needs story text to read aloud;
       |                   can start per-paragraph as stream completes)
       |
       |--- enables ---> Scene Illustrations (needs story text to derive
                          scene prompts; fires as paragraphs accumulate)
```

### Critical Architecture Decision: Streaming vs. Safety Validation

The v1.0 codebase has a tension that v2.0 MUST resolve:

- **route.ts** streams Anthropic response directly to client WITHOUT safety validation. Fast, but no Haiku safety check.
- **safety.ts** has `generateSafeStory()` that buffers full response, validates with Haiku, then returns. Safe, but no streaming.

The current production code (route.ts) chose speed over safety validation. The `safety.ts` module exists but is NOT called by the route.

**v2.0 options:**

| Option | UX | Safety | Complexity |
|--------|-----|--------|-----------|
| **Buffer-validate-then-stream** (recommended) | ~15-30s wait, then progressive text reveal | Full safety guarantee | Medium -- generate full story, validate, then re-stream validated text to client |
| Stream first, validate in background | First words in 1-2s | Risk: user sees partial unsafe content before halt | High -- race conditions, partial content cleanup |
| Trust prompt engineering only | First words in 1-2s | No post-hoc validation; prompt constraints only | Low -- current approach in route.ts |
| Paragraph-level validation | ~3-5s per paragraph | Catches issues per paragraph | High -- multiple Haiku calls, complex orchestration |

**Recommendation:** Buffer-validate-then-stream for v2.0. Generate full story server-side, run Haiku validation, then stream the validated text to client with paragraph-level fade-in animation. The 15-30s generation wait is acceptable with the existing `LoadingOverlay`. The progressive text reveal after validation gives the "streaming feel" without compromising safety. True real-time streaming with inline safety monitoring is a v3.0 optimization.

### Dependency Details

1. **Progressive Streaming is the foundation.** The current architecture buffers the full response client-side (`await res.text()`), navigates to `/story`, and reads from `sessionStorage`. Streaming requires restructuring: the reading view must render incrementally as text arrives (or simulate progressive reveal of validated text).

2. **Story Library enables Shareable Links.** Sharing a story implies it has an identity (ID, metadata). The library gives stories structure. Shareable links store that same structured data in Redis.

3. **TTS needs story text.** Can begin reading per-paragraph as a buffer-then-stream delivers text, or wait for full story. Either way, the text pipeline must be in place.

4. **Scene Illustrations need story text.** Must extract scene descriptions from accumulated paragraphs to build image prompts. Can fire requests lazily via IntersectionObserver.

## Suggested Build Order

### Wave 1: Foundation (independent, immediate value)
1. **Screen Wake Lock** -- 0.5 days, massive UX win for the core bedtime use case
2. **Reading font evaluation** -- 1 day, improves every story read
3. **Improved SVG theme illustrations** -- 2-3 days (design), no code dependencies

### Wave 2: Core Pipeline (streaming + persistence)
4. **Progressive streaming** (buffer-validate-then-stream) -- 2-3 days, modernizes the feel, resolves safety architecture tension
5. **Story library** (IndexedDB) -- 3-4 days, gives stories longevity and identity

### Wave 3: Sharing + Rich Features
6. **Shareable story links** -- 2 days, builds on story identity from library, uses existing Upstash Redis
7. **AI scene illustrations** -- 4-5 days, image generation API integration, on-demand loading, prompt engineering for consistent style
8. **TTS narration** -- 5-7 days, most complex feature, requires service selection, audio playback UI, sentence highlighting

## MVP Recommendation

**Prioritize for immediate v2.0 impact:**
1. Screen Wake Lock -- solves the most frustrating UX problem, trivial effort
2. Progressive streaming (buffer-validate-then-stream) -- modernizes feel, resolves safety tension
3. Story library -- gives stories longevity, enables sharing
4. Shareable links -- organic growth, partner/grandparent sharing

**Defer to later v2.0 phases:**
- AI scene illustrations: High complexity, per-generation cost, needs prompt engineering for consistent style
- TTS narration: Highest complexity, service selection required, cost implications

**Ship anytime (low effort, no dependencies):**
- SVG illustration refresh: pure asset work
- Font evaluation: A/B test or user preference toggle

## Complexity Budget

| Feature | Eng Days (est) | Risk | Cost Impact |
|---------|---------------|------|-------------|
| Screen Wake Lock | 0.5 | Low | None |
| Reading font evaluation | 1 | Low | None (Google Fonts, free) |
| SVG illustration refresh | 2-3 (design-heavy) | Low | None |
| Progressive streaming | 2-3 | Medium -- safety architecture redesign | None |
| Story library (IndexedDB) | 3-4 | Medium -- Safari eviction edge case | None |
| Shareable links | 2 | Low | Minimal (Upstash Redis already in stack) |
| AI scene illustrations | 4-5 | High -- new API, cost, safety for images | ~$0.04-0.08/image, 2-3/story |
| TTS narration | 5-7 | High -- service selection, cross-device compat | Web Speech: free; OpenAI TTS: ~$0.01/story; ElevenLabs: subscription |

**Total estimate:** 20-26 engineering days for all v2.0 features.

## Sources

- [Screen Wake Lock API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [Wake Lock supported in all browsers - web.dev](https://web.dev/blog/screen-wake-lock-supported-in-all-browsers)
- [Wake Lock browser support - Can I Use](https://caniuse.com/wake-lock)
- [LocalStorage vs IndexedDB guide - DEV Community](https://dev.to/tene/localstorage-vs-indexeddb-javascript-guide-storage-limits-best-practices-fl5)
- [Browser Storage Comparison 2026](https://recca0120.github.io/en/2026/03/06/browser-storage-comparison/)
- [ElevenLabs vs OpenAI TTS - Vapi](https://vapi.ai/blog/elevenlabs-vs-openai)
- [Best TTS APIs 2026 - Speechmatics](https://www.speechmatics.com/company/articles-and-news/best-tts-apis-in-2025-top-12-text-to-speech-services-for-developers)
- [AI Image Generation Models 2026 - Gradually.ai](https://www.gradually.ai/en/ai-image-models/)
- [Dark Mode Typography - Design Shack](https://designshack.net/articles/typography/dark-mode-typography/)
- [Serif fonts in dark mode - TypeDrawers](https://typedrawers.com/discussion/4989/serif-typefaces-that-work-well-in-dark-mode)
- [Streaming Content Monitoring for LLM Safety - arXiv](https://arxiv.org/abs/2506.09996)
- [Upstash Redis URL Shortener Tutorial](https://upstash.com/docs/redis/tutorials/python_url_shortener)
- [Best reading fonts - Fontfabric](https://www.fontfabric.com/blog/best-fonts-for-reading/)
