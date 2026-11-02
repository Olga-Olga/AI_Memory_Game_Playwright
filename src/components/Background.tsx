import type { CSSProperties } from 'react'

export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="orb left-[-10%] top-[-15%] h-[45vmax] w-[45vmax]" style={{ '--orb': '#4f46e5' } as CSSProperties} />
      <div className="orb bottom-[-20%] right-[-10%] h-[40vmax] w-[40vmax]" style={{ '--orb': '#c026d3', animationDelay: '-9s' } as CSSProperties} />
      <div className="orb left-[40%] top-[30%] h-[25vmax] w-[25vmax] opacity-60" style={{ '--orb': '#06b6d4', animationDelay: '-4s' } as CSSProperties} />
      <div className="bg-grid absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.7))]" />
    </div>
  )
}
