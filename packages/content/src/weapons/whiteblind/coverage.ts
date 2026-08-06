import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.whiteblind.infusion-blade.1-stack.attack-percent",
        "weapon.whiteblind.infusion-blade.1-stack.defense-percent",
        "weapon.whiteblind.infusion-blade.2-stack.attack-percent",
        "weapon.whiteblind.infusion-blade.2-stack.defense-percent",
        "weapon.whiteblind.infusion-blade.3-stack.attack-percent",
        "weapon.whiteblind.infusion-blade.3-stack.defense-percent",
        "weapon.whiteblind.infusion-blade.4-stack.attack-percent",
        "weapon.whiteblind.infusion-blade.4-stack.defense-percent"
      ],
      id: "weapon.whiteblind.infusion-blade.attack-and-defense-percent",
      label: "白影剑 · 注能之锋层数对应的攻击力与防御力",
      source: weaponSource("Whiteblind"),
      status: "implemented"
    }
  ],
  equipmentId: "Whiteblind",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
