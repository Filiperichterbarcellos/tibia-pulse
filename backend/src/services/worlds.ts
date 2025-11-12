import axios from 'axios'
import { endpoints } from '../constants'
import { getCache, setCache } from '../utils/cache'

const base = endpoints.TIBIADATA_BASE_URL // ex.: https://api.tibiadata.com/v4
const CACHE_TTL = 60_000

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
    const error: any = new Error('worlds_unavailable')
    error.status = 503
    throw error
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
    const error: any = new Error('world_detail_unavailable')
    error.status = 503
    throw error
  }
}
