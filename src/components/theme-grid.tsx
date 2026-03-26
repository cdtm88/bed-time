'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VALID_THEMES } from '@/lib/schemas'
import { themeToFilename } from '@/lib/theme-utils'

interface ThemeGridProps {
  value: string | null
  onChange: (theme: string) => void
}

export function ThemeGrid({ value, onChange }: ThemeGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  return (
    <div className="flex flex-col gap-xs">
      <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-on-surface">
        CHOOSE A THEME
      </span>
      <div role="radiogroup" aria-label="Choose a theme" className="grid grid-cols-2 gap-[12px]">
        {VALID_THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={value === theme}
            onClick={() => onChange(theme)}
            className={[
              'rounded-3xl bg-surface-container-low p-md flex flex-col items-center transition-all duration-300 ease-in-out',
              value === theme
                ? 'bg-primary-container/15 ring-2 ring-primary/30'
                : '',
            ].join(' ')}
          >
            {failedImages.has(theme) ? (
              <div className="w-full aspect-square rounded-3xl bg-surface-container-low flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-highest" />
              </div>
            ) : (
              <Image
                src={'/themes/' + themeToFilename(theme) + '.svg'}
                width={200}
                height={200}
                alt={theme}
                className="w-full aspect-square rounded-3xl"
                unoptimized
                onError={() => setFailedImages(prev => new Set(prev).add(theme))}
              />
            )}
            <span className="mt-sm font-serif text-[1rem] font-semibold text-on-surface">
              {theme}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
