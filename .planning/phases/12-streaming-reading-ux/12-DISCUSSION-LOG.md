# Phase 12: Streaming & Reading UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 12-streaming-reading-ux
**Areas discussed:** Loading → Reading transition, Text reveal granularity, Wake Lock lifecycle, Literata font scope

---

## Loading → Reading Transition

### Part 1: When does the overlay drop?

| Option | Description | Selected |
|--------|-------------|----------|
| Overlay stays until stream starts | Keep dark navy loading overlay during generation + Haiku validation. Navigate to /story when stream begins. | ✓ |
| Navigate early, skeleton in reading view | Navigate to /story immediately, show skeleton while generation+validation runs. | |
| Overlay fades, stream in-place | Keep user on home page, overlay fades as stream starts, story renders on same page. | |

**User's choice:** Overlay stays until stream starts

### Part 2: How does story data reach the reading view?

| Option | Description | Selected |
|--------|-------------|----------|
| Stream directly into reading view | Reading view connects to stream itself — form passes session/request ID or reading view fetches from API. | ✓ |
| Partial sessionStorage handoff | Form receives stream, populates sessionStorage with chunks, navigates. Reading view polls/reads. | |
| Buffer first chunk, then stream | Form waits for first paragraph, saves to sessionStorage, navigates. Reading view streams remaining. | |

**User's choice:** Stream directly into reading view

**Notes:** Browser navigation breaks ReadableStream continuity — planner/researcher to resolve the bridging mechanism. User intent is clear: overlay up during validation, then progressive text in reading view.

---

## Text Reveal Granularity

### Part 1: Reveal unit

| Option | Description | Selected |
|--------|-------------|----------|
| Paragraph-by-paragraph | Buffer chunks until \\n\\n, render complete paragraph. Matches existing split pattern. | ✓ |
| Word-by-word | Append words as they stream. Fluid but potentially noisy for bedtime. | |
| Raw chunks as they arrive | Append immediately. Fast but unpredictable breaks possible. | |

**User's choice:** Paragraph-by-paragraph

### Part 2: Paragraph animation

| Option | Description | Selected |
|--------|-------------|----------|
| Fade in | Short opacity transition (300–500ms). Calm, matches existing reading view fadeIn. | ✓ |
| Snap in | Paragraph appears instantly. Simpler, slightly abrupt. | |
| Slide up + fade | Slides up slightly as it fades. More dynamic, may feel too active. | |

**User's choice:** Fade in

---

## Wake Lock Lifecycle

### Part 1: Activation

| Option | Description | Selected |
|--------|-------------|----------|
| On reading view load | Acquire on component mount (useEffect). Covers whole reading session. | ✓ |
| When streaming begins | Acquire only once first chunk arrives. | |

**User's choice:** On reading view load

### Part 2: Release

| Option | Description | Selected |
|--------|-------------|----------|
| When user navigates away | Release on component unmount (useEffect cleanup). | ✓ |
| When story ends + timeout | Release after stream completes with short delay. | |
| Never explicitly | Let browser handle via page visibility. | |

**User's choice:** When user navigates away (unmount)

---

## Literata Font Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Reading view only | Literata only on reading screen, home/form keeps current font. | |
| Whole app | Replace Noto Serif everywhere. | |
| Defer to backlog | Leave font as-is for this phase. | ✓ |

**User's choice:** Defer — park in backlog, font stays as Noto Serif. STREAM-03 not in Phase 12.

---

## Claude's Discretion

- Exact fade duration (300ms vs 500ms) — pick what looks right at dim-room brightness
- Whether to show a subtle loading indicator in reading view during pre-stream validation window
- Error handling for mid-stream failures

## Deferred Ideas

- **Literata font (STREAM-03)** — Explicitly deferred to roadmap backlog. Font stays as Noto Serif.
