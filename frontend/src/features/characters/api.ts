import { apiClient } from '@/lib/apiClient'

export type DeathEntry = {
  time?: string
  level?: number
  reason?: string
}

export type CharacterSummary = {
  name: string
  level: number
  vocation?: string
  world?: string
  residence?: string
  sex?: string
  lastLogin?: string | null
  created?: string | null
  deaths?: DeathEntry[] // opcional
}

export async function getCharacter(name: string): Promise<{ character: CharacterSummary }> {
  const { data } = await apiClient.get(`/api/characters/${encodeURIComponent(name)}`)

  // Backend pode retornar em formatos levemente diferentes; normalizamos aqui
  const c = (data?.character ?? data?.characters?.data ?? data) as any

  const deaths: DeathEntry[] =
    Array.isArray(c?.deaths) ? c.deaths
    : Array.isArray(c?.deaths?.data) ? c.deaths.data
    : []

  const character: CharacterSummary = {
    name: c?.name,
    level: c?.level,
    vocation: c?.vocation,
    world: c?.world,
    residence: c?.residence,
    sex: c?.sex,
    lastLogin: c?.last_login ?? c?.lastLogin ?? null,
    created: c?.created ?? null,
    deaths,
  }

  return { character }
}
