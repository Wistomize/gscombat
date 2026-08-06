import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.makhaira-aquamarine.after-10s.self.source-em-to-flat-attack",
        "weapon.makhaira-aquamarine.after-10s.other-party.source-em-to-flat-attack"
      ],
      id: "weapon.makhaira-aquamarine.elemental-mastery-sourced-flat-attack",
      label: "玛海菈的水色 · 按持有者元素精通提供自身与其他队友平面攻击力",
      source: weaponSource("MakhairaAquamarine"),
      status: "implemented"
    }
  ],
  equipmentId: "MakhairaAquamarine",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
