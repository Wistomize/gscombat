import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-daybreak-chronicles.radiance.normal.6-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.6-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.6-stack.damage-bonus"
      ],
      id: "weapon.the-daybreak-chronicles.radiance.damage-bonus",
      label: "黎明破晓之史 · 当前攻击类别的光辉层数",
      source: {
        kind: "weapon",
        weaponId: "TheDaybreakChronicles"
      },
      status: "implemented"
    }
  ],
  equipmentId: "TheDaybreakChronicles",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
