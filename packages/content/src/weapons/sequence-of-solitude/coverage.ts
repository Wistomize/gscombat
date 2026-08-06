import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.sequence-of-solitude.hp-physical-hit"],
      id: "weapon.sequence-of-solitude.hp-physical-hit",
      label: "冷寂迸音 · 冷却就绪的基于生命值上限的物理伤害",
      source: weaponSource("SequenceOfSolitude"),
      status: "implemented"
    }
  ],
  equipmentId: "SequenceOfSolitude",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
