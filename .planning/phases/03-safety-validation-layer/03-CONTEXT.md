# Phase 3: Safety Validation Layer - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Every generated story passes through a separate validation call (claude-haiku-4-5) before it can reach a parent. If validation fails, the system silently retries story generation (up to 2 retries) with a reinforced safety prompt. If all retries fail, the parent sees a friendly error — never an unsafe story. No frontend UI in scope (that is Phase 4/5). The route handler changes from a pure streaming endpoint to a buffered-then-return endpoint.

</domain>

<decisions>
## Implementation Decisions

### Display Behavior (Architecture Change)
- **D-01:** After Phase 3, the `/api/generate` route **no longer streams progressively to the client**. The route buffers the full generated story internally, validates it, then returns the complete story as a single response (plain text, same `Content-Type: text/plain` header). Phase 5 (Reading Experience) will handle the loading state UX — the API contract simply changes from a ReadableStream to a complete text body.

### Validator Model & Response Format
- **D-02:** Use **claude-haiku-4-5-20251001** for post-generation validation. It is a separate Anthropic call, not part of the generation call.
- **D-03:** Validator returns a structured response — Claude should prompt Haiku to respond with a simple, parseable format (e.g., `SAFE` or `UNSAFE: <reason>`). Parsing must be robust to minor whitespace/casing variation.

### Validator Strictness Criteria
- **D-04:** **Strict — flag any doubt.** The validator should flag the story as unsafe if it contains any of the following:
  - Violence of any kind (cartoon, implied, or explicit)
  - Scary or horror elements (frightening monsters, nightmares, sinister characters)
  - Death or dying (characters, animals, implied)
  - Real-world dangers (strangers, injuries, natural disasters)
  - Anything unsettling or anxiety-inducing
  - Mild peril (a child briefly lost, slightly scared, in danger) — **flag it**
  - Any content a cautious parent of a 0–10 year old might find inappropriate at bedtime
  - When in doubt: **flag as unsafe**
  False positives are acceptable — retries are cheap; showing an unsafe story is not.

### Retry Strategy
- **D-05:** Up to 2 retries (3 total attempts: 1 original + 2 retries). Each retry uses a **reinforced safety prompt** — the system prompt is modified to add explicit safety constraints beyond the baseline (e.g., "This story MUST contain no scary elements, no peril, no conflict — only warmth and calm"). Claude's discretion on exact retry prompt wording.
- **D-06:** Retries are **silent** — the parent sees nothing during retries; the request simply takes longer.

### Error Response
- **D-07:** If all 3 attempts fail validation, return a JSON error response (same shape as existing 500 errors) with the message: `"We weren't able to create a story right now. Please try again."` — warm, non-technical, no hint of what went wrong.
- **D-08:** The error HTTP status should remain **500** to maintain consistency with existing error handling in `route.ts`.

### Claude's Discretion
- Exact validation prompt wording — Claude designs the Haiku prompt to meet D-04 strictness criteria
- Exact retry system prompt additions — should meaningfully reinforce safety beyond the baseline
- Whether to extract the validation and retry logic into a `src/lib/` utility or keep it inline in the route handler (utility preferred for testability)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — SAFE-01, SAFE-02, SAFE-03 are all mapped to this phase
- `.planning/ROADMAP.md` — Phase 3 success criteria (Haiku validates before display, 2 retries on failure, friendly error on exhaustion)

### Prior Phase Context
- `.planning/phases/01-project-scaffolding/01-CONTEXT.md` — D-03 (Edge Runtime locked)
- `.planning/phases/02-core-generation-pipeline/02-CONTEXT.md` — D-02 (claude-sonnet-4-6 for generation), D-03 (plain text response format), D-06 (input validation pattern in route)

### Existing Implementation
- `src/app/api/generate/route.ts` — the file Phase 3 modifies; currently streams via ReadableStream, Phase 3 changes this to buffered response
- `src/lib/prompts.ts` — `buildSystemPrompt()` is the function Phase 3 modifies for retry attempts

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/generate/route.ts` — Phase 3 modifies this file directly; generation logic (lines 42–67) currently returns a ReadableStream; Phase 3 replaces this with a buffer-validate-retry-return flow
- `src/lib/prompts.ts` — `buildSystemPrompt()` used for generation; Phase 3 may need a `buildSafetySystemPrompt(reinforced: boolean)` variant or a separate `buildValidationPrompt(story: string)` function
- `src/lib/schemas.ts` — validation pattern already established; new Haiku response parsing can follow the same approach

### Established Patterns
- Separate Anthropic client instantiation (`const client = new Anthropic()`) at module level
- JSON error responses with `{ error: "..." }` shape and HTTP status codes
- Utility functions in `src/lib/` (age-levels, prompts, schemas) — validation logic should follow this pattern

### Integration Points
- `src/app/api/generate/route.ts` — the only file that needs significant modification
- `src/lib/` — new utility for safety validation logic (validator prompt + retry orchestration)
- The response contract changes: `ReadableStream` (text/plain streaming) → `string` body (text/plain, complete)

</code_context>

<specifics>
## Specific Ideas

- Validator strictness: "flag any doubt" — explicitly includes mild peril like a child briefly getting lost. The bar is: would a cautious parent of a 0–10 year old be comfortable? If not certain → flag.
- The display architecture change (no more streaming) is intentional and accepted. Phase 5 owns the loading UX.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-safety-validation-layer*
*Context gathered: 2026-03-24*
