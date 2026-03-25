export const runtime = "edge"

import Anthropic from "@anthropic-ai/sdk"
import { validateInput, GenerateInput } from "@/lib/schemas"
import { checkRateLimit } from "@/lib/rate-limit"
import { getReadingLevel } from "@/lib/age-levels"
import {
  buildUserMessage,
  getWordCount,
  getMaxTokens,
} from "@/lib/prompts"
import { generateSafeStory, GenerationParams } from "@/lib/safety"

const client = new Anthropic()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const { allowed } = checkRateLimit(ip)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "You've created a few stories recently. Try again in a bit." }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const validationError = validateInput(body)
  if (validationError !== null) {
    return new Response(JSON.stringify({ error: validationError }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { name, age, theme, duration } = body as GenerateInput
  const readingLevel = getReadingLevel(age)
  const targetWords = getWordCount(duration as 5 | 10 | 15)
  const userMessage = buildUserMessage(name, theme)
  const maxTokens = getMaxTokens(duration as 5 | 10 | 15)

  try {
    const params: GenerationParams = {
      name,
      age,
      theme,
      duration: duration as 5 | 10 | 15,
      readingLevel,
      targetWords,
      maxTokens,
      userMessage,
    }

    const result = await generateSafeStory(client, params)

    if (result.ok) {
      return new Response(result.story, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }

    // Per D-07: warm, non-technical error message. Per D-08: status 500.
    return new Response(
      JSON.stringify({
        error: "We weren't able to create a story right now. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  } catch {
    // Per D-07/D-08: same friendly error for unexpected failures
    return new Response(
      JSON.stringify({
        error: "We weren't able to create a story right now. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
