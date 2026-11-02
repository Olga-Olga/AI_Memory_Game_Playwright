export type DifficultyId = 'rookie' | 'veteran' | 'legend'

export interface Difficulty {
  id: DifficultyId
  size: number
  label: string
  tagline: string
  accent: string
  /** Seconds per pair considered "on pace" for the time bonus. */
  parSecondsPerPair: number
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'rookie', size: 5, label: 'Rookie', tagline: 'Warm up your neurons', accent: '#22d3ee', parSecondsPerPair: 5 },
  { id: 'veteran', size: 10, label: 'Veteran', tagline: 'Real focus required', accent: '#e879f9', parSecondsPerPair: 6 },
  { id: 'legend', size: 20, label: 'Legend', tagline: '200 pairs. No mercy.', accent: '#fbbf24', parSecondsPerPair: 7 },
]

export function pairCount(size: number) {
  return Math.floor((size * size) / 2)
}
