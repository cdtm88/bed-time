# Requirements: Nightlight Tales

**Defined:** 2026-04-03
**Core Value:** A parent can generate a safe, personalized bedtime story in under a minute and read it aloud to their child tonight.

## v2.0 Requirements

Requirements for the v2.0 milestone. Each maps to roadmap phases.

### Streaming & Core UX

- [ ] **STREAM-01**: Story text streams progressively to the reading view (buffer-validate-then-stream: full story generated and validated server-side, then streamed to client)
- [ ] **STREAM-02**: Device screen stays awake throughout the reading session (Screen Wake Lock API)
- [ ] **STREAM-03**: Reading view uses Literata font, optimized for dim-room mobile reading

### Visuals

- [ ] **VISUAL-01**: Theme tile illustrations display warmer, more whimsical nighttime artwork (18 SVGs redesigned)
- [ ] **VISUAL-02**: User sees AI-generated scene illustrations appear between story paragraphs while reading (2–3 per story, loaded on-demand via fal.ai)

### Story Persistence

- [ ] **PERSIST-01**: User can access a library of previously generated stories saved on their device (IndexedDB via idb-keyval)
- [ ] **PERSIST-02**: User can re-read any saved story from the library in full reading mode
- [ ] **PERSIST-03**: User can share a story via a unique link that expires after a set time (Upstash Redis, TTL-based)

## v2.1 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### Narration

- **NARR-01**: User can listen to a story narrated aloud with selectable voice (TTS via OpenAI gpt-4o-mini-tts + Web Speech API fallback)
- **NARR-02**: User can pause and resume narration during reading

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / cloud sync | Zero-friction is core to the product; library is local-first |
| Native iOS app | Web-first; deferred until web features validated |
| Custom freeform theme input | Preset list keeps quality and safety more controlled |
| Story editing / regeneration controls | Keep reading flow simple |
| Real-time collaboration | Not relevant to single-parent bedtime use case |
| TTS narration (v2.0) | Most complex feature; deferred to v2.1 after simpler features stable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STREAM-01 | TBD | Pending |
| STREAM-02 | TBD | Pending |
| STREAM-03 | TBD | Pending |
| VISUAL-01 | TBD | Pending |
| VISUAL-02 | TBD | Pending |
| PERSIST-01 | TBD | Pending |
| PERSIST-02 | TBD | Pending |
| PERSIST-03 | TBD | Pending |

**Coverage:**
- v2.0 requirements: 8 total
- Mapped to phases: 0 (roadmap not yet created)
- Unmapped: 8 ⚠️

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after initial v2.0 definition*
