# Feature Research

**Domain:** AI-powered bedtime story generator for parents
**Researched:** 2026-03-23
**Confidence:** MEDIUM (based on training data knowledge of competitors like Oscar Stories, Sleepytales, DreamyTales, Moshi; web verification was unavailable)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Child name personalization | Every competitor does this; a "personalized" story without the child's name is just a generic story | LOW | Straightforward prompt injection; ensure name appears naturally 3-5 times, not forced |
| Age-appropriate content | Parents will not use an app that produces content wrong for their child's age | MEDIUM | Map age to reading level bands (Toddler 0-3, Young 4-6, Older 7-10); calibrate vocabulary, sentence length, concept complexity |
| Theme/topic selection | Parents want some control over what the story is about; competitors all offer this | LOW | Preset list is the right MVP call -- keeps safety high and prompt quality controllable |
| Reading duration control | Parents need stories that fit their bedtime routine length; 5/10/15 min is standard | LOW | Map durations to approximate word counts (~500/1000/1500 words based on ~100 wpm read-aloud pace) |
| Safety/content filtering | Non-negotiable for children's content; a single inappropriate story kills trust permanently | HIGH | Multi-layer: prompt engineering + output validation + retry logic + graceful failure. This is the hardest table-stakes feature to get right |
| Mobile-friendly reading view | Parents read on phones at bedside; if the reading experience is poor on mobile the app fails its core use case | MEDIUM | Large text, dark/dim mode, no distracting UI, scrollable or paginated, no screen timeout triggers |
| Fast generation (under 30s) | A tired parent holding a phone next to a child will not wait minutes; competitors generate in 10-20 seconds | MEDIUM | Streaming response display helps perceived speed even if generation takes 20-30s |
| Narrative arc (beginning, middle, end) | AI-generated stories that meander or end abruptly feel broken; parents expect a real story, not random paragraphs | MEDIUM | Prompt engineering challenge -- explicit story structure instructions, possibly multi-step generation |
| No account required for first use | Friction kills bedtime apps -- parent discovers it at 8pm, wants a story NOW, not after email verification | LOW | Session-based, no auth. This is already in PROJECT.md and is the right call |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required day one, but create competitive moats.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Calming/wind-down language design | Most competitors generate "exciting adventure stories" -- explicitly designing for sleep wind-down is rare and valuable | MEDIUM | Prompt engineering to ensure descending energy arc: active beginning, calming middle, sleepy resolution. This is the core differentiator for PROJECT.md |
| Reading duration accuracy | Competitors often miss on story length; actually hitting 5/10/15 minute targets makes parents trust the product | MEDIUM | Requires calibration: measure word count vs. read-aloud time, iterate on prompt word count targets, possibly trim or extend post-generation |
| Dim-room optimized UI | Most competitors have standard white UIs; a truly dim-room-friendly reading experience (warm amber tones, OLED-friendly, auto-dim) stands out | MEDIUM | Dark theme with warm color temperature, adjustable brightness, no sudden white flashes during transitions |
| Story illustrations (AI-generated) | Competitors like Oscar Stories include illustrations; children love pictures with their stories | HIGH | Adds significant cost (image generation API calls), latency, and content safety complexity. Defer to post-MVP but plan the architecture to support it |
| Multi-voice TTS narration | High-quality narration with character voices, ambient sounds (rain, crickets), and music transforms the experience | HIGH | Explicitly out of scope for MVP per PROJECT.md. When built, needs to be exceptional -- bad TTS is worse than no TTS |
| Story history / favorites | Parents find a story their kid loves and want to read it again tomorrow | LOW | Requires persistence. Could do local storage (no account) initially, then sync with accounts later |
| Sibling support (multiple children) | Families have multiple kids; stories that include siblings or are tailored per child | LOW | Simple input extension. Valuable differentiator because most competitors focus on single-child |
| Bedtime routine integration | Timer/alarm that suggests "time for a story," wind-down music before and after, sleep tracking integration | HIGH | Future native app feature. Over-engineering for MVP |
| Themed story series / continuity | "Chapter 3 of Maya's Space Adventure" -- continuing stories across nights | MEDIUM | Requires story state persistence and careful prompt engineering to maintain narrative continuity. Very compelling for retention |
| Offline story caching | Pre-generate stories for airplane/camping/no-signal bedtimes | LOW | Cache generated stories in local storage or service worker. Simple to implement once stories exist |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems -- especially for a children's bedtime product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Freeform theme/prompt input | Parents want total creative control | Opens massive safety surface area; adversarial inputs, injection attacks, inappropriate content requests. Every freeform input is a content moderation problem | Curated preset theme list that grows over time based on user requests. Offer 15-20 rich themes that cover the space well |
| Child-facing UI / "let the kid pick" | Seems fun to let kids interact | Product is for parents reading to children. Child-facing UI means: accessibility requirements change, safety surface increases (child typing), screen time concerns, regulatory implications (COPPA) | Parent-only input UI. Child's role is listener, not user |
| Social sharing of stories | Parents want to share cute stories | Sharing AI-generated children's content publicly creates moderation nightmares, privacy concerns (child names in shared URLs), and potential for misuse | Private "save to favorites" with manual copy-paste if parents want to share |
| User-generated theme marketplace | Community-driven content sounds engaging | Moderation burden is enormous for children's content. One bad actor submitting an inappropriate theme poisons trust | Curated editorial theme list. Accept theme suggestions via feedback form, vet manually |
| Story editing / prompt tweaking | "Regenerate the ending" or "make it longer" | Turns a simple bedtime flow into a creative writing tool. Parent spends 15 minutes tweaking instead of reading. Breaks the "generate and read" simplicity | Single "generate new story" button. Accept that some stories are better than others |
| Gamification / rewards / streaks | Engagement metrics, retention | This is a bedtime app. Gamification creates anxiety ("don't break the streak!"), screen time guilt, and undermines the calm wind-down purpose | Track usage passively for parents who want to see patterns, but no badges/streaks/notifications |
| In-story interactive choices ("choose your adventure") | Engagement, replayability | Extends bedtime, creates decision fatigue for tired children, breaks the winding-down arc. Parent is reading aloud -- branching narrative is awkward | Linear narrative with natural arc. Save interactivity for a daytime reading product |
| Real-time collaborative story building | Parent and AI co-write | Destroys the simplicity. Parent is holding a phone in a dark room next to a sleepy child. They need to press one button, not co-author | One-tap generation. The AI is the author; the parent is the narrator |
| Detailed content controls (violence level, vocabulary sliders, etc.) | Fine-grained customization | Analysis paralysis at bedtime. Most parents want "safe and appropriate" -- not a 10-slider configuration panel | Age input handles calibration automatically. Trust the system to get it right |

