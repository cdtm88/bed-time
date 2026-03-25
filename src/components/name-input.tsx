'use client'

interface NameInputProps {
  value: string
  onChange: (value: string) => void
}

export function NameInput({ value, onChange }: NameInputProps) {
  const hasError = value.length > 0 && !/^[a-zA-Z\s]{1,30}$/.test(value)

  return (
    <div className="flex flex-col gap-xs">
      <label
        htmlFor="name"
        className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-on-surface"
      >
        NAME
      </label>
      <input
        type="text"
        id="name"
        maxLength={30}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your child's name"
        className={[
          'w-full h-[48px] rounded-full bg-surface-container-highest px-lg font-serif text-[1rem] text-on-surface placeholder:text-on-surface/40 outline-none transition-all duration-300 ease-in-out',
          hasError
            ? 'ring-2 ring-destructive/40'
            : 'focus:ring-2 focus:ring-primary-container',
        ].join(' ')}
      />
      <p
        className={[
          'font-sans text-[0.75rem] font-semibold text-destructive mt-xs transition-opacity duration-300',
          hasError ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        Letters and spaces only, up to 30 characters
      </p>
    </div>
  )
}
