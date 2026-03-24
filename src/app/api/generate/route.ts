export const runtime = "edge"

export async function POST(_request: Request) {
  return new Response("Story generation coming in Phase 2", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}
