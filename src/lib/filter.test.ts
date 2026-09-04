import { describe, expect, it } from 'vitest'
import { LOCAL_STALLS } from '../data/stalls'
import { MIN_WHEEL_SIZE, pickWinner, selectStalls, weightFor, weightedPick } from './filter'

describe('selectStalls', () => {
  it('surprise me returns everything, not widened', () => {
    const r = selectStalls(LOCAL_STALLS, { craving: 'surprise', hunger: 2 })
    expect(r.stalls).toHaveLength(LOCAL_STALLS.length)
    expect(r.widened).toBe(false)
  })

  it('never returns an empty or tiny wheel', () => {
    for (const craving of ['noodles', 'rice', 'soupy', 'fried', 'grilled', 'sweet'] as const) {
      for (const hunger of [1, 2, 3, 4] as const) {
        const r = selectStalls(LOCAL_STALLS, { craving, hunger })
        expect(r.stalls.length).toBeGreaterThanOrEqual(MIN_WHEEL_SIZE)
      }
    }
  })

  it('flags widening when the craving is scarce', () => {
    const r = selectStalls(LOCAL_STALLS, { craving: 'grilled', hunger: 4 })
    expect(r.widened).toBe(true)
    // Original matches must still be present.
    expect(r.stalls.some((s) => s.name === 'Western Barbeque')).toBe(true)
  })

  it('does not flag widening when there are enough matches', () => {
    const r = selectStalls(LOCAL_STALLS, { craving: 'noodles', hunger: 1 })
    expect(r.widened).toBe(false)
  })
})

describe('weights', () => {
  const stall = LOCAL_STALLS[0]
  it('boosts highly rated stalls', () => {
    const base = weightFor(stall, stall.hunger_weight, {})
    const boosted = weightFor(stall, stall.hunger_weight, {
      [stall.id]: {
        place_id: 'x', rating: 4.5, user_rating_count: 10, display_name: null,
        review_snippet: null, review_author: null, price_level: null, photo_url: null,
        maps_uri: null, fetched_at: '',
      },
    })
    expect(boosted).toBeGreaterThan(base)
  })
  it('penalises recently spun stalls', () => {
    const base = weightFor(stall, 2, {})
    expect(weightFor(stall, 2, {}, [stall.id])).toBeLessThan(base)
  })
  it('excludes on demand', () => {
    expect(weightFor(stall, 2, {}, [], [stall.id])).toBe(0)
  })
  it('weightedPick respects zero weights', () => {
    const picks = new Set<string>()
    for (let i = 0; i < 200; i++) picks.add(weightedPick(['a', 'b', 'c'], [0, 1, 0]))
    expect([...picks]).toEqual(['b'])
  })
  it('pickWinner never returns an excluded stall when alternatives exist', () => {
    const wheel = LOCAL_STALLS.slice(0, 4)
    for (let i = 0; i < 100; i++) {
      const w = pickWinner(wheel, { craving: 'surprise', hunger: 2 }, {}, [], [wheel[0].id])
      expect(w.id).not.toBe(wheel[0].id)
    }
  })
})
