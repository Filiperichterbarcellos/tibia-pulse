import { create } from 'zustand'

type User = {
  id: string
  email: string
}

type AuthState = {
  token: string | null
  user: User | null
  setToken: (t: string | null) => void
  setUser: (u: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('tp_token'),
  user: null,
  setToken: (t) => {
    if (t) localStorage.setItem('tp_token', t)
    else localStorage.removeItem('tp_token')
    set({ token: t })
  },
  setUser: (u) => set({ user: u }),
  logout: () => {
    localStorage.removeItem('tp_token')
    set({ token: null, user: null })
  },
}))
