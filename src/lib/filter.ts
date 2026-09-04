import type { Answers, Craving, Hunger, PlaceMap, Stall, WheelSelection } from '../types'

export const MIN_WHEEL_SIZE = 4

export const CRAVING_OPTIONS: { key: Craving; label: string; emoji: string }[] = [
  { key: 'noodles', label: 'Noodles', emoji: '🍜' },
  { key: 'rice', label: 'Rice', emoji: '🍚' },
  { key: 'soupy', label: 'Soupy & comforting', emoji: '🥣' },
  { key: 'fried', label: 'Fried & crispy', emoji: '🍳' },
  { key: 'grilled', label: 'Grilled & smoky', emoji: '🔥' },
  { key: 'sweet', label: 'Something sweet', emoji: '🍧' },
  { key: 'surprise', label: 'Surprise me', emoji: '🎲' },
]

export const HUNGER_OPTIONS: { key: Hunger; label: string; sub: string }[] = [
  { key: 1, label: 'Just peckish', sub: 'A little something' },
  { key: 2, label: 'Normal hungry', sub: 'Regular makan' },
  { key: 3, label: 'Very hungry', sub: 'Need a proper meal' },
  { key: 4, label: 'Absolutely famished', sub: 'Aiyah, feed me' },
]

function matchesCraving(stall: Stall, craving: Craving): boolean {
  if (craving === 'surprise') return true
  return stall.craving_tags.includes(craving)
}

/**
 * Hard filter is craving only. Hunger is a soft weight (see `weightFor`),
 * so it can never empty the wheel. If the craving filter still leaves fewer
 * than MIN_WHEEL_SIZE stalls we widen: first with hunger-adjacent stalls
 * (same weight band, any craving), then everything.
 */
export function selectStalls(all: Stall[], answers: Answers): WheelSelection {
  const byCraving = all.filter((s) => matchesCraving(s, answers.craving))
  if (byCraving.length >= MIN_WHEEL_SIZE) return { stalls: byCraving, widened: false }

  // Step 1: loosen — pull in stalls whose hunger weight fits, regardless of craving.
  const seen = new Set(byCraving.map((s) => s.id))
  const hungerNeighbours = all.filter(
    (s) => !seen.has(s.id) && Math.abs(s.hunger_weight - answers.hunger) <= 1,
  )
  const step1 = [...byCraving, ...hungerNeighbours]
  if (step1.length >= MIN_WHEEL_SIZE) return { stalls: step1, widened: true }

  // Step 2: drop craving entirely.
  return { stalls: all.slice(), widened: true }
}

/** How much the stall's filling-ness matches how hungry you are. 1.0 = perfect. */
export function hungerAffinity(stallWeight: Hunger, hunger: Hunger): number {
  const d = Math.abs(stallWeight - hunger)
  // 0 → 1.0, 1 → 0.7, 2 → 0.45, 3 → 0.3. Never zero, so there's always variety.
  return [1.0, 0.7, 0.45, 0.3][d] ?? 0.3
}

export const GOOD_RATING = 4.3
export const GOOD_RATING_BOOST = 1.25
export const RECENT_PENALTY = [0.15, 0.3, 0.5, 0.7, 0.85] // most recent first

export function weightFor(
  stall: Stall,
  hunger: Hunger,
  places: PlaceMap,
  recentIds: string[] = [],
  excludeIds: string[] = [],
): number {
  if (excludeIds.includes(stall.id)) return 0
  let w = hungerAffinity(stall.hunger_weight, hunger)
  const rating = places[stall.id]?.rating ?? null
  if (rating !== null && rating >= GOOD_RATING) w *= GOOD_RATING_BOOST
  const recentIdx = recentIds.indexOf(stall.id)
  if (recentIdx >= 0) w *= RECENT_PENALTY[recentIdx] ?? 1
  return w
}

export function weightedPick<T>(items: T[], weights: number[], rand = Math.random): T {
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) return items[Math.floor(rand() * items.length)]
  let r = rand() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function pickWinner(
  wheel: Stall[],
  answers: Answers,
  places: PlaceMap,
  recentIds: string[],
  excludeIds: string[],
  rand = Math.random,
): Stall {
  let weights = wheel.map((s) => weightFor(s, answers.hunger, places, recentIds, excludeIds))
  if (weights.every((w) => w === 0)) {
    // Everything on the wheel was excluded — allow all rather than stall out.
    weights = wheel.map((s) => weightFor(s, answers.hunger, places, recentIds))
  }
  return weightedPick(wheel, weights, rand)
}
