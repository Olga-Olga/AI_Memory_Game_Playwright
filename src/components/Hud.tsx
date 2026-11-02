import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { Difficulty } from '../game/config'
import { elapsedOf, streakMultiplier, type GameState } from '../game/useMemoryGame'
import { formatTime } from '../utils'
import { Logo } from './Logo'

interface HudProps {
  difficulty: Difficulty
  state: GameState
  totalPairs: number
  muted: boolean
  onToggleMute: () => void
  onPauseToggle: () => void
  onRestart: () => void
  onExit: () => void
}

export function Hud({ difficulty, state, totalPairs, muted, onToggleMute, onPauseToggle, onRestart, onExit }: HudProps) {
  const progress = state.pairsFound / totalPairs
  const paused = state.status === 'paused'

  return (
    <header className="glass flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3">
        <button type="button" className="icon-btn h-10 w-10" onClick={onExit} aria-label="Back to menu" data-testid="exit-button">
          <ArrowLeft size={18} />
        </button>
        <div className="hidden md:block">
          <Logo compact />
        </div>
        <span
          className="rounded-md border px-2 py-1 font-display text-[11px] font-bold tracking-[0.2em]"
          style={{ color: difficulty.accent, borderColor: `${difficulty.accent}66`, background: `${difficulty.accent}14` }}
        >
          {difficulty.label.toUpperCase()} {difficulty.size}×{difficulty.size}
        </span>
      </div>

      <div className="order-last flex w-full items-center justify-between gap-4 sm:order-none sm:w-auto sm:flex-1 sm:justify-center sm:gap-8">
        <Stat label="Time" testId="stat-time">
          <Clock state={state} />
        </Stat>
        <Stat label="Moves" testId="stat-moves">{state.moves}</Stat>
        <Stat label="Pairs" testId="stat-pairs">
          <span>
            {state.pairsFound}
            <span className="text-slate-500">/{totalPairs}</span>
          </span>
          <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink"
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </span>
        </Stat>
        <Stat label="Score" testId="stat-score">
          <motion.span key={state.score} initial={{ scale: 1.25, color: '#fbbf24' }} animate={{ scale: 1, color: '#ffffff' }} className="inline-block">
            {state.score.toLocaleString()}
          </motion.span>
        </Stat>
        <ComboBadge streak={state.streak} />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <button type="button" className="icon-btn h-10 w-10" onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'} data-testid="mute-button">
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          className="icon-btn h-10 w-10 disabled:opacity-40"
          onClick={onPauseToggle}
          disabled={state.status !== 'playing' && !paused}
          aria-label={paused ? 'Resume' : 'Pause'}
          data-testid="pause-button"
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <button type="button" className="icon-btn h-10 w-10" onClick={onRestart} aria-label="Restart" data-testid="restart-button">
          <RotateCcw size={18} />
        </button>
      </div>
    </header>
  )
}

function Stat({ label, testId, children }: { label: string; testId: string; children: ReactNode }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-[10px] font-semibold tracking-[0.3em] text-slate-500 uppercase">{label}</div>
      <div className="font-display text-base font-bold text-white tabular-nums sm:text-lg" data-testid={testId}>
        {children}
      </div>
    </div>
  )
}

function Clock({ state }: { state: GameState }) {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => {
    if (state.runningSince === null) return
    const timer = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(timer)
  }, [state.runningSince])
  return <>{formatTime(state.runningSince === null ? state.elapsedMs : elapsedOf(state, now))}</>
}

function ComboBadge({ streak }: { streak: number }) {
  return (
    <div className="hidden w-16 justify-center sm:flex">
      <AnimatePresence mode="popLayout">
        {streak >= 2 && (
          <motion.div
            key={streak}
            initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="text-glow font-display text-lg font-black text-neon-gold"
            data-testid="combo"
          >
            x{streakMultiplier(streak + 1).toFixed(1)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
