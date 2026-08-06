import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
    damagePartId: "chisel-light-mirror-projection-attack",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Alhaitham/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "chisel-light-mirror-projection-attack-attack-ratio",
        explanation: "The pinned splitScaleDmgNode maps skill[3] mirrorDmgAtk into the one Projection Attack attack term.",
        groupId: "skill",
        parameterIndex: 3,
        snapshotChecks: [
          { expectedCoefficient: 0.672, talentLevel: 1 },
          { expectedCoefficient: 1.2096, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "mirrorDmgAtk",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
        explanation: "The same pinned splitScaleDmgNode maps skill[4] mirrorDmgEm into the same one Projection Attack elemental-mastery term.",
        groupId: "skill",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 1.344, talentLevel: 1 },
          { expectedCoefficient: 2.4192, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "mirrorDmgEm",
        talentSlot: "skill"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
