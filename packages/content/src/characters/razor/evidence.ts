import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "razor.burst.lightning_fang.wolf_spirit.fourth_hit",
    damagePartId: "lightning-fang-wolf-spirit-fourth-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Razor/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierParameterId: "lightning-fang-wolf-spirit-damage-multiplier",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.24, talentLevel: 1 },
          { expectedCoefficient: 0.432, talentLevel: 10 }
        ],
        coefficientParameterId: "normal-attack-fourth-hit-damage",
        explanation: "The pinned companionDmg4 node multiplies auto[3] normal.hitArr[3] by burst[1] companionDmg and Attack.",
        groupId: "auto",
        parameterIndex: 3,
        snapshotChecks: [
          { expectedCoefficient: 1.36048, talentLevel: 1 },
          { expectedCoefficient: 2.42722, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dm.normal.hitArr[3] × dm.burst.companionDmg",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
