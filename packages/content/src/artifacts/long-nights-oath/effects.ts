import type { CombatActionEffect } from "../../combat/types.js"

export const LONG_NIGHTS_OATH_PLUNGE_DAMAGE_BONUS = 0.25
export const LONG_NIGHTS_OATH_RADIANCE_EVERLASTING_DAMAGE_BONUS_PER_STACK = 0.15

const stackCounts = [1, 2, 3, 4, 5] as const

function createRadianceEverlastingDamageBonusEffect(
  stackCount: (typeof stackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "long-nights-oath-radiance-everlasting", variant: `${stackCount}-stack` },
    id: `artifact.long-nights-oath.4pc.radiance-everlasting.${stackCount}-stack.plunge-damage-bonus`,
    label: `长夜之誓 · 已达成${stackCount}层永照的流辉`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "LongNightsOath" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["plunge"] },
    value: {
      kind: "fixed",
      value: LONG_NIGHTS_OATH_RADIANCE_EVERLASTING_DAMAGE_BONUS_PER_STACK * stackCount
    }
  }
}

/** Typed two-piece and selected current-action Radiance Everlasting stacks of Long Night's Oath. */
export const longNightsOathCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.long-nights-oath.2pc.plunge-damage-bonus",
    label: "长夜之誓 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "LongNightsOath" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "fixed", value: LONG_NIGHTS_OATH_PLUNGE_DAMAGE_BONUS }
  },
  ...stackCounts.map(createRadianceEverlastingDamageBonusEffect)
]
