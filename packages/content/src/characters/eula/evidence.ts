import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "eula.burst.glacial_illumination.lightfall_sword.explosion",
    damagePartId: "lightfall-sword-explosion",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Eula/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "lightfall-sword-base-damage",
        explanation: "The pinned sheet maps burst[1] to lightFallSwordDmg and adds it as the base attack-scaling term of the Lightfall Sword explosion.",
        groupId: "burst",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 3.67048, talentLevel: 1 },
          { expectedCoefficient: 7.2556, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "lightFallSwordDmg",
        talentSlot: "burst"
      },
      {
        coefficientMultiplierScenarioParameterId: "lightfall-sword-stack-count",
        coefficientParameterId: "lightfall-sword-damage-per-stack",
        explanation: "The pinned sheet maps burst[2] to lightFallSwordDmgPerStack and adds it once per Lightfall Sword energy stack to the same attack-scaling explosion.",
        groupId: "burst",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 0.74992, talentLevel: 1 },
          { expectedCoefficient: 1.4824, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "lightFallSwordDmgPerStack",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
