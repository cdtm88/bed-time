# Phase 2: Core Generation Pipeline - Research

**Researched:** 2026-03-24
**Domain:** Claude API streaming integration via Next.js Edge Runtime
**Confidence:** HIGH

## Summary

Phase 2 fills in the existing `src/app/api/generate/route.ts` stub with a working story generation pipeline. The parent POSTs `{ name, age, theme, duration }`, the route validates inputs, constructs a prompt with age-appropriate vocabulary guidance and word count targets, calls Claude via the Anthropic TypeScript SDK with streaming enabled, and returns a plain text `ReadableStream` of story chunks.

The Anthropic TypeScript SDK (v0.80.0) officially supports Vercel Edge Runtime and provides streaming via `messages.stream()` (high-level with event helpers) or `messages.create({ stream: true })` (low-level async iterable). The `toReadableStream()` convenience method was removed from the SDK in an earlier version, so the route must manually convert the async iterable to a web `ReadableStream` using a standard adapter pattern. This is well-documented in the Next.js ecosystem and straightforward.

**Primary recommendation:** Use `@anthropic-ai/sdk` directly with `messages.create({ stream: true })` and a manual `ReadableStream` adapter. Do not add the Vercel AI SDK -- it is unnecessary overhead for a single-provider, text-only streaming use case.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 18 preset themes: Animals, Dinosaurs, Space & Stars, Ocean & Sea, Fairy Tales, Dragons, Knights & Castles, Trains & Vehicles, Superheroes, Robots, Forest & Nature, Pirates, Magic School, Farm Life, Rainforest, Underwater Adventure, Dreams & Clouds, Holidays & Seasons
- **D-02:** Use claude-sonnet-4-6 for story generation. Cost per story is ~$0.006 at 2000 output tokens.
- **D-03:** Plain text stream. The Edge route returns a ReadableStream of raw story text chunks. No SSE framing. Works with `curl -N`.
- **D-04:** Word count targets based on 150 wpm: 5 min = 750 words, 10 min = 1500 words, 15 min = 2250 words.
- **D-05 (inherited):** Edge Runtime (`export const runtime = "edge"`), already declared in the stub.
- **D-06:** Input validation at the route layer: name (letters/spaces, max 30), age (int 0-10), theme (one of 18), duration (5/10/15). Return 400 for invalid. Name XML-delimited in prompt.
- **D-07:** Age-to-reading-level mapping: 0-3 Toddler, 4-6 Young child, 7-10 Older child.

### Claude's Discretion
- System prompt structure and exact wording
- Whether to use system prompt + user message or single prompt
- How to express word count guidance (target range vs. exact count)
- Error handling approach beyond 400 validation errors

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-01 | Parent can enter a child's name (letters only, max 30 chars) | Input validation pattern in route handler; name XML-delimited in prompt |
| STORY-02 | Parent can enter age; app maps to reading level band (0-3, 4-6, 7-10) | Age mapping utility function; reading level descriptions in system prompt |
| STORY-03 | Parent can select a theme from 18 preset options | Theme validation against const array; theme woven into prompt |
| STORY-04 | Parent can select reading duration (5/10/15 min); app maps to word count | Duration-to-word-count mapping; max_tokens calculated from target |
| SAFE-04 | Name validated (letters/spaces, max 30) and XML-delimited in prompt | Input validation regex + XML wrapping in prompt construction |
| INFRA-02 | All Claude API calls server-side; API key never exposed to frontend | Edge Runtime route handler; env var access server-side only |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | 0.80.0 | Claude API client | Official Anthropic SDK; supports Edge Runtime; built-in streaming |
| next | 16.2.1 | Framework (already installed) | Edge Runtime route handlers; App Router |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No additional dependencies needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @anthropic-ai/sdk direct | Vercel AI SDK (@ai-sdk/anthropic) | Adds abstraction layer, multi-provider support not needed; unnecessary dependency for single-provider text streaming |
| Manual ReadableStream adapter | ai SDK StreamingTextResponse | Deprecated in ai SDK v4+; plain Response with ReadableStream is the standard approach now |

**Installation:**
```bash
npm install @anthropic-ai/sdk
```

