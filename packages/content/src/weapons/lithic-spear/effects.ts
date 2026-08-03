import type { CombatActionEffect } from "../../combat/types.js"

export const LITHIC_SPEAR_ATTACK_PERCENT_PER_LIYUE_CHARACTER = [0.07, 0.08, 0.09, 0.1, 0.11] as const
export const LITHIC_SPEAR_CRIT_RATE_PER_LIYUE_CHARACTER = [0.03, 0.04, 0.05, 0.06, 0.07] as const

const liyueCharacterCounts = [1, 2, 3, 4] as const

function getValues(values: readonly number[], count: number): readonly number[] {
  return values.map((value) => value * count)
}

function createLiyueCharacterEffects(count: (typeof liyueCharacterCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "lithic-spear-liyue-party", variant: `${count}-character` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.lithic-spear.liyue-party.${count}-character.attack-percent`,
      label: `千岩长枪 · ${count}名璃月角色的攻击力`,
      source: { kind: "weapon", weaponId: "LithicSpear" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getValues(LITHIC_SPEAR_ATTACK_PERCENT_PER_LIYUE_CHARACTER, count) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.lithic-spear.liyue-party.${count}-character.crit-rate`,
      label: `千岩长枪 · ${count}名璃月角色的暴击率`,
      source: { kind: "weapon", weaponId: "LithicSpear" },
      target: "critRate",
      value: { kind: "refinement_table", values: getValues(LITHIC_SPEAR_CRIT_RATE_PER_LIYUE_CHARACTER, count) }
    }
  ]
}

/** Typed selected Liyue-party-count contributions of Lithic Spear. */
export const lithicSpearCombatActionEffects: readonly CombatActionEffect[] = liyueCharacterCounts.flatMap(
  createLiyueCharacterEffects
)
