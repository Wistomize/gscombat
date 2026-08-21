import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Clash of Kings. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.clash-of-kings.after-skill.attack-percent",
        "weapon.clash-of-kings.after-skill.elemental-mastery"
      ],
      id: "weapon.clash-of-kings.after-skill.chess-law",
      label: "群王局戏 · 棋中法度攻击力与元素精通",
      source: weaponSource("ClashOfKings"),
      status: "implemented"
    },
    {
      id: "weapon.clash-of-kings.charged-hit-duration-extension",
      label: "群王局戏 · 重击命中延长棋中法度",
      reason: "延长持续时间不改变增益生效时的一次动作数值。",
      source: weaponSource("ClashOfKings"),
      status: "not_applicable"
    }
  ],
  equipmentId: "ClashOfKings",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
