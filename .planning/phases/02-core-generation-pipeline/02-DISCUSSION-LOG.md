# Phase 2: Core Generation Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 02 - Core Generation Pipeline

---

## Area: Theme List

**Question:** How do you want to approach the initial theme list?

| Option | Description |
|--------|-------------|
| ✅ You pick, I approve | Claude proposes 15–20 themes, user reviews and approves |
| I'll define them now | User provides the list |
| Claude decides | Captured as discretion |

**Selected:** You pick, I approve

**Claude proposed 18 themes. User response:** Looks good, use it

**Locked themes:** Animals, Dinosaurs, Space & Stars, Ocean & Sea, Fairy Tales, Dragons, Knights & Castles, Trains & Vehicles, Superheroes, Robots, Forest & Nature, Pirates, Magic School, Farm Life, Rainforest, Underwater Adventure, Dreams & Clouds, Holidays & Seasons

---

## Area: Claude Model Selection

**Question:** Which Claude model for story generation?

| Option | Description |
|--------|-------------|
| ✅ Sonnet 4.6 | Higher quality, ~$0.006/story |
| Haiku 4.5 | Fast/cheap, ~$0.0005/story, may produce blander narratives |
| Haiku now, Sonnet later | Swap at launch |

**Selected:** Sonnet 4.6

---

## Area: Streaming Response Format

**Question:** How should the Edge route stream the story?

| Option | Description |
|--------|-------------|
| ✅ Plain text stream | Raw chunks, curl-friendly, ReadableStream for frontend |
| Server-Sent Events (SSE) | `data: <text>\n\n` framing, EventSource-compatible |

**Selected:** Plain text stream

---

## Area: Word Count Targets

**Question:** Word count targets for each duration?

| Option | Description |
|--------|-------------|
| ✅ 150 wpm baseline | 5→750w, 10→1500w, 15→2250w |
| Slower 120 wpm | 5→600w, 10→1200w, 15→1800w |
| You decide | Claude picks |

**Selected:** 150 wpm baseline → 5 min: 750w, 10 min: 1500w, 15 min: 2250w
