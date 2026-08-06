import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
    damagePartId: "fiery-passion-high-plunge-with-follow-up-strike",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Varesa/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "fiery-passion-high-plunge-impact-damage",
        explanation: "The pinned fphigh node uses auto[15] dm.fp.plunging.high as the Fiery Passion High Plunge Attack term.",
        groupId: "auto",
        parameterIndex: 15,
        snapshotChecks: [
          { expectedCoefficient: 2.794334, talentLevel: 1 },
          { expectedCoefficient: 5.523683, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dm.fp.plunging.high",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "rainbow-upon-the-burning-mountain-fiery-passion-impact-bonus",
        explanation: "The pinned fpPlungingAddl pre-multiplier maps passive1[1] fpImpact_dmgInc into the same plunge impact's Attack term.",
        groupId: "passive1",
        parameterIndex: 1,
        snapshotChecks: [{ expectedCoefficient: 1.8, talentLevel: 1 }],
        stat: "attack",
        symbol: "dm.passive1.fpImpact_dmgInc",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
