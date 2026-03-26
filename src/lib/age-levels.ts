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
        "Very simple sentences. Familiar, everyday words. Repetition encouraged. Short paragraphs. Use soft, warm, fluffy sensory words and simple sounds like splashing and humming to make the world feel cozy and real.",
    }
  }
  if (age <= 6) {
    return {
      level: "young_child",
      description:
        "Short sentences with some descriptive language. Gentle complexity. Simple dialogue. Weave in gentle multi-sense details — the smell of rain, the feel of cool grass, the glow of moonlight — to ground the story in comforting sensations.",
    }
  }
  return {
    level: "older_child",
    description:
      "Longer sentences with richer vocabulary. More involved narrative. Descriptive imagery. Layer vivid but calming sensory details across sight, sound, smell, and touch to create an immersive, soothing atmosphere.",
  }
}
