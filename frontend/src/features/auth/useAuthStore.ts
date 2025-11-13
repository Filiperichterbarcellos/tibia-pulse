import { create } from 'zustand'
import { setAuthHeader } from '@/lib/apiClient'
import { fetchSession } from './api'

type User = {
  id: string
  email: string
  name?: string | null
  mainCharacter?: string | null
  avatarUrl?: string | null
  createdAt?: string
}

type AuthState = {
  token: string | null
  user: User | null
  status: 'idle' | 'loading' | 'ready'
  setSession: (session: { token: string; user: User }) => void
  setUser: (user: User | null) => void
  hydrateProfile: () => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'tp_token'

function readToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

function persistToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

const initialToken = readToken()
if (initialToken) {
  setAuthHeader(initialToken)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: null,
  status: initialToken ? 'idle' : 'ready',

  setSession: ({ token, user }) => {
    persistToken(token)
    setAuthHeader(token)
    set({ token, user, status: 'ready' })
  },

  setUser: (user) => set({ user }),

  hydrateProfile: async () => {
    const { token, status } = get()
    if (!token || status === 'loading') return
    set({ status: 'loading' })
    try {
      const data = await fetchSession()
      set({ user: data?.user ?? null, status: 'ready' })
    } catch {
      persistToken(null)
      setAuthHeader(null)
      set({ token: null, user: null, status: 'ready' })
    }
  },

  logout: () => {
    persistToken(null)
    setAuthHeader(null)
    set({ token: null, user: null, status: 'ready' })
  },
}))
