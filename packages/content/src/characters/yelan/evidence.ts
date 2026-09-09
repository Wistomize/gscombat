import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
    damagePartId: "c6-strategic-reserve-breakthrough-barb",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Yelan/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierScenarioParameterId: "c6-strategic-reserve-damage-percent",
        coefficientParameterId: "breakthrough-barb-damage",
        explanation: "Each Strategic Reserve arrow uses auto[6] as its Max HP term and the bounded C6 scenario multiplier applies the documented 156% ratio.",
        groupId: "auto",
        parameterIndex: 6,
        snapshotChecks: [
          { expectedCoefficient: 0.11576, talentLevel: 1 },
          { expectedCoefficient: 0.208368, talentLevel: 10 }
        ],
        stat: "hp",
        symbol: "breakthroughBarb.dmg × c6StrategicReserve",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
