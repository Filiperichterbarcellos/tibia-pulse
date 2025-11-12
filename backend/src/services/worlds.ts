import axios from 'axios'
import { endpoints } from '../constants'
import { getCache, setCache } from '../utils/cache'

const base = endpoints.TIBIADATA_BASE_URL // ex.: https://api.tibiadata.com/v4
const CACHE_TTL = 60_000
const FALLBACK_WORLDS = [
  { name: 'Antica', location: 'Europe', pvp_type: 'open pvp', battleye_status: 'protected' },
  { name: 'Belobra', location: 'South America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Ferobra', location: 'South America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Gentebra', location: 'South America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Grimera', location: 'North America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Havera', location: 'North America', pvp_type: 'open pvp', battleye_status: 'protected' },
  { name: 'Honbra', location: 'South America', pvp_type: 'open pvp', battleye_status: 'protected' },
  { name: 'Kalibra', location: 'Europe', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Luminera', location: 'North America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Menera', location: 'North America', pvp_type: 'optional pvp', battleye_status: 'unprotected' },
  { name: 'Noctera', location: 'North America', pvp_type: 'retro open pvp', battleye_status: 'protected' },
  { name: 'Ombra', location: 'South America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Pacera', location: 'North America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Quelibra', location: 'South America', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Secura', location: 'Europe', pvp_type: 'optional pvp', battleye_status: 'protected' },
  { name: 'Venebra', location: 'South America', pvp_type: 'retro open pvp', battleye_status: 'protected' },
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
    const fallback = { worlds: FALLBACK_WORLDS }
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
