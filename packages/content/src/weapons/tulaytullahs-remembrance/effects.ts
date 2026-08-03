import type { CombatActionEffect } from "../../combat/types.js"

export const TULAYTULLAHS_REMEMBRANCE_NORMAL_DAMAGE_BONUS_PER_UNIT = [
  0.048, 0.06, 0.072, 0.084, 0.096
] as const

const normalDamageUnitCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

function getNormalDamageBonusValues(unitCount: number): readonly number[] {
  return TULAYTULLAHS_REMEMBRANCE_NORMAL_DAMAGE_BONUS_PER_UNIT.map((value) => value * unitCount)
}

function createNormalDamageUnitEffect(
  unitCount: (typeof normalDamageUnitCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "tulaytullahs-remembrance-aeons-flow", variant: unitCount + "-unit" },
    id: "weapon.tulaytullahs-remembrance.aeons-flow." + unitCount + "-unit.normal-damage-bonus",
    label: "图莱杜拉的回忆 · 流转的微风" + unitCount + "次普通攻击伤害",
    source: { kind: "weapon", weaponId: "TulaytullahsRemembrance" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: getNormalDamageBonusValues(unitCount) }
  }
}

/** Typed selected Aeons Flow contributions of Tulaytullah's Remembrance. */
export const tulaytullahsRemembranceCombatActionEffects: readonly CombatActionEffect[] = normalDamageUnitCounts.map(
  createNormalDamageUnitEffect
)
