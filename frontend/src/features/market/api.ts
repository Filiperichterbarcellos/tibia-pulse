import { apiClient } from '@/lib/apiClient'

export type Auction = {
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  hasBid: boolean
  endTime: string
  url: string
}

export async function getAuctions(params: Record<string, any> = {}) {
  const { data } = await apiClient.get<{ auctions: Auction[] }>('/market/auctions', { params })
  return data
}
