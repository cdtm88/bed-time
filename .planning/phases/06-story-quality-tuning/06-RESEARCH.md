# Phase 6: Story Quality Tuning - Research

**Researched:** 2026-03-25
**Domain:** Prompt engineering for narrative quality (Claude LLM)
**Confidence:** HIGH

## Summary

Phase 6 is a prompt engineering phase with a narrow, well-defined scope: rewrite `buildSystemPrompt()` in `src/lib/prompts.ts` and expand the `description` fields in `src/lib/age-levels.ts` to produce higher-quality bedtime stories. No new dependencies, no UI changes, no route handler changes. The implementation surface is two source files and two test files.

The CONTEXT.md provides nine locked decisions (D-01 through D-09) that fully specify what needs to change. The primary research question is how to structure the prompt text and tests effectively, not what libraries or frameworks to use.

**Primary recommendation:** Implement all nine decisions as additive prompt text changes, update existing tests to verify the presence of key narrative/sensory/variation instructions, and keep the function signatures unchanged so `buildReinforcedSystemPrompt()` and the route handler cascade without modification.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Replace the current single-line arc mention with explicit three-part beat guidance (Beginning 2-3 paragraphs, Middle 3-4 paragraphs, Ending 2-3 paragraphs)
- **D-02:** The "middle" beat must use the word "wonder" or equivalent framing -- no tension, no fear, no peril language
- **D-03:** Sentence length taper -- explicitly instruct Claude to use progressively shorter sentences in the final section
- **D-04:** Sleepy sensory cues -- name specific sleepy language: heavy eyelids, slow breathing, warmth of a blanket, yawning
- **D-05:** Explicit sleep invitation -- the final sentence or paragraph must invite the child to close their eyes and drift off (strengthen existing instruction)
- **D-06:** Enumerate four distinct opening styles and instruct Claude to choose one: in medias res, wonder, setting, character voice
- **D-07:** Include the instruction: "Never begin two stories the same way"
- **D-08:** Add per-age-level sensory guidance to `age-levels.ts` reading level descriptions (toddler: tactile/sound; young child: multi-sense gentle; older child: rich multi-sense vivid but calming)
- **D-09:** Global instruction in `buildSystemPrompt()`: "Ground descriptions in the senses. Favour calming, comforting sensations."

### Claude's Discretion
- Exact wording and phrasing of all prompt additions
- Whether to reorganise the system prompt into labelled sections (e.g., `## Structure`, `## Voice`) or keep it as flowing prose
- Whether the four opening styles appear as a bulleted list or inline in the system prompt
- Where in the prompt the sensory guidance appears relative to the arc guidance

### Deferred Ideas (OUT OF SCOPE)
- **3-minute duration option** -- Deferred to Phase 6.1 (touches DURATION_CONFIG, duration schema, DurationToggle UI)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-05 | Generated story follows a complete narrative arc with beginning, conflict, and resolution | D-01, D-02 provide explicit three-part beat guidance with paragraph counts and tone constraints |
| STORY-06 | Generated story uses calming, wind-down language designed to ease children toward sleep | D-03, D-04, D-05 provide sentence-length taper, sleepy sensory cues, and explicit sleep invitation |
| STORY-07 | Generated stories use varied narrative structures, incorporate sensory language and descriptive imagery, integrate child's name naturally | D-06, D-07 provide four opening styles and variation instruction; D-08, D-09 provide per-age sensory guidance and global sensory grounding |

</phase_requirements>

## Standard Stack

No new libraries required. This phase modifies only prompt text in existing TypeScript files.

### Core (Existing, Unchanged)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| TypeScript | ^5 | Type-safe prompt construction | No changes |
| vitest | ^3.2.4 | Test framework for prompt assertions | Test updates only |

