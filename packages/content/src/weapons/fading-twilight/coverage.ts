import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.fading-twilight.evening-glow.damage-bonus",
        "weapon.fading-twilight.azure-glow.damage-bonus",
        "weapon.fading-twilight.dawn-glow.damage-bonus"
      ],
      id: "weapon.fading-twilight.glow.damage-bonus",
      label: "落霞 · 当前夕暮、流霞或朝晖状态的伤害",
      source: weaponSource("FadingTwilight"),
      status: "implemented"
    }
  ],
  equipmentId: "FadingTwilight",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
