import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/features/auth/useAuthStore'
import {
  createFavorite,
  deleteFavorite,
  listFavorites,
  type Favorite,
} from './api'

export type FavoriteRecord<TSnapshot = any> = Favorite<TSnapshot>

type UseFavoritesResult<TSnapshot> = {
  favorites: Array<FavoriteRecord<TSnapshot>>
  loading: boolean
  error: string | null
  updatingKey: string | null
  isFavorite: (key: string) => FavoriteRecord<TSnapshot> | undefined
  refresh: () => Promise<void>
  addFavorite: (payload: { key: string; notes?: string; snapshot?: TSnapshot }) => Promise<FavoriteRecord<TSnapshot>>
  removeFavorite: (favorite: FavoriteRecord<TSnapshot>) => Promise<void>
}

export function useFavorites<TSnapshot = any>(type: Favorite['type']): UseFavoritesResult<TSnapshot> {
  const token = useAuthStore((s) => s.token)
  const [favorites, setFavorites] = useState<Array<FavoriteRecord<TSnapshot>>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const { favorites: payload } = await listFavorites(type)
      setFavorites(payload as Array<FavoriteRecord<TSnapshot>>)
      setError(null)
    } catch (err: any) {
      const message = err?.response?.data?.error ?? 'Não foi possível carregar favoritos.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [token, type])

  useEffect(() => {
    if (!token) {
      setFavorites([])
      setError(null)
      setLoading(false)
      return
    }
    fetchFavorites()
  }, [token, fetchFavorites])

  const favoriteMap = useMemo(() => new Map(favorites.map((fav) => [fav.key, fav])), [favorites])

  const addFavorite = useCallback(
    async (payload: { key: string; notes?: string; snapshot?: TSnapshot }) => {
      if (!token) throw new Error('not-authenticated')
      setUpdatingKey(payload.key)
      try {
        const { favorite } = await createFavorite({
          type,
          key: payload.key,
          notes: payload.notes,
          snapshot: payload.snapshot,
        })
        setFavorites((prev) => [
          favorite as FavoriteRecord<TSnapshot>,
          ...prev.filter((item) => item.id !== favorite.id),
        ])
        setError(null)
        return favorite as FavoriteRecord<TSnapshot>
      } catch (err: any) {
        const message = err?.response?.data?.error ?? 'Não foi possível salvar o favorito.'
        setError(message)
        throw err
      } finally {
        setUpdatingKey(null)
      }
    },
    [token, type],
  )

  const removeFavorite = useCallback(
    async (favorite: FavoriteRecord<TSnapshot>) => {
      if (!token) throw new Error('not-authenticated')
      setUpdatingKey(favorite.key)
      try {
        await deleteFavorite(favorite.id)
        setFavorites((prev) => prev.filter((item) => item.id !== favorite.id))
        setError(null)
      } catch (err: any) {
        const message = err?.response?.data?.error ?? 'Não foi possível remover o favorito.'
        setError(message)
        throw err
      } finally {
        setUpdatingKey(null)
      }
    },
    [token],
  )

  return {
    favorites,
    loading,
    error,
    updatingKey,
    isFavorite: (key: string) => favoriteMap.get(key),
    refresh: fetchFavorites,
    addFavorite,
    removeFavorite,
  }
}
