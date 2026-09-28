import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"],
      id: "weapon.cinnabar-spindle.albedo-transient-blossom.defense-additive-damage",
      label: "辰砂之纺锤 · 冷却就绪的元素战技命中防御力同一命中加算（不限阿贝多）",
      source: weaponSource("CinnabarSpindle"),
      status: "implemented"
    },
    {
      id: "weapon.cinnabar-spindle.other-skill-hits.per-trigger-cooldown",
      label: "辰砂之纺锤 · 其它元素战技命中的1.5秒触发上限",
      effectIds: ["weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"],
      source: weaponSource("CinnabarSpindle"),
      status: "implemented"
    }
  ],
  equipmentId: "CinnabarSpindle",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
