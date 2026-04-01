export const runtime = "edge"

import Anthropic from "@anthropic-ai/sdk"
import { validateInput, GenerateInput } from "@/lib/schemas"
import { checkRateLimit } from "@/lib/rate-limit"
import { getReadingLevel } from "@/lib/age-levels"
import {
  buildSystemPrompt,
  buildUserMessage,
  getWordCount,
  getMaxTokens,
} from "@/lib/prompts"

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
  const systemPrompt = buildSystemPrompt(readingLevel, targetWords)

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch {
    // Per D-07/D-08: warm, non-technical error message
    return new Response(
      JSON.stringify({
        error: "We weren't able to create a story right now. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
