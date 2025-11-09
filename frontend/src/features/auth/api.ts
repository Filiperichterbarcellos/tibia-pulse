import axios, { type InternalAxiosRequestConfig, type AxiosRequestHeaders } from 'axios'
import { useAuthStore } from './useAuthStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
})

// Anexa token JWT se existir (tipagem segura)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders
    ;(config.headers as AxiosRequestHeaders)['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Endpoints
export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function register(payload: { email: string; password: string; name?: string }) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export default api   // (default)
