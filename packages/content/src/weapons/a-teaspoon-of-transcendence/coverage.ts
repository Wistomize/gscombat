import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.a-teaspoon-of-transcendence.attack-percent"
      ],
      id: "weapon.a-teaspoon-of-transcendence.attack-percent",
      label: "超越之匙 · 攻击力",
      source: {
        kind: "weapon",
        weaponId: "ATeaspoonOfTranscendence"
      },
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus"
      ],
      id: "weapon.a-teaspoon-of-transcendence.charged-hit.star-superconduct-damage-bonus",
      label: "超越之匙 · 重击命中后的星超导反应伤害提升",
      source: {
        kind: "weapon",
        weaponId: "ATeaspoonOfTranscendence"
      },
      status: "implemented"
    }
  ],
  equipmentId: "ATeaspoonOfTranscendence",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
