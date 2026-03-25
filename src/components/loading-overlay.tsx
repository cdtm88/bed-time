'use client'

interface LoadingOverlayProps {
  name: string
}

export function LoadingOverlay({ name }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
      role="alert"
      aria-live="polite"
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="relative w-32 h-32 mb-xl">
        {/* Moon */}
        <div
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-primary"
          style={{ animation: 'breathe 3s ease-in-out infinite' }}
        />
        {/* Stars */}
        <div
          className="absolute w-2 h-2 rounded-full bg-primary-container"
          style={{ top: '10px', right: '18px', animation: 'twinkle 2s ease-in-out infinite', animationDelay: '0s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-primary-container"
          style={{ top: '22px', left: '12px', animation: 'twinkle 2s ease-in-out infinite', animationDelay: '0.4s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-primary-container"
          style={{ bottom: '14px', right: '14px', animation: 'twinkle 2s ease-in-out infinite', animationDelay: '0.8s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-primary-container"
          style={{ bottom: '10px', left: '20px', animation: 'twinkle 2s ease-in-out infinite', animationDelay: '1.2s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-primary-container"
          style={{ top: '8px', left: '32px', animation: 'twinkle 2s ease-in-out infinite', animationDelay: '0.6s' }}
        />
      </div>

      <h2 className="font-serif text-[1.75rem] text-on-surface">
        Crafting {name}&apos;s story&hellip;
      </h2>
      <p className="font-serif text-[1rem] leading-relaxed text-on-surface mt-md">
        This takes about 30 seconds.
      </p>
    </div>
  )
}
