export type Skills = Partial<{
  magic: number
  club: number
  sword: number
  axe: number
  distance: number
  shielding: number
  fishing: number
  fist: number
}>

export type StoreItem = {
  name: string
  amount: number
}

export type CharmInfo = {
  total: number
  expansion: boolean
}

export type GemsInfo = {
  lesser: number
  regular: number
  greater: number
}

export type HirelingInfo = {
  count: number
  jobs: number
  outfits: number
}

export type Auction = {
  id?: number | null
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  minimumBid: number
  hasBid: boolean
  endTime: string
  url: string
  portrait: string
  bossPoints?: number
  charmPoints?: number
  charmInfo?: CharmInfo
  skills?: Skills
  items?: number[]
  storeItems?: StoreItem[]
  imbuements?: string[]
  quests?: string[]
  hirelings?: HirelingInfo
  preySlot?: boolean
  huntingSlot?: boolean
  gems?: GemsInfo
  greaterGems?: string[]
  tcInvested?: number
  tags?: string[]
  battleye?: 'green' | 'yellow'
  pvpType?: string
  serverLocation?: string
  transfer?: boolean
}
