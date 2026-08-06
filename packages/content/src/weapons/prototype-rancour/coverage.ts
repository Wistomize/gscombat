import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prototype-rancour.shattered-stone.1-stack.attack-percent",
        "weapon.prototype-rancour.shattered-stone.1-stack.defense-percent",
        "weapon.prototype-rancour.shattered-stone.2-stack.attack-percent",
        "weapon.prototype-rancour.shattered-stone.2-stack.defense-percent",
        "weapon.prototype-rancour.shattered-stone.3-stack.attack-percent",
        "weapon.prototype-rancour.shattered-stone.3-stack.defense-percent",
        "weapon.prototype-rancour.shattered-stone.4-stack.attack-percent",
        "weapon.prototype-rancour.shattered-stone.4-stack.defense-percent"
      ],
      id: "weapon.prototype-rancour.shattered-stone.stats",
      label: "试作斩岩 · 普通攻击或重击命中后的攻击力与防御力层数",
      source: weaponSource("PrototypeRancour"),
      status: "implemented"
    }
  ],
  equipmentId: "PrototypeRancour",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
