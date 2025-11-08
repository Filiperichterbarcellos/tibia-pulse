type Entry<T> = { value: T; expiresAt: number }
const store = new Map<string, Entry<any>>()

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function getCache<T>(key: string): T | undefined {
  const e = store.get(key)
  if (!e) return
  if (Date.now() > e.expiresAt) { store.delete(key); return }
  return e.value as T
}
