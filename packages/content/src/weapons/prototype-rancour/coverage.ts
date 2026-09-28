import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prototype-rancour.shattered-stone.4-stack.attack-percent",
        "weapon.prototype-rancour.shattered-stone.4-stack.defense-percent"
      ],
      id: "weapon.prototype-rancour.shattered-stone.stats",
      label: "试作斩岩 · 普通攻击或重击命中后的攻击力与防御力层数",
      source: {
        kind: "weapon",
        weaponId: "PrototypeRancour"
      },
      status: "implemented"
    }
  ],
  equipmentId: "PrototypeRancour",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
