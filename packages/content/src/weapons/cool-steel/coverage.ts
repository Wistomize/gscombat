import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.cool-steel.hydro-or-cryo-aura.damage-bonus"],
      id: "weapon.cool-steel.hydro-or-cryo-aura.damage-bonus",
      label: "冷刃 · 当前目标受水元素或冰元素影响时的伤害",
      source: weaponSource("CoolSteel"),
      status: "implemented"
    }
  ],
  equipmentId: "CoolSteel",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
