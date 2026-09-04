import { LOCAL_STALLS } from '../data/stalls'
import type { Stall } from '../types'
import { supabase } from './supabase'

export type StallSource = 'supabase' | 'local'

export async function loadStalls(): Promise<{ stalls: Stall[]; source: StallSource }> {
  if (!supabase) return { stalls: LOCAL_STALLS, source: 'local' }
  try {
    const { data, error } = await supabase
      .from('stalls')
      .select(
        'id,name,unit_number,signature_dish,craving_tags,hunger_weight,price_range,typical_price,place_id,illustration_key',
      )
      .order('name')
    if (error) throw error
    if (!data || data.length === 0) return { stalls: LOCAL_STALLS, source: 'local' }
    return { stalls: data as Stall[], source: 'supabase' }
  } catch (err) {
    console.warn('[makan] falling back to local stalls:', err)
    return { stalls: LOCAL_STALLS, source: 'local' }
  }
}
