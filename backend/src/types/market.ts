export type Vocation =
  | 'Knight' | 'Elite Knight'
  | 'Paladin' | 'Royal Paladin'
  | 'Sorcerer' | 'Master Sorcerer'
  | 'Druid' | 'Elder Druid'

export interface Auction {
  name: string
  level: number
  vocation: Vocation | string
  world: string
  currentBid: number // em gold
  hasBid: boolean
  endTime: string    // ISO
  url: string        // link do leilão oficial
  outfits?: string[]
  mounts?: string[]
}
