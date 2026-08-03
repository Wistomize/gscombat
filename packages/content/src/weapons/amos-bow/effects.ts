import type { CombatActionEffect } from "../../combat/types.js"

export const AMOS_BOW_NORMAL_CHARGED_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const AMOS_BOW_PROJECTILE_FLIGHT_TIME_DAMAGE_BONUS_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const projectileFlightStackCounts = [1, 2, 3, 4, 5] as const

function getProjectileFlightStackValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => Number((value * stackCount).toFixed(12)))
}

function createProjectileFlightStackEffect(
  stackCount: (typeof projectileFlightStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "amos-bow-projectile-flight-time", variant: `${stackCount}-stack` },
    id: `weapon.amos-bow.projectile-flight-time.${stackCount}-stack.damage-bonus`,
    label: `阿莫斯之弓 · 本次箭矢命中前已累计${stackCount}层伤害提升（每0.1秒，最多5层）`,
    source: { holder: "primary", kind: "weapon", weaponId: "AmosBow" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      kind: "refinement_table",
      values: getProjectileFlightStackValues(AMOS_BOW_PROJECTILE_FLIGHT_TIME_DAMAGE_BONUS_PER_STACK, stackCount)
    }
  }
}

/** Typed self normal, charged, and selected projectile-flight contributions of Amos' Bow. */
export const amosBowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.amos-bow.normal-charged-damage-bonus",
    label: "阿莫斯之弓 · 普通攻击与重击伤害",
    source: { kind: "weapon", weaponId: "AmosBow" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: AMOS_BOW_NORMAL_CHARGED_DAMAGE_BONUS }
  },
  ...projectileFlightStackCounts.map(createProjectileFlightStackEffect)
]
