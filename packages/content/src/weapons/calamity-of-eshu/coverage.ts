import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.calamity-of-eshu.shielded.normal-charged-damage-bonus",
        "weapon.calamity-of-eshu.shielded.normal-charged-crit-rate"
      ],
      id: "weapon.calamity-of-eshu.shielded.normal-charged",
      label: "厄水之祸 · 当前角色处于护盾庇护下（普通攻击与重击）",
      source: weaponSource("CalamityOfEshu"),
      status: "implemented"
    }
  ],
  equipmentId: "CalamityOfEshu",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
