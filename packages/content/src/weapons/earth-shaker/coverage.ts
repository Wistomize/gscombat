import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus"],
      id: "weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus",
      label: "撼地者 · 队伍触发火元素相关反应后（元素战技伤害）",
      source: weaponSource("EarthShaker"),
      status: "implemented"
    }
  ],
  equipmentId: "EarthShaker",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
