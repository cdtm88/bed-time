import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { VALID_THEMES } from '@/lib/schemas'
import { themeToFilename } from '@/lib/theme-utils'

const THEMES_DIR = path.join(process.cwd(), 'public', 'themes')

const PERMITTED_COLORS = ['#0c6681', '#705d00', '#fbf9f1', '#1b1c17']

const COLOR_REGEX = /(?:fill|stroke)="(#[0-9a-fA-F]{6})"/g

describe('Theme SVG Assets', () => {
  it('all 18 theme SVGs exist', () => {
    for (const theme of VALID_THEMES) {
      const filename = themeToFilename(theme) + '.svg'
      const filepath = path.join(THEMES_DIR, filename)
      expect(
        fs.existsSync(filepath),
        `Expected ${filename} to exist for theme "${theme}"`
      ).toBe(true)
    }
  })

  it('each SVG has viewBox 0 0 200 200', () => {
    for (const theme of VALID_THEMES) {
      const filename = themeToFilename(theme) + '.svg'
      // Skip dinosaurs.svg — it is a legacy asset with different dimensions
      if (filename === 'dinosaurs.svg') continue
      const filepath = path.join(THEMES_DIR, filename)
      if (!fs.existsSync(filepath)) continue
      const content = fs.readFileSync(filepath, 'utf-8')
      expect(
        content,
        `Expected ${filename} to contain viewBox="0 0 200 200"`
      ).toContain('viewBox="0 0 200 200"')
    }
  })

  it('each new SVG uses only permitted palette colors', () => {
    for (const theme of VALID_THEMES) {
      const filename = themeToFilename(theme) + '.svg'
      // Skip dinosaurs.svg — it is a legacy asset not subject to palette constraints
      if (filename === 'dinosaurs.svg') continue
      const filepath = path.join(THEMES_DIR, filename)
      if (!fs.existsSync(filepath)) continue
      const content = fs.readFileSync(filepath, 'utf-8')

      let match: RegExpExecArray | null
      const colorRegex = new RegExp(COLOR_REGEX.source, 'g')
      while ((match = colorRegex.exec(content)) !== null) {
        const color = match[1].toLowerCase()
        expect(
          PERMITTED_COLORS,
          `Found non-permitted color "${color}" in ${filename}`
        ).toContain(color)
      }
    }
  })

  it('each new SVG is under 5KB', () => {
    for (const theme of VALID_THEMES) {
      const filename = themeToFilename(theme) + '.svg'
      // Skip dinosaurs.svg — it is a large legacy asset
      if (filename === 'dinosaurs.svg') continue
      const filepath = path.join(THEMES_DIR, filename)
      if (!fs.existsSync(filepath)) continue
      const size = fs.statSync(filepath).size
      expect(
        size,
        `Expected ${filename} to be under 5KB but it is ${size} bytes`
      ).toBeLessThan(5120)
    }
  })

  it('no SVG contains prohibited elements', () => {
    const prohibitedPatterns = [
      { regex: /<image[\s>]/, label: '<image>' },
      { regex: /<text[\s>]/, label: '<text>' },
      { regex: /<style[\s>]/, label: '<style>' },
      { regex: /<script[\s>]/, label: '<script>' },
    ]

    for (const theme of VALID_THEMES) {
      const filename = themeToFilename(theme) + '.svg'
      // Skip dinosaurs.svg — it is a legacy asset not subject to these checks
      if (filename === 'dinosaurs.svg') continue
      const filepath = path.join(THEMES_DIR, filename)
      if (!fs.existsSync(filepath)) continue
      const content = fs.readFileSync(filepath, 'utf-8')

      for (const { regex, label } of prohibitedPatterns) {
        expect(
          regex.test(content),
          `Found prohibited element ${label} in ${filename}`
        ).toBe(false)
      }
    }
  })
})
