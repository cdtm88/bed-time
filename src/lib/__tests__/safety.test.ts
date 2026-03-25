import { vi, describe, it, expect, beforeEach } from "vitest"

const mockCreate = vi.fn()
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate }
  },
}))

import {
  parseValidationResponse,
  validateStory,
  generateSafeStory,
  type GenerationParams,
} from "@/lib/safety"
import { buildValidationPrompt, buildReinforcedSystemPrompt } from "@/lib/prompts"
import Anthropic from "@anthropic-ai/sdk"
import { getReadingLevel } from "@/lib/age-levels"

function makeMessage(text: string) {
  return {
    id: "msg_test",
    type: "message" as const,
    role: "assistant" as const,
    content: [{ type: "text" as const, text }],
    model: "claude-haiku-4-5-20251001",
    stop_reason: "end_turn" as const,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
  }
}

describe("parseValidationResponse", () => {
  it('returns safe:true for "SAFE"', () => {
    expect(parseValidationResponse("SAFE")).toEqual({ safe: true })
  })

  it("returns safe:true for whitespace-padded SAFE", () => {
    expect(parseValidationResponse("  SAFE  ")).toEqual({ safe: true })
  })

  it("returns safe:true for lowercase safe", () => {
    expect(parseValidationResponse("safe")).toEqual({ safe: true })
  })

  it('returns safe:false with reason for "UNSAFE: Contains scary monster"', () => {
    expect(parseValidationResponse("UNSAFE: Contains scary monster")).toEqual({
      safe: false,
      reason: "Contains scary monster",
    })
  })

  it("returns safe:false with reason for lowercase unsafe", () => {
    expect(parseValidationResponse("unsafe: mild peril")).toEqual({
      safe: false,
      reason: "mild peril",
    })
  })

  it("returns safe:false with undefined reason for UNSAFE without reason", () => {
    expect(parseValidationResponse("UNSAFE")).toEqual({
      safe: false,
      reason: undefined,
    })
  })

  it("returns safe:false for empty string (fail closed)", () => {
    expect(parseValidationResponse("")).toEqual({
      safe: false,
      reason: "Unparseable validation response",
    })
  })

  it("returns safe:false for conversational response (fail closed)", () => {
    expect(parseValidationResponse("I think this story is fine")).toEqual({
      safe: false,
      reason: "Unparseable validation response",
    })
  })
})

describe("validateStory", () => {
  let client: Anthropic

  beforeEach(() => {
    mockCreate.mockReset()
    client = new Anthropic()
  })

  it("returns true when Haiku returns SAFE", async () => {
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))
    const result = await validateStory(client, "A gentle story about bunnies.")
    expect(result).toBe(true)
  })

  it("returns false when Haiku returns UNSAFE", async () => {
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: violence"))
    const result = await validateStory(client, "A scary story.")
    expect(result).toBe(false)
  })

  it('calls client.messages.create with model "claude-haiku-4-5-20251001" and max_tokens 100', async () => {
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))
    await validateStory(client, "A story.")
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
      })
    )
  })

  it("passes buildValidationPrompt() as system prompt", async () => {
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))
    await validateStory(client, "A story.")
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: buildValidationPrompt(),
      })
    )
  })

  it("passes story text as user message content", async () => {
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))
    await validateStory(client, "Once upon a time...")
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Once upon a time..." }],
      })
    )
  })
})

