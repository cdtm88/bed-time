'use client'

import { useEffect, useState } from 'react'

interface StoryData {
  story: string
  name: string
  theme: string
}

function assembleTitle(name: string, theme: string): string {
  return `${name}'s ${theme} Story`
}

export function ReadingView() {
  const [storyData, setStoryData] = useState<StoryData | null>(null)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)

  // Read story data from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem('nightlight-story')
    if (raw === null) return
    try {
      const data: StoryData = JSON.parse(raw)
      setStoryData(data)
    } catch {
      setError(true)
    }
  }, [])

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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-reading-surface flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-lg">
          <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface">
            Something went wrong
          </h1>
          <p className="font-serif text-[1rem] leading-[1.6] text-reading-on-surface-muted mt-sm">
            Something went wrong loading the story. Please try generating a new
            one.
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

  // Empty state
  if (!storyData) {
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

  // Story loaded state
  const paragraphs = storyData.story.split('\n\n').filter((p) => p.trim())

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

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        style={{ animation: 'fadeIn 600ms ease-in-out' }}
        className="mx-auto max-w-[640px] px-lg pt-2xl pb-3xl"
      >
        <article
          role="article"
          style={{
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <h1 className="font-serif text-[2rem] font-normal leading-[1.3] tracking-[-0.02em] text-reading-on-surface-muted mb-xl">
            {assembleTitle(storyData.name, storyData.theme)}
          </h1>

          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`font-serif text-[1.25rem] font-normal leading-[1.8] tracking-[0.01em] text-reading-on-surface${
                index < paragraphs.length - 1 ? ' mb-md' : ''
              }`}
            >
              {paragraph}
            </p>
          ))}
        </article>

        {/* End-of-story section */}
        <div className="mt-2xl flex justify-center">
          <a
            href="/"
            className="bg-secondary-container text-on-secondary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] h-[48px] px-xl rounded-full inline-flex items-center justify-center transition-all duration-300 ease-in-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-reading-on-surface-muted focus-visible:outline-offset-2"
          >
            NEW STORY
          </a>
        </div>
      </div>
    </div>
  )
}
