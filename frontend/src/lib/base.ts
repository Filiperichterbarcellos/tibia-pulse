// src/lib/base.ts
import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL,
  timeout: 15000,
})

// opcional: helper pra setar/remover Authorization
export function setAuth(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}
