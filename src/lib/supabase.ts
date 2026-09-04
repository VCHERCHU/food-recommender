import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** `null` when the app is running without a backend (local seed, no ratings). */
export const supabase: SupabaseClient | null =
  url && anon && /^https?:\/\//.test(url) ? createClient(url, anon) : null

export const hasBackend = supabase !== null
