import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.gambler.2pc.skill-damage-bonus"],
      id: "artifact.gambler.2pc.skill-damage-bonus",
      label: "赌徒 · 二件套",
      source: artifactSource("Gambler", 2),
      status: "implemented"
    },
    {
      id: "artifact.gambler.4pc.skill-cooldown-reset",
      label: "赌徒 · 四件套",
      reason: "击败敌人后清除元素战技冷却仅改变后续施放机会，需要循环、击杀和冷却状态模型。",
      source: artifactSource("Gambler", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "Gambler",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
