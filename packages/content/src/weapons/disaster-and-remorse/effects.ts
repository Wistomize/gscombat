import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const DISASTER_AND_REMORSE_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS = [0.3, 0.375, 0.45, 0.525, 0.6] as const

/** Typed selected No Mercy, No Healing, and Magic Secret contributions of Disaster and Remorse. */
export const disasterAndRemorseCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台战技准备，退场不保留", true),
    id: "weapon.disaster-and-remorse.after-skill.normal-charged-damage-bonus",
    label: "灾悔 · 施放元素战技后的无赦（普通攻击、重击伤害）",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台战技准备，退场不保留", true),
    id: "weapon.disaster-and-remorse.after-skill.skill-burst-damage-bonus",
    label: "灾悔 · 施放元素战技后的无愈（元素战技、元素爆发伤害）",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台战技准备，退场不保留", true), { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceHomework: true }, explanation: "本人须有魔导资格" }] },
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.disaster-and-remorse.magic-secret.extra-normal-charged-damage-bonus",
    label: "灾悔 · 魔导·秘仪下无赦的额外普通攻击、重击伤害",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人前台战技准备，退场不保留", true), { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceHomework: true }, explanation: "本人须有魔导资格" }] },
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.disaster-and-remorse.magic-secret.extra-skill-burst-damage-bonus",
    label: "灾悔 · 魔导·秘仪下无愈的额外元素战技、元素爆发伤害",
    source: { kind: "weapon", weaponId: "DisasterAndRemorse" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "refinement_table", values: DISASTER_AND_REMORSE_MAGIC_DAMAGE_BONUS }
  }
]
