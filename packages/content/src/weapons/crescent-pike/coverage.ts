import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.crescent-pike.after-particle.additional-physical-damage"],
      id: "weapon.crescent-pike.after-particle.additional-physical-damage",
      label: "流月针 · 获得元素微粒或晶球后的普通攻击、重击额外物理伤害",
      source: weaponSource("CrescentPike"),
      status: "implemented"
    }
  ],
  equipmentId: "CrescentPike",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
