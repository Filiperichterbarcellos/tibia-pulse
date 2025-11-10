import { apiClient } from '@/lib/apiClient'

export type BoostedBoss = {
  name: string
  imageUrl?: string | null
  description?: string | null
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
