# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## vercel-edge-function-504-timeout — Non-streaming LLM calls exceed Vercel edge 25s timeout
- **Date:** 2026-04-01
- **Error patterns:** 504, edge function timeout, Your function was stopped, generate, Vercel, timeout, LLM, Anthropic
- **Root cause:** The API route used non-streaming Anthropic API calls and returned the response only after full generation + validation completed. For longer stories (3000-4096 max_tokens), generation alone took 15-30s, exceeding Vercel's 25s edge function timeout.
- **Fix:** Switched to Anthropic streaming API (client.messages.stream) returning a ReadableStream. Text chunks pipe to the client as they arrive (~1-2s TTFB), keeping the connection alive indefinitely.
- **Files changed:** src/app/api/generate/route.ts
---

