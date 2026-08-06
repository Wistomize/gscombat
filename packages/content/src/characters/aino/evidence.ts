import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "aino.burst.precision_hydronic_cooler.water_ball",
    damagePartId: "precision-hydronic-cooler-water-ball",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Aino/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "precision-hydronic-cooler-water-ball-damage",
        explanation: "The pinned sheet maps burst[0] to one Precision Hydronic Cooler water-ball Attack term.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.20112, talentLevel: 1 },
          { expectedCoefficient: 0.362016, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "waterBallDmg",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "precision-hydronic-cooler-a4-elemental-mastery-ratio",
        explanation: "At ascension 4+, the pinned A4 burst_dmgInc adds passive2[0] as an independent Elemental Mastery term.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.5, talentLevel: 1 }],
        stat: "elementalMastery",
        symbol: "a4_burst_dmgInc",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
