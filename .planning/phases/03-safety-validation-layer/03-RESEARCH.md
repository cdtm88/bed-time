# Phase 3: Safety Validation Layer - Research

**Researched:** 2026-03-24
**Domain:** Anthropic API (non-streaming), content safety classification, retry patterns
**Confidence:** HIGH

## Summary

Phase 3 transforms the `/api/generate` route from a streaming endpoint to a buffered-then-validate-then-return endpoint. The core work is: (1) collect the full story text from a non-streaming Sonnet call, (2) send it to Haiku for safety classification, (3) retry with a reinforced prompt if flagged unsafe, and (4) return a friendly error if all attempts fail.

The implementation is straightforward because the Anthropic SDK already supports non-streaming `messages.create()` calls that return a `Message` object directly. No new dependencies are needed. The main complexity is designing the retry orchestration loop cleanly and crafting effective validation/reinforcement prompts.

**Primary recommendation:** Extract safety validation into `src/lib/safety.ts` with a `validateStory()` function and a `generateSafeStory()` orchestrator. Keep the route handler thin -- it delegates to the orchestrator and maps the result to an HTTP response.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Route no longer streams. Returns complete story as plain text (`Content-Type: text/plain`). Phase 5 handles loading UX.
- **D-02:** Use `claude-haiku-4-5-20251001` for post-generation validation. Separate Anthropic call.
- **D-03:** Validator returns parseable format (`SAFE` or `UNSAFE: <reason>`). Parsing robust to whitespace/casing.
- **D-04:** Strict flagging -- flag any doubt. Includes mild peril, cartoon violence, anything a cautious parent of 0-10 year old might find inappropriate. False positives acceptable.
- **D-05:** Up to 2 retries (3 total attempts). Each retry uses a reinforced safety prompt.
- **D-06:** Retries are silent -- parent sees nothing during retries.
- **D-07:** Final failure returns JSON error: `"We weren't able to create a story right now. Please try again."` -- warm, non-technical.
- **D-08:** Error HTTP status remains 500 for consistency.

### Claude's Discretion
- Exact validation prompt wording (must meet D-04 strictness)
- Exact retry system prompt additions (must meaningfully reinforce safety)
- Whether to extract into `src/lib/` utility or keep inline (utility preferred for testability)

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SAFE-01 | Every story passes multi-layer content filtering: prompt-level safety + separate post-generation validation via lightweight model | Haiku validation call pattern, validator prompt design, non-streaming SDK usage |
| SAFE-02 | If validation flags unsafe, silently retry with reinforced prompt (up to 2 retries) | Retry orchestration pattern, reinforced system prompt design |
| SAFE-03 | If all retries fail, display friendly error -- never show unsafe story | Error response pattern, orchestrator return type design |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | 0.80.0 | Anthropic API calls (generation + validation) | Already installed, used in Phase 2 |
| next | 16.2.1 | Edge Runtime route handler | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 3.2.4 | Unit testing for validation logic | Testing safety module |

No new packages needed. Phase 3 uses only the existing Anthropic SDK.

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    safety.ts           # NEW: validateStory() + generateSafeStory() orchestrator
    prompts.ts          # MODIFIED: add buildReinforcedSystemPrompt(), buildValidationPrompt()
    __tests__/
      safety.test.ts    # NEW: tests for validation parsing + retry logic
  app/
    api/
      generate/
        route.ts        # MODIFIED: buffered flow, delegates to safety orchestrator
```

### Pattern 1: Non-Streaming Anthropic SDK Call
**What:** Use `messages.create()` without `stream: true` to get a complete `Message` object.
**When to use:** Both story generation (buffered) and Haiku validation call.
**Example:**
```typescript
// Source: @anthropic-ai/sdk types (verified in node_modules)
const message = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 100,
  messages: [{ role: "user", content: storyText }],
  system: validationPrompt,
});

// Extract text from response
const text = message.content
  .filter((block) => block.type === "text")
  .map((block) => block.text)
  .join("");
```

### Pattern 2: Orchestrator with Typed Result
**What:** A function that encapsulates the generate-validate-retry loop and returns a discriminated union.
**When to use:** The route handler calls this single function and maps the result.
**Example:**
```typescript
type SafeStoryResult =
  | { ok: true; story: string }
  | { ok: false; reason: "all_attempts_failed" | "generation_error" };

