// src/features/worlds/api.ts
import { apiClient } from '@/lib/apiClient'

type WorldItem = { name: string }

export async function listWorldNames(): Promise<string[]> {
  const { data } = await apiClient.get<{ worlds?: WorldItem[] }>('/api/worlds')
  const worlds = data?.worlds ?? []
  return worlds.map((w) => w.name).sort((a, b) => a.localeCompare(b))
}
