# Phase 7: Nightlight Tales Branding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 07-nightlight-tales-branding
**Areas discussed:** README scope, Open Graph / social metadata, Favicon

---

## README Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Title + 1-2 sentence description | Rename heading and add a brief description only | |
| Title only | Just fix the H1, nothing else | |
| Title + setup instructions | Full rewrite with install/run steps | |
| User clarified | Full detailed README with key features and setup steps | ✓ |

**User's choice:** Detailed README — key features + setup steps
**Notes:** User clarified mid-question that they want the README to be detailed, covering key features and setup steps.

---

## Open Graph / Social Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Add minimal OG tags | og:title + og:description in layout.tsx | ✓ |
| Defer — not MVP priority | Skip OG tags entirely for now | |

**User's choice:** Add minimal OG tags
**Notes:** No additional follow-up needed — clear choice.

---

## Favicon

| Option | Description | Selected |
|--------|-------------|----------|
| Defer — needs real design | Leave default Next.js favicon | |
| Simple text/emoji favicon | Add moon emoji 🌙 as placeholder | ✓ |
| Add a branded icon now | Source/create a proper icon | |

**User's choice:** Simple moon emoji (🌙) placeholder
**Notes:** Removes the generic Next.js default without requiring design assets.

---

## Claude's Discretion

- `package.json` name field: `"bed-time"` → `"nightlight-tales"` (obvious fix, not discussed)
- `layout.tsx` and `story-form.tsx` already correct — no changes

## Deferred Ideas

- Proper branded favicon — needs design work, deferred
- OG image — requires designed asset, deferred
- Twitter Card metadata — low priority until sharing is a focus
