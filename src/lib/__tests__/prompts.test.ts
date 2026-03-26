import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserMessage, getWordCount, getMaxTokens, buildReinforcedSystemPrompt } from '@/lib/prompts'
import { getReadingLevel } from '@/lib/age-levels'

describe('getWordCount', () => {
  it('returns 750 for 5 minutes', () => {
    expect(getWordCount(5)).toBe(750)
  })

  it('returns 1500 for 10 minutes', () => {
    expect(getWordCount(10)).toBe(1500)
  })

  it('returns 2250 for 15 minutes', () => {
    expect(getWordCount(15)).toBe(2250)
  })

  it('returns 450 for 3 minutes', () => {
    expect(getWordCount(3)).toBe(450)
  })
})

describe('getMaxTokens', () => {
  it('returns 1500 for 5 minutes', () => {
    expect(getMaxTokens(5)).toBe(1500)
  })

  it('returns 3000 for 10 minutes', () => {
    expect(getMaxTokens(10)).toBe(3000)
  })

  it('returns 4096 for 15 minutes', () => {
    expect(getMaxTokens(15)).toBe(4096)
  })

  it('returns 900 for 3 minutes', () => {
    expect(getMaxTokens(3)).toBe(900)
  })
})

describe('buildUserMessage', () => {
  it('contains child_name XML tags wrapping the name', () => {
    const msg = buildUserMessage('Lily', 'Dragons')
    expect(msg).toContain('<child_name>Lily</child_name>')
  })

  it('contains the theme', () => {
    const msg = buildUserMessage('Lily', 'Dragons')
    expect(msg).toContain('Dragons')
  })

  it('handles names with spaces', () => {
    const msg = buildUserMessage('Mary Jane', 'Space & Stars')
    expect(msg).toContain('<child_name>Mary Jane</child_name>')
    expect(msg).toContain('Space & Stars')
  })
})

describe('buildSystemPrompt', () => {
  it('contains reading level description for toddler', () => {
    const toddlerConfig = getReadingLevel(2)
    const prompt = buildSystemPrompt(toddlerConfig, 750)
    expect(prompt).toMatch(/simple/i)
  })

  it('contains word count target', () => {
    const config = getReadingLevel(2)
    const prompt = buildSystemPrompt(config, 750)
    expect(prompt).toContain('750')
  })

  it('contains older child vocabulary guidance', () => {
    const olderConfig = getReadingLevel(8)
    const prompt = buildSystemPrompt(olderConfig, 2250)
    expect(prompt).toMatch(/richer|vocabulary/i)
  })

  it('mentions bedtime', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/bedtime/i)
  })

  it('includes instruction about reading aloud', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/read.*aloud|reading.*aloud/i)
  })

  it('includes instruction about weaving child name', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/child.*name|name.*naturally/i)
  })

  it('includes calming instruction', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/calm|sooth|wind.*down|gentle/i)
  })

  it('instructs no title or headers', () => {
    const config = getReadingLevel(5)
    const prompt = buildSystemPrompt(config, 1500)
    expect(prompt).toMatch(/no title|no header|without.*title|just.*story/i)
  })
})

describe('buildSystemPrompt quality tuning (Phase 6)', () => {
  const config = getReadingLevel(5)
  const prompt = buildSystemPrompt(config, 1500)

  it('includes three-part narrative arc guidance (D-01)', () => {
    expect(prompt).toMatch(/beginning/i)
    expect(prompt).toMatch(/middle/i)
    expect(prompt).toMatch(/ending/i)
  })

  it('specifies wonder framing for middle beat (D-02)', () => {
    expect(prompt).toMatch(/wonder/i)
  })

  it('instructs sentence length taper in ending (D-03)', () => {
    expect(prompt).toMatch(/shorter.*sentence|sentence.*shorter|progressively.*short/i)
  })

  it('names sleepy sensory cues (D-04)', () => {
    expect(prompt).toMatch(/eyelid/i)
    expect(prompt).toMatch(/breath/i)
    expect(prompt).toMatch(/blanket/i)
    expect(prompt).toMatch(/yawn/i)
  })

  it('includes explicit sleep invitation (D-05)', () => {
    expect(prompt).toMatch(/close.*eyes|drift.*off|eyes.*heavy/i)
  })

  it('enumerates four opening styles (D-06)', () => {
    expect(prompt).toMatch(/in medias res|middle of action/i)
    expect(prompt).toMatch(/question|mystery/i)
    expect(prompt).toMatch(/setting/i)
    expect(prompt).toMatch(/character/i)
  })

  it('instructs never to repeat opening styles (D-07)', () => {
    expect(prompt).toMatch(/never begin two stories the same way/i)
  })

  it('includes global sensory grounding instruction (D-09)', () => {
    expect(prompt).toMatch(/senses|sensory/i)
    expect(prompt).toMatch(/calming|comforting/i)
  })
})

describe('buildSystemPrompt compact arc (Phase 06.1)', () => {
  const config = getReadingLevel(5)
  const shortPrompt = buildSystemPrompt(config, 450)
  const standardPrompt = buildSystemPrompt(config, 750)

  it('uses compact arc beginning (1-2 paragraphs) for targetWords < 500 (D-04)', () => {
    expect(shortPrompt).toMatch(/1-2 paragraphs/)
    expect(shortPrompt).toMatch(/establish.*world|warm.*inviting/i)
  })

  it('uses compact arc middle (2 paragraphs, no tension) for short stories (D-04)', () => {
    expect(shortPrompt).toContain('2 paragraphs')
    expect(shortPrompt).toMatch(/no tension/i)
  })

  it('uses compact arc ending (1-2 paragraphs) for short stories (D-04)', () => {
    expect(shortPrompt).toMatch(/1-2 paragraphs.*wind/is)
  })

  it('preserves standard arc (2-3 paragraphs beginning) for targetWords >= 500 (D-06)', () => {
    expect(standardPrompt).toMatch(/2-3 paragraphs/)
  })

  it('preserves ending wind-down instructions unchanged for short stories (D-05)', () => {
    expect(shortPrompt).toMatch(/eyelid/i)
    expect(shortPrompt).toMatch(/breath/i)
    expect(shortPrompt).toMatch(/blanket/i)
    expect(shortPrompt).toMatch(/yawn/i)
    expect(shortPrompt).toMatch(/close.*eyes|drift.*off/i)
  })
})
