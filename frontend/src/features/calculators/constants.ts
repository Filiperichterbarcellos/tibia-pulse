import protectiveCharm from '@/assets/protectiveCharm.png'
import sabretooth from '@/assets/sabretooth.png'
import vexclawTalon from '@/assets/vexclawTalon.png'
import ropeBelt from '@/assets/ropeBelt.png'
import silencerClaws from '@/assets/silencerClaws.png'
import grimeleech from '@/assets/grimeleech.png'
import deadBrain from '@/assets/deadBrain.png'
import bloodyPincers from '@/assets/bloodyPincers.png'
import vampireTeeth from '@/assets/vampireTeeth.png'

export const LOW_BLOW_MULTIPLIER = 1.09
export const ELEMENTAL_DAMAGE = 0.05
export const ELEMENTAL_PROC_CHANCE = 0.1
export const POWERFUL_MULTIPLIER = 1.05

export const MAX_STAMINA_MINUTES = 42 * 60
export const HAPPY_HOUR_STAMINA_MINUTES = 39 * 60
export const STAMINA_MINUTES_PER_REAL_MINUTE = 1 / 3

export const IMBUEMENT_TIERS = [
  { label: 'Powerful (III)', value: 3 },
  { label: 'Intricate (II)', value: 2 },
  { label: 'Basic (I)', value: 1 },
]

export const TIER_BASE_PRICE: Record<number, number> = {
  1: 15000,
  2: 60000,
  3: 250000,
}

export const TIER_NAME: Record<number, string> = {
  1: 'basic',
  2: 'intricate',
  3: 'powerful',
}

export type ImbuementRecipe = {
  id: string
  label: string
  npc: string
  materials: Array<{
    name: string
    amount: number
    icon: string
  }>
}

export const IMBUEMENT_RECIPES: ImbuementRecipe[] = [
  {
    id: 'life-leech',
    label: 'Vampirism (Life Leech)',
    npc: 'vampirism',
    materials: [
      { name: 'Vampire Teeth', amount: 25, icon: vampireTeeth },
      { name: 'Bloody Pincers', amount: 15, icon: bloodyPincers },
      { name: 'Piece of Dead Brain', amount: 5, icon: deadBrain },
    ],
  },
  {
    id: 'mana-leech',
    label: 'Void (Mana Leech)',
    npc: 'void',
    materials: [
      { name: 'Rope Belt', amount: 25, icon: ropeBelt },
      { name: 'Silencer Claws', amount: 25, icon: silencerClaws },
      { name: 'Grimeleech Wings', amount: 5, icon: grimeleech },
    ],
  },
  {
    id: 'critical',
    label: 'Strike (Critical Hit)',
    npc: 'strike',
    materials: [
      { name: 'Protective Charm', amount: 20, icon: protectiveCharm },
      { name: 'Sabretooth', amount: 25, icon: sabretooth },
      { name: 'Vexclaw Talon', amount: 5, icon: vexclawTalon },
    ],
  },
]

type TokenPattern = boolean[]

export const TIER_TOKEN_PATTERNS: Record<number, TokenPattern[]> = {
  1: [[true], [false]],
  2: [
    [true, true],
    [true, false],
    [false, false],
  ],
  3: [
    [true, true, true],
    [true, true, false],
    [true, false, false],
    [false, false, false],
  ],
}

export const EXERCISE_WEAPONS = {
  skillPoints: {
    regular: 300000,
    durable: 1080000,
    lasting: 8640000,
  },
  charges: {
    lasting: 14400,
    durable: 1800,
    regular: 500,
  },
  goldPrice: {
    lasting: 10_000_000,
    durable: 1_250_000,
    regular: 347_222,
  },
  tcPrice: {
    lasting: 720,
    durable: 90,
    regular: 25,
  },
  seconds: {
    lasting: 28_800,
    durable: 3_600,
    regular: 1_000,
  },
}

export const DIVIDERS = {
  hasDummy: 1.1,
  isDouble: 2,
}

export const VOCATION_CONSTANTS = {
  knight: { magic: 3, melee: 1.1, fist: 1.1, distance: 1.4, shield: 1.1 },
  paladin: { magic: 1.4, melee: 1.2, fist: 1.2, distance: 1.1, shield: 1.1 },
  druid: { magic: 1.1, melee: 1.8, fist: 1.5, distance: 1.8, shield: 1.5 },
  sorcerer: { magic: 1.1, melee: 2, fist: 1.5, distance: 2, shield: 1.5 },
  monk: { magic: 1.25, melee: 1.4, fist: 1.1, distance: 1.5, shield: 1.15 },
} as const

export const SKILL_BASE = {
  magic: 1600,
  distance: 30,
  melee: 50,
  fist: 50,
  shield: 100,
} as const
