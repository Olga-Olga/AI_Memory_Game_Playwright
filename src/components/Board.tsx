import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { CardData } from '../game/symbols'
import { Card } from './Card'

interface BoardProps {
  size: number
  deck: CardData[]
  matched: boolean[]
  revealed: number[]
  pendingMatch: boolean
  onFlip: (id: number) => void
}

// Tighter gaps and smaller minimum cells as the board grows.
const LAYOUT: Record<number, { gap: number; minCell: number }> = {
  5: { gap: 14, minCell: 52 },
  10: { gap: 8, minCell: 30 },
  20: { gap: 4, minCell: 22 },
}

export function Board({ size, deck, matched, revealed, pendingMatch, onFlip }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState(0)
  const { gap, minCell } = LAYOUT[size] ?? { gap: 6, minCell: 24 }

  // Size cards so the whole board fits the available space; small screens scroll instead.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const padding = 24
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const fit = Math.min(width - padding, height - padding) - gap * (size - 1)
      setCell(Math.max(minCell, Math.floor(fit / size)))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [size, gap, minCell])

  const pairComplete = revealed.length === 2
  const feedback = pairComplete ? (pendingMatch ? 'correct' : 'wrong') : null

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-auto">
      <div className="flex min-h-full min-w-full items-center justify-center p-3">
        {cell > 0 && (
          <div
            className="board glass grid rounded-2xl"
            data-testid="board"
            data-size={size}
            style={
              {
                '--cell': `${cell}px`,
                gridTemplateColumns: `repeat(${size}, var(--cell))`,
                gap,
                padding: Math.max(gap, 8),
              } as CSSProperties
            }
          >
            {deck.map((card) => {
              const isRevealed = revealed.includes(card.id)
              return (
                <Card
                  key={card.id}
                  id={card.id}
                  symbol={card.symbol}
                  faceUp={isRevealed || matched[card.id]}
                  matched={matched[card.id]}
                  feedback={isRevealed ? feedback : null}
                  onFlip={onFlip}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
