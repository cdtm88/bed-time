'use client'

interface AgeStepperProps {
  value: number
  onChange: (value: number) => void
}

export function AgeStepper({ value, onChange }: AgeStepperProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-on-surface">
        AGE
      </span>
      <div className="flex items-center gap-sm">
        <button
          type="button"
          aria-label="Decrease age"
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-[44px] h-[44px] rounded-full bg-surface-container-highest flex items-center justify-center font-sans font-semibold text-on-surface text-[1rem] transition-opacity duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="min-w-[48px] text-center font-serif text-[1.75rem] text-on-surface">
          {value}
        </span>
        <button
          type="button"
          aria-label="Increase age"
          disabled={value >= 10}
          onClick={() => onChange(Math.min(10, value + 1))}
          className="w-[44px] h-[44px] rounded-full bg-surface-container-highest flex items-center justify-center font-sans font-semibold text-on-surface text-[1rem] transition-opacity duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  )
}
