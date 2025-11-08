import axios from 'axios'
import { endpoints } from '../constants'
import { getCache, setCache } from '../utils/cache'

const base = endpoints.TIBIADATA_BASE_URL // ex.: https://api.tibiadata.com/v4

export async function getWorlds() {
  const key = 'worlds'
  const cached = getCache<any>(key)
  if (cached) return cached

  const { data } = await axios.get(`${base}/worlds`, { timeout: 6000 })
  const payload = data?.worlds || data || null
  if (payload) setCache(key, payload, 60_000) // 60s
  return payload
}

export async function getWorldDetail(world: string) {
  const key = `world:${world.toLowerCase()}`
  const cached = getCache<any>(key)
  if (cached) return cached

  const { data } = await axios.get(`${base}/world/${encodeURIComponent(world)}`, { timeout: 6000 })
  const payload = data?.world || data || null
  if (payload) setCache(key, payload, 60_000)
  return payload
}
