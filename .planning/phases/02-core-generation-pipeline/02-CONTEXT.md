# Phase 2: Core Generation Pipeline - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the `/api/generate` Edge Runtime endpoint so that a POST request with `name`, `age`, `theme`, and `duration` returns a streamed, personalized bedtime story via Claude. Testable via curl. No frontend UI in scope — that is Phase 4. No safety validation layer in scope — that is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Theme List
- **D-01:** 18 preset themes (locked):
  Animals, Dinosaurs, Space & Stars, Ocean & Sea, Fairy Tales, Dragons, Knights & Castles, Trains & Vehicles, Superheroes, Robots, Forest & Nature, Pirates, Magic School, Farm Life, Rainforest, Underwater Adventure, Dreams & Clouds, Holidays & Seasons

### Claude Model
- **D-02:** Use **claude-sonnet-4-6** for story generation. Quality is the priority for the core product. Cost per story is ~$0.006 at 2000 output tokens — acceptable.

### Streaming Response Format
- **D-03:** Plain text stream. The Edge route returns a `ReadableStream` of raw story text chunks. No SSE framing. Works with `curl -N` for testing; Phase 4/5 frontend consumes it as a `ReadableStream`.

### Word Count Targets
- **D-04:** Based on 150 wpm adult reading-aloud pace:
  - 5 min → 750 words
  - 10 min → 1500 words
  - 15 min → 2250 words
  Passed to Claude as target word count in the prompt.

### Streaming (from Phase 1)
- **D-05 (inherited from Phase 1 D-03):** The route uses **Next.js Edge Runtime** — already declared in the stub (`export const runtime = "edge"`). Edge Runtime has no Vercel timeout, required for 10–30s generation times.

### Input Validation
- **D-06:** The API endpoint validates all inputs at the route layer (not deferred to Phase 4):
  - `name`: letters and spaces only, max 30 characters (SAFE-04)
  - `age`: integer 0–10
  - `theme`: must be one of the 18 locked themes
  - `duration`: must be 5, 10, or 15
  - Return 400 with a descriptive error for invalid inputs
  - Name is XML-delimited in the prompt to prevent prompt injection (SAFE-04)

### Age → Reading Level Mapping
- **D-07:** Map age to reading level band internally (not exposed in the API):
  - 0–3 → Toddler: very simple sentences, familiar words, repetition encouraged
  - 4–6 → Young child: short sentences, some descriptive language, gentle complexity
  - 7–10 → Older child: longer sentences, richer vocabulary, more involved narrative

### Claude's Discretion
- System prompt structure and exact wording — Claude designs the prompt to meet the phase success criteria
- Whether to use a system prompt + user message or a single prompt structure
- How to express word count guidance in the prompt (target range vs. exact count)
- Error handling approach beyond 400 validation errors (e.g., API failures, timeout handling)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — STORY-01, STORY-02, STORY-03, STORY-04, SAFE-04, INFRA-02 are all mapped to this phase
- `.planning/ROADMAP.md` — Phase 2 success criteria (curl testable, name woven in, vocabulary differs by age, length scales with duration, API key never in client code)

### Prior Phase Decisions
- `.planning/phases/01-project-scaffolding/01-CONTEXT.md` — D-03 (Edge Runtime streaming locked), D-04 (folder structure: `src/app/api/generate/route.ts` is the integration point), D-05 (App Router)

### Design System (not in scope for Phase 2, but note for future)
- `.planning/DESIGN.md` — Phase 2 is backend only; design system applies starting Phase 4

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/generate/route.ts` — Edge Runtime POST stub already exists. Phase 2 fills this in. No other reusable code yet.

### Established Patterns
- TypeScript throughout (established in Phase 1)
- Edge Runtime for API routes (locked in Phase 1 D-03)
- `src/` directory layout (D-04 from Phase 1)

### Integration Points
- `src/app/api/generate/route.ts` — the only file Phase 2 implements
- `src/lib/` — utility functions (age mapping, theme validation, prompt construction) live here
- `ANTHROPIC_API_KEY` — available via environment variable (`.env.local.example` created in Phase 1); must stay server-side only (INFRA-02)

</code_context>

<specifics>
## Specific Ideas

- No specific UX references or "I want it like X" moments — this phase is pure backend pipeline
- curl testability is an explicit success criterion: `curl -X POST /api/generate -d '{"name":"Lily","age":5,"theme":"Dragons","duration":10}'` should stream story text

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-generation-pipeline*
*Context gathered: 2026-03-24*
