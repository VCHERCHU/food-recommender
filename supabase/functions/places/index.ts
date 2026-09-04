// Supabase Edge Function: `places`
//
// Proxies Google Places API (New) so the API key never reaches the browser.
//   POST { stalls: [{ id, name, place_id? }] }
//   →    { results: { [stallId]: PlaceInfo | null } }
//
// - Resolves missing place_ids with places:searchText (biased to Old Airport
//   Road Food Centre) and writes them back to `stalls.place_id` permanently.
// - Fetches Place Details for rating / reviews / photos / priceLevel.
// - Caches everything in `place_cache` for 24h.
// - Photo URLs are resolved server-side (skipHttpRedirect) so the cached
//   photoUri is a plain googleusercontent link with no key in it.
//
// Secrets:  supabase secrets set GOOGLE_PLACES_API_KEY=...
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'npm:@supabase/supabase-js@2'

const GOOGLE_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_STALLS_PER_CALL = 40
const CONCURRENCY = 4

// Old Airport Road Food Centre, 51 Old Airport Rd, Singapore 390051
const CENTRE = { latitude: 1.3082, longitude: 103.8855 }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StallReq {
  id: string
  name: string
  place_id?: string | null
}

interface PlaceInfo {
  place_id: string
  display_name: string | null
  rating: number | null
  user_rating_count: number | null
  review_snippet: string | null
  review_author: string | null
  price_level: string | null
  photo_url: string | null
  maps_uri: string | null
  fetched_at: string
}

interface CacheRow extends PlaceInfo {
  stall_id: string
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function googleFetch(url: string, init: RequestInit & { fieldMask?: string } = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': GOOGLE_KEY,
  }
  if (init.fieldMask) headers['X-Goog-FieldMask'] = init.fieldMask
  return fetch(url, { ...init, headers })
}

async function resolvePlaceId(name: string): Promise<string | null> {
  const res = await googleFetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    fieldMask: 'places.id,places.displayName',
    body: JSON.stringify({
      textQuery: `${name} Old Airport Road Food Centre Singapore`,
      locationBias: { circle: { center: CENTRE, radius: 250 } },
      maxResultCount: 3,
      languageCode: 'en',
      regionCode: 'SG',
    }),
  })
  if (!res.ok) {
    console.warn('searchText failed', res.status, await res.text())
    return null
  }
  const data = (await res.json()) as { places?: { id: string }[] }
  return data.places?.[0]?.id ?? null
}

interface GooglePlace {
  id: string
  displayName?: { text: string }
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  googleMapsUri?: string
  reviews?: { text?: { text: string }; authorAttribution?: { displayName?: string }; rating?: number }[]
  photos?: { name: string }[]
}

async function fetchDetails(placeId: string): Promise<GooglePlace | null> {
  const res = await googleFetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
    method: 'GET',
    fieldMask: 'id,displayName,rating,userRatingCount,priceLevel,googleMapsUri,reviews,photos',
  })
  if (!res.ok) {
    console.warn('details failed', res.status, await res.text())
    return null
  }
  return (await res.json()) as GooglePlace
}

/** Resolve a photo resource name to a plain, key-free image URL. */
async function resolvePhoto(photoName: string): Promise<string | null> {
  const res = await googleFetch(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&skipHttpRedirect=true`,
    { method: 'GET' },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { photoUri?: string }
  return data.photoUri ?? null
}

function pickSnippet(reviews: GooglePlace['reviews']): { text: string; author: string | null } | null {
  if (!reviews?.length) return null
  const candidates = reviews
    .map((r) => ({ text: (r.text?.text ?? '').trim(), author: r.authorAttribution?.displayName ?? null, rating: r.rating ?? 0 }))
    .filter((r) => r.text.length >= 20)
  if (!candidates.length) return null
  // Prefer positive, short reviews — they read best on a card.
  candidates.sort((a, b) => b.rating - a.rating || a.text.length - b.text.length)
  const best = candidates[0]
  const text = best.text.length > 180 ? best.text.slice(0, 177).replace(/\s+\S*$/, '') + '…' : best.text
  return { text, author: best.author }
}

async function lookup(stall: StallReq, cached: CacheRow | undefined): Promise<PlaceInfo | null> {
  const now = Date.now()
  if (cached && now - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS) {
    const { stall_id: _omit, ...info } = cached
    return info
  }
  if (!GOOGLE_KEY) return null

  let placeId = stall.place_id ?? cached?.place_id ?? null
  if (!placeId) {
    placeId = await resolvePlaceId(stall.name)
    if (!placeId) return null
    await admin.from('stalls').update({ place_id: placeId }).eq('id', stall.id).is('place_id', null)
  }

  const details = await fetchDetails(placeId)
  if (!details) {
    // Serve stale cache rather than nothing.
    if (cached) {
      const { stall_id: _omit, ...info } = cached
      return info
    }
    return null
  }

  const snippet = pickSnippet(details.reviews)
  const photoName = details.photos?.[0]?.name
  const photo_url = photoName ? await resolvePhoto(photoName) : null

  const info: PlaceInfo = {
    place_id: details.id,
    display_name: details.displayName?.text ?? null,
    rating: details.rating ?? null,
    user_rating_count: details.userRatingCount ?? null,
    review_snippet: snippet?.text ?? null,
    review_author: snippet?.author ?? null,
    price_level: details.priceLevel ?? null,
    photo_url,
    maps_uri: details.googleMapsUri ?? null,
    fetched_at: new Date().toISOString(),
  }

  const { error } = await admin.from('place_cache').upsert({ stall_id: stall.id, ...info })
  if (error) console.warn('cache upsert failed', error.message)
  return info
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++
        out[idx] = await fn(items[idx])
      }
    }),
  )
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)

  let body: { stalls?: StallReq[] }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }
  const stalls = (body.stalls ?? [])
    .filter((s) => s && typeof s.id === 'string' && typeof s.name === 'string')
    .slice(0, MAX_STALLS_PER_CALL)
  if (!stalls.length) return json({ results: {} })

  const { data: cacheRows } = await admin
    .from('place_cache')
    .select('*')
    .in('stall_id', stalls.map((s) => s.id))
  const cache = new Map<string, CacheRow>((cacheRows ?? []).map((r: CacheRow) => [r.stall_id, r]))

  const infos = await mapLimit(stalls, CONCURRENCY, async (s) => {
    try {
      return await lookup(s, cache.get(s.id))
    } catch (err) {
      console.warn('lookup failed for', s.id, err)
      return null
    }
  })

  const results: Record<string, PlaceInfo | null> = {}
  stalls.forEach((s, i) => (results[s.id] = infos[i]))
  return json({ results })
})
