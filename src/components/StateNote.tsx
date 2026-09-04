import { motion } from 'framer-motion'
import { BowlFace } from './FoodIcon'

export type NoteKind = 'offline' | 'api-error' | 'widened' | 'local'

const COPY: Record<NoteKind, { mood: 'happy' | 'sad' | 'sleepy' | 'shrug'; tone: string; line: string; sub?: string }> = {
  offline: { mood: 'sleepy', tone: 'note--bad', line: 'No internet, but the wheel still works.', sub: 'Ratings will show up once you’re back online.' },
  'api-error': { mood: 'shrug', tone: 'note--warn', line: 'Google’s not picking up right now.', sub: 'Still can spin — just no ratings for a bit.' },
  widened: { mood: 'happy', tone: 'note--info', line: 'Widened the search a bit.', sub: 'Not enough stalls matched, so we added a few more. Confirm plus chop still got choice.' },
  local: { mood: 'happy', tone: 'note--info', line: 'Running on the built-in stall list.', sub: 'Connect Supabase for live ratings.' },
}

export function StateNote({ kind, compact }: { kind: NoteKind; compact?: boolean }) {
  const c = COPY[kind]
  return (
    <motion.div
      className={`note ${c.tone}`}
      role="status"
      initial={{ y: -12, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -12, opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      <BowlFace mood={c.mood} />
      <div>
        {c.line}
        {!compact && c.sub && <small>{c.sub}</small>}
      </div>
    </motion.div>
  )
}
