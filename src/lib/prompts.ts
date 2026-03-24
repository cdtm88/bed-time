import { ReadingLevelConfig } from "@/lib/age-levels"

const DURATION_CONFIG = {
  5: { words: 750, maxTokens: 1500 },
  10: { words: 1500, maxTokens: 3000 },
  15: { words: 2250, maxTokens: 4096 },
} as const

type Duration = keyof typeof DURATION_CONFIG

export function getWordCount(duration: Duration): number {
  return DURATION_CONFIG[duration].words
}

export function getMaxTokens(duration: Duration): number {
  return DURATION_CONFIG[duration].maxTokens
}

export function buildSystemPrompt(
  readingLevel: ReadingLevelConfig,
  targetWords: number
): string {
  const low = Math.round(targetWords * 0.93)
  const high = Math.round(targetWords * 1.07)

  return `You are a bedtime story writer who creates calming, gentle stories for children to be read aloud by a parent at bedtime.

Writing style for this story:
${readingLevel.description}

Target length: approximately ${low}-${high} words (about ${targetWords} words). This story should take the right amount of time to read aloud before sleep.

Important guidelines:
- Weave the child's name naturally throughout the story so it feels personal and warm.
- The story must be calming and soothing, designed to wind a child down for sleep.
- Follow a gentle narrative arc: a peaceful beginning, a mild challenge or adventure, and a comforting resolution that leads toward sleep.
- Write just the story text with no title, no headers, and no extra formatting. The parent will read it aloud directly.
- End the story in a way that encourages the child to close their eyes and drift off to sleep.`
}

export function buildUserMessage(name: string, theme: string): string {
  return `Write a bedtime story for a child named <child_name>${name}</child_name> about ${theme}.`
}