### Files Modified
| File | Function(s) | Change Type |
|------|------------|-------------|
| `src/lib/prompts.ts` | `buildSystemPrompt()` | Rewrite prompt body (signature unchanged) |
| `src/lib/age-levels.ts` | `getReadingLevel()` | Expand `description` strings with sensory guidance |
| `src/lib/__tests__/prompts.test.ts` | `buildSystemPrompt` describe block | Update/add assertions for new prompt content |
| `src/lib/__tests__/age-levels.test.ts` | `getReadingLevel` describe block | Update/add assertions for sensory guidance in descriptions |

## Architecture Patterns

### Current Prompt Architecture
```
buildSystemPrompt(readingLevel, targetWords) -> string
    |
    +-- readingLevel.description (from age-levels.ts)
    |
    +-- word count range (93%-107% of targetWords)
    |
    +-- guidelines (calming, narrative arc, no formatting, sleep ending)

buildReinforcedSystemPrompt(readingLevel, targetWords) -> string
    |
    +-- calls buildSystemPrompt() + appends safety reinforcement
```

### Pattern: Structured Prompt Sections
**What:** Organize the system prompt into clearly labeled sections rather than a single flowing paragraph block.
**When to use:** When the prompt exceeds ~200 words and covers multiple distinct concerns (arc, voice, variation, sensory).
**Recommendation:** Use markdown-style section headers within the prompt string. Claude responds well to structured prompts with clear section boundaries. This is at Claude's discretion per CONTEXT.md.

Example structure:
```
You are a bedtime story writer...

## Story Structure
[D-01 beat guidance]
[D-02 wonder framing]

## Voice & Pacing
[D-03 sentence taper]
[D-04 sleepy sensory cues]
[D-05 sleep invitation]

## Variety
[D-06 opening styles]
[D-07 never repeat openings]

## Sensory Language
[D-09 global sensory grounding]
[readingLevel.description -- now includes D-08 per-age sensory words]
```

### Pattern: Additive Description Enhancement
**What:** Expand `ReadingLevelConfig.description` strings in `age-levels.ts` to include sensory vocabulary guidance alongside existing reading-level guidance.
**When to use:** D-08 requires per-age-level sensory guidance.
**Key constraint:** The `description` field is a plain string interpolated into the prompt. Keep it concise enough that the prompt doesn't balloon. Append sensory guidance after the existing reading-level text.

### Anti-Patterns to Avoid
- **Contradicting the safety layer:** The base prompt must not introduce tension/peril language that conflicts with `buildReinforcedSystemPrompt()`. D-02 already addresses this ("wonder, not tension").
- **Over-constraining Claude:** Prompt should guide, not micro-manage every sentence. Too many rigid rules produce stilted output.
- **Breaking the function signature:** `buildSystemPrompt(readingLevel, targetWords)` signature must remain unchanged -- the route handler depends on it.
- **Duplicating instructions:** The sleep-ending instruction already exists in the current prompt. D-05 says "strengthen it," not duplicate it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Variation/randomness | Code-level random seed injection | Prompt-level opening style enumeration (D-06) | Claude's own sampling temperature provides variation; prompt gives it structural options to vary |
| Per-age vocabulary control | Separate vocabulary lists or lookup tables | Inline sensory guidance in `description` strings (D-08) | Keeps the prompt pipeline simple; no new data structures or types needed |

## Common Pitfalls

### Pitfall 1: Tests That Are Too Specific to Exact Wording
**What goes wrong:** Tests assert exact substrings of prompt text, making any wording change break tests.
**Why it happens:** Existing tests already use `.toMatch(/pattern/i)` and `.toContain()` -- the temptation is to add very specific assertions.
**How to avoid:** Test for the *presence of concepts* (e.g., "wonder" appears, "heavy eyelids" or similar sleepy-sensory words appear, four opening styles are mentioned) not exact sentences. Use regex patterns like `/wonder/i`, `/eyelid|breath|blanket|yawn/i`.
**Warning signs:** A test that breaks when you rephrase a prompt sentence without changing its meaning.