async function generateSafeStory(
  client: Anthropic,
  params: GenerationParams
): Promise<SafeStoryResult> {
  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const reinforced = attempt > 0;
    const story = await generateStory(client, params, reinforced);
    const safe = await validateStory(client, story);
    if (safe) return { ok: true, story };
  }
  return { ok: false, reason: "all_attempts_failed" };
}
```

### Pattern 3: Validation Response Parsing
**What:** Parse Haiku's response robustly, handling whitespace and casing variations.
**When to use:** After every Haiku validation call.
**Example:**
```typescript
function parseValidationResponse(raw: string): { safe: boolean; reason?: string } {
  const trimmed = raw.trim().toUpperCase();
  if (trimmed === "SAFE") return { safe: true };
  if (trimmed.startsWith("UNSAFE")) {
    const reason = raw.trim().replace(/^UNSAFE[:\s]*/i, "").trim() || undefined;
    return { safe: false, reason };
  }
  // Unparseable response = treat as unsafe (fail closed)
  return { safe: false, reason: "Unparseable validation response" };
}
```

### Pattern 4: Route Handler Change (Streaming to Buffered)
**What:** Replace the ReadableStream construction with a direct non-streaming call.
**When to use:** The route handler POST function.
**Example:**
```typescript
// BEFORE (Phase 2): streaming
const stream = await client.messages.create({ ...params, stream: true });
const readable = new ReadableStream({ ... });
return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

// AFTER (Phase 3): buffered + validated
const result = await generateSafeStory(client, generationParams);
if (result.ok) {
  return new Response(result.story, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
return new Response(
  JSON.stringify({ error: "We weren't able to create a story right now. Please try again." }),
  { status: 500, headers: { "Content-Type": "application/json" } }
);
```

### Anti-Patterns to Avoid
- **Streaming then buffering:** Do not stream the generation and buffer the chunks manually. Use a non-streaming `messages.create()` call directly -- simpler and the SDK handles it.
- **Inline retry logic in route handler:** Keep the route handler thin. Extract the generate-validate-retry loop into `src/lib/safety.ts`.
- **Fail-open validation parsing:** If Haiku returns something unparseable, treat it as UNSAFE, not SAFE. Always fail closed.
- **Sharing the same system prompt on retry:** Retries must add explicit safety reinforcement to the system prompt, not just repeat the same call.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Anthropic API calls | Custom fetch wrapper | `@anthropic-ai/sdk` `messages.create()` | Already in use, handles auth/errors/retries/types |
| Text extraction from Message | Custom content parser | `.content.filter(b => b.type === "text").map(b => b.text).join("")` | Standard SDK pattern, handles multi-block responses |

**Key insight:** This phase needs no new dependencies. The Anthropic SDK's non-streaming mode and a second model call are the only tools required.

## Common Pitfalls

### Pitfall 1: Edge Runtime Timeout on 3 Attempts
**What goes wrong:** With 3 generation + 3 validation calls (worst case), total latency could approach Vercel Edge timeout.
**Why it happens:** Sonnet generation for a 15-minute story (2250 words, 4096 max tokens) takes 10-20 seconds. Three attempts = 30-60 seconds for generation alone.
**How to avoid:** Edge Runtime on Vercel has no hard timeout for streaming responses, but since Phase 3 switches to buffered responses, the standard Edge function timeout (25 seconds on free tier) may apply. The non-streaming call itself can take longer, but Vercel may kill the function. Monitor this -- if it becomes an issue, the generation call can remain streaming internally (collect chunks) while the response to client is buffered.
**Warning signs:** 504 Gateway Timeout errors on longer stories with retries.

### Pitfall 2: Haiku Response Format Drift
**What goes wrong:** Haiku returns conversational text instead of the exact `SAFE`/`UNSAFE: reason` format.
**Why it happens:** LLMs can be unpredictable with strict format adherence, especially with simple prompts.
**How to avoid:** Use a very explicit system prompt that constrains output format. Consider using `max_tokens: 50` to prevent verbose responses. Parse defensively -- check for "SAFE" anywhere in a short response, but fail closed on anything ambiguous.
**Warning signs:** Validation always returning unsafe despite safe stories.

### Pitfall 3: Retry Prompt Not Different Enough
**What goes wrong:** Retries produce the same type of content that was flagged, leading to all 3 attempts failing.
**Why it happens:** Simply re-running with the same prompt gets similar output. The reinforced prompt must explicitly exclude the categories that tend to trigger flags.
**How to avoid:** The reinforced system prompt should add explicit constraints: "This story MUST NOT contain any conflict, peril, danger, scary elements, villains, or tension. Focus exclusively on warmth, comfort, wonder, and calm."
**Warning signs:** High rate of all-3-attempts-failed errors in production.

### Pitfall 4: Exposing Validation Internals to Client
**What goes wrong:** Error messages or response headers leak information about the validation/retry process.
**Why it happens:** Developers add debugging info that reaches the client.
**How to avoid:** The only error the client ever sees is the D-07 message. Log retry details server-side (console.log in Edge Runtime goes to Vercel logs) but never include them in the response.
**Warning signs:** Client-visible error messages mentioning "validation", "unsafe", or "retry".

## Code Examples

### Validation Prompt Design (Claude's Discretion)
```typescript
// Meets D-04 strictness criteria
export function buildValidationPrompt(): string {
  return `You are a children's bedtime story safety reviewer. Your job is to determine if a story is appropriate for a parent to read to a child aged 0-10 at bedtime.

A story is UNSAFE if it contains ANY of the following:
- Violence of any kind (cartoon, implied, or explicit)
- Scary or horror elements (frightening monsters, nightmares, sinister characters)
- Death or dying (characters, animals, implied)
- Real-world dangers (strangers, injuries, natural disasters)
- Anything unsettling or anxiety-inducing
- Mild peril (a child briefly lost, slightly scared, in danger)
- Any content a cautious parent might find inappropriate for bedtime

When in doubt, flag as UNSAFE.

Respond with EXACTLY one of:
- SAFE
- UNSAFE: <brief reason>

Do not include any other text in your response.`;
}
```

### Reinforced System Prompt Addition (Claude's Discretion)
```typescript
export function buildReinforcedSystemPrompt(
  readingLevel: ReadingLevelConfig,
  targetWords: number
): string {
  const basePrompt = buildSystemPrompt(readingLevel, targetWords);
  return `${basePrompt}

CRITICAL SAFETY REQUIREMENTS — this story must be completely safe for bedtime:
- NO conflict, peril, danger, villains, or tension of any kind
- NO scary elements, no monsters (even friendly ones that could seem scary), no darkness as a threat
- NO characters getting lost, hurt, scared, or in any risky situation
- Focus ONLY on warmth, comfort, wonder, gentle discovery, and calm
- The story should feel like a warm hug — nothing that could make a child anxious
- Every character is kind, every situation is safe, every outcome is peaceful`;
}
```

### Non-Streaming Generation Call
```typescript
async function generateStory(
  client: Anthropic,
  params: GenerationParams,
  reinforced: boolean
): Promise<string> {
  const systemPrompt = reinforced
    ? buildReinforcedSystemPrompt(params.readingLevel, params.targetWords)
    : buildSystemPrompt(params.readingLevel, params.targetWords);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: params.maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: params.userMessage }],
  });

  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Streaming response to client | Buffered generation + validation + return | Phase 3 (now) | Response contract changes from ReadableStream to complete text body |
