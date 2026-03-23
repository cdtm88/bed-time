# Project Research Summary

**Project:** Bedtime Story Generator
**Domain:** AI-powered children's content generation (parent-read bedtime stories)
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Executive Summary

This is a single-purpose AI generation app: a parent enters a child's name, age, theme, and desired reading duration, and the app produces a calming, age-appropriate bedtime story via Claude. Experts build apps like this as thin wrappers around LLM APIs with server-side generation, streaming responses, and layered content safety. The recommended stack is intentionally minimal -- Next.js 16 with App Router, Tailwind CSS 4, the Anthropic TypeScript SDK, and Zod for validation. No database, no auth, no state management library. The complexity lives in prompt engineering and the reading experience, not infrastructure.

The recommended approach is to treat the prompt as the product and the reading screen as the primary surface. The generation pipeline (input validation, age/duration mapping, prompt construction, Claude API call, safety validation, retry logic) should be built and testable via curl before any UI work begins. The reading screen -- dark/warm background, large serif font, Wake Lock, no chrome -- deserves as much design attention as the generation logic because parents spend 5-15 minutes reading and 30 seconds on the form.

The dominant risk is content safety. This is a children's product where a single inappropriate story destroys trust permanently. The mitigation is defense in depth: constrained inputs (preset themes, sanitized name field), a safety-focused system prompt, post-generation validation via a cheaper model (Haiku), retry with modified prompts (capped at 2 retries), and graceful failure. Secondary risks are LLM latency (mitigated by streaming), bland story quality (mitigated by investing in prompt engineering), and API cost spiraling from retries (mitigated by strong first-pass prompts and cost monitoring).

## Key Findings

### Recommended Stack

An intentionally minimal stack for a form-to-display app with one API integration. Every library earns its place.

**Core technologies:**
- **Next.js 16.2:** Full-stack framework -- App Router for server components, API routes keep the Claude key server-side, Turbopack for dev speed
- **Tailwind CSS 4.2:** Utility-first CSS with built-in dark mode variants, Typography plugin for the reading experience, no runtime overhead
- **@anthropic-ai/sdk ^0.80.0:** Direct Anthropic SDK for full control over prompts, streaming, retries -- no abstraction layer needed for a single-model app
- **Zod ^3.25:** Input/output validation shared between client and server; compatible with the Anthropic SDK for structured output
- **Vercel:** Zero-config deployment for Next.js with edge functions and generous free tier

**What to avoid:** Vercel AI SDK (unnecessary abstraction for single-provider), databases (no data to persist in MVP), auth libraries (zero-friction first use), state management libraries (form + display flow needs only useState), LangChain (massive dependency for one API call).

### Expected Features

**Must have (table stakes):**
- Child name personalization (name woven naturally into narrative)
- Age-appropriate content calibration (vocabulary, sentence length, complexity per age band)
- Preset theme selection (15-20 curated themes; no freeform input)
- Reading duration control (5/10/15 minutes mapped to word counts)
- Multi-layer safety filtering (prompt + validation + retry + graceful failure)
- Mobile-first dim-room reading view (dark/warm, large text, no chrome)
- Streaming response display (first text within 1-2 seconds)
- Narrative arc with calming wind-down design (the core differentiator)
- No account required (zero friction to first story)

**Should have (add after validation):**
- Story history via local storage
- Sibling support (multiple child names)
- Dim-room UI refinements (amber mode, brightness presets)
- Reading duration accuracy tuning (calibrate against real read-aloud timing)
- Offline story caching

**Defer (v2+):**
- User accounts and saved profiles
- AI-generated story illustrations
- Multi-voice TTS narration with ambient sounds
- Themed story series / continuing adventures
- Native iOS app
- Freeform theme input (moderated)

**Anti-features (do not build):** Freeform prompts (safety nightmare), child-facing UI (COPPA, screen time), social sharing (moderation burden), gamification/streaks (undermines calm purpose), interactive branching stories (extends bedtime, breaks wind-down arc).

### Architecture Approach

A server-rendered monolith with two pages (form + reading mode) and one API endpoint. All generation runs server-side with a generate-then-validate pipeline. The client receives only validated, safe stories via SSE streaming. State management is React useState -- no global store needed for a linear form-to-display flow.

