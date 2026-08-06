import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.prototype-archaic.physical-hit"],
      id: "weapon.prototype-archaic.physical-hit",
      label: "试作古华 · 普通攻击或重击命中的额外物理伤害",
      source: weaponSource("PrototypeArchaic"),
      status: "implemented"
    }
  ],
  equipmentId: "PrototypeArchaic",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
