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
      reason: "该分支仍依赖实际清除的生命之契数值，并按数值、精炼系数与每效果上限计算平面攻击力。",
      requiredCapability: "bond_of_life_cleared_scalar_and_hp_sourced_capped_flat_attack",
      source: weaponSource("FinaleOfTheDeep"),
      status: "unsupported"
    }
  ],
  equipmentId: "FinaleOfTheDeep",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
