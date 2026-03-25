# Phase 4: Input Form - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 04-input-form
**Areas discussed:** Form structure, Theme selector, Loading state, Story handoff, Rate limit UX

---

## Form Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single scroll | All 4 fields visible at once, scrollable. Fast, no state management. | ✓ |
| Step-by-step wizard | One field per screen with progress indicator. More complexity for 4 simple fields. | |

**User's choice:** Single scroll — specific field order: Name → Age → Duration → Themes
**Notes:** User specified exact control types per field: Name (free text with safety validation), Age (stepper: − AGE# +), Duration (option buttons), Themes (2-column tile grid with illustrated icons)

---

## Theme Selector

| Option | Description | Selected |
|--------|-------------|----------|
| Emoji | Large emoji per tile, zero asset management | |
| Illustrated icons | SVG illustrations per theme, visually premium | ✓ |
| You decide | Claude picks approach | |

**User's choice:** Illustrated icons (SVG)

**Revisited — illustration source:**

| Option | Description | Selected |
|--------|-------------|----------|
| Claude generates inline SVGs | Claude writes SVG code per theme | |
| Free icon library | OpenMoji, Twemoji, or similar | |
| Emoji placeholder now | Ship emoji, replace later | |
| User-supplied | User creates 18 illustrations to spec | ✓ |

**User's choice:** User will create and supply all 18 SVG illustrations
**Notes:** User requested spec sheet. Provided: 200×200px artboard, DESIGN.md palette, rounded strokes 2–3px, stored in `public/themes/` with kebab-case filenames.

---

## Loading State

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen overlay | Form transitions out, full-screen calm animation with personalised copy | ✓ |
| Button loading state | Spinner on Generate button, form stays visible | |
| New route/page | Navigate to /loading immediately on submit | |

**User's choice:** Full-screen overlay
**Notes:** Should include child's name in copy ("Crafting Luna's story…") and a 30-second expectation setter.

---

## Story Handoff

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to /story route | Route to new page; Phase 5 builds it out | ✓ |
| Show story on same page | Story replaces form on same route | |

**User's choice:** Navigate to /story route
**Notes:** Phase 4 creates a minimal /story stub. Phase 5 replaces it with the full reading experience.

---

## Rate Limit UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on submit | Error appears below Generate button, contextual | ✓ |
| Toast / snackbar | Ephemeral dismissing message | |
| You decide | Claude picks placement | |

**User's choice:** Inline below the Generate button
**Notes:** Friendly, non-technical copy. Form stays visible for retry.

---

## Claude's Discretion

- Loading animation implementation (CSS keyframes, SVG animation)
- Rate limiting implementation location (middleware vs. route handler)
- Story text passing mechanism to /story route
- Exact copy for loading and rate limit messages
- Input validation error styling details
- Selected state appearance for tiles and duration buttons

## Deferred Ideas

None — discussion stayed within phase scope.