## Feature Dependencies

```
[Age-appropriate content]
    └──requires──> [Age input + reading level mapping]

[Safety/content filtering]
    └──requires──> [Prompt engineering layer]
    └──requires──> [Output validation layer]
    └──enhances──> [Age-appropriate content]

[Reading duration control]
    └──requires──> [Word count calibration per reading level]

[Dim-room UI]
    └──enhances──> [Mobile-friendly reading view]

[Story history / favorites]
    └──requires──> [Local storage or user accounts]

[Themed story series / continuity]
    └──requires──> [Story history / favorites]
    └──requires──> [User accounts] (for cross-device)

[AI illustrations]
    └──requires──> [Story generation pipeline]
    └──requires──> [Image safety filtering]
    └──enhances──> [Reading experience]

[Multi-voice TTS narration]
    └──requires──> [Story generation pipeline]
    └──enhances──> [Reading experience]
    └──conflicts──> [No-account MVP simplicity] (TTS costs need monetization)

[Sibling support]
    └──enhances──> [Name personalization]
    └──requires──> [Prompt engineering updates]

[Offline story caching]
    └──requires──> [Story history / favorites]
    └──enhances──> [Mobile-friendly reading view]
```

### Dependency Notes

- **Safety filtering requires prompt engineering + output validation:** Safety cannot be a single layer. Prompt engineering reduces bad outputs, output validation catches what slips through, retry logic handles edge cases. All three are needed before launch.
- **Reading duration requires word count calibration:** The mapping from "5 minutes" to word count depends on reading level band. A toddler story read aloud is slower (simpler words, more pauses) than an older-child story. Calibrate empirically.
- **Story series requires persistence:** Continuing stories across sessions needs state. This blocks on either local storage (fragile, single device) or user accounts (adds friction). Defer until accounts exist.
- **TTS conflicts with no-account MVP:** High-quality TTS is expensive per-request. Offering it free with no accounts means no way to rate-limit or monetize. TTS should launch alongside accounts and a pricing model.

## MVP Definition

### Launch With (v1)

Minimum viable product -- validate that parents want AI bedtime stories at all.

- [x] Child name + age input -- core personalization
- [x] Preset theme list (15-20 themes) -- controlled creative scope
- [x] Reading duration selector (5/10/15 min) -- fits bedtime routines
- [x] AI story generation with narrative arc -- the core product
- [x] Calming/wind-down language design -- the key differentiator
- [x] Safety filtering (prompt + validation + retry + graceful error) -- non-negotiable
- [x] Mobile-first dim-room reading view -- the primary use context
- [x] No account required -- zero friction to first story
- [x] Streaming response display -- perceived speed while generating

