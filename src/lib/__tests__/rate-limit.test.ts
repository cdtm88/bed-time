import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Upstash modules BEFORE importing the module under test.
// This prevents real network calls and guards against module-scope init errors.
const mockLimit = vi.fn()

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn()
    limit = mockLimit
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}))

// Import AFTER mocks are in place
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
    mockLimit.mockReset()
  })

  describe('dev bypass (no UPSTASH_REDIS_REST_URL)', () => {
    it('allows all requests when UPSTASH_REDIS_REST_URL is absent', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      const result = await checkRateLimit('10.0.0.1')
      expect(result).toEqual({ allowed: true })
      expect(mockLimit).not.toHaveBeenCalled()
    })
  })

  describe('Upstash enforced (UPSTASH_REDIS_REST_URL present)', () => {
    beforeEach(() => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'
    })

    afterEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
    })

    it('returns { allowed: true } when limit() returns { success: true }', async () => {
      mockLimit.mockResolvedValue({ success: true })
      const result = await checkRateLimit('10.0.0.2')
      expect(result).toEqual({ allowed: true })
      expect(mockLimit).toHaveBeenCalledWith('10.0.0.2')
    })

    it('returns { allowed: false } when limit() returns { success: false }', async () => {
      mockLimit.mockResolvedValue({ success: false })
      const result = await checkRateLimit('10.0.0.3')
      expect(result).toEqual({ allowed: false })
      expect(mockLimit).toHaveBeenCalledWith('10.0.0.3')
    })

    it('passes the exact IP string to limit()', async () => {
      mockLimit.mockResolvedValue({ success: true })
      await checkRateLimit('192.168.1.100')
      expect(mockLimit).toHaveBeenCalledWith('192.168.1.100')
    })
  })
})
