import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export interface Option<K> {
  key: K
  label: string
  sub?: string
  emoji?: string
  extra?: ReactNode
  wide?: boolean
}

export function QuestionScreen<K extends string | number>({
  step,
  title,
  options,
  stack,
  onPick,
  onBack,
}: {
  step: string
  title: string
  options: Option<K>[]
  stack?: boolean
  onPick: (k: K) => void
  onBack: () => void
}) {
  return (
    <>
      <div className="topbar">
        <motion.button type="button" className="icon-btn" whileTap={{ scale: 0.9 }} onClick={onBack} aria-label="Back">
          ←
        </motion.button>
        <div className="spacer" />
      </div>
      <div className="q-head">
        <div className="q-step">{step}</div>
        <h2 className="q-title">{title}</h2>
      </div>
      <div className={`cards ${stack ? 'cards--stack' : ''}`}>
        {options.map((o, i) => (
          <motion.button
            key={String(o.key)}
            type="button"
            className={`card ${stack ? 'card--stack' : ''} ${o.wide ? 'card--wide' : ''} card--tint-${i % 4}`}
            initial={{ y: 24, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.04 * i }}
            whileTap={{ scaleX: 1.03, scaleY: 0.94 }}
            onClick={() => onPick(o.key)}
          >
            {o.emoji && <span className="emoji" aria-hidden="true">{o.emoji}</span>}
            <span>
              {o.label}
              {o.sub && <span className="sub" style={{ display: 'block' }}>{o.sub}</span>}
            </span>
            {o.extra}
          </motion.button>
        ))}
      </div>
    </>
  )
}
