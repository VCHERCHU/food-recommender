const KEY = 'makan:recent'
export const RECENT_LIMIT = 5

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function getRecent(): string[] {
  return read()
}

/** Most recent first. */
export function pushRecent(id: string): string[] {
  const next = [id, ...read().filter((x) => x !== id)].slice(0, RECENT_LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode etc. — ignore */
  }
  return next
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
