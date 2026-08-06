import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.nocturnes-curtain-call.hp-percent"],
      id: "weapon.nocturnes-curtain-call.hp-percent",
      label: "帷间夜曲 · 生命值",
      source: weaponSource("NocturnesCurtainCall"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent"],
      id: "weapon.nocturnes-curtain-call.after-lunar-reaction.extra-hp-percent",
      label: "帷间夜曲 · 丰饶海的神酒状态下的额外生命值",
      source: weaponSource("NocturnesCurtainCall"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage"],
      id: "weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage",
      label: "帷间夜曲 · 丰饶海的神酒状态下的月曜暴击伤害",
      source: weaponSource("NocturnesCurtainCall"),
      status: "implemented"
    },
    {
      id: "weapon.nocturnes-curtain-call.after-lunar-reaction.energy-restoration",
      label: "帷间夜曲 · 触发月曜反应后的元素能量恢复",
      reason: "元素能量恢复只影响后续循环，当前模型只结算一个已选核心动作。",
      source: weaponSource("NocturnesCurtainCall"),
      status: "not_applicable"
    }
  ],
  equipmentId: "NocturnesCurtainCall",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
