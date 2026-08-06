import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.travelers-handy-sword.particle-or-orb-collection.self-healing",
      label: "旅行剑 · 拾取元素微粒或晶球后的自身治疗",
      reason: "拾取元素微粒或晶球后的自身治疗不进入当前角色核心动作伤害。",
      source: weaponSource("TravelersHandySword"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TravelersHandySword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
