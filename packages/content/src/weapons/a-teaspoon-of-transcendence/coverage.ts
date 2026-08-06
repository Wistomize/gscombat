import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.a-teaspoon-of-transcendence.attack-percent"],
      id: "weapon.a-teaspoon-of-transcendence.attack-percent",
      label: "超越之匙 · 攻击力",
      source: weaponSource("ATeaspoonOfTranscendence"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.a-teaspoon-of-transcendence.charged-hit.1-stack.star-superconduct-damage-bonus",
        "weapon.a-teaspoon-of-transcendence.charged-hit.2-stack.star-superconduct-damage-bonus",
        "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus"
      ],
      id: "weapon.a-teaspoon-of-transcendence.charged-hit.star-superconduct-damage-bonus",
      label: "超越之匙 · 重击命中后的星超导反应伤害提升",
      source: weaponSource("ATeaspoonOfTranscendence"),
      status: "implemented"
    }
  ],
  equipmentId: "ATeaspoonOfTranscendence",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
