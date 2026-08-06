import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "beidou.skill.tidecaller.full_counter",
    damagePartId: "tidecaller-full-counter-damage",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Beidou/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "tidecaller-base-damage",
        explanation: "The pinned sheet maps skill[2] dmgBase to Tidecaller's base Attack term.",
        groupId: "skill",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 1.216, talentLevel: 1 },
          { expectedCoefficient: 2.1888, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dmgBase",
        talentSlot: "skill"
      },
      {
        coefficientMultiplierScenarioParameterId: "tidecaller-counter-hit-count",
        coefficientParameterId: "tidecaller-damage-bonus-on-hit-taken",
        explanation: "The pinned skillDmgTwoHits expression adds skill[3] onHitDmgBonus once for each selected full-counter hit.",
        groupId: "skill",
        parameterIndex: 3,
        snapshotChecks: [
          { expectedCoefficient: 1.6, talentLevel: 1 },
          { expectedCoefficient: 2.88, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "onHitDmgBonus",
        talentSlot: "skill"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
