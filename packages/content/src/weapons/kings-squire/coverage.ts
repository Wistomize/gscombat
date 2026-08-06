import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.kings-squire.after-skill-or-burst.elemental-mastery"],
      id: "weapon.kings-squire.after-skill-or-burst.elemental-mastery",
      label: "王下近侍 · 施放元素战技或元素爆发后",
      source: weaponSource("KingsSquire"),
      status: "implemented"
    },
    {
      id: "weapon.kings-squire.leaf-expiration-damage",
      label: "王下近侍 · 伽陀般度叶消失后的攻击力伤害",
      reason: "延迟伤害发生在效果结束或切换角色后，不属于当前选定核心动作的一次命中。",
      source: weaponSource("KingsSquire"),
      status: "not_applicable"
    }
  ],
  equipmentId: "KingsSquire",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
