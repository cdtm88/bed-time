import Anthropic from "@anthropic-ai/sdk"
import { ReadingLevelConfig } from "@/lib/age-levels"
import {
  buildSystemPrompt,
  buildReinforcedSystemPrompt,
  buildValidationPrompt,
} from "@/lib/prompts"

export interface GenerationParams {
  name: string
  age: number
  theme: string
  duration: 5 | 10 | 15
  readingLevel: ReadingLevelConfig
  targetWords: number
  maxTokens: number
  userMessage: string
}

export type SafeStoryResult =
  | { ok: true; story: string }
  | { ok: false; reason: "all_attempts_failed" | "generation_error" }

export function parseValidationResponse(raw: string): { safe: boolean; reason?: string } {
  const trimmed = raw.trim().toUpperCase()
  if (trimmed === "SAFE") return { safe: true }
  if (trimmed.startsWith("UNSAFE")) {
    const reason = raw.trim().replace(/^UNSAFE[:\s]*/i, "").trim() || undefined
    return { safe: false, reason }
  }
  return { safe: false, reason: "Unparseable validation response" }
}

export async function validateStory(
  client: Anthropic,
  story: string
): Promise<boolean> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: buildValidationPrompt(),
    messages: [{ role: "user", content: story }],
  })

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")

  return parseValidationResponse(text).safe
}

const MAX_ATTEMPTS = 3

export async function generateSafeStory(
  client: Anthropic,
  params: GenerationParams
): Promise<SafeStoryResult> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const reinforced = attempt > 0
    const systemPrompt = reinforced
      ? buildReinforcedSystemPrompt(params.readingLevel, params.targetWords)
      : buildSystemPrompt(params.readingLevel, params.targetWords)

    let story: string
    try {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: params.maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: params.userMessage }],
      })
      story = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("")
    } catch {
      return { ok: false, reason: "generation_error" }
    }

    const safe = await validateStory(client, story)
    if (safe) return { ok: true, story }
  }
  return { ok: false, reason: "all_attempts_failed" }
}
