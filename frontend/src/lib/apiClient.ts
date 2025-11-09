// src/lib/apiClient.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
})

// exporta dos dois jeitos pra não quebrar nenhum import antigo
export default apiClient
