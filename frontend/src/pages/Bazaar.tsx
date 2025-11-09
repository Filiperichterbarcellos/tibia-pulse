// src/pages/Bazaar.tsx
import { useEffect, useState } from 'react'
import { listAuctions, type Auction, type AuctionFilters } from '@/features/bazaar/api'
import BazaarFilters from '@/features/bazaar/BazaarFilters'
import Pagination from '@/features/bazaar/Pagination'
import BazaarAuctionCard from '@/features/bazaar/AuctionCard'

const INITIAL_FILTERS: AuctionFilters = {
  page: 1,
  order: 'end',
  sort: 'asc',
}

export default function Bazaar() {
  const [filters, setFilters] = useState<AuctionFilters>(INITIAL_FILTERS)
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { auctions: payload } = await listAuctions({
          ...filters,
          page: filters.page ?? 1,
        })
        if (cancelled) return
        setAuctions(payload ?? [])
        setError(null)
      } catch (e: any) {
        if (cancelled) return
        setError(e?.response?.data?.error ?? 'upstream error')
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

  const renderState = () => {
    if (loading) return <div className="text-zinc-400">Carregando leilões…</div>
    if (error)
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )
    if (!auctions.length)
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-zinc-400">
          Nenhum leilão encontrado com os filtros atuais.
        </div>
      )
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
          {auctions.map((auction) => (
            <BazaarAuctionCard
              key={`${auction.name}-${auction.world}-${auction.endTime ?? auction.url}`}
              {...auction}
            />
          ))}
        </div>
        <Pagination page={page} onPage={handlePageChange} />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-indigo-300">Char Bazaar</p>
        <h1 className="text-3xl font-semibold text-zinc-100">Monitore os últimos leilões</h1>
        <p className="text-zinc-400">
          Filtre por mundo, vocação e nível para encontrar o próximo personagem perfeito.
        </p>
      </header>

      <BazaarFilters value={filters} onChange={handleFiltersChange} />

      {renderState()}
    </div>
  )
}
