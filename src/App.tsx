import confetti from 'canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Landing } from './components/Landing'
import { QuestionScreen } from './components/QuestionScreen'
import { ResultCard } from './components/ResultCard'
import { StateNote, type NoteKind } from './components/StateNote'
import { Wheel } from './components/Wheel'
import { Button } from './components/Button'
import { BowlFace } from './components/FoodIcon'
import { CRAVING_OPTIONS, HUNGER_OPTIONS, pickWinner, selectStalls } from './lib/filter'
import { fetchPlaces, type PlacesStatus } from './lib/places'
import { clearRecent, getRecent, pushRecent } from './lib/recent'
import { isMuted, setMuted } from './lib/sound'
import { loadStalls, type StallSource } from './lib/stalls'
import type { Answers, Craving, Hunger, PlaceMap, Stall } from './types'

type Screen = 'landing' | 'craving' | 'hunger' | 'wheel'

const slide = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0, pointerEvents: 'none' },
  transition: { type: 'spring', stiffness: 380, damping: 32 },
} as const

function burst() {
  const colors = ['#E8553D', '#F2B632', '#6DB36B', '#5BB3B0', '#FFF8ED']
  confetti({ particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.45 }, colors, scalar: 1.1, ticks: 220 })
  window.setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0.1, y: 0.6 }, colors }), 120)
  window.setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 0.9, y: 0.6 }, colors }), 120)
}

