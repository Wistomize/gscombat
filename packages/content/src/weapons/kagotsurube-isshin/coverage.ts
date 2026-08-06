import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.kagotsurube-isshin.physical-hit",
        "weapon.kagotsurube-isshin.after-hit.attack-percent"
      ],
      id: "weapon.kagotsurube-isshin.passive",
      label: "笼钓瓶一心 · 横云断雨",
      source: weaponSource("KagotsurubeIsshin"),
      status: "implemented"
    }
  ],
  equipmentId: "KagotsurubeIsshin",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
