import { motion } from 'framer-motion'
import type { Stall } from '../types'
import { Button } from './Button'
import { FoodIcon } from './FoodIcon'
import { RecentStrip } from './RecentStrip'

const floaters: { key: Parameters<typeof FoodIcon>[0]['name']; style: React.CSSProperties; delay: number }[] = [
  { key: 'noodles', style: { left: '22%', top: '24%', width: '56%' }, delay: 0 },
  { key: 'prawn', style: { left: '2%', top: '8%', width: '30%' }, delay: 0.6 },
  { key: 'skewer', style: { right: '0%', top: '4%', width: '30%' }, delay: 1.1 },
  { key: 'claypot', style: { left: '-2%', bottom: '4%', width: '30%' }, delay: 0.3 },
  { key: 'dessert', style: { right: '0%', bottom: '2%', width: '28%' }, delay: 0.9 },
]

export function Landing({
  onStart,
  recent,
  onClearRecent,
  muted,
  onToggleMute,
}: {
  onStart: () => void
  recent: Stall[]
  onClearRecent: () => void
  muted: boolean
  onToggleMute: () => void
}) {
  return (
    <>
      <div className="topbar">
        <div className="spacer" />
        <motion.button
          type="button"
          className="icon-btn"
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔔'}
        </motion.button>
      </div>

      <div className="hero">
        <div className="hero-art" aria-hidden="true">
          <motion.div
            className="blob"
            initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          />
          {floaters.map((f, i) => (
            <motion.div
              key={f.key}
              className="float"
              style={f.style}
              initial={{ y: 30, opacity: 0, scale: 0.7 }}
              animate={{ y: [0, -7, 0], opacity: 1, scale: 1, rotate: i % 2 ? [0, 3, 0] : [0, -3, 0] }}
              transition={{
                y: { duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: f.delay },
                rotate: { duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: f.delay },
                opacity: { type: 'spring', delay: 0.1 + i * 0.08 },
                scale: { type: 'spring', stiffness: 260, damping: 14, delay: 0.1 + i * 0.08 },
              }}
            >
              <FoodIcon name={f.key} />
            </motion.div>
          ))}
        </div>

        <motion.h1
          className="app-name"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
        >
          What's for Makan?
          <span>Old Airport Road</span>
        </motion.h1>
        <motion.p
          className="tagline"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
        >
          Can't decide? Spin, then go eat. Steady lah.
          <small>51 Old Airport Road · Food Centre</small>
        </motion.p>
      </div>

      <RecentStrip recent={recent} onClear={onClearRecent} />

      <motion.div
        className="actions"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.35 }}
      >
        <Button onClick={onStart}>Let's Spin 🎡</Button>
      </motion.div>
    </>
  )
}
