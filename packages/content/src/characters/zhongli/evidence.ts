import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "zhongli.burst.planet_befall.meteor",
    damagePartId: "planet-befall-meteor",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Zhongli/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "planet-befall-meteor-damage",
        explanation: "The pinned sheet maps burst[0] to Planet Befall's Attack-scaled meteor term.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 4.0108, talentLevel: 1 },
          { expectedCoefficient: 8.9972, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dm.burst.meteor",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "dominance-of-earth-meteor-hp-ratio",
        explanation: "At ascension 4+, Dominance of Earth adds passive2[2] as an independent max-HP term to this meteor.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 2,
        snapshotChecks: [{ expectedCoefficient: 0.33, talentLevel: 1 }],
        stat: "hp",
        symbol: "dm.passive2.burst_",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
