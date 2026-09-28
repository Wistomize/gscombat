import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  comparison: {
    refinements: [
      1
    ]
  },
  clauses: [
    {
      effectIds: [
        "weapon.kagotsurube-isshin.after-hit.attack-percent"
      ],
      id: "weapon.kagotsurube-isshin.passive",
      label: "笼钓瓶一心 · 横云断雨",
      source: {
        kind: "weapon",
        weaponId: "KagotsurubeIsshin"
      },
      status: "implemented"
    }
  ],
  equipmentId: "KagotsurubeIsshin",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
