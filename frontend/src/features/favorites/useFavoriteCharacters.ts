import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/features/auth/useAuthStore'
import {
  createFavorite,
  deleteFavorite,
  listFavorites,
  type Favorite,
} from './api'

export type FavoriteCharacterSnapshot = {
  name?: string | null
  vocation?: string | null
  world?: string | null
  level?: number | null
  outfitUrl?: string | null
  lastUpdate?: string | null
}

export type FavoriteCharacter = Favorite<FavoriteCharacterSnapshot>

export function useFavoriteCharacters(type: Favorite['type'] = 'AUCTION') {
  const token = useAuthStore((s) => s.token)
  const [favorites, setFavorites] = useState<FavoriteCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const { favorites: payload } = await listFavorites(type)
      setFavorites(payload as FavoriteCharacter[])
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

  const favoriteMap = useMemo(() => {
    return new Map(favorites.map((fav) => [fav.key, fav]))
  }, [favorites])

  const addFavorite = useCallback(
    async (payload: { key: string; notes?: string; snapshot?: FavoriteCharacterSnapshot }) => {
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
          favorite as FavoriteCharacter,
          ...prev.filter((item) => item.id !== favorite.id),
        ])
        setError(null)
        return favorite as FavoriteCharacter
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
    async (fav: FavoriteCharacter) => {
      if (!token) throw new Error('not-authenticated')
      setUpdatingKey(fav.key)
      try {
        await deleteFavorite(fav.id)
        setFavorites((prev) => prev.filter((item) => item.id !== fav.id))
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
    refresh: fetchFavorites,
    isFavorite: (key: string) => favoriteMap.get(key),
    addFavorite,
    removeFavorite,
  }
}
