export async function* readParagraphs(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let boundary: number
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const paragraph = buffer.slice(0, boundary).trim()
      if (paragraph) yield paragraph
      buffer = buffer.slice(boundary + 2)
    }
  }
  const remaining = buffer.trim()
  if (remaining) yield remaining
}
