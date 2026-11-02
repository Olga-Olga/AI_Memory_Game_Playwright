import type { DifficultyId } from './config'

export interface BestRecord {
  score: number
  timeMs: number
  moves: number
}

const KEY = 'neon-recall:best'

function readAll(): Partial<Record<DifficultyId, BestRecord>> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getBest(id: DifficultyId): BestRecord | undefined {
  return readAll()[id]
}

/** Stores the record if it beats the previous best score. Returns true on a new best. */
export function saveBest(id: DifficultyId, record: BestRecord): boolean {
  const all = readAll()
  const prev = all[id]
  if (prev && prev.score >= record.score) return false
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: record }))
  } catch {
    // Storage unavailable (private mode) — the run still counts, it just isn't remembered.
  }
  return true
}

export function getMuted(): boolean {
  try {
    return localStorage.getItem('neon-recall:muted') === '1'
  } catch {
    return false
  }
}

export function setMutedPref(muted: boolean) {
  try {
    localStorage.setItem('neon-recall:muted', muted ? '1' : '0')
  } catch {
    // ignore
  }
}
