import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
    damagePartId: "pactsworn-pathclearer-normal-attack-first-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Cyno/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "pactsworn-pathclearer-normal-attack-first-hit-damage",
        explanation: "The pinned sheet maps burst[0] to the transformed first normal Attack term.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.782832, talentLevel: 1 },
          { expectedCoefficient: 1.547459, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "burstNormal.hitArr[0]",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
        explanation: "At ascension 4+, Featherfall Judgment adds passive2[0] as an independent Elemental Mastery term to transformed normal damage.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 1.5, talentLevel: 1 }],
        stat: "elementalMastery",
        symbol: "a4_burstNormal_dmgInc",
        talentSlot: "passive"
      }
    ]
  },
  {
    actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
    damagePartId: "c6-duststalker-bolt",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Cyno/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "c6-duststalker-bolt-attack-ratio",
        explanation: "The reviewed C6 Duststalker Bolt term reads passive1[1] as a fixed Attack ratio.",
        groupId: "passive1",
        parameterIndex: 1,
        snapshotChecks: [{ expectedCoefficient: 1, talentLevel: 1 }],
        stat: "attack",
        symbol: "c6DuststalkerBolt.atk",
        talentSlot: "passive"
      },
      {
        coefficientParameterId: "c6-duststalker-bolt-elemental-mastery-ratio",
        explanation: "The reviewed C6 Duststalker Bolt term reads passive2[1] as a fixed Elemental Mastery ratio.",
        groupId: "passive2",
        parameterIndex: 1,
        snapshotChecks: [{ expectedCoefficient: 2.5, talentLevel: 1 }],
        stat: "elementalMastery",
        symbol: "c6DuststalkerBolt.em",
        talentSlot: "passive"
      }
    ]
  },
  {
    actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.aggravate",
    damagePartId: "c6-duststalker-bolt",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Cyno/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "c6-duststalker-bolt-attack-ratio",
        explanation: "The Aggravate branch preserves passive1[1] as the C6 Duststalker Bolt Attack term.",
        groupId: "passive1",
        parameterIndex: 1,
        snapshotChecks: [{ expectedCoefficient: 1, talentLevel: 1 }],
        stat: "attack",
        symbol: "c6DuststalkerBolt.atk",
        talentSlot: "passive"
      },
      {
        coefficientParameterId: "c6-duststalker-bolt-elemental-mastery-ratio",
        explanation: "The Aggravate branch preserves passive2[1] as the C6 Duststalker Bolt Elemental Mastery term.",
        groupId: "passive2",
        parameterIndex: 1,
        snapshotChecks: [{ expectedCoefficient: 2.5, talentLevel: 1 }],
        stat: "elementalMastery",
        symbol: "c6DuststalkerBolt.em",
        talentSlot: "passive"
      }
    ]
  },
  {
    actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct",
    damagePartId: "c6-stellar-duststalker-bolt",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Cyno/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "c6-stellar-duststalker-bolt-attack-ratio",
        explanation: "The reviewed Stellar-Superconduct replacement reads passive1[2] as its Attack term.",
        groupId: "passive1",
        parameterIndex: 2,
        snapshotChecks: [{ expectedCoefficient: 2, talentLevel: 1 }],
        stat: "attack",
        symbol: "c6StellarDuststalkerBolt.atk",
        talentSlot: "passive"
      },
      {
        coefficientParameterId: "c6-stellar-duststalker-bolt-elemental-mastery-ratio",
        explanation: "At ascension 4+, passive2[2] supplies the Stellar-Superconduct base Elemental Mastery term.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 2,
        snapshotChecks: [{ expectedCoefficient: 6, talentLevel: 1 }],
        stat: "elementalMastery",
        symbol: "c6StellarDuststalkerBolt.em",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
