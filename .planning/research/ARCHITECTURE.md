# Architecture Research

**Domain:** AI-powered bedtime story generator web app
**Researched:** 2026-03-23
**Confidence:** MEDIUM (based on training data for LLM app patterns; web search unavailable for verification)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │  Input Form   │  │ Loading/     │  │  Reading Mode     │     │
│  │  (name, age,  │  │ Progress     │  │  (fullscreen,     │     │
│  │  theme, dur.) │  │ Screen       │  │  dim-friendly)    │     │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘     │
│         │                 │                     ▲               │
├─────────┴─────────────────┴─────────────────────┼───────────────┤
│                     API Layer                    │               │
│  ┌──────────────────────────────────────────────┐│               │
│  │              /api/generate-story             ││               │
│  │  ┌────────────────────────────────────────┐  ││               │
│  │  │          Request Validation            │  ││               │
│  │  └──────────────┬─────────────────────────┘  ││               │
│  │                 ▼                             ││               │
│  │  ┌────────────────────────────────────────┐  ││               │
│  │  │     Prompt Engineering Service         │  ││               │
│  │  │  (age mapping, theme, duration calc)   │  ││               │
│  │  └──────────────┬─────────────────────────┘  ││               │
│  │                 ▼                             ││               │
│  │  ┌────────────────────────────────────────┐  ││               │
│  │  │       Claude API Client                │  ││               │
│  │  │  (streaming story generation)          │  ││               │
│  │  └──────────────┬─────────────────────────┘  ││               │
│  │                 ▼                             ││               │
│  │  ┌────────────────────────────────────────┐  ││               │
│  │  │       Safety Evaluation Layer          │  ││               │
│  │  │  (validate → retry or reject)          │──┘│               │
│  │  └────────────────────────────────────────┘   │               │
│  └───────────────────────────────────────────────┘               │
├──────────────────────────────────────────────────────────────────┤
│                    External Services                             │
│  ┌──────────────────────────────────────────────┐                │
│  │            Anthropic Claude API              │                │
│  │  (Messages API, streaming responses)         │                │
│  └──────────────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Input Form | Collect child name, age, theme, duration | React component with controlled inputs, preset theme selector |
| Loading Screen | Show progress while story generates | Streaming indicator or animated placeholder; receives SSE/streaming chunks |
| Reading Mode | Display finished story fullscreen | Dedicated route/view; large serif font, dark background, no chrome |
| API Route | Orchestrate generation pipeline | Next.js API route or server action; single endpoint |
| Request Validator | Sanitize and validate inputs | Zod schema; reject bad inputs before hitting Claude |
| Prompt Engineering Service | Build Claude prompt from inputs | Pure function: inputs -> system prompt + user message |
| Claude API Client | Call Anthropic API, handle streaming | Anthropic SDK; streaming for perceived speed |
| Safety Evaluation Layer | Validate story safety, manage retries | Post-generation check + retry loop (max 2 retries) |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home — input form
│   ├── story/
│   │   └── page.tsx            # Reading mode (receives story via state/params)
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # Story generation API endpoint
│   └── layout.tsx              # Root layout, global styles
├── components/
│   ├── story-form.tsx          # Input form component
│   ├── theme-selector.tsx      # Theme picker (preset list)
│   ├── duration-selector.tsx   # Reading duration picker
│   ├── loading-screen.tsx      # Generation progress display
│   └── story-reader.tsx        # Full-screen reading mode component
├── lib/
│   ├── prompts/
│   │   ├── system-prompt.ts    # Base system prompt for Claude
│   │   ├── story-prompt.ts     # Story generation prompt builder
│   │   └── safety-prompt.ts    # Safety evaluation prompt
│   ├── claude.ts               # Anthropic SDK client wrapper
│   ├── safety.ts               # Safety check + retry orchestration
│   ├── age-mapping.ts          # Age -> reading level band mapping
│   ├── duration.ts             # Duration -> word count / complexity mapping
│   └── validation.ts           # Zod schemas for request validation
├── types/
│   └── story.ts                # Shared TypeScript types
└── styles/
    └── reading-mode.css        # Dedicated reading mode styles
