import { apiClient } from '@/lib/apiClient'

export type BoostedBoss = {
  name: string
  imageUrl?: string | null
  description?: string | null
}

export type KillStatsEntry = {
  race: string
  last_day_killed: number
  last_week_killed: number
  last_day_players_killed: number
  last_week_players_killed: number
}

export type KillStatsResponse = {
  world: string
  total?: {
    last_day_killed?: number
    last_week_killed?: number
    last_day_players_killed?: number
    last_week_players_killed?: number
  }
  entries: KillStatsEntry[]
}

export async function fetchBoostedBoss(): Promise<BoostedBoss | null> {
  const { data } = await apiClient.get('/api/bosses/boostable')
  const payload = data?.boostable_bosses ?? data
  const today = payload?.boostable_today ?? payload?.boostable ?? payload
  if (!today?.name) return null
  return {
    name: today.name,
    imageUrl: today.image_url ?? today.image ?? null,
    description: payload?.message ?? payload?.description ?? null,
  }
}

export async function fetchWorldKillStats(world: string): Promise<KillStatsResponse | null> {
  if (!world) return null
  try {
    const { data } = await apiClient.get<KillStatsResponse>(
      `/api/bosses/killstats/${encodeURIComponent(world)}`,
    )
    if (data && Array.isArray(data.entries)) return data
    return null
  } catch (err: any) {
    if (err?.response?.status === 404) return null
    throw err
  }
}
