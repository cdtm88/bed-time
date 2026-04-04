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
import { validateParagraph } from "@/lib/safety"

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

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        })

        let buffer = ''
        let paragraphIndex = 0

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            buffer += event.delta.text

            // Check for paragraph boundaries (double newline)
            let boundary: number
            while ((boundary = buffer.indexOf('\n\n')) !== -1) {
              const paragraph = buffer.slice(0, boundary).trim()
              buffer = buffer.slice(boundary + 2)

              if (!paragraph) continue

              // Validate this paragraph before sending to client
              const safe = await validateParagraph(client, paragraph)
              if (!safe) {
                // Unsafe paragraph detected — abort the stream
                controller.close()
                return
              }

              const chunk = paragraphIndex > 0 ? '\n\n' + paragraph : paragraph
              controller.enqueue(encoder.encode(chunk))
              paragraphIndex++
            }
          }
        }

        // Handle final paragraph remaining in buffer
        const remaining = buffer.trim()
        if (remaining) {
          const safe = await validateParagraph(client, remaining)
          if (safe) {
            const chunk = paragraphIndex > 0 ? '\n\n' + remaining : remaining
            controller.enqueue(encoder.encode(chunk))
          }
        }

        controller.close()
      } catch {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
