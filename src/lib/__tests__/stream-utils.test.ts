import { describe, it, expect } from "vitest"
import { readParagraphs } from "@/lib/stream-utils"

function mockReader(
  chunks: Uint8Array[],
): ReadableStreamDefaultReader<Uint8Array> {
  let index = 0
  return {
    read: async () => {
      if (index < chunks.length) {
        return { done: false as const, value: chunks[index++] }
      }
      return { done: true as const, value: undefined }
    },
    cancel: async () => {},
    releaseLock: () => {},
    closed: Promise.resolve(undefined),
  } as unknown as ReadableStreamDefaultReader<Uint8Array>
}

async function collect(
  gen: AsyncGenerator<string>,
): Promise<string[]> {
  const results: string[] = []
  for await (const item of gen) {
    results.push(item)
  }
  return results
}

describe("readParagraphs", () => {
  it("splits complete paragraphs on \\n\\n", async () => {
    const encoder = new TextEncoder()
    const reader = mockReader([
      encoder.encode("Hello world\n\nSecond paragraph\n\nThird paragraph"),
    ])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual(["Hello world", "Second paragraph", "Third paragraph"])
  })

  it("handles partial chunks across reads", async () => {
    const encoder = new TextEncoder()
    const reader = mockReader([
      encoder.encode("Hello wo"),
      encoder.encode("rld\n\nSecond"),
      encoder.encode(" paragraph"),
    ])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual(["Hello world", "Second paragraph"])
  })

  it("handles trailing text without final \\n\\n", async () => {
    const encoder = new TextEncoder()
    const reader = mockReader([
      encoder.encode("First\n\nSecond"),
    ])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual(["First", "Second"])
  })

  it("handles multi-byte characters split across chunks", async () => {
    // Em-dash is U+2014, encoded as 0xE2 0x80 0x94 in UTF-8
    const reader = mockReader([
      new Uint8Array([
        ...new TextEncoder().encode("Hello"),
        0xe2,
        0x80,
      ]),
      new Uint8Array([
        0x94,
        ...new TextEncoder().encode(" world"),
      ]),
    ])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual(["Hello\u2014 world"])
  })

  it("yields nothing for empty stream", async () => {
    const reader = mockReader([])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual([])
  })

  it("skips empty paragraphs from consecutive \\n\\n", async () => {
    const encoder = new TextEncoder()
    const reader = mockReader([
      encoder.encode("Hello\n\n\n\nWorld"),
    ])
    const result = await collect(readParagraphs(reader))
    expect(result).toEqual(["Hello", "World"])
  })
})