### Pitfall 2: Prompt Becoming Too Long
**What goes wrong:** With nine decisions adding text, the system prompt could balloon, eating into the context window and reducing story quality.
**Why it happens:** Each decision adds 1-3 sentences. Nine decisions could add 20+ sentences.
**How to avoid:** Be concise. Each decision should map to 1-2 well-crafted sentences in the prompt. The prompt should stay under ~400 words total. Combine related instructions where natural.
**Warning signs:** System prompt exceeding 500 words. Claude starting to ignore some instructions (context dilution).

### Pitfall 3: Existing Test Assertions Breaking
**What goes wrong:** The 17 existing `prompts.test.ts` tests and 9 `age-levels.test.ts` tests use regex/substring matching against current prompt text. Rewriting the prompt may break assertions.
**Why it happens:** Tests like `expect(prompt).toMatch(/calm|sooth|wind.*down|gentle/i)` will still pass if those words remain. But tests checking for exact patterns like "Follow a gentle narrative arc" may break if that exact phrasing changes.
**How to avoid:** Review each existing test assertion before rewriting the prompt. Ensure the rewritten prompt still satisfies all existing test intent. Update tests that check for old-specific wording to check for new-specific wording.
**Warning signs:** Tests failing after prompt rewrite on words that are conceptually still present but rephrased.

### Pitfall 4: buildReinforcedSystemPrompt Interaction
**What goes wrong:** The reinforced prompt appends safety text after the base prompt. If the base prompt's new structure (section headers, etc.) conflicts with the appended safety text, it could confuse Claude.
**Why it happens:** `buildReinforcedSystemPrompt` does simple string concatenation: `${basePrompt}\n\n...safety text...`.
**How to avoid:** Ensure the base prompt ends cleanly (no trailing section header that the safety text would fall under unexpectedly). The safety text is already a self-contained block with its own "CRITICAL SAFETY REQUIREMENTS" header.

## Code Examples

### Current buildSystemPrompt (to be rewritten)
```typescript
// Source: src/lib/prompts.ts lines 19-39
export function buildSystemPrompt(
  readingLevel: ReadingLevelConfig,
  targetWords: number
): string {
  const low = Math.round(targetWords * 0.93)
  const high = Math.round(targetWords * 1.07)
  // ... returns prompt string
}
```
Function signature stays identical. Only the returned string changes.

### Current age-levels descriptions (to be expanded)
```typescript
// Source: src/lib/age-levels.ts
// Toddler: "Very simple sentences. Familiar, everyday words. Repetition encouraged. Short paragraphs."
// Young child: "Short sentences with some descriptive language. Gentle complexity. Simple dialogue."
// Older child: "Longer sentences with richer vocabulary. More involved narrative. Descriptive imagery."
```
Each description gets sensory guidance appended per D-08.

### Test Pattern for New Prompt Content
```typescript
// Pattern: Assert concept presence, not exact wording
describe('buildSystemPrompt', () => {
  it('includes three-part narrative arc guidance', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/beginning/i)
    expect(prompt).toMatch(/middle/i)
    expect(prompt).toMatch(/ending/i)
  })

  it('includes sentence taper instruction for ending', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/shorter.*sentence|sentence.*shorter/i)
  })

  it('includes sleepy sensory cues', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/eyelid|breath|blanket|yawn/i)
  })

  it('enumerates opening styles for variation', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/in medias res|middle of action/i)
    expect(prompt).toMatch(/wonder|question|mystery/i)
    expect(prompt).toMatch(/setting/i)
    expect(prompt).toMatch(/character/i)
  })

  it('includes sensory grounding instruction', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/senses|sensory/i)
  })
})
```

