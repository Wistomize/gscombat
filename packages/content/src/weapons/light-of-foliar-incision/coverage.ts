import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.light-of-foliar-incision.crit-rate"],
      id: "weapon.light-of-foliar-incision.crit-rate",
      label: "裁叶萃光 · 暴击率",
      source: weaponSource("LightOfFoliarIncision"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.light-of-foliar-incision.foliar-incisiveness.normal-em-additive-damage",
        "weapon.light-of-foliar-incision.foliar-incisiveness.skill-em-additive-damage"
      ],
      id: "weapon.light-of-foliar-incision.foliar-incisiveness.em-additive-damage",
      label: "裁叶萃光 · 白月枝芒普通攻击与元素战技元素精通附加伤害",
      source: weaponSource("LightOfFoliarIncision"),
      status: "implemented"
    }
  ],
  equipmentId: "LightOfFoliarIncision",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
