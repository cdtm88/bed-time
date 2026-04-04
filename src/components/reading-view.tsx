'use client'

import { useEffect, useState } from 'react'
import { readParagraphs } from '@/lib/stream-utils'
import { useWakeLock } from '@/lib/use-wake-lock'
import { LoadingOverlay } from './loading-overlay'

function assembleTitle(name: string, theme: string): string {
  return `${name}'s ${theme} Story`
}

export function ReadingView() {
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storyMeta, setStoryMeta] = useState<{ name: string; theme: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useWakeLock()

  // Track scroll progress
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mount: check for completed story or params, then stream
  useEffect(() => {
    // Check for completed story first (refresh resilience)
    const completedRaw = sessionStorage.getItem('nightlight-story')
    if (completedRaw) {
      try {
        const data = JSON.parse(completedRaw)
        const storyParagraphs = data.story.split('\n\n').filter((p: string) => p.trim())
        setParagraphs(storyParagraphs)
        setStoryMeta({ name: data.name, theme: data.theme })
        setIsComplete(true)
        setIsLoading(false)
        return
      } catch {
        // Fall through to params check
      }
    }

    // Check for params (new story request)
    const paramsRaw = sessionStorage.getItem('nightlight-params')
    if (!paramsRaw) {
      setIsLoading(false)
      return
    }

    let params: { name: string; age: number; theme: string; duration: number }
    try {
      params = JSON.parse(paramsRaw)
    } catch {
      setIsLoading(false)
      setError('load')
      return
    }

    setStoryMeta({ name: params.name, theme: params.theme })

    async function streamStory() {
      setIsStreaming(true)

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: paramsRaw,
        })

        if (!res.ok || !res.body) {
          setError(res.status === 429 ? 'rate-limit' : 'load')
          setIsStreaming(false)
          setIsLoading(false)
          return
        }

        const reader = res.body.getReader()
        let firstParagraph = true

        for await (const paragraph of readParagraphs(reader)) {
          if (firstParagraph) {
            setIsLoading(false)
            firstParagraph = false
          }
          setParagraphs(prev => [...prev, paragraph])
        }

        // Stream complete — persist for refresh resilience
        setParagraphs(prev => {
          const fullStory = prev.join('\n\n')
          sessionStorage.setItem('nightlight-story', JSON.stringify({
            story: fullStory,
            name: params.name,
            theme: params.theme,
          }))
          sessionStorage.removeItem('nightlight-params')
          return prev
        })

        setIsStreaming(false)
        setIsComplete(true)
      } catch {
        setError('mid-stream')
        setIsStreaming(false)
        setIsLoading(false)
      }
    }

    streamStory()
  }, [])

  // Loading state — overlay during generation + validation
  if (isLoading && storyMeta) {
    return <LoadingOverlay name={storyMeta.name} />
  }

  // Error state — load failure or rate limit
  if (error === 'load' || error === 'rate-limit') {
    return (
      <div className="min-h-screen bg-reading-surface flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-lg">
          <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface">
            Couldn&apos;t create your story
          </h1>
          <p className="font-serif text-[1rem] leading-[1.6] text-reading-on-surface-muted mt-sm">
            {error === 'rate-limit'
              ? "You've created a few stories recently. Try again in a bit."
              : 'The story failed to generate. Please try again.'}
          </p>
          <a
            href="/"
            className="mt-lg bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-reading-on-surface-muted focus-visible:outline-offset-2"
          >
            TRY AGAIN
          </a>
        </div>
      </div>
    )
  }

  // Empty state — no params, no story
  if (!isLoading && paragraphs.length === 0 && !error && !storyMeta) {
    return (
      <div className="min-h-screen bg-reading-surface flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-lg">
          <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface">
            No story yet
          </h1>
          <p className="font-serif text-[1rem] leading-[1.6] text-reading-on-surface-muted mt-sm">
            Head back to create a bedtime story.
          </p>
          <a
            href="/"
            aria-label="Create a new bedtime story"
            className="mt-lg bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-reading-on-surface-muted focus-visible:outline-offset-2"
          >
            CREATE A STORY
          </a>
        </div>
      </div>
    )
  }

  // Streaming / Complete state — paragraphs are rendering
  if (paragraphs.length > 0 && storyMeta) {
    return (
      <div className="min-h-screen bg-reading-surface">
        {/* Scroll progress bar */}
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 h-[3px] z-40 transition-opacity duration-300 ease-in-out"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: 'var(--color-secondary-container)',
            opacity: progress > 0 ? 1 : 0,
          }}
        />

        <div className="mx-auto max-w-[640px] px-lg pt-2xl pb-3xl">
          <article
            role="article"
            style={{
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface-muted mb-xl">
              {assembleTitle(storyMeta.name, storyMeta.theme)}
            </h1>

            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`font-serif text-[1.25rem] font-normal leading-[1.8] tracking-[0.01em] text-reading-on-surface${
                  index < paragraphs.length - 1 ? ' mb-md' : ''
                }`}
                style={{ animation: 'paragraphFadeIn 300ms ease-out forwards' }}
              >
                {paragraph}
              </p>
            ))}
          </article>

          {/* Mid-stream error */}
          {error === 'mid-stream' && (
            <div className="mt-lg flex flex-col items-center text-center">
              <p className="font-serif text-[1rem] leading-[1.6] text-reading-on-surface-muted">
                The story couldn&apos;t be completed. Tap to try again.
              </p>
              <a
                href="/"
                className="mt-lg bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-reading-on-surface-muted focus-visible:outline-offset-2"
              >
                TRY AGAIN
              </a>
            </div>
          )}

          {/* End-of-story section */}
          {isComplete && (
            <div className="mt-2xl flex justify-center">
              <a
                href="/"
                className="bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-reading-on-surface-muted focus-visible:outline-offset-2"
              >
                NEW STORY
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Fallback loading state (isLoading but no storyMeta yet)
  return null
}
