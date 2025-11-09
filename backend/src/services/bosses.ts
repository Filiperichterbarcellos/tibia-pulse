import axios from 'axios'
import { endpoints } from '../constants'
import { getCache, setCache } from '../utils/cache'

const base = endpoints.TIBIADATA_BASE_URL

export async function getBoostableBosses() {
  const key = 'boostable_bosses'
  const cached = getCache<any>(key)
  if (cached) return cached

  const { data } = await axios.get(`${base}/boostablebosses`, { timeout: 6000 })
  const payload = data?.boostable_bosses || data || null

  if (payload) setCache(key, payload, 60_000) // 60s
  return payload
}

export async function getKillStatistics(world: string) {
  const key = `killstats:${world.toLowerCase()}`
  const cached = getCache<any>(key)
  if (cached) return cached

  const { data } = await axios.get(`${base}/killstatistics/${encodeURIComponent(world)}`, { timeout: 6000 })
  const payload = data?.killstatistics || data || null

  if (payload) setCache(key, payload, 60_000)
  return payload
}
