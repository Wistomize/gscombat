import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
    damagePartId: "shadowpiercing-shot",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Sethos/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "shadowpiercing-shot-attack-scaling",
        explanation: "The pinned splitScaleDmgNode maps auto[6] shadowAtk into the Attack term of one Shadowpiercing Shot.",
        groupId: "auto",
        parameterIndex: 6,
        snapshotChecks: [
          { expectedCoefficient: 1.4, talentLevel: 1 },
          { expectedCoefficient: 2.52, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "shadowAtk",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "shadowpiercing-shot-elemental-mastery-scaling",
        explanation: "The same pinned splitScaleDmgNode maps auto[7] shadowEm into the Elemental Mastery term of the same Shadowpiercing Shot.",
        groupId: "auto",
        parameterIndex: 7,
        snapshotChecks: [
          { expectedCoefficient: 1.3456, talentLevel: 1 },
          { expectedCoefficient: 2.42208, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "shadowEm",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
