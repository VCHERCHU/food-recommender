import { motion } from 'framer-motion'
import type { Stall } from '../types'
import { FoodIcon } from './FoodIcon'

export function RecentStrip({ recent, onClear }: { recent: Stall[]; onClear: () => void }) {
  if (!recent.length) return null
  return (
    <div className="recent" aria-label="Recently spun">
      <div className="recent-label">
        <span>Recently spun</span>
        <button type="button" onClick={onClear}>clear</button>
      </div>
      <div className="recent-row">
        {recent.map((s, i) => (
          <motion.span
            key={s.id}
            className="chip"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 * i }}
          >
            <FoodIcon name={s.illustration_key} />
            {s.name}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
