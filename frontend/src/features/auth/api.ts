import { apiClient } from '@/lib/apiClient'

type AuthResponse = {
  token: string
  user: {
    id: string
    email: string
    name?: string | null
  }
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload)
  return data
}

export async function register(payload: { email: string; password: string; name?: string }) {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload)
  return data
}

export async function fetchSession() {
  const { data } = await apiClient.get<{ user: AuthResponse['user'] }>('/api/auth/me')
  return data
}
