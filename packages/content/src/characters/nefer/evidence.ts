import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "nefer.skill.senet_strategy.dance_of_a_thousand_nights.initial_hit",
    damagePartId: "dance-of-a-thousand-nights-initial-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "dance-of-a-thousand-nights-attack",
        explanation: "The pinned sheet binds skill[0] to skillDmgAtk and splitScaleDmgNode combines it with the elemental-mastery term in the same initial skill hit.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.76384, talentLevel: 1 },
          { expectedCoefficient: 1.374912, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "skillDmgAtk",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "dance-of-a-thousand-nights-elemental-mastery",
        explanation: "The pinned sheet binds skill[1] to skillDmgEleMas and splitScaleDmgNode combines it with the attack term in the same initial skill hit.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 1.52768, talentLevel: 1 },
          { expectedCoefficient: 2.749824, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "skillDmgEleMas",
        talentSlot: "skill"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-second-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "phantom-performance-second-hit-attack",
        explanation: "The pinned Phantom Performance node maps skill[4] nefer2Atk into its direct Attack term.",
        groupId: "skill",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 0.2464, talentLevel: 1 },
          { expectedCoefficient: 0.44352, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "nefer2Atk",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "phantom-performance-second-hit-elemental-mastery",
        explanation: "The same pinned Phantom Performance node maps skill[5] nefer2EleMas into its direct Elemental Mastery term.",
        groupId: "skill",
        parameterIndex: 5,
        snapshotChecks: [
          { expectedCoefficient: 0.4928, talentLevel: 1 },
          { expectedCoefficient: 0.88704, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "nefer2EleMas",
        talentSlot: "skill"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-self-second-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "phantom-performance-self-second-hit-attack",
        explanation: "The pinned Phantom Performance node maps skill[6] nefer3Atk into its second self-hit Attack term.",
        groupId: "skill",
        parameterIndex: 6,
        snapshotChecks: [
          { expectedCoefficient: 0.32032, talentLevel: 1 },
          { expectedCoefficient: 0.576576, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "nefer3Atk",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "phantom-performance-self-second-hit-elemental-mastery",
        explanation: "The same pinned Phantom Performance node maps skill[7] nefer3EleMas into its second self-hit Elemental Mastery term.",
        groupId: "skill",
        parameterIndex: 7,
        snapshotChecks: [
          { expectedCoefficient: 0.64064, talentLevel: 1 },
          { expectedCoefficient: 1.153152, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "nefer3EleMas",
        talentSlot: "skill"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
