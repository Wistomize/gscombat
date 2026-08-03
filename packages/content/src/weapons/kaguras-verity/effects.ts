import type { CombatActionEffect } from "../../combat/types.js"

export const KAGURAS_VERITY_SKILL_DAMAGE_BONUS_PER_STACK = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const KAGURAS_VERITY_THREE_STACK_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const KAGURAS_VERITY_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK = [0.12, 0.15, 0.18, 0.21, 0.24] as const

const stackCounts = [1, 2, 3] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

function getSkillDamageBonusValues(stackCount: number): readonly number[] {
  return KAGURAS_VERITY_SKILL_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function getStellarSuperconductDamageBonusValues(stackCount: number): readonly number[] {
  return KAGURAS_VERITY_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "kaguras-verity-kagura-dance", variant: `${stackCount}-stack` }
  const effects: CombatActionEffect[] = [
    {
      activation: "active",
      exclusivity,
      id: `weapon.kaguras-verity.kagura-dance.${stackCount}-stack.skill-damage-bonus`,
      label: `神乐之真意 · ${stackCount}层神乐舞元素战技伤害`,
      source: { kind: "weapon", weaponId: "KagurasVerity" },
      target: "damageBonus",
      targetFilter: { talentSlots: ["skill"] },
      value: { kind: "refinement_table", values: getSkillDamageBonusValues(stackCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.kaguras-verity.kagura-dance.${stackCount}-stack.star-superconduct-damage-bonus`,
      label: `神乐之真意 · ${stackCount}层神乐舞星超导伤害`,
      source: { kind: "weapon", weaponId: "KagurasVerity" },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "refinement_table", values: getStellarSuperconductDamageBonusValues(stackCount) }
    }
  ]
  if (stackCount === 3) {
    effects.push({
      activation: "active",
      exclusivity,
      id: "weapon.kaguras-verity.kagura-dance.3-stack.all-element-damage-bonus",
      label: "神乐之真意 · 三层神乐舞所有元素伤害",
      source: { kind: "weapon", weaponId: "KagurasVerity" },
      target: "damageBonus",
      targetFilter: { elements: elementalDamageElements },
      value: { kind: "refinement_table", values: KAGURAS_VERITY_THREE_STACK_ALL_ELEMENT_DAMAGE_BONUS }
    })
  }
  return effects
}

/** Typed selected Kagura Dance stack contributions of Kagura's Verity. */
export const kagurasVerityCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(createStackEffects)
