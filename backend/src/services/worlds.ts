import axios from 'axios'
import { endpoints } from '../constants'
import { getCache, setCache } from '../utils/cache'

const base = endpoints.TIBIADATA_BASE_URL // ex.: https://api.tibiadata.com/v4
const CACHE_TTL = 60_000
const FALLBACK_WORLDS = [
  {
    name: 'Antica',
    location: 'Europe',
    pvp_type: 'open pvp',
    battleye_status: 'protected',
    players_online: 612,
  },
  {
    name: 'Belobra',
    location: 'South America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 489,
  },
  {
    name: 'Ferobra',
    location: 'South America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 408,
  },
  {
    name: 'Gentebra',
    location: 'South America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 375,
  },
  {
    name: 'Grimera',
    location: 'North America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 220,
  },
  {
    name: 'Havera',
    location: 'North America',
    pvp_type: 'open pvp',
    battleye_status: 'protected',
    players_online: 198,
  },
  {
    name: 'Honbra',
    location: 'South America',
    pvp_type: 'open pvp',
    battleye_status: 'protected',
    players_online: 344,
  },
  {
    name: 'Kalibra',
    location: 'Europe',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 515,
  },
  {
    name: 'Luminera',
    location: 'North America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 261,
  },
  {
    name: 'Menera',
    location: 'North America',
    pvp_type: 'optional pvp',
    battleye_status: 'unprotected',
    players_online: 204,
  },
  {
    name: 'Noctera',
    location: 'North America',
    pvp_type: 'retro open pvp',
    battleye_status: 'protected',
    players_online: 187,
  },
  {
    name: 'Ombra',
    location: 'South America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 326,
  },
  {
    name: 'Pacera',
    location: 'North America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 238,
  },
  {
    name: 'Quelibra',
    location: 'South America',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 402,
  },
  {
    name: 'Secura',
    location: 'Europe',
    pvp_type: 'optional pvp',
    battleye_status: 'protected',
    players_online: 477,
  },
  {
    name: 'Venebra',
    location: 'South America',
    pvp_type: 'retro open pvp',
    battleye_status: 'protected',
    players_online: 289,
  },
]

export async function getWorlds() {
  const key = 'worlds'
  const cached = getCache<any>(key)
  if (cached) return cached

  try {
    const { data } = await axios.get(`${base}/worlds`, { timeout: 6000 })
    const payload = data?.worlds || data || null
    if (payload) setCache(key, payload, CACHE_TTL)
    return payload
  } catch (err) {
    const reason = axios.isAxiosError(err)
      ? err.code ?? err.response?.status ?? err.message
      : String(err)
    console.warn('[worlds] upstream failed', { reason })
    if (cached) return cached
    const totalPlayers = FALLBACK_WORLDS.reduce(
      (sum, w) => sum + Number(w.players_online ?? 0),
      0,
    )
    const fallback = { worlds: FALLBACK_WORLDS, players_online: totalPlayers }
    console.warn('[worlds] using fallback worlds list')
    setCache(key, fallback, CACHE_TTL)
    return fallback
  }
}

export async function getWorldDetail(world: string) {
  const key = `world:${world.toLowerCase()}`
  const cached = getCache<any>(key)
  if (cached) return cached

  try {
    const { data } = await axios.get(`${base}/world/${encodeURIComponent(world)}`, {
      timeout: 6000,
    })
    const payload = data?.world || data || null
    if (payload) setCache(key, payload, CACHE_TTL)
    return payload
  } catch (err) {
    const reason = axios.isAxiosError(err)
      ? err.code ?? err.response?.status ?? err.message
      : String(err)
    console.warn('[worlds] detail upstream failed', { world, reason })
    if (cached) return cached
    const fallback = FALLBACK_WORLDS.find(
      (w) => w.name.toLowerCase() === world.toLowerCase(),
    )
    if (fallback) {
      setCache(key, fallback, CACHE_TTL)
      return fallback
    }
    const error: any = new Error('world_detail_unavailable')
    error.status = 503
    throw error
  }
}
