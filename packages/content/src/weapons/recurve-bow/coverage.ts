import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.recurve-bow.enemy-defeat.self-healing",
      label: "反曲弓 · 击败敌人后的自身治疗",
      reason: "击败敌人后的自身治疗不进入当前角色核心动作伤害。",
      source: weaponSource("RecurveBow"),
      status: "not_applicable"
    }
  ],
  equipmentId: "RecurveBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
