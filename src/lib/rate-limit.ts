const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 10

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean } {
  cleanup()
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true }
  }
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false }
  }
  entry.count++
  return { allowed: true }
}
