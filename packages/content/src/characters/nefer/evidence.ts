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
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-shade-first-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "phantom-performance-shade-first-hit-elemental-mastery",
        explanation: "The pinned sheet maps skill[8] to the first shade hit before the Veil multiplier.",
        groupId: "skill",
        parameterIndex: 8,
        snapshotChecks: [
          { expectedCoefficient: 0.96, talentLevel: 1 },
          { expectedCoefficient: 1.728, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "shade1EleMas",
        talentSlot: "skill"
      },
      {
        explanation: "Nefer C1 adds 60% Elemental Mastery to this same Lunar-Bloom base hit before Veil.",
        fixedCoefficient: 0.6,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "c1LunarBloomEleMas"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-shade-second-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "phantom-performance-shade-second-hit-elemental-mastery",
        explanation: "The pinned sheet maps skill[9] to the second shade hit before the Veil multiplier.",
        groupId: "skill",
        parameterIndex: 9,
        snapshotChecks: [
          { expectedCoefficient: 0.96, talentLevel: 1 },
          { expectedCoefficient: 1.728, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "shade2EleMas",
        talentSlot: "skill"
      },
      {
        explanation: "Nefer C1 adds 60% Elemental Mastery to this same Lunar-Bloom base hit before Veil.",
        fixedCoefficient: 0.6,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "c1LunarBloomEleMas"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-shade-third-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "phantom-performance-shade-third-hit-elemental-mastery",
        explanation: "The pinned sheet maps skill[10] to the third shade hit before the Veil multiplier.",
        groupId: "skill",
        parameterIndex: 10,
        snapshotChecks: [
          { expectedCoefficient: 1.28, talentLevel: 1 },
          { expectedCoefficient: 2.304, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "shade3EleMas",
        talentSlot: "skill"
      },
      {
        explanation: "Nefer C1 adds 60% Elemental Mastery to this same Lunar-Bloom base hit before Veil.",
        fixedCoefficient: 0.6,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "c1LunarBloomEleMas"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-c6-self-second-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        explanation: "Nefer C6 replaces the second self hit with 85% Elemental Mastery Lunar-Bloom damage.",
        fixedCoefficient: 0.85,
        minimumSourceConstellation: 6,
        stat: "elementalMastery",
        symbol: "c6SecondSelfHitEleMas"
      },
      {
        explanation: "The C6 replacement remains cumulative with Nefer C1's 60% Elemental Mastery term.",
        fixedCoefficient: 0.6,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "c1LunarBloomEleMas"
      }
    ]
  },
  {
    actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
    damagePartId: "phantom-performance-c6-ending-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        explanation: "Nefer C6 adds a final 120% Elemental Mastery Lunar-Bloom hit after Phantom Performance.",
        fixedCoefficient: 1.2,
        minimumSourceConstellation: 6,
        stat: "elementalMastery",
        symbol: "c6EndingHitEleMas"
      },
      {
        explanation: "The C6 ending hit remains cumulative with Nefer C1's 60% Elemental Mastery term.",
        fixedCoefficient: 0.6,
        minimumSourceConstellation: 1,
        stat: "elementalMastery",
        symbol: "c1LunarBloomEleMas"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
