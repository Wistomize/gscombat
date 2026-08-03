import type { CombatActionEffect } from "../../combat/types.js"

export const SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected normal-hit and Skill-or-Burst-hit contributions of Solar Pearl. */
export const solarPearlCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus",
    label: "匣里日月 · 普通攻击命中后（元素战技与元素爆发伤害）",
    source: { kind: "weapon", weaponId: "SolarPearl" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "active",
    id: "weapon.solar-pearl.after-skill-or-burst-hit.normal-damage-bonus",
    label: "匣里日月 · 元素战技或元素爆发命中后（普通攻击伤害）",
    source: { kind: "weapon", weaponId: "SolarPearl" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: SOLAR_PEARL_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
