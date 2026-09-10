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
      label: "海渊终曲 · 清除生命之契后攻击力达到上限",
      source: weaponSource("FinaleOfTheDeep"),
      status: "implemented"
    },
    {
      id: "weapon.finale-of-the-deep.bond-of-life-cleared.uncapped-or-partial.flat-attack",
      label: "海渊终曲 · 清除未达上限或部分生命之契后的攻击力",
      reason: "当前核心动作固定假设治疗量充足，并完整清除本次按生命值上限25%生成的生命之契。",
      source: weaponSource("FinaleOfTheDeep"),
      status: "not_applicable"
    }
  ],
  equipmentId: "FinaleOfTheDeep",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
