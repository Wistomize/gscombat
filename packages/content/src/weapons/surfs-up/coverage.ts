import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.surfs-up.hp-percent"],
      id: "weapon.surfs-up.hp-percent",
      label: "冲浪时光 · 生命值",
      source: weaponSource("SurfsUp"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.surfs-up.scorching-summer.1-stack.normal-damage-bonus",
        "weapon.surfs-up.scorching-summer.2-stack.normal-damage-bonus",
        "weapon.surfs-up.scorching-summer.3-stack.normal-damage-bonus",
        "weapon.surfs-up.scorching-summer.4-stack.normal-damage-bonus"
      ],
      id: "weapon.surfs-up.scorching-summer.normal-damage-bonus",
      label: "冲浪时光 · 炽夏层数对应的普通攻击伤害",
      source: weaponSource("SurfsUp"),
      status: "implemented"
    }
  ],
  equipmentId: "SurfsUp",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
