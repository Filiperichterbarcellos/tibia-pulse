export type CharacterDeath = {
  time: string | null
  level: number
  reason: string
}

export type CharacterExperienceHistory = {
  date: string
  expChange: number
  level: number
  vocationRank?: number
  vocationRankDelta?: number
  experience?: number
  timeOnlineText?: string
  timeOnlineMinutes?: number
  averageExpPerHour?: number
}

export type PulseStatsLevelHistoryEntry = {
  index: number
  when: string
  relative?: string
  level: number
  change?: 'up' | 'down' | 'same'
}

export type PulseStatsTimeOnlineDay = {
  label: string
  raw?: string
  durationMinutes?: number
  doubleEvent?: boolean
}

export type PulseStatsTimeOnlineSummary = {
  lastMonth?: string
  currentMonth?: string
  currentWeek?: string
  weekdays?: PulseStatsTimeOnlineDay[]
}

export type PulseStatsHighscoreEntry = {
  skill: string
  value: string
  position?: number
  link?: string
}

export type PulseStatsDeathEntry = {
  index: number
  when: string
  killer: string
  level: number
  expLost?: number
}

export type PulseStatsSummary = {
  currentXP?: number
  bestDay?: { date: string; value: number }
  averageDaily?: number
  history: CharacterExperienceHistory[]
  levelHistory?: PulseStatsLevelHistoryEntry[]
  timeOnline?: PulseStatsTimeOnlineSummary
  highscores?: PulseStatsHighscoreEntry[]
  guildDeaths?: PulseStatsDeathEntry[]
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
  loyaltyTitle?: string
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
  trackerStats?: PulseStatsSummary
}