### Test Pattern for Age-Level Sensory Guidance
```typescript
describe('getReadingLevel sensory guidance', () => {
  it('toddler includes tactile/sound sensory words', () => {
    const result = getReadingLevel(2)
    expect(result.description).toMatch(/soft|warm|fluffy|splash|hum/i)
  })

  it('young child includes multi-sense descriptions', () => {
    const result = getReadingLevel(5)
    expect(result.description).toMatch(/smell|feel|glow|rain|grass|moonlight/i)
  })

  it('older child includes rich multi-sense imagery', () => {
    const result = getReadingLevel(8)
    expect(result.description).toMatch(/sight|sound|smell|touch|vivid/i)
  })
})
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/lib/__tests__/prompts.test.ts src/lib/__tests__/age-levels.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-05 | Three-part narrative arc in prompt | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "narrative arc"` | Needs update |
| STORY-05 | Wonder framing (no peril) in middle beat | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "wonder"` | Needs update |
| STORY-06 | Sentence taper instruction | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "taper"` | Needs creation |
| STORY-06 | Sleepy sensory cues in prompt | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sleepy"` | Needs creation |
| STORY-06 | Sleep invitation instruction | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sleep"` | Existing (update) |
| STORY-07 | Four opening styles enumerated | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "opening"` | Needs creation |
| STORY-07 | Per-age sensory guidance in descriptions | unit | `npx vitest run src/lib/__tests__/age-levels.test.ts -t "sensory"` | Needs creation |
| STORY-07 | Global sensory grounding instruction | unit | `npx vitest run src/lib/__tests__/prompts.test.ts -t "sensory"` | Needs creation |

### Sampling Rate
- **Per task commit:** `npx vitest run src/lib/__tests__/prompts.test.ts src/lib/__tests__/age-levels.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- None -- existing test infrastructure (`vitest`, config, test files) covers all phase requirements. Tests need new assertions added, not new infrastructure.

## Project Constraints (from CLAUDE.md)

No `CLAUDE.md` file exists in the project root. No project-specific directives to enforce beyond what is captured in CONTEXT.md and STATE.md decisions.

Relevant STATE.md decisions that constrain this phase:
- System prompt uses word count range 93%-107% rather than exact target -- **keep unchanged**
- Claude model: `claude-sonnet-4-6` for generation -- **keep unchanged**
- Prompt instructions are plain prose strings (no JSON, no structured format) -- **keep this pattern**
- `buildSystemPrompt` signature `(readingLevel: ReadingLevelConfig, targetWords: number) -> string` -- **do not change**
- Buffered response (not streaming) -- story validated before reaching client -- **no impact on prompt changes**

## Open Questions

1. **Prompt length budget**
   - What we know: Current prompt is ~180 words. Nine decisions will roughly double it.
   - What's unclear: Exactly how concise the additions can be while still being effective.
   - Recommendation: Target ~350-400 words total. If it exceeds 400, consolidate related instructions. This is well within Claude's system prompt capacity (no risk of context issues).

2. **Whether section headers help or hurt**
   - What we know: Claude handles both flowing prose and markdown-sectioned prompts. CONTEXT.md leaves this at Claude's discretion.
   - What's unclear: Whether headers improve instruction-following for this specific use case.
   - Recommendation: Use light section headers (e.g., `## Structure`, `## Voice`) for maintainability and clarity. They also help in testing -- easier to verify each section exists.

## Sources

### Primary (HIGH confidence)
- `src/lib/prompts.ts` -- Current implementation, read directly
- `src/lib/age-levels.ts` -- Current implementation, read directly
- `src/lib/__tests__/prompts.test.ts` -- 17 existing tests, all passing
- `src/lib/__tests__/age-levels.test.ts` -- 9 existing tests, all passing
- `.planning/phases/06-story-quality-tuning/06-CONTEXT.md` -- Nine locked decisions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` -- Project decisions and constraints

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries; modifying existing files only
- Architecture: HIGH - Function signatures locked, prompt is a string, changes are additive text
- Pitfalls: HIGH - Based on direct reading of existing tests and code patterns

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable -- no external dependencies that could change)