```

### Structure Rationale

- **app/:** Next.js App Router convention. Only two real pages (form + reading mode) plus one API route keeps routing minimal.
- **components/:** Flat component directory is fine for an app this size. No need for atomic design or nested folders with fewer than 10 components.
- **lib/prompts/:** Prompts are isolated as their own module because they are the core product logic. They will be iterated constantly and need to be easy to find and modify without touching application code.
- **lib/:** Business logic separated from UI. Every file here is independently testable. The safety module is its own file because it orchestrates a multi-step flow (generate -> evaluate -> retry/reject).

## Architectural Patterns

### Pattern 1: Server-Side Generation with Streaming Response

**What:** Story generation runs entirely server-side. The API route calls Claude, streams the response back to the client via Server-Sent Events (SSE). The client progressively renders text as chunks arrive.

**When to use:** Always for MVP. Claude API keys must never reach the client. Streaming gives the user visual feedback during the 5-15 second generation time.

**Trade-offs:** Streaming adds some complexity to both the API route and client-side rendering, but the UX improvement is significant. A 10-second blank wait feels broken; streaming text feels alive.

**Example:**
```typescript
// api/generate/route.ts — simplified
export async function POST(req: Request) {
  const input = storyInputSchema.parse(await req.json());
  const prompt = buildStoryPrompt(input);

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: calculateMaxTokens(input.duration),
    system: getSystemPrompt(input.ageGroup),
    messages: [{ role: 'user', content: prompt }],
  });

  // Return as SSE stream to client
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### Pattern 2: Two-Phase Generation (Generate then Validate)

**What:** Story generation and safety validation are two distinct phases. Phase 1 generates the full story. Phase 2 evaluates it for safety. If validation fails, Phase 1 reruns with a modified prompt (up to N retries). If all retries fail, a friendly error is returned.

**When to use:** This is the safety architecture specified in the requirements.

**Trade-offs:** Two-phase means the user waits for both generation AND validation. This doubles latency if done naively. Mitigation: validate the story as it streams (accumulate chunks, run safety check on the completed text). The user sees streaming text, and the safety check runs immediately after completion. If the story fails, the stream is "replaced" with a retry (show a brief "polishing your story..." message).

**Important design decision:** Do NOT stream an unsafe story to the client and then yank it away. Buffer the full story server-side, validate, then stream to the client only after it passes. This means the user waits for full generation + validation before seeing any text, but there is no risk of showing unsafe content.

**Example:**
```typescript
// lib/safety.ts
const MAX_RETRIES = 2;

export async function generateSafeStory(input: StoryInput): Promise<SafeStoryResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const story = await generateStory(input, attempt);
    const safetyResult = await evaluateSafety(story, input);

    if (safetyResult.safe) {
      return { success: true, story };
    }
    // Retry with adjusted prompt hints based on what failed
  }
  return { success: false, error: 'friendly-error' };
}
```

### Pattern 3: Prompt as Product Logic

**What:** The system prompt and prompt template are the core product. They encode tone, narrative structure, age-appropriateness, duration targeting, and safety guardrails. Treat prompts as first-class code: version-controlled, well-commented, parameterized.

**When to use:** Always. The prompt IS the product for an AI generation app.

**Trade-offs:** Prompts are inherently fragile and hard to test deterministically. Mitigate with example-based testing (run prompt, check output properties) rather than exact-match testing.

