import type { CombatActionEffect } from "../../combat/types.js"

export const LITHIC_BLADE_ATTACK_PERCENT_PER_LIYUE_CHARACTER = [0.07, 0.08, 0.09, 0.1, 0.11] as const
export const LITHIC_BLADE_CRIT_RATE_PER_LIYUE_CHARACTER = [0.03, 0.04, 0.05, 0.06, 0.07] as const

const liyueCharacterCounts = [1, 2, 3, 4] as const

function getValues(values: readonly number[], count: number): readonly number[] {
  return values.map((value) => value * count)
}

function createLiyueCharacterEffects(count: (typeof liyueCharacterCounts)[number]): readonly CombatActionEffect[] {
  const condition = {
    kind: "team_region_count" as const,
    ...(count === 4 ? {} : { maximum: count }),
    minimum: count,
    region: "liyue"
  }
  const exclusivity = { group: "lithic-blade-liyue-party", variant: `${count}-character` }
  return [
    {
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.lithic-blade.liyue-party.${count}-character.attack-percent`,
      label: `千岩古剑 · ${count}名璃月角色的攻击力`,
      source: { kind: "weapon", weaponId: "LithicBlade" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getValues(LITHIC_BLADE_ATTACK_PERCENT_PER_LIYUE_CHARACTER, count) }
    },
    {
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.lithic-blade.liyue-party.${count}-character.crit-rate`,
      label: `千岩古剑 · ${count}名璃月角色的暴击率`,
      source: { kind: "weapon", weaponId: "LithicBlade" },
      target: "critRate",
      value: { kind: "refinement_table", values: getValues(LITHIC_BLADE_CRIT_RATE_PER_LIYUE_CHARACTER, count) }
    }
  ]
}

/** Typed selected Liyue-party-count contributions of Lithic Blade. */
export const lithicBladeCombatActionEffects: readonly CombatActionEffect[] = liyueCharacterCounts.flatMap(
  createLiyueCharacterEffects
)
