import type { CombatActionEffect } from "../../combat/types.js"

export const ANGELOS_HEPTADES_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const ANGELOS_HEPTADES_DAMAGE_BONUS_PER_ATTACK = [0.0001, 0.00013, 0.00016, 0.00019, 0.00022] as const
export const ANGELOS_HEPTADES_DAMAGE_BONUS_MAXIMUM = [0.26, 0.34, 0.42, 0.5, 0.58] as const
export const ANGELOS_HEPTADES_MAGIC_SECRET_OFF_FIELD_DAMAGE_BONUS_PER_ATTACK = [
  0.00005,
  0.000065,
  0.00008,
  0.000095,
  0.00011
] as const
export const ANGELOS_HEPTADES_MAGIC_SECRET_OFF_FIELD_DAMAGE_BONUS_MAXIMUM = [0.13, 0.17, 0.21, 0.25, 0.29] as const

/** Typed self attack contribution of Angelos Heptades. */
export const angelosHeptadesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.angelos-heptades.attack-percent",
    label: "尘光七谕 · 攻击力",
    source: { kind: "weapon", weaponId: "AngelosHeptades" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ANGELOS_HEPTADES_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "angelos-heptades-guiding-light-recipient-position", variant: "current-on-field" },
    id: "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus",
    label: "尘光七谕 · 创造护盾后的先导之光（当前场上角色伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "AngelosHeptades" },
    target: "sourceFinalAttackToDamageBonus",
    value: {
      kind: "source_final_attack",
      maximumValue: { kind: "refinement_table", values: ANGELOS_HEPTADES_DAMAGE_BONUS_MAXIMUM },
      multiplier: { kind: "refinement_table", values: ANGELOS_HEPTADES_DAMAGE_BONUS_PER_ATTACK }
    }
  },
  {
    activation: "active",
    condition: { kind: "hexerei_secret_rite" },
    exclusivity: { group: "angelos-heptades-guiding-light-recipient-position", variant: "magic-secret-off-field" },
    id: "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus",
    label: "尘光七谕 · 魔导·秘仪下后台魔导角色的先导之光（50%伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "AngelosHeptades" },
    target: "sourceFinalAttackToDamageBonus",
    targetFilter: { recipientHexereiRequired: true },
    value: {
      kind: "source_final_attack",
      maximumValue: { kind: "refinement_table", values: ANGELOS_HEPTADES_MAGIC_SECRET_OFF_FIELD_DAMAGE_BONUS_MAXIMUM },
      multiplier: { kind: "refinement_table", values: ANGELOS_HEPTADES_MAGIC_SECRET_OFF_FIELD_DAMAGE_BONUS_PER_ATTACK }
    }
  }
]
