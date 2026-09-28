import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const FRACTURED_HALO_AFTER_SKILL_OR_BURST_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const FRACTURED_HALO_AFTER_SHIELD_PARTY_LUNAR_CHARGED_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed selected self attack contribution of Fractured Halo after a skill or burst. */
export const fracturedHaloCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人可提前施放战技"),
    id: "weapon.fractured-halo.after-skill-or-burst.self-attack-percent",
    label: "支离轮光 · 施放元素战技或元素爆发后的攻击力",
    source: { kind: "weapon", weaponId: "FracturedHalo" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: FRACTURED_HALO_AFTER_SKILL_OR_BURST_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "shield", provider: "source", recipient: "source" }, "本人创造护盾后授予队伍月感电增伤"),
    id: "weapon.fractured-halo.after-shield.party-lunar-charged.reaction-damage-bonus",
    label: "支离轮光 · 流电圣敕生效时队伍角色的月感电伤害",
    source: { holder: "party_member", kind: "weapon", weaponId: "FracturedHalo", resolveOneMatchingPartySource: true },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_charged"] },
    value: { kind: "refinement_table", values: FRACTURED_HALO_AFTER_SHIELD_PARTY_LUNAR_CHARGED_DAMAGE_BONUS }
  }
]