describe("generateSafeStory", () => {
  let client: Anthropic
  const readingLevel = getReadingLevel(5)
  const params: GenerationParams = {
    name: "Lily",
    age: 5,
    theme: "Dragons",
    duration: 10,
    readingLevel,
    targetWords: 1500,
    maxTokens: 3000,
    userMessage: "Write a bedtime story for a child named Lily about Dragons.",
  }

  beforeEach(() => {
    mockCreate.mockReset()
    client = new Anthropic()
  })

  it("returns ok:true when first attempt is safe", async () => {
    // generate call
    mockCreate.mockResolvedValueOnce(makeMessage("Once upon a time, Lily met a dragon."))
    // validate call
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))

    const result = await generateSafeStory(client, params)
    expect(result).toEqual({ ok: true, story: "Once upon a time, Lily met a dragon." })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it("returns ok:true when first attempt unsafe, second safe", async () => {
    // attempt 1: generate
    mockCreate.mockResolvedValueOnce(makeMessage("A scary dragon attacked."))
    // attempt 1: validate
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: violence"))
    // attempt 2: generate
    mockCreate.mockResolvedValueOnce(makeMessage("A friendly dragon played."))
    // attempt 2: validate
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))

    const result = await generateSafeStory(client, params)
    expect(result).toEqual({ ok: true, story: "A friendly dragon played." })
    expect(mockCreate).toHaveBeenCalledTimes(4)
  })

  it("returns ok:true when first two unsafe, third safe", async () => {
    // attempt 1
    mockCreate.mockResolvedValueOnce(makeMessage("Scary story 1"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: violence"))
    // attempt 2
    mockCreate.mockResolvedValueOnce(makeMessage("Scary story 2"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: peril"))
    // attempt 3
    mockCreate.mockResolvedValueOnce(makeMessage("Safe story 3"))
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))

    const result = await generateSafeStory(client, params)
    expect(result).toEqual({ ok: true, story: "Safe story 3" })
    expect(mockCreate).toHaveBeenCalledTimes(6)
  })

  it("returns ok:false when all three attempts are unsafe", async () => {
    // attempt 1
    mockCreate.mockResolvedValueOnce(makeMessage("Scary 1"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: violence"))
    // attempt 2
    mockCreate.mockResolvedValueOnce(makeMessage("Scary 2"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: peril"))
    // attempt 3
    mockCreate.mockResolvedValueOnce(makeMessage("Scary 3"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: death"))

    const result = await generateSafeStory(client, params)
    expect(result).toEqual({ ok: false, reason: "all_attempts_failed" })
    expect(mockCreate).toHaveBeenCalledTimes(6)
  })

  it("uses buildReinforcedSystemPrompt on retry attempts (attempt > 0)", async () => {
    // attempt 1: generate + validate (fails)
    mockCreate.mockResolvedValueOnce(makeMessage("Scary story"))
    mockCreate.mockResolvedValueOnce(makeMessage("UNSAFE: violence"))
    // attempt 2: generate + validate (passes)
    mockCreate.mockResolvedValueOnce(makeMessage("Safe story"))
    mockCreate.mockResolvedValueOnce(makeMessage("SAFE"))

    await generateSafeStory(client, params)

    // First generate call (attempt 0) should NOT use reinforced prompt
    const firstGenCall = mockCreate.mock.calls[0][0]
    const reinforcedPrompt = buildReinforcedSystemPrompt(readingLevel, 1500)
    expect(firstGenCall.system).not.toBe(reinforcedPrompt)

    // Second generate call (attempt 1) SHOULD use reinforced prompt
    const secondGenCall = mockCreate.mock.calls[2][0]
    expect(secondGenCall.system).toBe(reinforcedPrompt)
  })

  it("returns ok:false with reason generation_error when generation throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API error"))

    const result = await generateSafeStory(client, params)
    expect(result).toEqual({ ok: false, reason: "generation_error" })
  })
})

describe("buildValidationPrompt", () => {
  it('returns string containing "SAFE" and "UNSAFE" format instructions', () => {
    const prompt = buildValidationPrompt()
    expect(prompt).toContain("SAFE")
    expect(prompt).toContain("UNSAFE")
  })

  it("returns string containing D-04 strictness criteria keywords", () => {
    const prompt = buildValidationPrompt()
    expect(prompt.toLowerCase()).toContain("violence")
    expect(prompt.toLowerCase()).toContain("scary")
    expect(prompt.toLowerCase()).toContain("death")
    expect(prompt.toLowerCase()).toContain("peril")
  })
})

describe("buildReinforcedSystemPrompt", () => {
  const readingLevel = getReadingLevel(5)

  it("returns string containing the base system prompt content", () => {
    const prompt = buildReinforcedSystemPrompt(readingLevel, 1500)
    expect(prompt).toContain("bedtime story writer")
  })

  it('returns string containing "NO conflict" and "NO scary" safety reinforcement', () => {
    const prompt = buildReinforcedSystemPrompt(readingLevel, 1500)
    expect(prompt).toContain("NO conflict")
    expect(prompt).toContain("NO scary")
  })
})
