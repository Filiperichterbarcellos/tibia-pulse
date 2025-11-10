// src/lib/apiClient.ts
import axios from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:4000'

const baseURL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_BASE_URL
).replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
})

export function setAuthHeader(token?: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

// tenta reaproveitar token salvo ao carregar o app
if (typeof window !== 'undefined') {
  const stored = window.localStorage.getItem('tp_token')
  if (stored) {
    setAuthHeader(stored)
  }
}

export default apiClient
