import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.fleuve-cendre-ferryman.skill-crit-rate"],
      id: "weapon.fleuve-cendre-ferryman.skill-crit-rate",
      label: "灰河渡手 · 元素战技暴击率",
      source: weaponSource("FleuveCendreFerryman"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.fleuve-cendre-ferryman.after-skill.energy-recharge"],
      id: "weapon.fleuve-cendre-ferryman.after-skill.energy-recharge",
      label: "灰河渡手 · 施放元素战技后",
      source: weaponSource("FleuveCendreFerryman"),
      status: "implemented"
    }
  ],
  equipmentId: "FleuveCendreFerryman",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
