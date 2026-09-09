import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
    damagePartId: "niwabi-fire-dance-fifth-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Yoimiya/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 1.37909, talentLevel: 1 },
          { expectedCoefficient: 1.61744, talentLevel: 10 }
        ],
        coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
        explanation: "The pinned Niwabi Fire-Dance normal-damage node multiplies auto[4] by skill[3] before applying Attack scaling.",
        groupId: "auto",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 1.05864, talentLevel: 1 },
          { expectedCoefficient: 1.88871, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[4] × normalDmg_",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
    damagePartId: "niwabi-fire-dance-fifth-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Yoimiya/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 1.37909, talentLevel: 1 },
          { expectedCoefficient: 1.61744, talentLevel: 10 }
        ],
        coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
        explanation: "The pinned Niwabi Fire-Dance normal-damage node multiplies auto[4] by skill[3] before applying Attack scaling.",
        groupId: "auto",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 1.05864, talentLevel: 1 },
          { expectedCoefficient: 1.88871, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[4] × normalDmg_",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction",
    damagePartId: "c6-niwabi-fire-dance-fifth-hit-blazing-arrow",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Yoimiya/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 1.37909, talentLevel: 1 },
          { expectedCoefficient: 1.61744, talentLevel: 10 }
        ],
        coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
        explanation: "The C6 expected Blazing Arrow preserves the reviewed fifth-hit auto[4] × skill[3] Attack base before its event-level 30% expectation multiplier.",
        groupId: "auto",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 1.05864, talentLevel: 1 },
          { expectedCoefficient: 1.88871, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[4] × normalDmg_ × expectedC6Arrow",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
