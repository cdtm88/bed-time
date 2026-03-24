# Phase 3: Safety Validation Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 03-safety-validation-layer
**Areas discussed:** Display behavior, Validator criteria, Error message

---

## Display Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Return all at once | Buffer internally, validate, then return complete story as single response. Simple and correct. Phase 5 handles loading UX. | ✓ |
| Fake a stream post-validation | Buffer and validate silently, then stream the already-complete text to client. Preserves progressive display but adds complexity. | |
| You decide | Claude picks simpler approach. | |

**User's choice:** Return all at once
**Notes:** Phase 5 (Reading Experience) will own the loading state UX. The API contract changes from ReadableStream to complete text body.

---

## Validator Criteria

| Option | Description | Selected |
|--------|-------------|----------|
| Strict — flag any doubt | Flag anything a cautious parent might find inappropriate: violence (even cartoon), scary/horror elements, death, real-world dangers, mild peril. When in doubt: flag. | ✓ |
| Moderate — flag serious concerns | Flag explicit violence, sexual content, death, horror. Allow mild peril and light tension. | |
| You decide | Claude picks appropriate criteria. | |

**User's choice:** Strict — flag any doubt
**Notes:** User initially selected this, then revisited and confirmed: strict is correct. False positives are acceptable; missed unsafe content is not.

---

## Error Message

| Option | Description | Selected |
|--------|-------------|----------|
| Generic retry message | "We weren't able to create a story right now. Please try again." | ✓ |
| Theme-specific suggestion | "We had trouble with this one. Try a different theme or try again in a moment." | |
| Custom | User provides specific wording. | |

**User's choice:** Generic retry message
**Notes:** Simple, warm, no technical detail.

---
