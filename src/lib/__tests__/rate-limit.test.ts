import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must be imported after vi.mock if needed, but we mock timers via vi.useFakeTimers
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('allows the first call from an IP', () => {
    vi.useFakeTimers()
    const result = checkRateLimit('10.0.0.1')
    expect(result).toEqual({ allowed: true })
    vi.useRealTimers()
  })

  it('allows calls 2-10 within the same window', () => {
    vi.useFakeTimers()
    const ip = '10.0.0.2'
    // First call
    checkRateLimit(ip)
    // Calls 2-10
    for (let i = 2; i <= 10; i++) {
      const result = checkRateLimit(ip)
      expect(result).toEqual({ allowed: true })
    }
    vi.useRealTimers()
  })

  it('blocks the 11th call within the same window', () => {
    vi.useFakeTimers()
    const ip = '10.0.0.3'
    // Make 10 allowed calls
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip)
    }
    // 11th call should be blocked
    const result = checkRateLimit(ip)
    expect(result).toEqual({ allowed: false })
    vi.useRealTimers()
  })

  it('treats different IPs independently', () => {
    vi.useFakeTimers()
    const ipA = '10.0.0.4'
    const ipB = '10.0.0.5'
    // Exhaust ipA
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ipA)
    }
    // ipA is now blocked
    expect(checkRateLimit(ipA)).toEqual({ allowed: false })
    // ipB is still allowed
    expect(checkRateLimit(ipB)).toEqual({ allowed: true })
    vi.useRealTimers()
  })

  it('allows calls again after the 1-hour window resets', () => {
    vi.useFakeTimers()
    const ip = '10.0.0.6'
    // Exhaust the limit
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip)
    }
    expect(checkRateLimit(ip)).toEqual({ allowed: false })
    // Advance time by 1 hour + 1ms to reset the window
    vi.advanceTimersByTime(3600001)
    // Should be allowed again
    expect(checkRateLimit(ip)).toEqual({ allowed: true })
    vi.useRealTimers()
  })
})
