'use client'

const DURATIONS = [5, 10, 15] as const

interface DurationToggleProps {
  value: number
  onChange: (value: number) => void
}

export function DurationToggle({ value, onChange }: DurationToggleProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-on-surface">
        STORY LENGTH
      </span>
      <div role="radiogroup" aria-label="Story length" className="flex gap-sm">
        {DURATIONS.map((dur) => (
          <button
            key={dur}
            type="button"
            role="radio"
            aria-checked={value === dur}
            onClick={() => onChange(dur)}
            className={[
              'rounded-full h-[44px] px-[20px] font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] transition-all duration-300 ease-in-out',
              value === dur
                ? 'bg-gradient-to-br from-primary to-primary-container text-white'
                : 'bg-surface-container-low text-on-surface',
            ].join(' ')}
          >
            {dur} MIN
          </button>
        ))}
      </div>
    </div>
  )
}
