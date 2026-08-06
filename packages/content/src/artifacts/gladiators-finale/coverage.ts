import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.gladiators-finale.2pc.attack-percent"],
      id: "artifact.gladiators-finale.2pc.attack-percent",
      label: "角斗士的终幕礼 · 二件套",
      source: artifactSource("GladiatorsFinale", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus"],
      id: "artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus",
      label: "角斗士的终幕礼 · 四件套（单手剑、双手剑或长柄武器角色的普通攻击）",
      source: artifactSource("GladiatorsFinale", 4),
      status: "implemented"
    }
  ],
  equipmentId: "GladiatorsFinale",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
