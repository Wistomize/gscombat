import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.skyward-spine.crit-rate", "weapon.skyward-spine.vacuum-blade"],
      id: "weapon.skyward-spine.passive",
      label: "天空之脊 · 黑翼",
      source: weaponSource("SkywardSpine"),
      status: "implemented"
    },
    {
      id: "weapon.skyward-spine.attack-speed",
      label: "天空之脊 · 黑翼（普通攻击速度）",
      reason: "攻击速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
      source: weaponSource("SkywardSpine"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SkywardSpine",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
