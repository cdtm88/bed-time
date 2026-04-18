import { Redis } from "@upstash/redis"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return new Response("No Redis configured", { status: 200 })
  }

  const redis = Redis.fromEnv()
  await redis.set("nightlight-tales:keepalive", Date.now(), { ex: 60 * 60 * 24 * 8 })

  return new Response("ok", { status: 200 })
}
