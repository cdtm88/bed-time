'use client'

import { useEffect, useState } from 'react'

export default function StoryPage() {
  const [story, setStory] = useState<string | null>(null)

  useEffect(() => {
    const text = sessionStorage.getItem('nightlight-story')
    if (text) {
      setStory(text)
    }
  }, [])

  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="font-serif text-on-surface">No story found. Go back and generate one.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface p-lg">
      <div className="mx-auto max-w-2xl">
        <article className="font-serif text-on-surface whitespace-pre-wrap leading-relaxed">
          {story}
        </article>
      </div>
    </main>
  )
}
