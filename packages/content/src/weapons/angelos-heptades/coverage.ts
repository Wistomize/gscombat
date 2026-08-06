import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.angelos-heptades.attack-percent"],
      id: "weapon.angelos-heptades.attack-percent",
      label: "尘光七谕 · 攻击力",
      source: weaponSource("AngelosHeptades"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"],
      id: "weapon.angelos-heptades.after-shield.source-attack-scaled-current-on-field-damage-bonus",
      label: "尘光七谕 · 创造护盾后按装备者攻击力提供的当前场上角色伤害提升",
      source: weaponSource("AngelosHeptades"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"],
      id: "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus",
      label: "尘光七谕 · 魔导·秘仪下后台角色的先导之光半额伤害提升",
      source: weaponSource("AngelosHeptades"),
      status: "implemented"
    },
    {
      id: "weapon.angelos-heptades.after-shield.energy-restoration",
      label: "尘光七谕 · 创造护盾后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("AngelosHeptades"),
      status: "not_applicable"
    }
  ],
  equipmentId: "AngelosHeptades",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
