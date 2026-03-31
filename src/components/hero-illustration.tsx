'use client'

export function HeroIllustration() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-lg">
      <style>{`
        @keyframes gentleBreathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* Moon - gradient circle echoing loading overlay */}
      <div
        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-primary"
        style={{ animation: 'gentleBreathe 4s ease-in-out infinite' }}
      />
      {/* Gold stars */}
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-secondary-container"
        style={{ top: '8px', right: '16px', opacity: 0.7 }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-secondary-container"
        style={{ bottom: '12px', right: '12px', opacity: 0.6 }}
      />
      {/* Light blue stars */}
      <div
        className="absolute w-1 h-1 rounded-full bg-primary-container"
        style={{ top: '16px', left: '10px', opacity: 0.5 }}
      />
      <div
        className="absolute w-1 h-1 rounded-full bg-primary-container"
        style={{ bottom: '20px', left: '18px', opacity: 0.4 }}
      />
    </div>
  )
}
