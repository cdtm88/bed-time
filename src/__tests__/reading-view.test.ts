import { describe, it, expect, beforeEach } from 'vitest'

// --- Types ---

interface StoryData {
  story: string
  name: string
  theme: string
}

// --- Utility implementations (will be extracted to src/lib/reading-utils.ts in Plan 02) ---

const STORAGE_KEY = 'nightlight-story'

function parseStoryData(): StoryData | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (raw === null) return null
  return JSON.parse(raw) as StoryData
}

function splitParagraphs(text: string): string[] {
  return text.split('\n\n').filter((p) => p.trim() !== '')
}

function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  const maxScroll = scrollHeight - innerHeight
  if (maxScroll <= 0) return 0
  return scrollTop / maxScroll
}

function assembleTitle(name: string, theme: string): string {
  return `${name}'s ${theme} Story`
}

// --- Tests ---

describe('parseStoryData', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('parses story data from sessionStorage', () => {
    const data = { story: 'Once upon...', name: 'Luna', theme: 'Space' }
    sessionStorage.setItem('nightlight-story', JSON.stringify(data))
    const result = parseStoryData()
    expect(result).toEqual(data)
  })

  it('returns null for empty state (no key)', () => {
    const result = parseStoryData()
    expect(result).toBeNull()
  })

  it('throws on invalid JSON (error state)', () => {
    sessionStorage.setItem('nightlight-story', 'not-json{')
    expect(() => parseStoryData()).toThrow()
  })
})

describe('splitParagraphs', () => {
  it('splits on double newlines and filters empty', () => {
    const result = splitParagraphs('Para one.\n\nPara two.\n\nPara three.')
    expect(result).toEqual(['Para one.', 'Para two.', 'Para three.'])
  })

  it('filters out whitespace-only segments from extra newlines', () => {
    const result = splitParagraphs('\n\n\n\n')
    expect(result).toEqual([])
  })
})

describe('calculateScrollProgress', () => {
  it('returns correct progress ratio', () => {
    const result = calculateScrollProgress(500, 1500, 500)
    expect(result).toBe(0.5)
  })

  it('returns 0 when scrollHeight equals innerHeight (no scroll needed)', () => {
    const result = calculateScrollProgress(0, 500, 500)
    expect(result).toBe(0)
  })
})

describe('assembleTitle', () => {
  it('assembles title from name and theme', () => {
    const result = assembleTitle('Luna', 'Space')
    expect(result).toBe("Luna's Space Story")
  })
})
