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
import { generateSafeStory } from "@/lib/safety"

const client = new Anthropic()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const { allowed } = await checkRateLimit(ip)
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
  const targetWords = getWordCount(duration)
  const userMessage = buildUserMessage(name, theme)
  const maxTokens = getMaxTokens(duration)

  try {
    const result = await generateSafeStory(client, {
      name,
      age,
      theme,
      duration: duration as 3 | 5 | 10 | 15,
      readingLevel,
      targetWords,
      maxTokens,
      userMessage,
    })

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "We weren't able to create a story right now. Please try again." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()
    const story = result.story
    const paragraphs = story.split('\n\n')

    const readable = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < paragraphs.length; i++) {
          const chunk = i > 0 ? '\n\n' + paragraphs[i] : paragraphs[i]
          controller.enqueue(encoder.encode(chunk))
          if (i < paragraphs.length - 1) {
            await new Promise(r => setTimeout(r, 80))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch {
    return new Response(
      JSON.stringify({
        error: "We weren't able to create a story right now. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
