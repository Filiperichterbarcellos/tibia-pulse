// src/features/bazaar/api.ts
import apiClient from '@/lib/apiClient'

export type Auction = {
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  hasBid: boolean
  endTime: string
  url: string
  portrait?: string
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

export async function listAuctions(filters: AuctionFilters = {}) {
  const { data } = await apiClient.get('/api/market/auctions', { params: filters })
  // backend responde { auctions: Auction[] }
  return data as { auctions: Auction[] }
}