**Major components:**
1. **Input Form** -- Collects name, age, theme, duration with client+server validation
2. **Prompt Engineering Service** -- Pure functions that map inputs to structured Claude prompts (system prompt + user message); the core product logic
3. **Claude API Client** -- Anthropic SDK wrapper handling streaming, token limits, and error classification
4. **Safety Evaluation Layer** -- Post-generation validation via cheaper model (Haiku), retry orchestration with modified prompts, graceful failure
5. **Reading Mode** -- Fullscreen dark/warm display with large serif font, Wake Lock, no navigation chrome

**Key architectural decision:** Do NOT stream stories directly to the client during generation. Buffer the full story server-side, validate safety, THEN stream the validated text to the client. This prevents showing unsafe content and then yanking it away.

### Critical Pitfalls

1. **Single-layer safety filtering** -- One check will eventually fail. Implement defense in depth: input constraints, prompt-level safety, output validation, retry with guidance, graceful failure. Address in Phase 1.
2. **Prompt injection via the name field** -- The only user-provided text interpolated into the prompt. Validate aggressively (30 char max, alpha only, XML-delimited in prompt). Address in Phase 1.
3. **LLM latency destroying the bedtime moment** -- 15-30 second waits are unacceptable in context. Stream responses, show personality in loading states, set hard timeouts. Address in Phase 1.
4. **Stories that sound AI-generated** -- Bland, preachy, formulaic stories kill retention. Invest in prompt engineering: narrative voice, sensory language, varied structures, example openings. Ongoing from Phase 1.
5. **Reading screen as an afterthought** -- The reading screen IS the product (5-15 min vs 30 sec on form). Dark/warm background, large serif font, Wake Lock, short line lengths, no chrome. Address in Phase 1.
6. **API costs spiraling from retries** -- Each retry doubles the cost. Strong first-pass prompts minimize retries. Use Haiku for validation. Track retry rates. Budget early.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Core Pipeline
**Rationale:** The architecture research identifies a clear dependency chain: types and validation first, then the generation pipeline, then safety. All three must exist before any UI makes sense. This phase proves the core product works (even via curl) before investing in presentation.
**Delivers:** Working story generation pipeline with safety validation, callable via API
**Addresses:** Input validation, age mapping, duration mapping, prompt engineering, Claude API integration, safety evaluation with retry logic, rate limiting
**Avoids:** Single-layer safety (Pitfall 1), prompt injection (Pitfall 2), unbounded retries (Pitfall 7), API key exposure

### Phase 2: Input UI
**Rationale:** With the pipeline proven, build the form that feeds it. The input form is low-risk and well-understood (4 controlled inputs + preset selectors). Group it separately from the reading experience because they have different design concerns.
**Delivers:** Parent-facing input form with theme picker, duration selector, name/age inputs, client-side validation
**Addresses:** Child name personalization, preset theme selection, reading duration control, no-account-required flow
**Avoids:** Freeform input (anti-feature), over-engineered state management (Anti-pattern 4)

### Phase 3: Reading Experience
**Rationale:** The reading screen is the primary product surface. It deserves its own phase because it requires specific UX attention: dark/warm theme, typography, Wake Lock, streaming text rendering, mobile optimization. Rushing it as "just display the text" is a documented pitfall.
**Delivers:** Fullscreen dim-room reading mode with streaming text display, loading states with personality, error states
**Addresses:** Mobile-friendly dim-room reading view, streaming response display, calming wind-down presentation
**Avoids:** Reading screen as afterthought (Pitfall 6), LLM latency perception (Pitfall 3), non-streaming rendering

### Phase 4: Story Quality and Calibration
**Rationale:** With the full loop working (form -> generate -> read), this phase focuses on the quality of the output. Prompt refinement, age calibration accuracy, duration accuracy, and narrative variety are best tuned with the full system in place.
**Delivers:** Refined prompts producing genuinely good stories with accurate age calibration and duration targeting
**Addresses:** Narrative arc quality, calming wind-down language design (core differentiator), age-appropriate calibration, reading duration accuracy
**Avoids:** Bland/formulaic stories (Pitfall 4), age calibration that does not work (Pitfall 5)

