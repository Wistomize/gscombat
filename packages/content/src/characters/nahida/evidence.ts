import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/**
 * Stores the human-reviewed mappings required by ADR 0010.
 *
 * Numeric checks remain beside the combat action; this registry records why each coefficient belongs to a stat term.
 */
const nahidaTriKarmaPurificationEvidence = {
  source: {
    sourcePath: "libs/gi/sheets/src/Characters/Nahida/index.tsx",
    upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
    upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
  },
  terms: [
    {
      coefficientParameterId: "tri-karma-purification-attack-ratio",
      explanation: "The pinned sheet binds skill[2] to karmaAtkDmg and uses it as the first split-scale Tri-Karma Purification term.",
      groupId: "skill",
      parameterIndex: 2,
      snapshotChecks: [
        { expectedCoefficient: 1.032, talentLevel: 1 },
        { expectedCoefficient: 1.8576, talentLevel: 10 }
      ],
      stat: "attack",
      symbol: "karmaAtkDmg",
      talentSlot: "skill"
    },
    {
      coefficientParameterId: "tri-karma-purification-elemental-mastery-ratio",
      explanation: "The pinned sheet binds skill[3] to karmaEleMasDmg and splitScaleDmgNode combines it with karmaAtkDmg in the same Tri-Karma Purification hit.",
      groupId: "skill",
      parameterIndex: 3,
      snapshotChecks: [
        { expectedCoefficient: 2.064, talentLevel: 1 },
        { expectedCoefficient: 3.7152, talentLevel: 10 }
      ],
      stat: "elementalMastery",
      symbol: "karmaEleMasDmg",
      talentSlot: "skill"
    }
  ]
} as const satisfies Omit<ReviewedMultiScalingEvidenceRecord, "actionId" | "damagePartId">

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
    damagePartId: "tri-karma-purification",
    ...nahidaTriKarmaPurificationEvidence
  },
  {
    actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
    damagePartId: "tri-karma-purification",
    ...nahidaTriKarmaPurificationEvidence
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
