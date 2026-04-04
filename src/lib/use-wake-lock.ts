import { useEffect } from 'react'

export function useWakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null

    async function acquire() {
      if (!('wakeLock' in navigator) || !navigator.wakeLock) {
        console.warn('Screen Wake Lock API not supported')
        return
      }
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch (err) {
        console.warn('Wake Lock request failed:', err)
      }
    }

    acquire()

    return () => {
      sentinel?.release()
    }
  }, [])
}
