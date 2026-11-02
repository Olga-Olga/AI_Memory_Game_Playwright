import { motion } from 'motion/react'
import { Crown, Home, Play, RotateCcw, Star } from 'lucide-react'
import type { Difficulty } from '../game/config'
import type { GameState } from '../game/useMemoryGame'
import { formatTime } from '../utils'

const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function PauseOverlay({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  return (
    <motion.div
      {...backdrop}
      className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-void/80 backdrop-blur-xl"
      data-testid="pause-overlay"
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
        <div className="text-glow font-display text-4xl font-black tracking-[0.3em] text-neon-cyan">PAUSED</div>
        <p className="mt-2 text-slate-400">Board hidden — no peeking.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" className="neon-btn flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold" onClick={onResume} data-testid="resume-button">
            <Play size={16} fill="currentColor" /> Resume
          </button>
          <button type="button" className="icon-btn gap-2 px-5 font-display text-xs tracking-widest" onClick={onExit}>
            <Home size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface ResultModalProps {
  difficulty: Difficulty
  state: GameState
  totalPairs: number
  isNewBest: boolean
  onReplay: () => void
  onExit: () => void
}

/** 3 stars for near-perfect recall, fewer as wasted moves pile up. */
function starsFor(moves: number, pairs: number) {
  const ratio = moves / pairs
  return ratio <= 1.6 ? 3 : ratio <= 2.4 ? 2 : 1
}

export function ResultModal({ difficulty, state, totalPairs, isNewBest, onReplay, onExit }: ResultModalProps) {
  const stars = starsFor(state.moves, totalPairs)
  const accuracy = Math.round((totalPairs / state.moves) * 100)

  return (
    <motion.div {...backdrop} className="fixed inset-0 z-30 grid place-items-center bg-void/70 p-4 backdrop-blur-md" role="dialog" aria-modal aria-labelledby="result-title" data-testid="result-modal">
      <motion.div
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="glass relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center"
        style={{ boxShadow: `0 0 80px -20px ${difficulty.accent}` }}
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${difficulty.accent}, transparent)` }} />

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300, damping: 12 }}
            >
              <Star
                size={i === 1 ? 52 : 40}
                className={i < stars ? 'text-neon-gold drop-shadow-[0_0_12px_#fbbf24]' : 'text-slate-700'}
                fill="currentColor"
                strokeWidth={1}
              />
            </motion.div>
          ))}
        </div>

        <h2 id="result-title" className="mt-4 font-display text-3xl font-black tracking-[0.15em] text-white">
          VICTORY
        </h2>
        <p className="mt-1 text-slate-400">
          {difficulty.label} {difficulty.size}×{difficulty.size} cleared
        </p>

        {isNewBest && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-neon-gold/50 bg-neon-gold/10 px-4 py-1 font-display text-xs font-bold tracking-widest text-neon-gold"
            data-testid="new-best"
          >
            <Crown size={14} /> NEW BEST
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-glow mt-6 font-display text-5xl font-black text-neon-cyan tabular-nums"
          data-testid="final-score"
        >
          {state.score.toLocaleString()}
        </motion.div>
        <div className="text-xs tracking-[0.3em] text-slate-500">FINAL SCORE</div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-left">
          <ResultStat label="Time" value={formatTime(state.elapsedMs)} />
          <ResultStat label="Moves" value={String(state.moves)} />
          <ResultStat label="Accuracy" value={`${accuracy}%`} />
          <ResultStat label="Best combo" value={`${state.bestStreak}`} />
          <ResultStat label="Time bonus" value={`+${state.timeBonus.toLocaleString()}`} wide />
        </dl>

        <div className="mt-8 flex gap-3">
          <button type="button" className="icon-btn flex-1 gap-2 py-3 font-display text-xs tracking-widest" onClick={onExit} data-testid="menu-button">
            MENU
          </button>
          <button type="button" className="neon-btn flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold" onClick={onReplay} data-testid="play-again-button">
            <RotateCcw size={16} /> Play again
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ResultStat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-edge bg-white/[0.03] px-4 py-2.5 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-[10px] tracking-[0.25em] text-slate-500 uppercase">{label}</dt>
      <dd className="font-display text-lg font-bold text-white tabular-nums">{value}</dd>
    </div>
  )
}
