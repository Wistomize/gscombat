import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.the-alley-flash.damage-bonus-ready"],
      id: "weapon.the-alley-flash.damage-bonus-ready",
      label: "暗巷闪光 · 当前未处于受伤后失效窗口",
      source: weaponSource("TheAlleyFlash"),
      status: "implemented"
    }
  ],
  equipmentId: "TheAlleyFlash",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
