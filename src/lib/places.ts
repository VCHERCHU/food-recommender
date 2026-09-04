import type { PlaceInfo, PlaceMap, Stall } from '../types'
import { supabase } from './supabase'

export type PlacesStatus = 'idle' | 'loading' | 'ok' | 'error' | 'offline' | 'unavailable'

/**
 * Ask the `places` edge function for ratings/reviews/photos. The Google key
 * never touches the browser — the function holds it and caches results for
 * 24h in the `place_cache` table.
 */
export async function fetchPlaces(stalls: Stall[]): Promise<{ places: PlaceMap; status: PlacesStatus }> {
  if (!supabase) return { places: {}, status: 'unavailable' }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { places: {}, status: 'offline' }
  }
  try {
    const { data, error } = await supabase.functions.invoke<{ results: PlaceMap }>('places', {
      body: { stalls: stalls.map((s) => ({ id: s.id, name: s.name, place_id: s.place_id })) },
    })
    if (error) throw error
    const results = data?.results ?? {}
    return { places: results, status: 'ok' }
  } catch (err) {
    console.warn('[makan] places lookup failed:', err)
    return { places: {}, status: 'error' }
  }
}

export function starsFor(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating - full >= 0.45
  return { full, half, empty: 5 - full - (half ? 1 : 0) }
}

export function mapsUrl(stall: Stall, place: PlaceInfo | null): string {
  if (place?.maps_uri) return place.maps_uri
  if (place?.place_id || stall.place_id) {
    const pid = place?.place_id ?? stall.place_id
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stall.name)}&query_place_id=${pid}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${stall.name} Old Airport Road Food Centre Singapore`,
  )}`
}
