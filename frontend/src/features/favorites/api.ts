import { apiClient } from '@/lib/apiClient'

export type Favorite<TSnapshot = any> = {
  id: string
  type: 'AUCTION' | 'BOSS'
  key: string
  notes?: string | null
  snapshot?: TSnapshot | null
  createdAt: string
}

export async function listFavorites(type?: Favorite['type']) {
  const params = type ? { type } : undefined
  const { data } = await apiClient.get<{ favorites: Favorite[] }>('/api/favorites', { params })
  return data
}

export async function createFavorite(payload: {
  type: Favorite['type']
  key: string
  notes?: string
  snapshot?: any
}) {
  const { data } = await apiClient.post<{ favorite: Favorite }>('/api/favorites', payload)
  return data
}

export async function deleteFavorite(id: string) {
  await apiClient.delete(`/api/favorites/${id}`)
}
