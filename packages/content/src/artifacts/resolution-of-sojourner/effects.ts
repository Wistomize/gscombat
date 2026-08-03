import type { CombatActionEffect } from "../../combat/types.js"

export const RESOLUTION_OF_SOJOURNER_ATTACK_PERCENT = 0.18
export const RESOLUTION_OF_SOJOURNER_CHARGED_CRIT_RATE = 0.3

/** Typed automatic contributions of Resolution of Sojourner to maintained core actions. */
export const resolutionOfSojournerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.resolution-of-sojourner.2pc.attack-percent",
    label: "行者之心 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ResolutionOfSojourner" },
    target: "attackPercent",
    value: { kind: "fixed", value: RESOLUTION_OF_SOJOURNER_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    id: "artifact.resolution-of-sojourner.4pc.charged-crit-rate",
    label: "行者之心 · 四件套",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ResolutionOfSojourner" },
    target: "critRate",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "fixed", value: RESOLUTION_OF_SOJOURNER_CHARGED_CRIT_RATE }
  }
]