**Key prompt components:**
- **System prompt:** Persona (children's story author), tone (calming, bedtime-appropriate), constraints (no violence, no scary content, no leaving home alone, etc.)
- **Age band calibration:** Toddler (0-3): simple sentences, repetition, familiar objects. Young child (4-6): short chapters, simple conflict, animal characters. Older child (7-10): real narrative arc, richer vocabulary, light themes.
- **Duration mapping:** 5 min ~ 500-700 words. 10 min ~ 1000-1400 words. 15 min ~ 1500-2100 words.
- **Personalization:** Child's name woven into narrative (as protagonist or named character), theme integrated into plot.

## Data Flow

### Story Generation Flow (Primary Flow)

```
[Parent fills form]
    ↓
[Client: POST /api/generate with {name, age, theme, duration}]
    ↓
[Server: Validate input (Zod schema)]
    ↓ (invalid → 400 error)
[Server: Map age → reading level band]
    ↓
[Server: Map duration → target word count + complexity]
    ↓
[Server: Build system prompt + user prompt]
    ↓
[Server: Call Claude API (full generation, not streaming to client yet)]
    ↓
[Server: Receive complete story text]
    ↓
[Server: Run safety evaluation (second Claude call with safety prompt)]
    ↓ (unsafe → retry from prompt building, max 2 retries)
    ↓ (all retries fail → return friendly error)
[Server: Stream validated story to client via SSE]
    ↓
[Client: Render story progressively in reading mode]
    ↓
[Client: Transition to full reading mode when complete]
```

### State Management

This app has minimal client-side state. No global store needed.

```
[Form State] (React useState / form library)
    ↓ (submit)
[Generation State] (loading | streaming | complete | error)
    ↓
[Story State] (accumulated story text from stream)
    ↓
[Reading Mode] (display final story, no further state changes)
```

No Redux, no Zustand, no context providers. React component state is sufficient for this flow. The app is essentially a stateless pipeline: input -> generate -> display.

### Key Data Flows

1. **Input to prompt:** Form data is validated, age is mapped to a reading level band (pure function), duration is mapped to word count target, then all parameters are interpolated into a prompt template. This is the most important data transformation in the app.
2. **Claude response to display:** The Claude API returns streaming text chunks. Server accumulates the full response, validates safety, then re-streams to the client. Client appends chunks to a string state variable and renders.
3. **Safety retry loop:** On safety failure, the system modifies the prompt (adds explicit constraints based on what failed) and regenerates. This loop is entirely server-side; the client only sees a longer wait time.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users | Monolith is perfect. Single Next.js app on Vercel. No database, no caching. |
| 100-1k users | Add rate limiting per IP to prevent abuse. Consider basic request logging. Claude API costs become a real concern (~$0.01-0.05 per story). |
| 1k-10k users | Add a database (stories table) to cache/save generated stories. Add basic analytics. Consider Anthropic API rate limits and request queuing. |
| 10k+ users | User accounts (planned post-MVP). Story caching to reduce redundant API calls. CDN for static assets. Queue-based generation for burst handling. |

### Scaling Priorities

1. **First bottleneck: Claude API rate limits and cost.** Each story requires 1-2 API calls (generation + safety check, potentially more on retries). At scale, implement request queuing and consider caching stories for common theme+age combinations.
2. **Second bottleneck: Serverless function timeout.** Story generation can take 10-30 seconds. Vercel's default timeout is 10s (free) or 60s (pro). Need Pro plan or use edge-compatible streaming to keep the connection alive.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Claude API Calls

**What people do:** Put the Anthropic API key in client-side code (even in environment variables exposed to the browser) and call Claude directly from the frontend.
**Why it's wrong:** API key is exposed to anyone inspecting network requests. Trivially exploitable. Also prevents server-side safety validation.
**Do this instead:** All Claude API calls go through your server-side API route. The API key lives in server-only environment variables.

### Anti-Pattern 2: Streaming Unsafe Content to Users

**What people do:** Stream the Claude response directly to the client in real-time, then run safety checks after the user has already read part of the story.
**Why it's wrong:** If the story contains inappropriate content, the user sees it before you can catch it. You cannot un-show text.
**Do this instead:** Buffer the complete story server-side, run the safety check, then stream the validated story to the client. The slight increase in perceived latency is worth the guarantee of safety.

### Anti-Pattern 3: Monolithic Prompt String

**What people do:** Build prompts as one giant concatenated string with inline conditionals and hardcoded values.
**Why it's wrong:** Prompts are the core product logic. A monolithic string is impossible to test, hard to iterate, and prone to subtle bugs when you change one part and break another.
**Do this instead:** Decompose prompts into composable sections (system persona, age calibration, theme instructions, duration guidance, safety constraints). Each section is a function that returns a string. The final prompt is assembled from these parts. Each section can be tested independently.

### Anti-Pattern 4: Over-Engineering State Management

**What people do:** Set up Redux/Zustand/MobX for a form-to-display app with no persistent state.
**Why it's wrong:** This app has three states: filling form, generating story, reading story. That is linear, one-directional flow with no shared state between components. A state management library adds complexity and indirection for zero benefit.
**Do this instead:** React useState for form fields, a single generation status state, and the story text. Pass via props or use a simple context if the component tree gets deep (unlikely with 2 pages).

### Anti-Pattern 5: Complex Retry Logic Without Bounds

**What people do:** Retry indefinitely on safety failures, or retry with the exact same prompt hoping for different output.
**Why it's wrong:** Unbounded retries waste API credits and make the user wait forever. Same prompt may produce similar unsafe content repeatedly.
**Do this instead:** Cap retries at 2 (3 total attempts). On each retry, modify the prompt to add explicit constraints addressing what the safety check flagged. If all attempts fail, return a graceful error. The error should feel friendly: "We could not create a story right now. Please try a different theme."

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic Claude API | Anthropic TypeScript SDK (`@anthropic-ai/sdk`) | Use `messages.create()` with streaming. Model: Claude Sonnet for cost/speed balance. Haiku for safety evaluation calls (cheaper, faster, sufficient for classification). |
| Vercel (hosting) | Next.js deployment | Use serverless functions for API route. Set function timeout appropriately (30s minimum). Edge runtime is NOT suitable because the Anthropic SDK uses Node.js APIs. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client <-> API Route | HTTP POST + SSE stream | Single endpoint. Client sends JSON, receives event stream. |
| API Route <-> Prompt Service | Direct function call | Same process. Prompt service is a pure function, no I/O. |
| API Route <-> Claude Client | Async function call | Wrapper around Anthropic SDK. Returns full text (not stream) for safety check. |
| API Route <-> Safety Service | Async function call | Orchestrates retry loop. Returns SafeStoryResult. |
| Safety Service <-> Claude Client | Async function call | Safety evaluation is a separate, smaller Claude call. |

## Build Order (Dependency Graph)

The architecture implies this build sequence:

```
Phase 1: Foundation
├── Project setup (Next.js, TypeScript, Tailwind)
├── lib/validation.ts (Zod schemas — no external deps)
├── lib/age-mapping.ts (pure function — no external deps)
├── lib/duration.ts (pure function — no external deps)
└── types/story.ts (shared types)

Phase 2: Core Generation Pipeline
├── lib/claude.ts (Anthropic SDK wrapper — needs API key)
├── lib/prompts/system-prompt.ts (prompt templates)
├── lib/prompts/story-prompt.ts (prompt builder, depends on age-mapping + duration)
└── api/generate/route.ts (wires it all together, no safety yet)

Phase 3: Safety Layer
├── lib/prompts/safety-prompt.ts (safety evaluation prompt)
├── lib/safety.ts (retry orchestration, depends on claude.ts + prompts)
└── Update api/generate/route.ts to use safety pipeline

Phase 4: UI — Input Form
├── components/story-form.tsx
├── components/theme-selector.tsx
├── components/duration-selector.tsx
└── app/page.tsx (home page with form)

Phase 5: UI — Reading Experience
├── components/loading-screen.tsx
├── components/story-reader.tsx
├── app/story/page.tsx (reading mode page)
└── styles/reading-mode.css (dim-room optimized styles)
```

**Why this order:**
- Foundation types and pure functions have zero dependencies — build and test them first.
- The generation pipeline is the core product risk. Get it working end-to-end (even via curl) before building UI.
- Safety layer wraps the generation pipeline — it needs a working pipeline to test against.
- UI is last because it is the lowest-risk, most-changeable layer. Building UI before the API is stable leads to rework.

## Safety Architecture Deep Dive

Safety is the most architecturally significant requirement. Here is the detailed design:

### Safety Strategy: Defense in Depth

1. **Input sanitization** (first line): Validate and constrain inputs. Preset theme list prevents injection via theme. Name is sanitized (strip special characters, cap length). Age is bounded (0-12).

2. **Prompt-level safety** (second line): The system prompt explicitly instructs Claude to produce safe, age-appropriate content. It includes a detailed negative list (no violence, no death, no abandonment, no scary imagery, no real-world dangers, no bathroom humor for young ages, etc.).

3. **Output validation** (third line): After generation, a separate Claude call evaluates the story against safety criteria. This uses a smaller, cheaper model (Haiku) with a focused classification prompt: "Is this story safe and age-appropriate for a [age-band] child? Reply YES or NO with brief reasoning."

4. **Retry with guidance** (fourth line): If safety check fails, the system retries generation with additional prompt constraints derived from the safety check's reasoning. For example, if the safety check flags "story includes a character getting lost in a dark forest," the retry prompt adds "the story must not include characters being lost or in dark/scary settings."

5. **Graceful failure** (final line): After max retries, display a warm, friendly message. Never show the unsafe story. Never blame the user.

### Safety Prompt Design

The safety evaluation prompt should be:
- **Binary:** Return SAFE or UNSAFE (not a score or scale)
- **Specific:** List exact criteria to check against
- **Age-aware:** Different criteria for toddlers vs older children
- **Fast:** Use Claude Haiku for speed and cost; safety classification does not need a large model
- **Conservative:** When in doubt, flag as unsafe (false positives are much better than false negatives)

### Cost of Safety

Each story generation costs:
- 1x Claude Sonnet call for story (~$0.003-0.015 depending on length)
- 1x Claude Haiku call for safety check (~$0.0003-0.001)
- On retry: additional Sonnet + Haiku calls
- Worst case (2 retries): 3x Sonnet + 3x Haiku ~ $0.01-0.05 per story

This is acceptable for MVP. At scale, consider caching safety-validated stories.

## Sources

- Anthropic Claude API documentation (training data, not live-verified)
- Next.js App Router patterns (training data)
- General LLM application architecture patterns (training data)

**Confidence note:** Web search was unavailable during this research. All recommendations are based on training data knowledge of these technologies. The core architectural patterns (server-side generation, safety validation, streaming) are well-established and unlikely to have changed, but specific API details (SDK methods, model names, pricing) should be verified against current Anthropic documentation before implementation.

---
*Architecture research for: AI bedtime story generator*
*Researched: 2026-03-23*
