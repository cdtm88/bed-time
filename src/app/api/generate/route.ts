export const runtime = "edge"

import Anthropic from "@anthropic-ai/sdk"
import { validateInput, GenerateInput } from "@/lib/schemas"
import { getReadingLevel } from "@/lib/age-levels"
import {
  buildSystemPrompt,
  buildUserMessage,
  getWordCount,
  getMaxTokens,
} from "@/lib/prompts"

const client = new Anthropic()

export async function POST(request: Request) {
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
  const systemPrompt = buildSystemPrompt(readingLevel, targetWords)
  const userMessage = buildUserMessage(name, theme)
  const maxTokens = getMaxTokens(duration as 5 | 10 | 15)

  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      stream: true,
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
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch {
    return new Response(
      JSON.stringify({
        error: "Story generation failed. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
