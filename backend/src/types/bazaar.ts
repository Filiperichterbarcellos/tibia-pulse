export type BazaarFilters = {
  world?: string
  vocation?: string
  minLevel?: number
  maxLevel?: number
  page?: number
  order?: 'price' | 'level' | 'end'
  sort?: 'asc' | 'desc'
}
