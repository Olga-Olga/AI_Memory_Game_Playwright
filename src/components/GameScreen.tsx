import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { pairCount, type Difficulty } from '../game/config'
import { useMemoryGame } from '../game/useMemoryGame'
import { getBest, saveBest } from '../game/storage'
import { isMuted, setMuted } from '../game/sound'
import { Board } from './Board'
import { Hud } from './Hud'
import { PauseOverlay, ResultModal } from './Overlays'

interface GameScreenProps {
  difficulty: Difficulty
  onExit: () => void
}

export function GameScreen({ difficulty, onExit }: GameScreenProps) {
  const { state, pendingMatch, flip, pause, resume, restart } = useMemoryGame(difficulty)
  const [muted, setMutedState] = useState(isMuted)
  // Captured before the run so "new best" is decided against the previous record.
  const [previousBest, setPreviousBest] = useState(() => getBest(difficulty.id))
  const totalPairs = pairCount(difficulty.size)
  const won = state.status === 'won'
  const isNewBest = won && (!previousBest || state.score > previousBest.score)

  useEffect(() => {
    if (won) saveBest(difficulty.id, { score: state.score, timeMs: state.elapsedMs, moves: state.moves })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won])

  const handleRestart = useCallback(() => {
    setPreviousBest(getBest(difficulty.id))
    restart()
  }, [difficulty.id, restart])

  const togglePause = useCallback(() => (state.status === 'paused' ? resume() : pause()), [state.status, pause, resume])

  // Keyboard: Esc / P pause, R restart. Auto-pause when the tab is hidden.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') togglePause()
      else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) handleRestart()
    }
    const onVisibility = () => document.hidden && pause()
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [togglePause, handleRestart, pause])

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:gap-4 sm:p-5">
      <Hud
        difficulty={difficulty}
        state={state}
        totalPairs={totalPairs}
        muted={muted}
        onToggleMute={() => {
          setMuted(!muted)
          setMutedState(!muted)
        }}
        onPauseToggle={togglePause}
        onRestart={handleRestart}
        onExit={onExit}
      />

      <div className="relative min-h-0 flex-1">
        <motion.div key={state.deck[0]?.symbol?.key ?? 'board'} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Board size={difficulty.size} deck={state.deck} matched={state.matched} revealed={state.revealed} pendingMatch={pendingMatch} onFlip={flip} />
        </motion.div>
        {state.status === 'ready' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-sm tracking-[0.25em] text-slate-500 uppercase">
            Flip any card to start the clock
          </div>
        )}
        <AnimatePresence>{state.status === 'paused' && <PauseOverlay onResume={resume} onExit={onExit} />}</AnimatePresence>
      </div>

      <AnimatePresence>
        {won && (
          <ResultModal difficulty={difficulty} state={state} totalPairs={totalPairs} isNewBest={isNewBest} onReplay={handleRestart} onExit={onExit} />
        )}
      </AnimatePresence>
    </div>
  )
}
