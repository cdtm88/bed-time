'use client'

interface AgeStepperProps {
  value: number
  onChange: (value: number) => void
}

const AGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function AgeStepper({ value, onChange }: AgeStepperProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-on-surface">
        AGE
      </span>
      <div className="grid grid-cols-5 gap-sm">
        {AGES.map(age => (
          <button
            key={age}
            type="button"
            aria-label={`Age ${age}`}
            aria-pressed={value === age}
            onClick={() => onChange(age)}
            className={`h-[44px] rounded-full font-sans text-[1rem] font-medium transition-all duration-200 ${
              value === age
                ? 'bg-primary text-white'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            {age}
          </button>
        ))}
      </div>
    </div>
  )
}
