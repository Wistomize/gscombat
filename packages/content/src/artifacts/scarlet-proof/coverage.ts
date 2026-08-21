import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Scarlet Proof. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.scarlet-proof.2pc.attack-percent"],
      id: "artifact.scarlet-proof.2pc.attack-percent",
      label: "血红之证 · 二件套",
      source: artifactSource("ScarletProof", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.scarlet-proof.4pc.after-stellar-swirl.crit-rate",
        "artifact.scarlet-proof.4pc.after-stellar-swirl.reaction-damage-bonus"
      ],
      id: "artifact.scarlet-proof.4pc.after-stellar-swirl",
      label: "血红之证 · 四件套（触发星扩散后的暴击率与反应伤害）",
      source: artifactSource("ScarletProof", 4),
      status: "implemented"
    }
  ],
  equipmentId: "ScarletProof",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
