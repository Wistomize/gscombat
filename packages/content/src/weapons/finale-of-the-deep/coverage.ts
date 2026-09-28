import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.finale-of-the-deep.after-skill.attack-percent"],
      id: "weapon.finale-of-the-deep.after-skill.attack-percent",
      label: "海渊终曲 · 施放元素战技后的攻击力",
      source: weaponSource("FinaleOfTheDeep"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"],
      id: "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack",
      label: "海渊终曲 · 有适用治疗并施放战技后，按最终生命25%完整清契量连续换算固定攻击并封顶（含未达上限）",
      source: weaponSource("FinaleOfTheDeep"),
      status: "implemented"
    },
    {
      id: "weapon.finale-of-the-deep.bond-of-life-cleared.uncapped-or-partial.flat-attack",
      label: "海渊终曲 · 手动指定部分清契量的攻击力",
      reason: "有适用治疗时按充分治疗、完整清除本次25%生命之契计算，未达攻击上限也已连续换算；不提供部分清契量或实际治疗过程模拟。",
      source: weaponSource("FinaleOfTheDeep"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FinaleOfTheDeep",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
