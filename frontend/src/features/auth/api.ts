import { apiClient } from '@/lib/apiClient'
import type { CharacterSummary } from '@/features/characters/api'

type AuthResponse = {
  token: string
  user: {
    id: string
    email: string
    name?: string | null
    mainCharacter?: string | null
    avatarUrl?: string | null
    createdAt?: string
  }
}

export async function fetchSession() {
  const { data } = await apiClient.get<{ user: AuthResponse['user'] }>('/api/auth/me')
  return data
}

export async function updateProfile(payload: { name?: string; mainCharacter?: string | null }) {
  const { data } = await apiClient.put<{ user: AuthResponse['user'] }>('/api/profile', payload)
  return data
}

export async function fetchTrackedCharacter() {
  const { data } = await apiClient.get<{ character: CharacterSummary }>('/api/profile/character')
  return data
}
