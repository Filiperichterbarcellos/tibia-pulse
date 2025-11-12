import {
  EXERCISE_WEAPONS,
  DIVIDERS,
  SKILL_BASE,
  VOCATION_CONSTANTS,
} from './constants'

export type Vocation = keyof typeof VOCATION_CONSTANTS
export type SkillKey = keyof typeof SKILL_BASE
export type ExerciseWeapon = 'regular' | 'durable' | 'lasting'

export type WeaponsObject = Record<ExerciseWeapon, number>

function skillToPoints(skillValue: number, vocation: Vocation, skill: SkillKey) {
  const vocationConstant = VOCATION_CONSTANTS[vocation][skill]
  const numerator = vocationConstant ** skillValue - 1
  const denominator = vocationConstant - 1
  return SKILL_BASE.magic * (numerator / denominator)
}

function pointsToAdvance(skillValue: number, vocation: Vocation, skill: SkillKey) {
  const vocationConstant = VOCATION_CONSTANTS[vocation][skill]
  return SKILL_BASE.magic * vocationConstant ** skillValue
}

export function requiredSkillPoints({
  current,
  target,
  percentageLeft,
  skill,
  vocation,
  loyaltyBonus,
}: {
  current: number
  target: number
  percentageLeft: number
  skill: SkillKey
  vocation: Vocation
  loyaltyBonus: number
}) {
  const currentPoints = skillToPoints(current, vocation, skill)
  const targetPoints = skillToPoints(target, vocation, skill)
  const required = targetPoints - currentPoints

  const remaining = Math.max(0, Math.min(100, percentageLeft)) / 100

  let total = 0
  if (target - current === 1) {
    total = required * remaining
  } else {
    const nextPoints = pointsToAdvance(current, vocation, skill)
    total = required - nextPoints * (1 - remaining)
  }

  return total / (1 + loyaltyBonus / 100)
}

export function autoRequiredWeapons(pointsRequired: number): WeaponsObject {
  const lasting = Math.floor(pointsRequired / EXERCISE_WEAPONS.skillPoints.lasting)
  const remainderAfterLasting = pointsRequired % EXERCISE_WEAPONS.skillPoints.lasting

  const durable = Math.floor(remainderAfterLasting / EXERCISE_WEAPONS.skillPoints.durable)
  const remainderAfterDurable = remainderAfterLasting % EXERCISE_WEAPONS.skillPoints.durable

  const regular = Math.ceil(remainderAfterDurable / EXERCISE_WEAPONS.skillPoints.regular)

  return { lasting, durable, regular }
}

export function customRequiredWeapons(pointsRequired: number, weapon: ExerciseWeapon): WeaponsObject {
  const count = Math.ceil(pointsRequired / EXERCISE_WEAPONS.skillPoints[weapon])
  return {
    lasting: weapon === 'lasting' ? count : 0,
    durable: weapon === 'durable' ? count : 0,
    regular: weapon === 'regular' ? count : 0,
  }
}

export function skillCost(weapons: WeaponsObject) {
  const entries = Object.entries(weapons) as Array<[ExerciseWeapon, number]>
  return entries.reduce(
    (acc, [weapon, qty]) => {
      acc.gold += qty * EXERCISE_WEAPONS.goldPrice[weapon]
      acc.tc += qty * EXERCISE_WEAPONS.tcPrice[weapon]
      acc.seconds += qty * EXERCISE_WEAPONS.seconds[weapon]
      return acc
    },
    { gold: 0, tc: 0, seconds: 0 },
  )
}

export function applyTrainingBoosts(points: number, opts: { dummy: boolean; double: boolean }) {
  let result = points
  if (opts.dummy) result /= DIVIDERS.hasDummy
  if (opts.double) result /= DIVIDERS.isDouble
  return result
}
