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

export type Auction = {
  name: string
  level: number
  vocation: string
  world: string
  currentBid: number
  hasBid: boolean
  endTime: string
  url: string
  portrait: string

  // novos (opcionais)
  charmPoints?: number
  bossPoints?: number
  skills?: Skills
}
