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
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
