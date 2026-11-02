import { useState } from 'react'
import { motion } from 'motion/react'
import { Play, Trophy, Timer, Footprints } from 'lucide-react'
import { DIFFICULTIES, pairCount, type Difficulty } from '../game/config'
import { getBest } from '../game/storage'
import { sfx } from '../game/sound'
import { formatTime } from '../utils'
import { Logo } from './Logo'

export function MainMenu({ onStart }: { onStart: (d: Difficulty) => void }) {
  const [selected, setSelected] = useState<Difficulty>(DIFFICULTIES[0])

  return (
    <main className="flex h-full flex-col items-center overflow-y-auto px-4 py-8 sm:justify-center">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <Logo />
      </motion.div>

      <motion.h1
        className="mt-10 text-center font-display text-3xl font-black tracking-wide text-white sm:text-5xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        Train your{' '}
        <span className="bg-gradient-to-r from-neon-cyan via-violet-400 to-neon-pink bg-clip-text text-transparent">memory</span>
      </motion.h1>
      <p className="mt-3 max-w-md text-center text-lg text-slate-400">Flip cards, find pairs, chain combos. Pick your arena.</p>

      <div className="mt-10 grid w-full max-w-4xl gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Board size">
        {DIFFICULTIES.map((d, i) => {
          const best = getBest(d.id)
          const active = selected.id === d.id
          return (
            <motion.button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={active}
              data-testid={`difficulty-${d.size}`}
              onClick={() => {
                setSelected(d)
                sfx.click()
              }}
              onDoubleClick={() => onStart(d)}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass relative overflow-hidden rounded-2xl p-5 text-left"
              style={{
                borderColor: active ? d.accent : undefined,
                boxShadow: active ? `0 0 0 1px ${d.accent}, 0 0 40px -10px ${d.accent}` : undefined,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-xs tracking-[0.3em]" style={{ color: d.accent }}>
                    {d.label.toUpperCase()}
                  </div>
                  <div className="mt-1 font-display text-3xl font-black text-white">
                    {d.size}
                    <span className="text-slate-500">×</span>
                    {d.size}
                  </div>
                </div>
                <GridPreview size={d.size} color={d.accent} active={active} />
              </div>
              <p className="mt-3 text-base text-slate-400">{d.tagline}</p>
              <div className="mt-4 flex items-center gap-4 border-t border-edge pt-3 text-sm text-slate-400">
                <span>{pairCount(d.size)} pairs</span>
                {best ? (
                  <span className="ml-auto flex items-center gap-3 text-slate-300" data-testid={`best-${d.size}`}>
                    <span className="flex items-center gap-1">
                      <Trophy size={14} className="text-neon-gold" />
                      {best.score.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer size={14} />
                      {formatTime(best.timeMs)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Footprints size={14} />
                      {best.moves}
                    </span>
                  </span>
                ) : (
                  <span className="ml-auto text-slate-500">No record yet</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        data-testid="start-button"
        onClick={() => onStart(selected)}
        className="neon-btn mt-10 flex items-center gap-3 rounded-xl px-10 py-4 text-sm font-bold"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <Play size={18} fill="currentColor" /> Start {selected.size}×{selected.size}
      </motion.button>
    </main>
  )
}

function GridPreview({ size, color, active }: { size: number; color: string; active: boolean }) {
  return (
    <div
      className="grid h-14 w-14 gap-px rounded-md bg-white/[0.03] p-1 transition-opacity"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, opacity: active ? 1 : 0.45 }}
      aria-hidden
    >
      {Array.from({ length: size * size }, (_, i) => (
        <span key={i} className="rounded-[1px]" style={{ background: (i * 7) % 5 === 0 ? color : 'rgb(129 140 248 / 0.25)' }} />
      ))}
    </div>
  )
}
