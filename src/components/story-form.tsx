'use client'

import { useState } from 'react'
import { NameInput } from './name-input'
import { AgeStepper } from './age-stepper'
import { DurationToggle } from './duration-toggle'
import { ThemeGrid } from './theme-grid'
import { LoadingOverlay } from './loading-overlay'

export function StoryForm() {
  const [name, setName] = useState('')
  const [age, setAge] = useState(5)
  const [duration, setDuration] = useState(10)
  const [theme, setTheme] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    name.trim().length > 0 &&
    /^[a-zA-Z\s]{1,30}$/.test(name.trim()) &&
    theme !== null

  async function handleSubmit() {
    if (isLoading || !canSubmit) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), age, theme, duration }),
      })
      if (res.status === 429) {
        setIsLoading(false)
        setError("You've created a few stories recently. Try again in a bit.")
        return
      }
      if (!res.ok) {
        setIsLoading(false)
        setError('Something went wrong creating the story. Please try again.')
        return
      }
      const storyText = await res.text()
      sessionStorage.setItem('nightlight-story', storyText)
      sessionStorage.setItem('nightlight-story-name', name.trim())
      window.location.href = '/story'
    } catch {
      setIsLoading(false)
      setError('Something went wrong creating the story. Please try again.')
    }
  }

  if (isLoading) {
    return <LoadingOverlay name={name.trim()} />
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-[480px] px-lg pt-3xl pb-3xl">
        {/* Title */}
        <h1 className="text-center font-serif text-[1.75rem] text-on-surface">
          Nightlight Tales
        </h1>
        <p className="text-center font-serif text-[1rem] leading-relaxed text-on-surface/70 mt-sm">
          A bedtime story, just for them.
        </p>

        {/* Form fields */}
        <div className="mt-2xl flex flex-col gap-md">
          <NameInput value={name} onChange={setName} />
          <AgeStepper value={age} onChange={setAge} />
          <DurationToggle value={duration} onChange={setDuration} />
        </div>

        {/* Theme grid */}
        <div className="mt-2xl">
          <ThemeGrid value={theme} onChange={setTheme} />
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          className="mt-xl w-full h-[52px] rounded-full bg-gradient-to-br from-primary to-primary-container font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-white transition-all duration-300 ease-in-out hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate Story
        </button>

        {/* Error messages */}
        {error && (
          <p
            role="alert"
            className="mt-sm font-serif text-[1rem] leading-relaxed text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
