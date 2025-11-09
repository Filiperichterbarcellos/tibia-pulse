// src/features/bazaar/constants.ts
export const ORDER_FIELDS = [
  { value: 'price', label: 'Preço' },
  { value: 'level', label: 'Level' },
  { value: 'end', label: 'Termina' },
] as const

export const ORDER_DIR = [
  { value: 'asc', label: 'Asc' },
  { value: 'desc', label: 'Desc' },
] as const

export const VOCATION_LABEL: Record<string, string> = {
  'None': 'None',
  'Knight': 'Knight',
  'Elite Knight': 'Elite Knight',
  'Paladin': 'Paladin',
  'Royal Paladin': 'Royal Paladin',
  'Sorcerer': 'Sorcerer',
  'Master Sorcerer': 'Master Sorcerer',
  'Druid': 'Druid',
  'Elder Druid': 'Elder Druid',
  'Monk': 'Monk',
}

export const VOCATION_EMOJI: Record<string, string> = {
  'Knight': '🛡️',
  'Elite Knight': '🛡️',
  'Paladin': '🏹',
  'Royal Paladin': '🏹',
  'Sorcerer': '🔥',
  'Master Sorcerer': '🔥',
  'Druid': '🌿',
  'Elder Druid': '🌿',
  'Monk': '🧘',
  'None': '🎲',
}

export const VOCATION_COLOR: Record<string, string> = {
  'Knight': 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30',
  'Elite Knight': 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30',
  'Paladin': 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
  'Royal Paladin': 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
  'Sorcerer': 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30',
  'Master Sorcerer': 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30',
  'Druid': 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  'Elder Druid': 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  'Monk': 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30',
  'None': 'bg-zinc-700/30 text-zinc-300 ring-1 ring-zinc-600/40',
}
