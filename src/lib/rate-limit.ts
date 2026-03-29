import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Lazy-initialized — only created when UPSTASH_REDIS_REST_URL is present.
// Per D-03: if env var is absent (local dev), bypass all rate limiting.
let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "nightlight-tales",
    })
  }
  return ratelimit
}

// Per D-01/D-02/D-05: sliding window, 10 requests per 1-hour window per IP.
// Per D-03: returns { allowed: true } when no Upstash creds present.
// Per D-06: caller provides the IP (x-forwarded-for, first entry, fallback 127.0.0.1).
export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const limiter = getRatelimit()
  if (!limiter) return { allowed: true }
  const { success } = await limiter.limit(ip)
  return { allowed: success }
}
