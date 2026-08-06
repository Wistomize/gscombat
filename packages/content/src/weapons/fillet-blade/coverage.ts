import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.fillet-blade.cooldown-ready.expected-physical-hit"],
      id: "weapon.fillet-blade.cooldown-ready.expected-physical-hit",
      label: "吃虎鱼刀 · 当前攻击命中且冷却就绪时的决物理伤害期望",
      source: weaponSource("FilletBlade"),
      status: "implemented"
    }
  ],
  equipmentId: "FilletBlade",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
