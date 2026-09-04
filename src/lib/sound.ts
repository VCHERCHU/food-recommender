/**
 * Tiny WebAudio sound kit. No samples — everything is synthesised so there
 * are no assets to load. Created lazily on the first user gesture.
 */
const MUTE_KEY = 'makan:muted'

let ctx: AudioContext | null = null
let whee: { osc: OscillatorNode; gain: GainNode } | null = null

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}
export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (m) stopWhee()
}

function ac(): AudioContext | null {
  if (isMuted()) return null
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Short woody click as the pointer passes a peg. Louder when faster. */
export function tick(intensity = 1): void {
  const a = ac()
  if (!a) return
  const t = a.currentTime
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(1400 + Math.random() * 300, t)
  osc.frequency.exponentialRampToValueAtTime(500, t + 0.03)
  const v = 0.05 + 0.12 * Math.min(1, intensity)
  gain.gain.setValueAtTime(v, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + 0.05)
}

/** Continuous "wheeee" whose pitch tracks the wheel speed (0..1). */
export function wheeUpdate(speed: number): void {
  const a = ac()
  if (!a) return
  if (speed <= 0.02) {
    stopWhee()
    return
  }
  if (!whee) {
    const osc = a.createOscillator()
    const gain = a.createGain()
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.0001, a.currentTime)
    osc.connect(gain).connect(a.destination)
    osc.start()
    whee = { osc, gain }
  }
  const f = 220 + speed * 660
  whee.osc.frequency.setTargetAtTime(f, a.currentTime, 0.05)
  whee.gain.gain.setTargetAtTime(0.02 + speed * 0.04, a.currentTime, 0.05)
}

export function stopWhee(): void {
  if (!whee || !ctx) {
    whee = null
    return
  }
  const t = ctx.currentTime
  whee.gain.gain.setTargetAtTime(0.0001, t, 0.08)
  const w = whee
  whee = null
  setTimeout(() => {
    try {
      w.osc.stop()
    } catch {
      /* already stopped */
    }
  }, 300)
}

/** A cheerful little three-note fanfare when the wheel lands. */
export function celebrate(): void {
  const a = ac()
  if (!a) return
  const t0 = a.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((f, i) => {
    const osc = a.createOscillator()
    const gain = a.createGain()
    osc.type = 'triangle'
    osc.frequency.value = f
    const t = t0 + i * 0.09
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    osc.connect(gain).connect(a.destination)
    osc.start(t)
    osc.stop(t + 0.4)
  })
}
