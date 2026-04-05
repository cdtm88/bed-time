# Phase 13: Story Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 13-story-persistence
**Areas discussed:** Library UI & entry point, Save trigger & auto-save behavior, Share link UX & TTL, Re-read flow & reading view reuse

---

## Library UI & Entry Point

| Option | Description | Selected |
|--------|-------------|----------|
| Home screen button | Persistent button/link on the home screen | ✓ |
| Post-generation prompt | Prompt after story generation to save/view library | |
| Dedicated nav bar | Bottom nav bar with Home / Library tabs | |

**User's choice:** Home screen button
**Notes:** Simple and always visible.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Title + theme chip + date | Compact card with title, theme chip, and save date | ✓ |
| Title + first paragraph preview | Opening line shown under title | |
| Just title and date | Minimal display | |

**User's choice:** Title + theme chip + date
**Notes:** Compact, scannable.

---

## Save Trigger & Auto-Save Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save after streaming completes | Silent auto-save when all paragraphs arrive | ✓ |
| User taps 'Save' button | Explicit save action required | |
| Auto-save + confirmation toast | Auto-save with brief toast notification | |

**User's choice:** Auto-save after streaming completes
**Notes:** Zero friction — no user action required.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — swipe or long-press to delete | Standard mobile gesture pattern | ✓ |
| Yes — delete button on each card | Always-visible delete button | |
| No delete in this phase | Skip delete for v2.0 | |

**User's choice:** Yes — swipe or long-press to delete

---

## Share Link UX & TTL

| Option | Description | Selected |
|--------|-------------|----------|
| Share button on reading view | Button alongside NEW STORY when complete | |
| Share button on library card | Share only accessible from library | ✓ |
| Both — reading view and library card | Share from both surfaces | |

**User's choice:** Share button on library card
**Notes:** Library-first sharing flow: generate → auto-saved → go to library → share.

---

| Option | Description | Selected |
|--------|-------------|----------|
| 7 days | Standard share-link TTL | ✓ |
| 24 hours | Same-night sharing only | |
| 30 days | Month-long links | |

**User's choice:** 7 days
**Notes:** Long enough for a grandparent to open it later in the week.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full reading view, same as the author | /story/[shareId] with full ReadingView | ✓ |
| Minimal story display page | Lighter read-only page | |
| Story loads then redirects to /story | SessionStorage handoff then redirect | |

**User's choice:** Full reading view, same as the author

---

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly expired message | "This story has expired. Create your own…" page | ✓ |
| Redirect to home screen | Silent redirect on expiry | |
| 404 page | Treat expired as missing | |

**User's choice:** Friendly expired message

---

## Re-read Flow & Reading View Reuse

| Option | Description | Selected |
|--------|-------------|----------|
| Same ReadingView, no streaming | sessionStorage handoff, renders immediately | ✓ |
| Same ReadingView, replay streaming | Artificial paragraph-by-paragraph replay | |
| New /library/[id] route with ReadingView | Separate route for saved stories | |

**User's choice:** Yes — same ReadingView, no streaming
**Notes:** ReadingView already handles completed story in sessionStorage — reuse without changes to that logic.

---

| Option | Description | Selected |
|--------|-------------|----------|
| NEW STORY + BACK TO LIBRARY | Two buttons at end of re-read | ✓ |
| Just NEW STORY | Existing behavior unchanged | |
| BACK TO LIBRARY only | Replace NEW STORY | |

**User's choice:** NEW STORY + BACK TO LIBRARY

---

## Claude's Discretion

- Library page layout (list vs. grid for story cards)
- Empty library state design
- Swipe/long-press delete UX implementation details
- Share button placement on library card (icon vs. labeled)
- "Copied!" feedback after share button click

## Deferred Ideas

None — discussion stayed within phase scope.