### Phase 5: Polish, Monitoring, and Post-Launch Features
**Rationale:** After the core product is solid, add the should-have features that improve retention and operational visibility. Story history, sibling support, and cost monitoring are all low-complexity additions that build on the existing foundation.
**Delivers:** Story history (local storage), sibling support, API cost monitoring, expanded theme list, offline caching
**Addresses:** Story history/favorites, sibling support, dim-room UI refinements, cost tracking
**Avoids:** API cost spiraling (Pitfall 7) via monitoring

### Phase Ordering Rationale

- **Pipeline before UI** because the generation pipeline is the core product risk and the architecture research explicitly recommends proving it works before building UI. Building UI first leads to rework when the API shape changes.
- **Input form before reading mode** because you need the form to drive the pipeline during development, but the reading mode is its own phase because it deserves dedicated design attention (not tacked onto the form phase).
- **Quality tuning after full loop** because prompt refinement requires seeing stories rendered in context. You cannot tune "calming wind-down" quality without reading the story in a dark room on a phone.
- **Monitoring and extras last** because they build on a stable foundation and are not needed for initial validation.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Safety layer):** The two-phase generate-then-validate pattern needs careful API design. Research specific Claude safety classification prompts and structured output for binary safe/unsafe decisions.
- **Phase 3 (Reading experience):** Wake Lock API browser compatibility (especially Safari iOS), streaming text rendering performance on mobile, and warm-amber color palette design need investigation.
- **Phase 4 (Story quality):** Prompt engineering is iterative and domain-specific. No amount of upfront research replaces testing with real parents reading aloud.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Input form):** Standard React form with controlled inputs, preset selectors, and Zod validation. Well-documented patterns.
- **Phase 5 (Polish/monitoring):** Local storage, cost dashboards, and feature additions are all established patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies (Next.js 16, Tailwind 4, Anthropic SDK) verified against official sources. Minor version uncertainty on TypeScript and Zod. |
| Features | MEDIUM | Based on training data knowledge of competitors (Oscar Stories, Sleepytales, DreamyTales). Competitor features may have changed; spot-check before finalizing. |
| Architecture | MEDIUM | Server-side generation with streaming and safety validation is a well-established LLM app pattern. Specific SDK method signatures should be verified. |
| Pitfalls | MEDIUM-HIGH | Safety, prompt injection, and latency are well-documented concerns in LLM apps. Children's content safety is a well-understood domain. |

**Overall confidence:** MEDIUM -- the patterns and technologies are well-established, but web search was unavailable during research. Specific API details (model names, pricing, SDK methods) should be verified against current Anthropic documentation before implementation begins.

### Gaps to Address

- **Claude model pricing and rate limits:** Exact current pricing for Sonnet and Haiku should be verified to set per-story cost budgets. Rate limits affect architecture at scale.
- **Vercel serverless function timeout:** Free tier has 10-second timeout which is insufficient for story generation (10-30s). Confirm Pro tier timeout limits and pricing.
- **Wake Lock API on Safari iOS:** Browser support and behavior should be verified -- Safari has historically been inconsistent with this API.
- **Competitor feature verification:** Feature research is based on training data. Spot-check Oscar Stories, Sleepytales, and DreamyTales before finalizing the differentiator strategy.
- **Read-aloud word count calibration:** The assumed 130-150 wpm for parent read-aloud needs empirical validation with actual parents and actual generated stories.

## Sources

### Primary (HIGH confidence)
- Next.js 16.2 release blog (nextjs.org/blog) -- verified March 2026
- Anthropic TypeScript SDK v0.80.0 releases (github.com/anthropics/anthropic-sdk-typescript) -- verified March 2026
- Tailwind CSS v4.2 blog (tailwindcss.com/blog) -- verified

### Secondary (MEDIUM confidence)
- Training data knowledge of competitor apps (Oscar Stories, Sleepytales, DreamyTales, Moshi)
- Training data knowledge of LLM safety patterns, prompt injection, COPPA
- Children's literacy research on read-aloud pacing (~100-150 wpm)
- General LLM application architecture patterns

### Tertiary (LOW confidence)
- TypeScript ~5.7 version (accept whatever ships with Next.js 16)
- Zod ^3.25 compatibility (verify on install)
- ESLint/Prettier versions (non-critical, accept latest stable)

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
