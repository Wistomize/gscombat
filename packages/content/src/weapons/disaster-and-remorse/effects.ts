import type { CombatActionEffect } from "../../combat/types.js"

export const DISASTER_AND_REMORSE_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS = [0.3, 0.375, 0.45, 0.525, 0.6] as const

/** Typed selected No Mercy, No Healing, and Magic Secret contributions of Disaster and Remorse. */
export const disasterAndRemorseCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.disaster-and-remorse.after-skill.normal-charged-damage-bonus",
    label: "灾悔 · 施放元素战技后的无赦（普通攻击、重击伤害）",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.disaster-and-remorse.after-skill.skill-burst-damage-bonus",
    label: "灾悔 · 施放元素战技后的无愈（元素战技、元素爆发伤害）",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.disaster-and-remorse.magic-secret.extra-normal-charged-damage-bonus",
    label: "灾悔 · 魔导·秘仪下无赦的额外普通攻击、重击伤害",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.disaster-and-remorse.magic-secret.extra-skill-burst-damage-bonus",
    label: "灾悔 · 魔导·秘仪下无愈的额外元素战技、元素爆发伤害",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS }
  }
]
