import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, buildUserMessage, getWordCount, getMaxTokens } from '@/lib/prompts'
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
