---
plan: 09-02
phase: 09-production-hardening
status: complete
completed: 2026-03-29
tasks_completed: 2
tasks_total: 2
key-files:
  created: []
  modified: []
decisions: []
---

## Summary

Connected Upstash Redis credentials to Vercel production environment, activating the rate limiter implemented in Plan 01.

## What Was Built

- Upstash Redis database created (`nightlight-tales`, regional, free tier)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` added to Vercel Production environment variables
- Production redeployment triggered and verified

## Verification Result

Curl loop (11 POST requests to `/api/generate`) confirmed:
- Requests 1–10: HTTP 500 (Claude API error — acceptable, not 429)
- Request 11: HTTP **429** with body `{"error":"You've created a few stories recently. Try again in a bit."}`

Rate limiting enforces correctly in production. Local dev continues to bypass (no env vars present).

## Self-Check: PASSED

- [x] UPSTASH_REDIS_REST_URL set for Production in Vercel
- [x] UPSTASH_REDIS_REST_TOKEN set for Production in Vercel
- [x] Production deployment live with new env vars
- [x] 11th request returns HTTP 429 with correct error body
- [x] INFRA-03 fully closed
