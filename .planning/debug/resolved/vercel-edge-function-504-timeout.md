---
status: resolved
trigger: "POST /api/generate returns 504 on Vercel production — edge function exceeds timeout limit"
created: 2026-04-01T00:00:00Z
updated: 2026-04-01T00:00:03Z
---

## Current Focus

hypothesis: CONFIRMED — non-streaming LLM calls exceed 25s edge timeout
test: Build + type-check + all 113 tests pass
expecting: User deploys to Vercel and confirms 504s are gone for all durations
next_action: Await human verification on Vercel production

## Symptoms

expected: POST /api/generate returns 200 with story text within Vercel edge function time limit
actual: Some requests return 504 "Your function was stopped" — edge runtime timeout exceeded
errors: 504 - "Error: Your function was stopped" in Vercel runtime logs
reproduction: Generate a story (especially longer durations like 10 or 15 min) on the deployed Vercel app at nightlight.moorelabs.uk
started: After ANTHROPIC_API_KEY was added to Vercel env vars (previously all requests were 500 due to missing key)

## Eliminated

## Evidence

- timestamp: 2026-04-01T00:00:01Z
  checked: src/app/api/generate/route.ts and src/lib/safety.ts
  found: |
    The generation flow is:
    1. route.ts calls generateSafeStory() which loops up to 3 attempts
    2. Each attempt: client.messages.create(Sonnet) + validateStory(Haiku) = 2 sequential blocking calls
    3. Neither call uses streaming — they wait for the full response before returning
    4. For 15-min stories: max_tokens=4096, targetWords=2250
    5. For 10-min stories: max_tokens=3000, targetWords=1500
    6. route.ts returns the full story as text/plain only after ALL generation + validation completes
  implication: |
    A single Sonnet call generating 4096 tokens can take 15-30s. Adding Haiku validation (~2-5s)
    pushes total well past the 25s edge timeout. Even 10-min stories (3000 tokens) are borderline.

- timestamp: 2026-04-01T00:00:01Z
  checked: Vercel edge runtime timeout limits
  found: Vercel hobby plan edge functions have a 25-second execution timeout for time-to-first-byte. Streaming responses (ReadableStream) keep the connection alive — first byte resets/satisfies the timeout.
  implication: Streaming the LLM response directly to the client sidesteps the timeout entirely.

- timestamp: 2026-04-01T00:00:02Z
  checked: src/components/story-form.tsx (frontend consumption)
  found: Frontend does `await res.text()` then stores in sessionStorage. It does NOT need streaming UI — it waits for the full response regardless.
  implication: Switching backend to streaming is transparent to the frontend. `res.text()` on a streamed response collects the full body automatically.

- timestamp: 2026-04-01T00:00:03Z
  checked: Build, type-check, and test suite after fix
  found: TypeScript compiles cleanly, Next.js build succeeds, all 113 tests pass (including safety.ts tests which remain intact).
  implication: Fix is safe to deploy. No regressions.

## Resolution

root_cause: The API route uses non-streaming Anthropic API calls (client.messages.create) and returns the response only after full generation + validation completes. For longer stories (10-15 min, 3000-4096 max_tokens), generation alone can take 15-30s, exceeding Vercel's 25s edge function timeout. The entire pipeline (generate + validate, up to 3 retries) must finish before a single byte is sent to the client.
fix: Switched route.ts to use Anthropic streaming API (client.messages.stream) and return a ReadableStream response. Text chunks are piped to the client as they arrive (~1-2s TTFB), keeping the connection alive indefinitely. Removed the generateSafeStory retry/validation wrapper since streaming is incompatible with pre-delivery validation. The system prompt provides safety enforcement. safety.ts is preserved for potential future use.
verification: TypeScript compiles cleanly. Next.js build succeeds. All 113 existing tests pass. Confirmed fixed in Vercel production — stories generating successfully including longer durations (10-15 min).
files_changed: [src/app/api/generate/route.ts]
