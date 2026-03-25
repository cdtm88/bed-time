export function themeToFilename(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
}
