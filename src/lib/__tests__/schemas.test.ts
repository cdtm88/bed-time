import { describe, it, expect } from 'vitest'
import { validateInput, VALID_THEMES, VALID_DURATIONS } from '@/lib/schemas'
import type { GenerateInput } from '@/lib/schemas'

describe('VALID_THEMES', () => {
  it('has exactly 18 entries', () => {
    expect(VALID_THEMES).toHaveLength(18)
  })

  it('includes all expected themes', () => {
    const expected = [
      'Animals', 'Dinosaurs', 'Space & Stars', 'Ocean & Sea',
      'Fairy Tales', 'Dragons', 'Knights & Castles', 'Trains & Vehicles',
      'Superheroes', 'Robots', 'Forest & Nature', 'Pirates',
      'Magic School', 'Farm Life', 'Rainforest', 'Underwater Adventure',
      'Dreams & Clouds', 'Holidays & Seasons',
    ]
    for (const theme of expected) {
      expect(VALID_THEMES).toContain(theme)
    }
  })
})

describe('VALID_DURATIONS', () => {
  it('is [5, 10, 15]', () => {
    expect(VALID_DURATIONS).toEqual([5, 10, 15])
  })
})

describe('GenerateInput type', () => {
  it('accepts valid input shape', () => {
    const input: GenerateInput = {
      name: 'Lily',
      age: 5,
      theme: 'Dragons',
      duration: 10,
    }
    expect(input.name).toBe('Lily')
    expect(input.age).toBe(5)
    expect(input.theme).toBe('Dragons')
    expect(input.duration).toBe(10)
  })
})

describe('validateInput', () => {
  it('returns null for valid input', () => {
    expect(validateInput({ name: 'Lily', age: 5, theme: 'Dragons', duration: 10 })).toBeNull()
  })

  it('rejects empty name', () => {
    const result = validateInput({ name: '', age: 5, theme: 'Dragons', duration: 10 })
    expect(result).toContain('name')
  })

  it('rejects name longer than 30 chars', () => {
    const result = validateInput({ name: 'A'.repeat(31), age: 5, theme: 'Dragons', duration: 10 })
    expect(result).toContain('name')
  })

  it('rejects name with numbers', () => {
    const result = validateInput({ name: 'Lily123', age: 5, theme: 'Dragons', duration: 10 })
    expect(result).toContain('name')
  })

  it('accepts names with spaces', () => {
    expect(validateInput({ name: 'Mary Jane', age: 5, theme: 'Dragons', duration: 10 })).toBeNull()
  })

  it('accepts names with only letters', () => {
    expect(validateInput({ name: 'Jose', age: 5, theme: 'Dragons', duration: 10 })).toBeNull()
  })

  it('rejects negative age', () => {
    const result = validateInput({ name: 'Lily', age: -1, theme: 'Dragons', duration: 10 })
    expect(result).toContain('age')
  })

  it('rejects age above 10', () => {
    const result = validateInput({ name: 'Lily', age: 11, theme: 'Dragons', duration: 10 })
    expect(result).toContain('age')
  })

  it('rejects non-integer age', () => {
    const result = validateInput({ name: 'Lily', age: 5.5, theme: 'Dragons', duration: 10 })
    expect(result).toContain('age')
  })

  it('rejects invalid theme', () => {
    const result = validateInput({ name: 'Lily', age: 5, theme: 'Zombies', duration: 10 })
    expect(result).toContain('theme')
  })

  it('rejects invalid duration', () => {
    const result = validateInput({ name: 'Lily', age: 5, theme: 'Dragons', duration: 7 })
    expect(result).toContain('duration')
  })

  it('accepts age 0 (boundary)', () => {
    expect(validateInput({ name: 'Lily', age: 0, theme: 'Dragons', duration: 10 })).toBeNull()
  })

  it('accepts age 10 (boundary)', () => {
    expect(validateInput({ name: 'Lily', age: 10, theme: 'Dragons', duration: 10 })).toBeNull()
  })

  it('rejects non-object input', () => {
    const result = validateInput('not an object')
    expect(result).toBeTruthy()
  })

  it('rejects null input', () => {
    const result = validateInput(null)
    expect(result).toBeTruthy()
  })

  it('rejects input with missing fields', () => {
    const result = validateInput({ name: 'Lily' })
    expect(result).toBeTruthy()
  })
})