**Version verification:** `@anthropic-ai/sdk` v0.80.0 confirmed via npm registry on 2026-03-24.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── generate/
│           └── route.ts        # Edge Runtime POST handler (exists, fill in)
├── lib/
│   ├── schemas.ts              # Input validation schemas and types
│   ├── prompts.ts              # Prompt construction (system + user)
│   └── age-levels.ts           # Age-to-reading-level mapping
└── ...
```

### Pattern 1: Async Iterator to ReadableStream Adapter
**What:** Convert the SDK's async iterable stream into a web `ReadableStream` for the Response.
**When to use:** Every streaming response from Claude in an Edge route handler.
**Why needed:** The SDK's `toReadableStream()` method was removed. The standard web API pattern is to construct a `ReadableStream` manually.
**Example:**
```typescript
// Source: Next.js docs + standard web platform pattern
function iteratorToStream(iterator: AsyncIterator<any>): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      if (
        value.type === "content_block_delta" &&
        value.delta.type === "text_delta"
      ) {
        controller.enqueue(encoder.encode(value.delta.text));
      }
    },
  });
}
```

### Pattern 2: System Prompt + User Message Separation
**What:** Use the SDK's `system` parameter (string) for persona/rules, and `messages` array for the specific story request.
**When to use:** Every Claude API call in this project.
**Example:**
```typescript
// Source: Anthropic SDK docs
const stream = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  system: "You are a bedtime story writer...",  // system prompt as string
  messages: [
    { role: "user", content: "Write a story about..." }
  ],
  stream: true,
});
```

### Pattern 3: Input Validation at Route Boundary
**What:** Validate all inputs at the top of the POST handler before any API calls.
**When to use:** Every request to the generate endpoint.
**Example:**
```typescript
// Source: D-06 locked decision
const VALID_THEMES = [
  "Animals", "Dinosaurs", "Space & Stars", "Ocean & Sea",
  "Fairy Tales", "Dragons", "Knights & Castles", "Trains & Vehicles",
  "Superheroes", "Robots", "Forest & Nature", "Pirates",
  "Magic School", "Farm Life", "Rainforest", "Underwater Adventure",
  "Dreams & Clouds", "Holidays & Seasons",
] as const;

const VALID_DURATIONS = [5, 10, 15] as const;

// Name: letters and spaces only, max 30 chars
const NAME_REGEX = /^[a-zA-Z\s]{1,30}$/;
```

### Pattern 4: XML-Delimited Name in Prompt (SAFE-04)
**What:** Wrap the child's name in XML tags within the prompt to prevent prompt injection.
**When to use:** Every prompt construction.
**Example:**
```typescript
// Source: SAFE-04 requirement + Anthropic prompt engineering best practices
const userMessage = `Write a bedtime story for a child named <child_name>${name}</child_name> about ${theme}.`;
```

### Anti-Patterns to Avoid
- **Hardcoding model name in multiple places:** Define `MODEL` as a constant in one place. The model is `claude-sonnet-4-6` (locked decision D-02). The actual model ID string should be verified at implementation time.
- **Returning SSE format:** Decision D-03 explicitly requires plain text stream, not SSE. Do not use `text/event-stream` content type.
- **Using `messages.stream()` when only text chunks are needed:** The high-level `.stream()` builds up a full message object in memory. Since we only need text deltas, use `messages.create({ stream: true })` for lower memory usage.
- **Exposing error details from Claude API:** Never leak API error internals or model response metadata to the client. Return generic 500 errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Claude API client | HTTP fetch wrapper with SSE parsing | @anthropic-ai/sdk | SSE parsing, retry logic, error typing, streaming helpers are complex |
| Input sanitization | Custom regex collection | Centralized validation module with typed schemas | Keeps validation testable and consistent |

**Key insight:** The Anthropic SDK handles retries (2 by default), error classification (RateLimitError, AuthenticationError, etc.), and SSE decoding internally. Building a custom HTTP client would miss edge cases in SSE parsing that the SDK already handles.

## Common Pitfalls

### Pitfall 1: max_tokens Too Low for Target Word Count
**What goes wrong:** Claude stops mid-sentence because `max_tokens` is set too close to the target word count.
**Why it happens:** Tokens != words. English averages ~1.3 tokens per word, but varies. A 2250-word story needs ~3000+ tokens.
**How to avoid:** Set `max_tokens` with a buffer. For 2250 words, use `max_tokens: 4096`. For 1500 words, `max_tokens: 3000`. For 750 words, `max_tokens: 1500`.
**Warning signs:** Stories ending abruptly with `stop_reason: "max_tokens"` instead of `"end_turn"`.

### Pitfall 2: Edge Runtime Module Compatibility
**What goes wrong:** Importing Node.js-specific modules in an Edge route causes build errors.
**Why it happens:** Edge Runtime has a restricted API surface -- no `fs`, no `path`, no `Buffer` (use `Uint8Array`).
**How to avoid:** Only use web-standard APIs. The `@anthropic-ai/sdk` explicitly supports Edge Runtime, so SDK imports are safe. Do not import any Node.js built-in modules in route.ts or its dependencies.
**Warning signs:** Build errors mentioning "module not found" for Node.js built-ins.

### Pitfall 3: Forgetting to Handle API Key Missing
**What goes wrong:** Route crashes with an unhelpful error when `ANTHROPIC_API_KEY` is not set.
**Why it happens:** The SDK constructor reads from `process.env.ANTHROPIC_API_KEY` by default but throws if undefined.
**How to avoid:** Check for the env var at startup or use try/catch around client instantiation. Return a 500 with a generic message.
**Warning signs:** Unhandled AuthenticationError on first request.

### Pitfall 4: TextEncoder in Streaming
**What goes wrong:** Stream sends raw strings instead of encoded bytes, causing garbled output.
**Why it happens:** `ReadableStream` controller expects `Uint8Array`, not `string`.
**How to avoid:** Always use `new TextEncoder().encode(text)` before `controller.enqueue()`.
**Warning signs:** Garbled or empty response body in curl.

### Pitfall 5: Word Count Guidance Ignored by Model
**What goes wrong:** Claude generates stories significantly shorter or longer than the target.
**Why it happens:** Vague or buried word count instructions in the prompt.
**How to avoid:** State word count target clearly and prominently in the system prompt. Use a target range (e.g., "approximately 1400-1600 words") rather than an exact number. Reinforce with "This story should take about 10 minutes to read aloud."
**Warning signs:** Consistent undershoot/overshoot across multiple generations.

## Code Examples

### Complete Route Handler Pattern
```typescript
// Source: Anthropic SDK docs + Next.js Edge Runtime docs
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

