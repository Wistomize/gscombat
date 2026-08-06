import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "dehya.burst.flame_manes_fist",
    damagePartId: "flame-manes-fist",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Dehya/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "flame-manes-fist-attack",
        explanation: "The pinned sheet binds burst[0] to fistDmgAtk and passes it as the first Flame-Mane's Fist term.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.987, talentLevel: 1 },
          { expectedCoefficient: 1.7766, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "fistDmgAtk",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "flame-manes-fist-hp",
        explanation: "The pinned sheet binds burst[1] to fistDmgHp and passes it as the second Flame-Mane's Fist term.",
        groupId: "burst",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.01692, talentLevel: 1 },
          { expectedCoefficient: 0.030456, talentLevel: 10 }
        ],
        stat: "hp",
        symbol: "fistDmgHp",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
