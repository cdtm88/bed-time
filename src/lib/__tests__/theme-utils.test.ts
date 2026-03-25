import { describe, it, expect } from 'vitest'
import { themeToFilename } from '@/lib/theme-utils'
import { VALID_THEMES } from '@/lib/schemas'

describe('themeToFilename', () => {
  it('converts "Animals" to "animals"', () => {
    expect(themeToFilename('Animals')).toBe('animals')
  })

  it('converts "Space & Stars" to "space-stars"', () => {
    expect(themeToFilename('Space & Stars')).toBe('space-stars')
  })

  it('converts "Knights & Castles" to "knights-castles"', () => {
    expect(themeToFilename('Knights & Castles')).toBe('knights-castles')
  })

  it('converts "Underwater Adventure" to "underwater-adventure"', () => {
    expect(themeToFilename('Underwater Adventure')).toBe('underwater-adventure')
  })

  it('converts "Farm Life" to "farm-life"', () => {
    expect(themeToFilename('Farm Life')).toBe('farm-life')
  })

  it('converts "Magic School" to "magic-school"', () => {
    expect(themeToFilename('Magic School')).toBe('magic-school')
  })

  it('maps all 18 VALID_THEMES to their expected kebab-case filenames', () => {
    const expectedFilenames = [
      'animals',
      'dinosaurs',
      'space-stars',
      'ocean-sea',
      'fairy-tales',
      'dragons',
      'knights-castles',
      'trains-vehicles',
      'superheroes',
      'robots',
      'forest-nature',
      'pirates',
      'magic-school',
      'farm-life',
      'rainforest',
      'underwater-adventure',
      'dreams-clouds',
      'holidays-seasons',
    ]

    expect(VALID_THEMES).toHaveLength(18)

    VALID_THEMES.forEach((theme, index) => {
      expect(themeToFilename(theme)).toBe(expectedFilenames[index])
    })
  })
})
