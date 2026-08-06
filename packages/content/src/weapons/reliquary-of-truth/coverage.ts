import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.reliquary-of-truth.crit-rate",
        "weapon.reliquary-of-truth.after-skill.elemental-mastery",
        "weapon.reliquary-of-truth.after-lunar-bloom.crit-damage",
        "weapon.reliquary-of-truth.both-states.elemental-mastery",
        "weapon.reliquary-of-truth.both-states.crit-damage"
      ],
      id: "weapon.reliquary-of-truth.passive",
      label: "真语秘匣 · 暴击率、元素战技与月绽放状态的元素精通和暴击伤害",
      source: weaponSource("ReliquaryOfTruth"),
      status: "implemented"
    }
  ],
  equipmentId: "ReliquaryOfTruth",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
