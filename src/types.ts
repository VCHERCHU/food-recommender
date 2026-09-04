export type Craving =
  | 'noodles'
  | 'rice'
  | 'soupy'
  | 'fried'
  | 'grilled'
  | 'sweet'
  | 'surprise'

export type Hunger = 1 | 2 | 3 | 4

export type PriceRange = '$' | '$$' | '$$$'

export type IllustrationKey =
  | 'noodles'
  | 'wok'
  | 'bowl'
  | 'prawn'
  | 'claypot'
  | 'duck'
  | 'skewer'
  | 'rojak'
  | 'dessert'
  | 'carrotcake'

export interface Stall {
  id: string
  name: string
  unit_number: string | null
  signature_dish: string
  craving_tags: Exclude<Craving, 'surprise'>[]
  hunger_weight: Hunger
  price_range: PriceRange
  typical_price: string
  place_id: string | null
  illustration_key: IllustrationKey
}

/** What the edge function hands back for one stall. */
export interface PlaceInfo {
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

export type PlaceMap = Record<string, PlaceInfo | null>

export interface Answers {
  craving: Craving
  hunger: Hunger
}

export interface WheelSelection {
  stalls: Stall[]
  widened: boolean
}
