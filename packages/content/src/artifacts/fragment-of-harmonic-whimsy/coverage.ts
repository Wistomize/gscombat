import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.fragment-of-harmonic-whimsy.2pc.attack-percent"],
      id: "artifact.fragment-of-harmonic-whimsy.2pc.attack-percent",
      label: "谐律异想断章 · 二件套",
      source: artifactSource("FragmentOfHarmonicWhimsy", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.1-stack.damage-bonus",
        "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.2-stack.damage-bonus",
        "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.3-stack.damage-bonus"
      ],
      id: "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-stacks",
      label: "谐律异想断章 · 四件套（生命之契增减后的全伤层数）",
      source: artifactSource("FragmentOfHarmonicWhimsy", 4),
      status: "implemented"
    }
  ],
  equipmentId: "FragmentOfHarmonicWhimsy",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