### Add After Validation (v1.x)

Features to add once core is working and users confirm value.

- [ ] Story history via local storage -- when users say "my kid loved last night's story"
- [ ] Dim-room UI refinements (amber mode, brightness controls) -- when usage data confirms bedtime phone use
- [ ] Sibling support (multiple names) -- when users request it
- [ ] Reading duration accuracy tuning -- after measuring real read-aloud times vs. targets
- [ ] Expanded theme list -- based on which themes users pick most and what they request
- [ ] Offline caching of recent stories -- when mobile signal complaints surface

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] User accounts + saved profiles -- needed for cross-device, story history sync, and monetization
- [ ] AI-generated story illustrations -- high cost and complexity, but high value
- [ ] Multi-voice TTS narration with ambient sounds -- the "audiobook" experience, must be exceptional
- [ ] Themed story series / continuing adventures -- requires accounts + story persistence
- [ ] Native iOS app -- after web MVP proves the concept
- [ ] Freeform theme input (carefully moderated) -- only if preset themes feel limiting to validated users

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Child name personalization | HIGH | LOW | P1 |
| Age-appropriate content calibration | HIGH | MEDIUM | P1 |
| Preset theme selection | HIGH | LOW | P1 |
| Reading duration control | HIGH | LOW | P1 |
| Safety/content filtering | HIGH | HIGH | P1 |
| Mobile-friendly dim-room reading view | HIGH | MEDIUM | P1 |
| Narrative arc (real story structure) | HIGH | MEDIUM | P1 |
| Calming wind-down language | HIGH | MEDIUM | P1 |
| Streaming response display | MEDIUM | LOW | P1 |
| Story history (local storage) | MEDIUM | LOW | P2 |
| Sibling support | MEDIUM | LOW | P2 |
| Dim-room UI refinements | MEDIUM | MEDIUM | P2 |
| Offline story caching | LOW | LOW | P2 |
| Reading duration accuracy tuning | MEDIUM | MEDIUM | P2 |
| AI-generated illustrations | HIGH | HIGH | P3 |
| Multi-voice TTS narration | HIGH | HIGH | P3 |
| User accounts + profiles | MEDIUM | MEDIUM | P3 |
| Story series / continuity | MEDIUM | MEDIUM | P3 |
| Native iOS app | HIGH | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when validated
- P3: Nice to have, future consideration

## Competitor Feature Analysis

*Note: Based on training data knowledge. Competitors may have added/changed features since. Confidence: MEDIUM.*

| Feature | Oscar Stories | Sleepytales | DreamyTales | Our Approach |
|---------|-------------|-------------|-------------|--------------|
| Name personalization | Yes | Yes | Yes | Yes -- table stakes |
| Age calibration | Basic (age ranges) | Yes | Limited | Internal age-to-reading-level mapping |
| Theme selection | Freeform + presets | Presets | Freeform | Presets only (safety-first) |
| AI illustrations | Yes (per story) | No | Some | Deferred (P3) |
| TTS / audio | Basic TTS | Yes (multiple voices) | No | Deferred until it can be exceptional (P3) |
| Reading duration control | No (fixed length) | Some | No | Yes -- 5/10/15 min selector (differentiator at launch) |
| Wind-down language design | Not explicit | Somewhat | No | Core differentiator -- stories designed for sleep |
| Dark/dim reading mode | Basic dark mode | No | No | Dim-room optimized UI (warm amber, large text) |
| Account required | Yes | Yes | Yes | No -- zero friction MVP |
| Story saving | Yes (with account) | Yes (with account) | Yes | Local storage (no account needed) in v1.x |
| Safety filtering | Moderate | Moderate | Basic | Multi-layer with retry (non-negotiable) |
| Free tier | Limited | Limited | Limited | Fully free MVP (validate first, monetize later) |

## Sources

- Training data knowledge of Oscar Stories, Sleepytales, DreamyTales, Moshi Kids, and general AI children's content apps (confidence: MEDIUM -- may be 6-18 months stale)
- Children's literacy research on read-aloud pacing (~100-130 words per minute for parent read-aloud, varying by child age)
- COPPA and children's digital product safety considerations (training data)
- Web verification was unavailable during this research session; competitor features should be spot-checked before finalizing roadmap

---
*Feature research for: AI-powered bedtime story generator*
*Researched: 2026-03-23*
