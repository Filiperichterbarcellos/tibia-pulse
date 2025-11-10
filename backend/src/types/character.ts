export type CharacterDeath = {
  time: string | null
  level: number
  reason: string
}

export type CharacterExperienceHistory = {
  date: string
  expChange: number
  level: number
}

export type CharacterSummary = {
  name: string
  world?: string
  vocation?: string
  level: number
  residence?: string
  guild?: string
  sex?: string
  created?: string
  lastLogin?: string
  accountStatus?: string
  house?: string
  comment?: string
  formerNames?: string
  title?: string
  formerWorld?: string
  achievementPoints?: number
  deaths: CharacterDeath[]
  currentXP?: number
  xpToNextLevel?: number
  averageDailyXP?: number
  bestDayXP?: {
    date: string
    value: number
  } | null
  history?: CharacterExperienceHistory[]
}
