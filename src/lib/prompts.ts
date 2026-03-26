import { ReadingLevelConfig } from "@/lib/age-levels"

const DURATION_CONFIG = {
  3: { words: 450, maxTokens: 900 },
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

  return `You are a bedtime story writer. A parent will read this story aloud to their child at bedtime in a dim, quiet room.

Reading level:
${readingLevel.description}

Length: aim for ${low}-${high} words (about ${targetWords} words), paced for reading aloud before sleep.

Story structure — use a three-part narrative arc:
- Beginning (2-3 paragraphs): Establish the world and the child's character. Warm, curious, inviting.
- Middle (3-4 paragraphs): A gentle adventure, discovery, or small challenge framed around wonder — never tension, fear, or peril.
- Ending (2-3 paragraphs): A calming resolution that winds down toward sleep. Make each sentence progressively shorter than the last. Weave in sleepy sensory cues — heavy eyelids, slow breathing, the warmth of a blanket, a soft yawn. The final paragraph should invite the child to close their eyes and drift off to sleep.

Opening variety — choose one of these four styles and never begin two stories the same way:
1. In medias res: start in the middle of action.
2. Wonder: open with a question or mystery.
3. Setting: paint the world before introducing the child.
4. Character voice: begin with something the child thinks or feels.

Voice and craft:
- Ground descriptions in the senses. Favour calming, comforting sensations.
- Weave the child's name naturally throughout so the story feels personal.
- Write just the story text — no title, no headers, no extra formatting.`
}

export function buildUserMessage(name: string, theme: string): string {
  return `Write a bedtime story for a child named <child_name>${name}</child_name> about ${theme}.`
}

export function buildValidationPrompt(): string {
  return `You are a children's bedtime story safety reviewer. Your job is to determine if a story is appropriate for a parent to read to a child aged 0-10 at bedtime.

A story is UNSAFE if it contains ANY of the following:
- Violence of any kind (cartoon, implied, or explicit)
- Scary or horror elements (frightening monsters, nightmares, sinister characters)
- Death or dying (characters, animals, implied)
- Real-world dangers (strangers, injuries, natural disasters)
- Anything unsettling or anxiety-inducing
- Mild peril (a child briefly lost, slightly scared, in danger)
- Any content a cautious parent might find inappropriate for bedtime

When in doubt, flag as UNSAFE.

Respond with EXACTLY one of:
- SAFE
- UNSAFE: <brief reason>

Do not include any other text in your response.`
}

export function buildReinforcedSystemPrompt(
  readingLevel: ReadingLevelConfig,
  targetWords: number
): string {
  const basePrompt = buildSystemPrompt(readingLevel, targetWords)
  return `${basePrompt}

CRITICAL SAFETY REQUIREMENTS — this story must be completely safe for bedtime:
- NO conflict, peril, danger, villains, or tension of any kind
- NO scary elements, no monsters (even friendly ones that could seem scary), no darkness as a threat
- NO characters getting lost, hurt, scared, or in any risky situation
- Focus ONLY on warmth, comfort, wonder, gentle discovery, and calm
- The story should feel like a warm hug — nothing that could make a child anxious
- Every character is kind, every situation is safe, every outcome is peaceful`
}
