import { getMuted, setMutedPref } from './storage'

// Tiny synthesized SFX — no audio assets to load.
let ctx: AudioContext | null = null
let muted = getMuted()

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.06, delay = 0) {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    amp.gain.setValueAtTime(gain, t)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(amp).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + duration)
  } catch {
    // Audio not supported — play silently.
  }
}

export const sfx = {
  flip: () => tone(520, 0.07, 'triangle', 0.04),
  match: (streak: number) => {
    const base = 660 + Math.min(streak, 8) * 40
    tone(base, 0.12, 'square', 0.04)
    tone(base * 1.5, 0.18, 'square', 0.035, 0.07)
  },
  miss: () => tone(160, 0.18, 'sawtooth', 0.035),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'square', 0.04, i * 0.11)),
  click: () => tone(880, 0.04, 'sine', 0.03),
}

export const isMuted = () => muted
export function setMuted(value: boolean) {
  muted = value
  setMutedPref(value)
}
