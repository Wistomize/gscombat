import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.dodoco-tales.after-normal-hit.charged-damage-bonus"],
      id: "weapon.dodoco-tales.after-normal-hit.charged-damage-bonus",
      label: "嘟嘟可故事集 · 普通攻击命中后（重击伤害）",
      source: weaponSource("DodocoTales"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.dodoco-tales.after-charged-hit.attack-percent"],
      id: "weapon.dodoco-tales.after-charged-hit.attack-percent",
      label: "嘟嘟可故事集 · 重击命中后（攻击力）",
      source: weaponSource("DodocoTales"),
      status: "implemented"
    }
  ],
  equipmentId: "DodocoTales",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
