// src/pages/Bazaar.tsx
import { useEffect, useMemo, useState } from 'react'
import { listAuctions, type Auction, type AuctionFilters } from '@/features/bazaar/api'
import BazaarFilters, { DEFAULT_UI_FILTERS, type BazaarUiFilters } from '@/features/bazaar/BazaarFilters'
import Pagination from '@/features/bazaar/Pagination'
import BazaarAuctionCard from '@/features/bazaar/AuctionCard'
import { useFavoriteAuctions } from '@/features/favorites/useFavoriteAuctions'
import { useAuthStore } from '@/features/auth/useAuthStore'

const INITIAL_FILTERS: AuctionFilters = {
  page: 1,
  order: 'end',
  sort: 'asc',
}

export default function Bazaar() {
  const [filters, setFilters] = useState<AuctionFilters>(INITIAL_FILTERS)
  const [uiFilters, setUiFilters] = useState<BazaarUiFilters>(DEFAULT_UI_FILTERS)
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const token = useAuthStore((s) => s.token)
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    addFavorite,
    removeFavorite,
    updatingKey,
  } = useFavoriteAuctions()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { auctions: payload, totalPages: total } = await listAuctions({
          ...filters,
          page: filters.page ?? 1,
        })
        if (cancelled) return
        setAuctions(payload ?? [])
        setTotalPages(total ?? 1)
        setError(null)
      } catch (e: any) {
        if (cancelled) return
        const message = e?.response?.data?.error
        setError(
          typeof message === 'string'
            ? message
            : 'Não foi possível carregar os leilões para esses filtros.',
        )
        setAuctions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [filters])

  useEffect(() => {
    if (!favoriteMessage) return
    const id = setTimeout(() => setFavoriteMessage(null), 4000)
    return () => clearTimeout(id)
  }, [favoriteMessage])

  useEffect(() => {
    if (token) setFavoriteMessage(null)
  }, [token])

  const handleFiltersChange = (next: AuctionFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...next,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  const page = filters.page ?? 1

  const favoritesMap = useMemo(() => {
    return new Map(favorites.map((fav) => [fav.key, fav]))
  }, [favorites])

  const filteredAuctions = useMemo(
    () => applyClientFilters(auctions, uiFilters, filters),
    [auctions, uiFilters, filters],
  )

  const handleFavoriteToggle = async (auction: Auction) => {
    if (!token) {
      setFavoriteMessage('Entre para salvar personagens favoritos.')
      return
    }

    const key = buildFavoriteKey(auction)
    const current = favoritesMap.get(key)

    try {
      if (current) {
        await removeFavorite(current)
      } else {
        await addFavorite({ key, snapshot: { ...auction } })
      }
    } catch {
      // erros já são tratados no hook
    }
  }

  const renderState = () => {
    if (loading) return <div className="retro-panel text-slate-500">Carregando leilões…</div>
    if (error)
      return (
        <div className="retro-panel border-red-200 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )
    if (!auctions.length)
      return (
        <div className="retro-panel text-slate-600">
          Nenhum leilão encontrado com os filtros atuais.
        </div>
      )

    if (!filteredAuctions.length) {
      return (
        <div className="retro-panel text-slate-600">
          Nenhum personagem corresponde a todos os filtros selecionados. Experimente limpar alguns
          chips para ampliar a busca.
        </div>
      )
    }

    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAuctions.map((auction) => {
            const key = buildFavoriteKey(auction)
            const favorite = favoritesMap.get(key)
            return (
              <BazaarAuctionCard
                key={auction.id ?? key}
                {...auction}
                isFavorite={Boolean(favorite)}
                disableFavorite={favoritesLoading || updatingKey === key}
                onFavoriteToggle={() => handleFavoriteToggle(auction)}
              />
            )
          })}
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
      </>
    )
  }

  return (
    <div className="retro-layout space-y-8">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Char Bazaar</p>
          <h1>Encontre o próximo personagem lendário</h1>
          <p>
            Dados frescos direto do tibia.com, com filtros avançados para vocações, PvP, BattlEye e
            itens da Store. Favoritar exige login.
          </p>
        </div>
        <div className="retro-hero__box">
          <p>Stats rápidos</p>
          <ul>
            <li>
              <strong>{auctions.length}</strong> leilões nesta página
            </li>
            <li>
              <strong>{filteredAuctions.length}</strong> após filtros locais
            </li>
            <li>
              <strong>{favorites.length}</strong> favoritos salvos
            </li>
          </ul>
        </div>
      </section>

      <BazaarFilters
        apiFilters={filters}
        uiFilters={uiFilters}
        onApiFiltersChange={handleFiltersChange}
        onUiFiltersChange={setUiFilters}
      />

      {(favoriteMessage || favoritesError) && (
        <div className="retro-panel border-amber-200 bg-amber-50 text-sm text-amber-900">
          {favoriteMessage || favoritesError}
        </div>
      )}

      {renderState()}
    </div>
  )
}

function buildFavoriteKey(auction: Auction) {
  if (auction.url) return auction.url
  return [auction.name, auction.world, auction.endDate ?? ''].filter(Boolean).join(':')
}

function applyClientFilters(list: Auction[], filters: BazaarUiFilters, apiFilters: AuctionFilters) {
  const search = filters.nickname.trim().toLowerCase()
  return list.filter((auction) => {
    if (filters.onlyBidded && !auction.hasBid) return false
    if (search && !auction.name.toLowerCase().includes(search)) return false
    if (filters.pvp && (auction.pvpType ?? '').toLowerCase() !== filters.pvp.toLowerCase())
      return false
    if (filters.battleye && auction.battleye !== filters.battleye) return false
    if (
      filters.location &&
      (auction.serverLocation ?? '').toUpperCase() !== filters.location.toUpperCase()
    ) {
      return false
    }
    if (apiFilters.world) {
      const worldSearch = apiFilters.world.trim().toLowerCase()
      if (!auction.world.toLowerCase().includes(worldSearch)) return false
    }
    if (apiFilters.vocation) {
      const voc = apiFilters.vocation.toLowerCase()
      if ((auction.vocation ?? '').toLowerCase() !== voc) return false
    }
    if (typeof apiFilters.minLevel === 'number' && auction.level < apiFilters.minLevel) return false
    if (typeof apiFilters.maxLevel === 'number' && auction.level > apiFilters.maxLevel) return false

    if (filters.storeItems.length) {
      const matchesAll = filters.storeItems.every((key) => storeMatcher(key, auction))
      if (!matchesAll) return false
    }
    return true
  })
}

function storeMatcher(value: string, auction: Auction) {
  const items = auction.storeItems ?? []
  const hasItem = (term: string) =>
    items.some((store) => store.name.toLowerCase().includes(term.toLowerCase()))

  switch (value) {
    case 'training-dummy':
      return hasItem('dummy')
    case 'charm-expansion':
      return Boolean(auction.charmInfo?.expansion)
    case 'imbuement-shrine':
      return hasItem('imbu')
    case 'gold-pouch':
      return hasItem('gold pouch')
    case 'hirelings':
      return (auction.hirelings?.count ?? 0) > 0
    case 'prey-slot':
      return Boolean(auction.preySlot)
    case 'hunting-slot':
      return Boolean(auction.huntingSlot)
    case 'reward-shrine':
      return hasItem('reward shrine')
    case 'mailbox':
      return hasItem('mailbox')
    default:
      return false
  }
}
