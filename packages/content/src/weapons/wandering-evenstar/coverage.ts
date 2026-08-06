import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.wandering-evenstar.after-10s.self.source-em-to-flat-attack",
        "weapon.wandering-evenstar.after-10s.other-party.source-em-to-flat-attack"
      ],
      id: "weapon.wandering-evenstar.elemental-mastery-sourced-flat-attack",
      label: "流浪的晚星 · 元素精通转平面攻击力与其他队友分支",
      source: weaponSource("WanderingEvenstar"),
      status: "implemented"
    }
  ],
  equipmentId: "WanderingEvenstar",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
