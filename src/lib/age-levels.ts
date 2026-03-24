export type ReadingLevel = "toddler" | "young_child" | "older_child"

export interface ReadingLevelConfig {
  level: ReadingLevel
  description: string
}

export function getReadingLevel(age: number): ReadingLevelConfig {
  if (age <= 3) {
    return {
      level: "toddler",
      description:
        "Very simple sentences. Familiar, everyday words. Repetition encouraged. Short paragraphs.",
    }
  }
  if (age <= 6) {
    return {
      level: "young_child",
      description:
        "Short sentences with some descriptive language. Gentle complexity. Simple dialogue.",
    }
  }
  return {
    level: "older_child",
    description:
      "Longer sentences with richer vocabulary. More involved narrative. Descriptive imagery.",
  }
}