export default function App() {
  const [stalls, setStalls] = useState<Stall[] | null>(null)
  const [source, setSource] = useState<StallSource>('local')
  const [places, setPlaces] = useState<PlaceMap>({})
  const [placesStatus, setPlacesStatus] = useState<PlacesStatus>('idle')
  const [screen, setScreen] = useState<Screen>('landing')
  const [craving, setCraving] = useState<Craving>('surprise')
  const [hunger, setHunger] = useState<Hunger>(2)
  const [result, setResult] = useState<Stall | null>(null)
  const [excluded, setExcluded] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>(() => getRecent())
  const [muted, setMutedState] = useState<boolean>(() => isMuted())
  const [online, setOnline] = useState<boolean>(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [wheelReset, setWheelReset] = useState(0)
  const [spinRequest, setSpinRequest] = useState(0)
  const [toast, setToast] = useState<NoteKind | null>(null)
  const toastShown = useRef<Set<NoteKind>>(new Set())

  // ---- load stalls, then ratings in the background ----
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { stalls: s, source: src } = await loadStalls()
      if (!alive) return
      setStalls(s)
      setSource(src)
      setPlacesStatus('loading')
      const { places: p, status } = await fetchPlaces(s)
      if (!alive) return
      setPlaces(p)
      setPlacesStatus(status)
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Retry ratings when we come back online.
  useEffect(() => {
    if (!online || !stalls) return
    if (placesStatus === 'offline' || placesStatus === 'error') {
      setPlacesStatus('loading')
      fetchPlaces(stalls).then(({ places: p, status }) => {
        setPlaces(p)
        setPlacesStatus(status)
      })
    }
  }, [online, stalls, placesStatus])

  const answers: Answers = useMemo(() => ({ craving, hunger }), [craving, hunger])
  const selection = useMemo(() => (stalls ? selectStalls(stalls, answers) : { stalls: [], widened: false }), [stalls, answers])

  // One-time friendly notes on the wheel screen.
  useEffect(() => {
    if (screen !== 'wheel') return
    let kind: NoteKind | null = null
    if (!online) kind = 'offline'
    else if (placesStatus === 'error') kind = 'api-error'
    else if (placesStatus === 'unavailable' || source === 'local') kind = 'local'
    if (kind && !toastShown.current.has(kind)) {
      toastShown.current.add(kind)
      setToast(kind)
      const t = window.setTimeout(() => setToast(null), 4200)
      return () => window.clearTimeout(t)
    }
  }, [screen, online, placesStatus, source])

  const chooseWinner = useCallback(
    () => pickWinner(selection.stalls, answers, places, recent, excluded),
    [selection.stalls, answers, places, recent, excluded],
  )

  const onLand = useCallback((stall: Stall) => {
    setResult(stall)
    setRecent(pushRecent(stall.id))
    burst()
  }, [])

  const start = () => {
    setExcluded([])
    setResult(null)
    setScreen('craving')
  }
  const pickCraving = (c: Craving) => {
    setCraving(c)
    setScreen('hunger')
  }
  const pickHunger = (h: Hunger) => {
    setHunger(h)
    setExcluded([])
    setWheelReset((k) => k + 1)
    setScreen('wheel')
  }
  const spinAgain = () => {
    setResult(null)
    setWheelReset((k) => k + 1)
  }
  const nextOne = () => {
    if (!result) return
    setExcluded((x) => [...x, result.id])
    setResult(null)
    setWheelReset((k) => k + 1)
    setSpinRequest((k) => k + 1)
  }
  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  const recentStalls = useMemo(
    () => recent.map((id) => stalls?.find((s) => s.id === id)).filter((s): s is Stall => Boolean(s)),
    [recent, stalls],
  )
  const canNext = selection.stalls.length - excluded.length > 1

  const cravingLabel = CRAVING_OPTIONS.find((o) => o.key === craving)?.label ?? ''
  const hungerLabel = HUNGER_OPTIONS.find((o) => o.key === hunger)?.label ?? ''

  return (
    <div className="app">
      <AnimatePresence mode="wait" initial={false}>
        {screen === 'landing' && (
          <motion.div key="landing" className="screen" {...slide}>
            {stalls ? (
              <Landing onStart={start} recent={recentStalls} onClearRecent={() => { clearRecent(); setRecent([]) }} muted={muted} onToggleMute={toggleMute} />
            ) : (
              <div className="loading">
                <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
                  <BowlFace mood="happy" />
                </motion.div>
                Warming up the wok…
              </div>
            )}
          </motion.div>
        )}

        {screen === 'craving' && (
          <motion.div key="craving" className="screen" {...slide}>
            <QuestionScreen<Craving>
              step="Question 1 of 2"
              title="What are you craving?"
              options={CRAVING_OPTIONS.map((o) => ({ key: o.key, label: o.label, emoji: o.emoji, wide: o.key === 'surprise' }))}
              onPick={pickCraving}
              onBack={() => setScreen('landing')}
            />
          </motion.div>
        )}

        {screen === 'hunger' && (
          <motion.div key="hunger" className="screen" {...slide}>
            <QuestionScreen<Hunger>
              step="Question 2 of 2"
              title="How hungry are you?"
              stack
              options={HUNGER_OPTIONS.map((o) => ({
                key: o.key,
                label: o.label,
                sub: o.sub,
                extra: (
                  <span className="hunger-bowls" aria-hidden="true">
                    {[1, 2, 3, 4].map((n) => <i key={n} className={n <= o.key ? 'on' : ''} />)}
                  </span>
                ),
              }))}
              onPick={pickHunger}
              onBack={() => setScreen('craving')}
            />
          </motion.div>
        )}

        {screen === 'wheel' && (
          <motion.div key="wheel" className="screen wheel-screen" {...slide}>
            <div className="topbar" style={{ alignSelf: 'stretch' }}>
              <motion.button type="button" className="icon-btn" whileTap={{ scale: 0.9 }} onClick={() => setScreen('hunger')} aria-label="Back">
                ←
              </motion.button>
              <div className="spacer" />
              <motion.button type="button" className="icon-btn" whileTap={{ scale: 0.9 }} onClick={toggleMute} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}>
                {muted ? '🔇' : '🔔'}
              </motion.button>
            </div>
            <h2 className="q-title" style={{ textAlign: 'center', marginTop: 4 }}>Spin lah!</h2>
            <div className="wheel-count">{cravingLabel} · {hungerLabel} · {selection.stalls.length} stalls</div>

            <Wheel
              stalls={selection.stalls}
              chooseWinner={chooseWinner}
              onLand={onLand}
              disabled={result !== null}
              resetKey={wheelReset}
              spinRequest={spinRequest}
            />
            <p className="wheel-hint">Tap or flick the wheel. Aiyah, choose already.</p>

            <div className="actions" style={{ alignSelf: 'stretch', marginTop: 0 }}>
              <Button onClick={() => setSpinRequest((k) => k + 1)} disabled={result !== null}>
                Spin! 🎡
              </Button>
            </div>

            <div className="toast-slot">
              <AnimatePresence>{toast && <StateNote key={toast} kind={toast} />}</AnimatePresence>
            </div>

            <AnimatePresence>
              {result && (
                <ResultCard
                  key={result.id}
                  stall={result}
                  place={places[result.id] ?? null}
                  widened={selection.widened}
                  onSpinAgain={spinAgain}
                  onNext={nextOne}
                  canNext={canNext}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