const client = new Anthropic();
// API key read from process.env.ANTHROPIC_API_KEY automatically

export async function POST(request: Request) {
  // 1. Parse and validate input
  const body = await request.json();
  const error = validateInput(body);
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, age, theme, duration } = body;

  // 2. Build prompt
  const readingLevel = getReadingLevel(age);
  const wordCount = getWordCount(duration);
  const systemPrompt = buildSystemPrompt(readingLevel, wordCount);
  const userMessage = buildUserMessage(name, theme);

  // 3. Stream from Claude
  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: getMaxTokens(duration),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      stream: true,
    });

    // 4. Convert async iterable to ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    // Generic error -- never expose API internals
    return new Response(
      JSON.stringify({ error: "Story generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

### Age-to-Reading-Level Mapping
```typescript
// Source: D-07 locked decision
type ReadingLevel = "toddler" | "young_child" | "older_child";

interface ReadingLevelConfig {
  level: ReadingLevel;
  description: string;
}

function getReadingLevel(age: number): ReadingLevelConfig {
  if (age <= 3) {
    return {
      level: "toddler",
      description:
        "Very simple sentences. Familiar, everyday words. Repetition encouraged. Short paragraphs.",
    };
  }
  if (age <= 6) {
    return {
      level: "young_child",
      description:
        "Short sentences with some descriptive language. Gentle complexity. Simple dialogue.",
    };
  }
  return {
    level: "older_child",
    description:
      "Longer sentences with richer vocabulary. More involved narrative. Descriptive imagery.",
  };
}
```

### Duration-to-Word-Count and max_tokens Mapping
```typescript
// Source: D-04 locked decision
const DURATION_CONFIG = {
  5:  { words: 750,  maxTokens: 1500 },
  10: { words: 1500, maxTokens: 3000 },
  15: { words: 2250, maxTokens: 4096 },
} as const;

function getWordCount(duration: 5 | 10 | 15): number {
  return DURATION_CONFIG[duration].words;
}

function getMaxTokens(duration: 5 | 10 | 15): number {
  return DURATION_CONFIG[duration].maxTokens;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Stream.toReadableStream()` | Manual `ReadableStream` constructor with async iteration | Removed from SDK (pre-v0.30) | Must write adapter; ~10 lines of code |
| Vercel AI SDK `StreamingTextResponse` | `new Response(readableStream)` with web standard API | Deprecated in ai SDK v4+ | No wrapper needed; use plain Response |
| `experimental-edge` runtime | `edge` runtime | Next.js 16 | Already using correct value in stub |
| `claude-3-5-sonnet-20241022` | `claude-sonnet-4-6` | Early 2025 | Use new model name per D-02 |

**Deprecated/outdated:**
- `StreamingTextResponse` from `ai` package: Deprecated. Use standard `new Response(readableStream)`.
- `experimental-edge`: Removed in Next.js 16. Use `edge`.

## Open Questions

1. **Exact model ID string for claude-sonnet-4-6**
   - What we know: Decision D-02 says "claude-sonnet-4-6". The SDK docs show model strings like `claude-opus-4-6` and `claude-sonnet-4-5-20250929`.
   - What's unclear: Whether the exact string is `claude-sonnet-4-6` or requires a date suffix.
   - Recommendation: Use `claude-sonnet-4-6` as specified. The SDK will return a clear error if the model ID is invalid. Verify at implementation time with a test curl.

2. **System prompt wording for consistent word count**
   - What we know: Word count targets are locked (750/1500/2250). Claude generally follows word count guidance.
   - What's unclear: Exact prompt wording that reliably produces stories within 10% of target.
   - Recommendation: Use a range ("approximately 1400-1600 words") and reinforce with reading duration context. This is in Claude's discretion per CONTEXT.md. Tune in Phase 6 (quality tuning).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build & dev server | Yes | v23.11.0 | -- |
| npm | Package installation | Yes | 11.11.1 | -- |
| Next.js | Framework | Yes | 16.2.1 | -- |
| ANTHROPIC_API_KEY | Claude API calls | Needs .env.local | -- | Cannot proceed without it |

**Missing dependencies with no fallback:**
- `ANTHROPIC_API_KEY` must be set in `.env.local` before testing. The `.env.local.example` template exists from Phase 1.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (to be installed -- no test framework exists yet) |
| Config file | `vitest.config.ts` (Wave 0) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-01 | Name validation: letters/spaces only, max 30 chars | unit | `npx vitest run src/lib/__tests__/schemas.test.ts -t "name"` | No -- Wave 0 |
| STORY-02 | Age maps to correct reading level band | unit | `npx vitest run src/lib/__tests__/age-levels.test.ts` | No -- Wave 0 |
| STORY-03 | Theme must be one of 18 valid options | unit | `npx vitest run src/lib/__tests__/schemas.test.ts -t "theme"` | No -- Wave 0 |
| STORY-04 | Duration maps to correct word count and max_tokens | unit | `npx vitest run src/lib/__tests__/schemas.test.ts -t "duration"` | No -- Wave 0 |
| SAFE-04 | Name XML-delimited in prompt output | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "xml"` | No -- Wave 0 |
| INFRA-02 | API key not in response headers or body | integration | Manual curl verification (cannot unit test Edge Runtime env var isolation) | Manual only |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install vitest: `npm install -D vitest`
- [ ] `vitest.config.ts` -- basic config with src alias resolution
- [ ] `src/lib/__tests__/schemas.test.ts` -- covers STORY-01, STORY-03, STORY-04
- [ ] `src/lib/__tests__/age-levels.test.ts` -- covers STORY-02
- [ ] `src/lib/__tests__/prompts.test.ts` -- covers SAFE-04 (XML delimiter check)

## Sources

### Primary (HIGH confidence)
- [Anthropic TypeScript SDK official docs](https://platform.claude.com/docs/en/api/sdks/typescript) -- SDK usage, streaming, Edge Runtime support, error handling, retries
- [Anthropic SDK helpers.md](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md) -- MessageStream API, event types, streaming helpers
- [Anthropic SDK streaming examples](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/examples/streaming.ts) -- Working streaming code patterns
- npm registry -- @anthropic-ai/sdk v0.80.0 confirmed current

### Secondary (MEDIUM confidence)
- [Next.js Route Handlers docs](https://nextjs.org/docs/app/api-reference/file-conventions/route) -- Edge Runtime route handler patterns
- [GitHub Issue #292](https://github.com/anthropics/anthropic-sdk-typescript/issues/292) -- Edge Runtime streaming fix (resolved)
- [Next.js ReadableStream discussion](https://github.com/vercel/next.js/discussions/50614) -- Async iterator to ReadableStream conversion pattern

### Tertiary (LOW confidence)
- Word count accuracy guidance -- based on general prompt engineering experience, not verified against specific model behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- single dependency (@anthropic-ai/sdk), officially supports Edge Runtime, version verified
- Architecture: HIGH -- well-documented patterns, existing stub to fill in, locked decisions constrain choices
- Pitfalls: MEDIUM -- Edge Runtime streaming issue was fixed but worth monitoring; word count adherence needs runtime validation

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (SDK is stable; model name should be verified if much time passes)
