// src/features/bazaar/api.ts
import apiClient from '@/lib/apiClient'

export type Auction = {
  id: number | null
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  minimumBid: number
  hasBid: boolean
  endDate: string | null
  url: string | null
  outfitUrl: string | null
  pvpType: string | null
  charmPoints: number | null
  charmInfo: { total: number | null; expansion: boolean } | null
  bossPoints: number | null
  skills: Record<string, number> | null
  items: number[] | null
  storeItems: Array<{ name: string; amount: number }> | null
  imbuements: string[] | null
  quests: string[] | null
  hirelings: { count: number; jobs: number; outfits: number } | null
  gems: { lesser: number; regular: number; greater: number } | null
  greaterGems: string[] | null
  preySlot: boolean
  huntingSlot: boolean
  battleye: 'green' | 'yellow' | null
  serverLocation: string | null
  transfer: boolean
}

export type AuctionFilters = {
  world?: string
  vocation?: string
  minLevel?: number
  maxLevel?: number
  page?: number
  order?: 'price' | 'level' | 'end'
  sort?: 'asc' | 'desc'
}

export type AuctionListResponse = {
  page: number
  totalPages: number
  auctions: Auction[]
}

export async function listAuctions(filters: AuctionFilters = {}): Promise<AuctionListResponse> {
  const { data } = await apiClient.get<AuctionListResponse>('/api/market/auctions', {
    params: filters,
  })
  return data
}
