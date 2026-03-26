import { describe, it, expect } from 'vitest'
import { getReadingLevel } from '@/lib/age-levels'
import type { ReadingLevel, ReadingLevelConfig } from '@/lib/age-levels'

describe('getReadingLevel', () => {
  it('returns toddler for age 0', () => {
    const result = getReadingLevel(0)
    expect(result.level).toBe('toddler')
    expect(result.description).toMatch(/simple/i)
  })

  it('returns toddler for age 3', () => {
    const result = getReadingLevel(3)
    expect(result.level).toBe('toddler')
    expect(result.description).toMatch(/simple/i)
  })

  it('returns young_child for age 4', () => {
    const result = getReadingLevel(4)
    expect(result.level).toBe('young_child')
  })

  it('returns young_child for age 6', () => {
    const result = getReadingLevel(6)
    expect(result.level).toBe('young_child')
  })

  it('returns older_child for age 7', () => {
    const result = getReadingLevel(7)
    expect(result.level).toBe('older_child')
  })

  it('returns older_child for age 10', () => {
    const result = getReadingLevel(10)
    expect(result.level).toBe('older_child')
  })

  it('toddler description mentions simple sentences', () => {
    const result = getReadingLevel(2)
    expect(result.description).toMatch(/simple/i)
  })

  it('older_child description mentions richer vocabulary', () => {
    const result = getReadingLevel(8)
    expect(result.description).toMatch(/richer|vocabulary/i)
  })

  it('returns a valid ReadingLevelConfig shape', () => {
    const result: ReadingLevelConfig = getReadingLevel(5)
    expect(result).toHaveProperty('level')
    expect(result).toHaveProperty('description')
    expect(typeof result.level).toBe('string')
    expect(typeof result.description).toBe('string')
  })
})

describe('getReadingLevel sensory guidance (D-08)', () => {
  it('toddler includes tactile and sound sensory words', () => {
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
