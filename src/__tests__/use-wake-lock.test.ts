import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWakeLock } from "@/lib/use-wake-lock"

const mockRelease = vi.fn().mockResolvedValue(undefined)
const mockSentinel = {
  released: false,
  type: "screen" as const,
  release: mockRelease,
}
const mockRequest = vi.fn().mockResolvedValue(mockSentinel)

describe("useWakeLock", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "wakeLock", {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    })
    vi.spyOn(console, "warn").mockImplementation(() => {})
    mockRequest.mockClear()
    mockRelease.mockClear()
    mockRequest.mockResolvedValue(mockSentinel)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("acquires wake lock on mount", async () => {
    const { unmount } = renderHook(() => useWakeLock())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(mockRequest).toHaveBeenCalledWith("screen")
    unmount()
  })

  it("releases wake lock on unmount", async () => {
    const { unmount } = renderHook(() => useWakeLock())

    // Wait for the async acquire() to complete so sentinel is assigned
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    // Unmount triggers the cleanup which calls sentinel.release()
    unmount()
    expect(mockRelease).toHaveBeenCalledOnce()
  })

  it("silently handles unsupported browser", async () => {
    Object.defineProperty(navigator, "wakeLock", {
      value: undefined,
      configurable: true,
    })

    const { unmount } = renderHook(() => useWakeLock())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Wake Lock"),
    )
    unmount()
  })

  it("silently handles request denial", async () => {
    const error = new DOMException("Not allowed", "NotAllowedError")
    mockRequest.mockRejectedValueOnce(error)

    const { unmount } = renderHook(() => useWakeLock())

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(console.warn).toHaveBeenCalled()
    unmount()
  })
})