| Single generation call | Generate + validate + retry loop | Phase 3 (now) | Multiple API calls per request; latency increase but safety guaranteed |

**Note:** The Anthropic SDK v0.80.0 supports both streaming and non-streaming calls via the same `messages.create()` method. The `stream` parameter controls the behavior and return type.

## Open Questions

1. **Edge Runtime timeout with buffered responses**
   - What we know: Edge Runtime has no timeout for streaming responses. Switching to buffered may impose Vercel's function timeout (25s free tier).
   - What's unclear: Whether `await client.messages.create()` (non-streaming) counts as a single long-running operation or if Vercel kills it at 25s.
   - Recommendation: Test with a 15-minute story (longest). If timeout occurs, keep generation as streaming internally (collect chunks into a string) while returning a buffered response to the client. This preserves the no-timeout behavior.

2. **Haiku cost at scale**
   - What we know: Haiku is $1/M input, $5/M output tokens. A 2250-word story is roughly 3000 tokens input to Haiku.
   - What's unclear: Validation cost per story (~$0.003 input + negligible output) -- trivial, but worth noting.
   - Recommendation: Not a concern for MVP. Log validation call counts for monitoring.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/safety.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SAFE-01 | Story passes through Haiku validation before display | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "validation"` | No -- Wave 0 |
| SAFE-02 | Retry with reinforced prompt on unsafe flag (up to 2 retries) | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "retry"` | No -- Wave 0 |
| SAFE-03 | Friendly error after all retries fail, never shows unsafe story | unit | `npx vitest run src/lib/__tests__/safety.test.ts -t "error"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/__tests__/safety.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/safety.test.ts` -- covers SAFE-01, SAFE-02, SAFE-03 (validation parsing, retry orchestration, error handling)
- [ ] Mock pattern for Anthropic SDK `messages.create()` -- needed to test without real API calls

## Sources

### Primary (HIGH confidence)
- `@anthropic-ai/sdk` v0.80.0 type definitions -- verified `messages.create()` non-streaming signature, `Message` type, `TextBlock` type
- Existing codebase: `src/app/api/generate/route.ts`, `src/lib/prompts.ts`, `src/lib/schemas.ts` -- verified current patterns

### Secondary (MEDIUM confidence)
- [Anthropic Claude Haiku 4.5 model page](https://www.anthropic.com/claude/haiku) -- confirmed model ID `claude-haiku-4-5-20251001`
- [Anthropic models overview](https://platform.claude.com/docs/en/about-claude/models/overview) -- confirmed model availability

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, verified SDK types directly
- Architecture: HIGH -- patterns follow existing codebase conventions, SDK types verified
- Pitfalls: MEDIUM -- timeout behavior under Vercel Edge is the main uncertainty

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable domain, no fast-moving dependencies)
