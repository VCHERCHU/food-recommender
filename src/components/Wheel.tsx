import { animate, motion, useMotionValue } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Stall } from '../types'
import { celebrate, stopWhee, tick, wheeUpdate } from '../lib/sound'

const CX = 200
const CY = 200
const R = 186
const COLORS = ['#E8553D', '#F2B632', '#6DB36B', '#5BB3B0']

export function shortName(name: string, max = 15): string {
  const clean = name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  const words = clean.split(/\s+/)
  let out = ''
  for (const w of words) {
    const next = out ? `${out} ${w}` : w
    if (next.length > max) break
    out = next
  }
  return out || clean.slice(0, max)
}

function polar(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function segPath(start: number, end: number): string {
  const [x1, y1] = polar(start, R)
  const [x2, y2] = polar(end, R)
  const large = end - start > 180 ? 1 : 0
  return `M${CX} ${CY} L${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
const mod = (a: number, n: number) => ((a % n) + n) % n

export interface WheelProps {
  stalls: Stall[]
  /** Called when a spin starts; return the stall the wheel must land on. */
  chooseWinner: () => Stall
  onLand: (stall: Stall) => void
  disabled?: boolean
  /** Bump this to reset the "landed" highlight (e.g. on spin again). */
  resetKey?: number
  /** Bump this to trigger a spin programmatically (e.g. "Nah, next one"). */
  spinRequest?: number
}

export function Wheel({ stalls, chooseWinner, onLand, disabled, resetKey, spinRequest = 0 }: WheelProps) {
  const n = stalls.length
  const seg = 360 / n
  const rotation = useMotionValue(0)
  const pointer = useMotionValue(0)
  const [spinning, setSpinning] = useState(false)
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null)
  const raf = useRef<number | null>(null)
  const lastSegRef = useRef<number>(0)
  const dragRef = useRef<{ startAngle: number; startRot: number; samples: { t: number; a: number }[]; moved: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWinnerIdx(null)
  }, [resetKey])

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current)
    stopWhee()
  }, [])

  const colors = useMemo(() => {
    return stalls.map((_, i) => {
      let c = COLORS[i % COLORS.length]
      if (i === n - 1 && c === COLORS[0] && n > 1) c = '#FFF8ED'
      return c
    })
  }, [stalls, n])

  /** Which segment sits under the pointer (top, 12 o'clock) at rotation r. */
  const segAt = useCallback((r: number) => Math.floor(mod(-r, 360) / seg) % n, [seg, n])

  const kickPointer = useCallback((dir: number, intensity: number) => {
    pointer.stop()
    pointer.set(-dir * (10 + 12 * Math.min(1, intensity)))
    animate(pointer, 0, { type: 'spring', stiffness: 900, damping: 18 })
  }, [pointer])

  const spin = useCallback(
    (strength = 1, dir: 1 | -1 = 1) => {
      if (spinning || disabled || n === 0) return
      const winner = chooseWinner()
      const wIdx = Math.max(0, stalls.findIndex((s) => s.id === winner.id))
      setWinnerIdx(null)
      setSpinning(true)

      const s = Math.min(2.2, Math.max(0.6, strength))
      const turns = Math.round(3 + s * 2 + Math.random())
      const duration = 3400 + s * 700 // ~4s at strength 1
      const centre = wIdx * seg + seg / 2
      const jitter = (Math.random() - 0.5) * seg * 0.6
      const want = -(centre + jitter) // rotation ≡ want (mod 360)
      const cur = rotation.get()
      const delta = dir === 1 ? mod(want - cur, 360) : -mod(cur - want, 360)
      const target = cur + delta + dir * turns * 360
      const total = target - cur
      const overshoot = dir * (5 + 4 * s)
      const settleMs = 900

      const t0 = performance.now()
      lastSegRef.current = segAt(cur)
      let lastR = cur
      let lastT = t0

      const frame = (now: number) => {
        const t = now - t0
        let r: number
        let done = false
        if (t < duration) {
          const p = easeOutQuart(t / duration)
          r = cur + total * p
          // start the overshoot a hair before the end so velocity is continuous-ish
        } else if (t < duration + settleMs) {
          const u = (t - duration) / settleMs
          r = target + overshoot * Math.exp(-4.5 * u) * Math.sin(Math.PI * 2.1 * u)
        } else {
          r = target
          done = true
        }
        rotation.set(r)

        const dt = Math.max(1, now - lastT)
        const vel = Math.abs(r - lastR) / dt // deg per ms
        const speed = Math.min(1, vel / 1.6)
        wheeUpdate(speed)

        const idx = segAt(r)
        if (idx !== lastSegRef.current) {
          lastSegRef.current = idx
          tick(speed)
          kickPointer(Math.sign(r - lastR) || 1, speed)
        }
        lastR = r
        lastT = now

        if (!done) {
          raf.current = requestAnimationFrame(frame)
        } else {
          raf.current = null
          stopWhee()
          setSpinning(false)
          setWinnerIdx(segAt(target))
          celebrate()
          window.setTimeout(() => onLand(winner), 850)
        }
      }
      raf.current = requestAnimationFrame(frame)
    },
    [spinning, disabled, n, chooseWinner, stalls, seg, rotation, segAt, kickPointer, onLand],
  )

  const spinRef = useRef(spin)
  spinRef.current = spin
  useEffect(() => {
    if (spinRequest > 0) spinRef.current(1)
  }, [spinRequest])

  // ---- drag-to-flick ----
  const angleOf = (e: React.PointerEvent) => {
    const el = wrapRef.current
    if (!el) return 0
    const b = el.getBoundingClientRect()
    const x = e.clientX - (b.left + b.width / 2)
    const y = e.clientY - (b.top + b.height / 2)
    return (Math.atan2(y, x) * 180) / Math.PI
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (spinning || disabled) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { startAngle: angleOf(e), startRot: rotation.get(), samples: [{ t: performance.now(), a: angleOf(e) }], moved: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const a = angleOf(e)
    let diff = a - d.startAngle
    diff = ((diff + 540) % 360) - 180
    d.moved = Math.max(d.moved, Math.abs(diff))
    const r = d.startRot + diff
    const idx = segAt(r)
    if (idx !== lastSegRef.current) {
      lastSegRef.current = idx
      tick(0.3)
      kickPointer(Math.sign(r - rotation.get()) || 1, 0.3)
    }
    rotation.set(r)
    d.samples.push({ t: performance.now(), a })
    if (d.samples.length > 6) d.samples.shift()
  }
  const onPointerUp = () => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (d.moved < 6) {
      spin(1)
      return
    }
    const first = d.samples[0]
    const last = d.samples[d.samples.length - 1]
    const dt = Math.max(1, last.t - first.t)
    let da = last.a - first.a
    da = ((da + 540) % 360) - 180
    const vel = da / dt // deg/ms
    if (Math.abs(vel) < 0.15) {
      // slow drag, no flick — just spin normally in the drag direction
      spin(0.9, vel < 0 ? -1 : 1)
      return
    }
    spin(0.8 + Math.min(1.4, Math.abs(vel) / 1.2), vel < 0 ? -1 : 1)
  }

  const labelR = R - 16
  const fontSize = n > 14 ? 11.5 : n > 10 ? 13 : n > 6 ? 15 : 17

  return (
    <div
      ref={wrapRef}
      className="wheel-wrap"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="button"
      aria-label="Spin the wheel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          spin(1)
        }
      }}
    >
      <svg viewBox="-12 -12 424 424" className="wheel-svg">
        {/* outer plate */}
        <circle cx={CX} cy={CY} r={R + 9} fill="#FFF8ED" stroke="#3D2B1F" strokeWidth={4} />
        <g className={`wheel-rotor ${spinning ? '' : 'wheel-rotor--idle'}`}>
          <motion.g style={{ rotate: rotation, transformOrigin: `${CX}px ${CY}px` }}>
            {stalls.map((s, i) => {
              const start = i * seg
              const end = start + seg
              const mid = start + seg / 2
              const [lx, ly] = polar(mid, labelR)
              return (
                <g key={s.id} className={winnerIdx === i ? 'seg seg--win' : 'seg'}>
                  <path className="seg-fill" d={segPath(start, end)} fill={colors[i]} stroke="#3D2B1F" strokeWidth={3} strokeLinejoin="round" />
                  {/* label reads from the hub out to the rim, anchored at the rim */}
                  <text
                    className="seg-label"
                    x={lx}
                    y={ly}
                    fontSize={fontSize}
                    textAnchor="end"
                    dominantBaseline="central"
                    transform={`rotate(${mid - 90} ${lx} ${ly})`}
                  >
                    {shortName(s.name)}
                  </text>
                </g>
              )
            })}
            {/* pegs */}
            {stalls.map((s, i) => {
              const [px, py] = polar(i * seg, R - 4)
              return <circle key={`peg-${s.id}`} cx={px} cy={py} r={4} fill="#3D2B1F" />
            })}
          </motion.g>
        </g>
        {/* hub */}
        <g className="hub">
          <circle cx={CX} cy={CY} r={40} fill="#FFF8ED" stroke="#3D2B1F" strokeWidth={4} />
          <circle cx={CX} cy={CY} r={30} fill="#F2B632" stroke="#3D2B1F" strokeWidth={3} />
          <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fontSize={15}>
            {spinning ? '…' : 'SPIN'}
          </text>
        </g>
        {/* pointer, pivot at top edge */}
        <motion.g className="pointer" style={{ rotate: pointer, transformOrigin: `${CX}px 2px` }}>
          <path d={`M${CX - 18} -4 L${CX + 18} -4 L${CX} 34 Z`} fill="#E8553D" stroke="#3D2B1F" strokeWidth={4} strokeLinejoin="round" />
          <circle cx={CX} cy={2} r={7} fill="#FFF8ED" stroke="#3D2B1F" strokeWidth={3.5} />
        </motion.g>
      </svg>
    </div>
  )
}
