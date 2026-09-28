import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-alley-flash.damage-bonus-ready",
        "weapon.the-alley-flash.damage-bonus-ready.disabled"
      ],
      id: "weapon.the-alley-flash.damage-bonus-ready",
      label: "暗巷闪光 · 当前未处于受伤后失效窗口",
      source: {
        kind: "weapon",
        weaponId: "TheAlleyFlash"
      },
      status: "implemented"
    }
  ],
  equipmentId: "TheAlleyFlash",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
