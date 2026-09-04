import { motion } from 'framer-motion'
import type { PlaceInfo, Stall } from '../types'
import { mapsUrl, starsFor } from '../lib/places'
import { Button, LinkButton } from './Button'
import { FoodIcon, Star } from './FoodIcon'
import { StateNote } from './StateNote'

export function ResultCard({
  stall,
  place,
  widened,
  onSpinAgain,
  onNext,
  canNext,
}: {
  stall: Stall
  place: PlaceInfo | null
  widened: boolean
  onSpinAgain: () => void
  onNext: () => void
  canNext: boolean
}) {
  const rating = place?.rating ?? null
  const stars = rating !== null ? starsFor(rating) : null
  return (
    <>
      <motion.div
        className="result-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onSpinAgain}
      />
      <motion.section
        className="result"
        role="dialog"
        aria-label={`${stall.name} — your pick`}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <div className="result-grip" aria-hidden="true" />
        <div className="result-scroll">
          <div className="result-head">
            <motion.div
              className="badge"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.15 }}
            >
              <FoodIcon name={stall.illustration_key} />
            </motion.div>
            <div>
              <h2 className="result-title">{stall.name}</h2>
              {stall.unit_number && <div className="result-unit">{stall.unit_number} · Old Airport Road</div>}
            </div>
          </div>

          <motion.div
            className="dish"
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.2 }}
          >
            <span aria-hidden="true">🍽️</span> {stall.signature_dish}
          </motion.div>

          {widened && <StateNote kind="widened" compact />}

          <motion.div
            className={`photo ${place?.photo_url ? '' : 'photo--placeholder'}`}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.25 }}
          >
            {place?.photo_url ? (
              <img src={place.photo_url} alt={`${stall.name} — ${stall.signature_dish}`} loading="lazy" />
            ) : (
              <FoodIcon name={stall.illustration_key} />
            )}
          </motion.div>

          {rating !== null && stars ? (
            <div className="rating" aria-label={`Rated ${rating} out of 5`}>
              <span className="stars" aria-hidden="true">
                {Array.from({ length: stars.full }, (_, i) => <Star key={`f${i}`} fill="full" />)}
                {stars.half && <Star fill="half" />}
                {Array.from({ length: stars.empty }, (_, i) => <Star key={`e${i}`} fill="empty" />)}
              </span>
              <span className="rating-num">{rating.toFixed(1)}</span>
              {place?.user_rating_count != null && (
                <span className="rating-count">({place.user_rating_count.toLocaleString()} reviews)</span>
              )}
            </div>
          ) : (
            <div className="rating rating--none">No rating yet</div>
          )}

          {place?.review_snippet && (
            <blockquote className="review">
              “{place.review_snippet}”
              {place.review_author && <cite>— {place.review_author}, on Google</cite>}
            </blockquote>
          )}

          <div className="meta-row">
            <div className="price">
              <b>{stall.price_range}</b>
              <span>typically {stall.typical_price}</span>
            </div>
            {place && <span className="attribution">Powered by Google</span>}
          </div>
        </div>

        <div className="result-actions">
          <Button onClick={onSpinAgain}>Spin again 🎡</Button>
          <LinkButton href={mapsUrl(stall, place)}>Open in Google Maps 📍</LinkButton>
          <Button variant="ghost" onClick={onNext} disabled={!canNext}>
            Nah, next one
          </Button>
        </div>
      </motion.section>
    </>
  )
}
