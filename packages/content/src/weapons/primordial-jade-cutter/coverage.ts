import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.primordial-jade-cutter.hp-percent"],
      id: "weapon.primordial-jade-cutter.hp-percent",
      label: "磐岩结绿 · 生命值",
      source: weaponSource("PrimordialJadeCutter"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.primordial-jade-cutter.hp-sourced-flat-attack"],
      id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack",
      label: "磐岩结绿 · 基于生命值上限的平面攻击力",
      source: weaponSource("PrimordialJadeCutter"),
      status: "implemented"
    }
  ],
  equipmentId: "PrimordialJadeCutter",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
