import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
    damagePartId: "arataki-kesagiri-chain",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/AratakiItto/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
        explanation: "The pinned sheet binds auto[5] to akSlash and uses it as the charged-hit attack ratio.",
        groupId: "auto",
        parameterIndex: 5,
        snapshotChecks: [
          { expectedCoefficient: 0.9116, talentLevel: 1 },
          { expectedCoefficient: 1.802, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "akSlash",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.576, talentLevel: 1 },
          { expectedCoefficient: 1.0368, talentLevel: 10 }
        ],
        coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
        explanation: "The pinned sheet multiplies akSlash by burst[1] defConv before adding the resulting defense term to the charged hit.",
        groupId: "auto",
        parameterIndex: 5,
        snapshotChecks: [
          { expectedCoefficient: 0.9116, talentLevel: 1 },
          { expectedCoefficient: 1.802, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "akSlash × defConv",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "superlative-superstrength-defense-damage-increase",
        explanation: "At ascension 4+, the pinned nodeA4Bonus adds passive2[0] once as an independent defense term to every Arataki Kesagiri chain hit.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
        stat: "defense",
        symbol: "nodeA4Bonus",
        talentSlot: "passive"
      }
    ]
  },
  {
    actionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
    damagePartId: "arataki-kesagiri-final",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/AratakiItto/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
        explanation: "The pinned sheet binds auto[6] to akFinal and uses it as the final charged-hit attack ratio.",
        groupId: "auto",
        parameterIndex: 6,
        snapshotChecks: [
          { expectedCoefficient: 1.9092, talentLevel: 1 },
          { expectedCoefficient: 3.774, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "akFinal",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.576, talentLevel: 1 },
          { expectedCoefficient: 1.0368, talentLevel: 10 }
        ],
        coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
        explanation: "The pinned sheet multiplies akFinal by burst[1] defConv before adding the resulting defense term to the charged hit.",
        groupId: "auto",
        parameterIndex: 6,
        snapshotChecks: [
          { expectedCoefficient: 1.9092, talentLevel: 1 },
          { expectedCoefficient: 3.774, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "akFinal × defConv",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "superlative-superstrength-defense-damage-increase",
        explanation: "At ascension 4+, the pinned nodeA4Bonus adds passive2[0] once as an independent defense term to the Arataki Kesagiri final hit.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
        stat: "defense",
        symbol: "nodeA4Bonus",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
