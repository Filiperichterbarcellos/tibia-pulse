// src/types/auction.ts
export type Skills = {
  magic?: number
  club?: number
  sword?: number
  axe?: number
  distance?: number
  shielding?: number
  fishing?: number
  fist?: number
}

export type AuctionDTO = {
  id?: number | null
  name: string
  level: number
  vocation: string
  world: string

  currentBid: number
  hasBid?: boolean

  // O backend pode mandar endDate (ISO) OU endTime (texto tipo "4m 20s")
  endDate?: string | null
  endTime?: string | null

  url?: string | null
  outfitUrl?: string | null

  // enriquecimentos
  charmPoints?: number | null
  bossPoints?: number | null
  skills?: Skills
}
