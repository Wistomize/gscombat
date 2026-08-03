import type { CombatActionEffect } from "../../combat/types.js"

export const SERPENT_SPINE_DAMAGE_BONUS_PER_STACK = [0.06, 0.07, 0.08, 0.09, 0.1] as const

const stackCounts = [1, 2, 3, 4, 5] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return SERPENT_SPINE_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "serpent-spine-wavesplitter", variant: `${stackCount}-stack` },
    id: `weapon.serpent-spine.wavesplitter.${stackCount}-stack.damage-bonus`,
    label: `螭骨剑 · ${stackCount}层破浪全伤害`,
    source: { kind: "weapon", weaponId: "SerpentSpine" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected Wavesplitter stack contributions of Serpent Spine. */
export const serpentSpineCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
