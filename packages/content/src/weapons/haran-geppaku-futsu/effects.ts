import type { CombatActionEffect } from "../../combat/types.js"

export const HARAN_GEPPAKU_FUTSU_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const HARAN_GEPPAKU_FUTSU_NORMAL_DAMAGE_BONUS_PER_STACK = [0.2, 0.25, 0.3, 0.35, 0.4] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const stackCounts = [1, 2] as const

function getNormalDamageBonusValues(stackCount: number): readonly number[] {
  return HARAN_GEPPAKU_FUTSU_NORMAL_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "haran-geppaku-futsu-wavespike", variant: `${stackCount}-stack` },
    id: `weapon.haran-geppaku-futsu.wavespike.${stackCount}-stack.normal-damage-bonus`,
    label: `波乱月白经津 · ${stackCount}层波穗普通攻击伤害`,
    source: { kind: "weapon", weaponId: "HaranGeppakuFutsu" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: getNormalDamageBonusValues(stackCount) }
  }
}

/** Typed automatic elemental and selected Wavespike contributions of Haran Geppaku Futsu. */
export const haranGeppakuFutsuCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.haran-geppaku-futsu.all-element-damage-bonus",
    label: "波乱月白经津 · 所有元素伤害",
    source: { kind: "weapon", weaponId: "HaranGeppakuFutsu" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: HARAN_GEPPAKU_FUTSU_ALL_ELEMENT_DAMAGE_BONUS }
  },
  ...stackCounts.map(createStackEffect)
]
