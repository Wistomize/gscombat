import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prototype-starglitter.magic-affinity.1-stack.normal-charged-damage-bonus",
        "weapon.prototype-starglitter.magic-affinity.2-stack.normal-charged-damage-bonus"
      ],
      id: "weapon.prototype-starglitter.magic-affinity.normal-charged-damage-bonus",
      label: "试作星镰 · 施放元素战技后的普通攻击与重击伤害层数",
      source: weaponSource("PrototypeStarglitter"),
      status: "implemented"
    }
  ],
  equipmentId: "PrototypeStarglitter",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
