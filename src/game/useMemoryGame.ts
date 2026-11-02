import { useCallback, useEffect, useReducer } from 'react'
import { type Difficulty, pairCount } from './config'
import { buildDeck, type CardData } from './symbols'
import { sfx } from './sound'

export type GameStatus = 'ready' | 'playing' | 'paused' | 'won'

export interface GameState {
  deck: CardData[]
  matched: boolean[]
  /** Ids of face-up, unresolved cards (0–2). */
  revealed: number[]
  moves: number
  pairsFound: number
  streak: number
  bestStreak: number
  score: number
  status: GameStatus
  /** Time banked before the current running segment. */
  elapsedMs: number
  /** Timestamp of when the current running segment began, null while stopped. */
  runningSince: number | null
  timeBonus: number
}

type Action =
  | { type: 'flip'; id: number; now: number }
  | { type: 'resolve'; pair: number[]; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'restart' }

const MATCH_POINTS = 100

function init(difficulty: Difficulty): GameState {
  const deck = buildDeck(difficulty.size)
  return {
    deck,
    matched: deck.map((c) => c.symbol === null),
    revealed: [],
    moves: 0,
    pairsFound: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    status: 'ready',
    elapsedMs: 0,
    runningSince: null,
    timeBonus: 0,
  }
}

export function elapsedOf(state: Pick<GameState, 'elapsedMs' | 'runningSince'>, now: number) {
  return state.elapsedMs + (state.runningSince === null ? 0 : now - state.runningSince)
}

export function streakMultiplier(streak: number) {
  return Math.min(1 + (streak - 1) * 0.5, 5)
}

function resolvePair(state: GameState, difficulty: Difficulty, now: number): GameState {
  const [a, b] = state.revealed
  const isMatch = state.deck[a].symbol?.key === state.deck[b].symbol?.key
  if (!isMatch) return { ...state, revealed: [], streak: 0 }

  const matched = [...state.matched]
  matched[a] = matched[b] = true
  const streak = state.streak + 1
  const pairsFound = state.pairsFound + 1
  const score = state.score + Math.round(MATCH_POINTS * streakMultiplier(streak))
  const next = { ...state, matched, revealed: [], streak, pairsFound, score, bestStreak: Math.max(state.bestStreak, streak) }

  if (pairsFound < pairCount(difficulty.size)) return next

  const elapsedMs = elapsedOf(state, now)
  const parMs = pairsFound * difficulty.parSecondsPerPair * 1000
  const timeBonus = Math.max(0, Math.round((parMs - elapsedMs) / 100))
  return { ...next, status: 'won', elapsedMs, runningSince: null, timeBonus, score: score + timeBonus }
}

function makeReducer(difficulty: Difficulty) {
  return function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case 'flip': {
        if (state.status !== 'ready' && state.status !== 'playing') return state
        if (state.matched[action.id] || state.revealed.includes(action.id)) return state
        // Clicking a third card resolves the pending pair instantly — keeps big boards snappy.
        let s = state.revealed.length === 2 ? resolvePair(state, difficulty, action.now) : state
        if (s.status === 'ready') s = { ...s, status: 'playing', runningSince: action.now }
        const revealed = [...s.revealed, action.id]
        return { ...s, revealed, moves: revealed.length === 2 ? s.moves + 1 : s.moves }
      }
      case 'resolve': {
        const current = state.revealed
        if (current.length !== 2 || current[0] !== action.pair[0] || current[1] !== action.pair[1]) return state
        return resolvePair(state, difficulty, action.now)
      }
      case 'pause':
        if (state.status !== 'playing') return state
        return { ...state, status: 'paused', elapsedMs: elapsedOf(state, action.now), runningSince: null }
      case 'resume':
        if (state.status !== 'paused') return state
        return { ...state, status: 'playing', runningSince: action.now }
      case 'restart':
        return init(difficulty)
    }
  }
}

export function useMemoryGame(difficulty: Difficulty) {
  const [state, dispatch] = useReducer(makeReducer(difficulty), difficulty, init)

  const { revealed, deck } = state
  const pendingPair = revealed.length === 2 ? revealed : null
  const pendingMatch = pendingPair !== null && deck[pendingPair[0]].symbol?.key === deck[pendingPair[1]].symbol?.key

  // Auto-resolve a revealed pair: matches settle quickly, misses stay visible a bit longer.
  useEffect(() => {
    if (!pendingPair) return
    const pair = [...pendingPair]
    const timer = setTimeout(() => dispatch({ type: 'resolve', pair, now: performance.now() }), pendingMatch ? 380 : 850)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPair?.[0], pendingPair?.[1], pendingMatch])

  // Sound feedback follows state transitions rather than clicks, so it never lies.
  useEffect(() => {
    if (pendingPair) (pendingMatch ? sfx.match(state.streak + 1) : sfx.miss())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPair?.[0], pendingPair?.[1]])
  useEffect(() => {
    if (state.status === 'won') sfx.win()
  }, [state.status])

  const flip = useCallback((id: number) => {
    dispatch({ type: 'flip', id, now: performance.now() })
    sfx.flip()
  }, [])
  const pause = useCallback(() => dispatch({ type: 'pause', now: performance.now() }), [])
  const resume = useCallback(() => dispatch({ type: 'resume', now: performance.now() }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])

  return { state, pendingPair, pendingMatch, flip, pause, resume, restart }
}
