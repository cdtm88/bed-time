export const VALID_THEMES = [
  "Animals",
  "Dinosaurs",
  "Space & Stars",
  "Ocean & Sea",
  "Fairy Tales",
  "Dragons",
  "Knights & Castles",
  "Trains & Vehicles",
  "Superheroes",
  "Robots",
  "Forest & Nature",
  "Pirates",
  "Magic School",
  "Farm Life",
  "Rainforest",
  "Underwater Adventure",
  "Dreams & Clouds",
  "Holidays & Seasons",
] as const

export const VALID_DURATIONS = [3, 5, 10, 15] as const

export interface GenerateInput {
  name: string
  age: number
  theme: string
  duration: number
}

const NAME_REGEX = /^[a-zA-Z\s]{1,30}$/

export function validateInput(input: unknown): string | null {
  if (input === null || typeof input !== "object") {
    return "Invalid input: expected an object"
  }

  const obj = input as Record<string, unknown>

  if (
    !("name" in obj) ||
    !("age" in obj) ||
    !("theme" in obj) ||
    !("duration" in obj)
  ) {
    return "Invalid input: missing required fields (name, age, theme, duration)"
  }

  const { name, age, theme, duration } = obj

  if (typeof name !== "string" || !NAME_REGEX.test(name)) {
    return "Invalid name: must be 1-30 characters, letters and spaces only"
  }

  if (typeof age !== "number" || !Number.isInteger(age) || age < 0 || age > 10) {
    return "Invalid age: must be an integer between 0 and 10"
  }

  if (
    typeof theme !== "string" ||
    !(VALID_THEMES as readonly string[]).includes(theme)
  ) {
    return "Invalid theme: must be one of the preset themes"
  }

  if (
    typeof duration !== "number" ||
    !(VALID_DURATIONS as readonly number[]).includes(duration)
  ) {
    return "Invalid duration: must be 3, 5, 10, or 15"
  }

  return null
}
