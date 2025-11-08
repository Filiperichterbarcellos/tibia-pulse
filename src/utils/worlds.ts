// Helpers para filtros/ordenação de /api/worlds

type AnyObj = Record<string, any>

export function normalizeWorldType(t?: string) {
  if (!t) return undefined
  const s = t.toLowerCase()
  if (['optional', 'optional pvp', 'optional_pvp'].includes(s)) return 'optional'
  if (['open', 'open pvp', 'open_pvp'].includes(s)) return 'open'
  if (['retro', 'retro open', 'retro_open', 'retro pvp'].includes(s)) return 'retro'
  if (['hardcore', 'hardcore pvp', 'hardcore_pvp'].includes(s)) return 'hardcore'
  return s
}

export function normalizeBattleye(b?: string) {
  if (!b) return undefined
  const s = b.toLowerCase()
  if (['on', 'true', 'protected'].includes(s)) return 'protected'
  if (['off', 'false', 'unprotected'].includes(s)) return 'unprotected'
  return s
}

export function normalizeLocation(l?: string) {
  if (!l) return undefined
  const s = l.toUpperCase()
  if (['EU', 'NA', 'SA'].includes(s)) return s
  return undefined
}

export function sortWorlds<T extends AnyObj>(arr: T[], sort?: string, order?: string) {
  const dir = (order?.toLowerCase() === 'asc') ? 1 : -1
  if (sort === 'players') {
    return [...arr].sort((a, b) => ((a?.players_online ?? 0) - (b?.players_online ?? 0)) * dir)
  }
  if (sort === 'record') {
    const get = (x: AnyObj) => x?.online_record?.players ?? 0
    return [...arr].sort((a, b) => (get(a) - get(b)) * dir)
  }
  if (sort === 'name') {
    return [...arr].sort((a, b) => String(a?.name).localeCompare(String(b?.name)) * dir)
  }
  return arr
}
