import { memo, type CSSProperties } from 'react'
import { Hexagon } from 'lucide-react'
import type { SymbolDef } from '../game/symbols'

interface CardProps {
  id: number
  symbol: SymbolDef | null
  faceUp: boolean
  matched: boolean
  feedback: 'correct' | 'wrong' | null
  onFlip: (id: number) => void
}

export const Card = memo(function Card({ id, symbol, faceUp, matched, feedback, onFlip }: CardProps) {
  if (!symbol) {
    return (
      <div className="core-tile" data-testid="core-tile" aria-hidden>
        <Hexagon className="card-icon" style={{ '--accent': '#fbbf24' } as CSSProperties} />
      </div>
    )
  }

  const { Icon } = symbol
  const classes = ['card', faceUp && 'is-up', matched && 'is-matched', feedback && `is-${feedback}`].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      style={{ '--accent': symbol.color } as CSSProperties}
      onClick={() => onFlip(id)}
      disabled={matched}
      aria-label={faceUp ? symbol.name : `Card ${id + 1}, hidden`}
      data-testid={`card-${id}`}
      data-state={matched ? 'matched' : faceUp ? 'revealed' : 'hidden'}
      data-symbol={faceUp ? symbol.key : undefined}
    >
      <span className="card-inner">
        <span className="card-face card-back" />
        <span className="card-face card-front">
          <Icon className="card-icon" strokeWidth={2.2} />
        </span>
      </span>
    </button>
  )
})
