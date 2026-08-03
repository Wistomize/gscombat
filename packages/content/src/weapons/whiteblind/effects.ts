import type { CombatActionEffect } from "../../combat/types.js"

export const WHITEBLIND_ATTACK_AND_DEFENSE_PERCENT_PER_STACK = [0.06, 0.075, 0.09, 0.105, 0.12] as const

const stackCounts = [1, 2, 3, 4] as const

function getStackValues(stackCount: number): readonly number[] {
  return WHITEBLIND_ATTACK_AND_DEFENSE_PERCENT_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "whiteblind-infusion-blade", variant: stackCount + "-stack" }
  const values = getStackValues(stackCount)
  return [
    {
      activation: "active",
      exclusivity,
      id: "weapon.whiteblind.infusion-blade." + stackCount + "-stack.attack-percent",
      label: "白影剑 · 注能之锋" + stackCount + "层攻击力",
      source: { kind: "weapon", weaponId: "Whiteblind" },
      target: "attackPercent",
      value: { kind: "refinement_table", values }
    },
    {
      activation: "active",
      exclusivity,
      id: "weapon.whiteblind.infusion-blade." + stackCount + "-stack.defense-percent",
      label: "白影剑 · 注能之锋" + stackCount + "层防御力",
      source: { kind: "weapon", weaponId: "Whiteblind" },
      target: "defensePercent",
      value: { kind: "refinement_table", values }
    }
  ]
}

/** Typed selected Infusion Blade stack contributions of Whiteblind. */
export const whiteblindCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(createStackEffects)
