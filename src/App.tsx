import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Background } from './components/Background'
import { MainMenu } from './components/MainMenu'
import { GameScreen } from './components/GameScreen'
import type { Difficulty } from './game/config'

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  return (
    <div className="relative h-full overflow-hidden">
      <Background />
      <AnimatePresence mode="wait">
        <motion.div
          key={difficulty?.id ?? 'menu'}
          className="relative z-10 h-full"
          // Opacity only: filters/scale on a 400-card screen are too heavy without a GPU.
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {difficulty ? (
            <GameScreen difficulty={difficulty} onExit={() => setDifficulty(null)} />
          ) : (
            <MainMenu onStart={setDifficulty} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
