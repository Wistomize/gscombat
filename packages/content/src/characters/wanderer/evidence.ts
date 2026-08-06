import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
    damagePartId: "windfavored-normal-attack-first-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Wanderer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierParameterId: "windfavored-normal-attack-damage-multiplier",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 1.329825, talentLevel: 1 },
          { expectedCoefficient: 1.5372, talentLevel: 10 }
        ],
        coefficientParameterId: "normal-attack-first-hit-damage",
        explanation: "The pinned Windfavored normal-damage node multiplies auto[0] by skill[1] before applying Attack scaling.",
        groupId: "auto",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.68714, talentLevel: 1 },
          { expectedCoefficient: 1.3583, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[0] × windfavoredNormalDmg",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
