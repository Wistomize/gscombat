import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "raiden.burst.initial_slash",
    damagePartId: "initial-slash",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/RaidenShogun/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "initial-slash-multiplier",
        explanation: "The pinned sheet maps burst[0] to dmg and uses it as the base Attack-scaling term of the initial Musou no Hitotachi hit.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 4.008, talentLevel: 1 },
          { expectedCoefficient: 7.2144, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dmg",
        talentSlot: "burst"
      },
      {
        coefficientMultiplierScenarioParameterId: "resolve-stack-count",
        coefficientParameterId: "resolve-multiplier-per-stack",
        explanation: "The pinned sheet maps burst[1] to resolveBonus1, multiplies it by the selected Resolve stack count, and adds it to burst[0] before Attack scaling.",
        groupId: "burst",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.03888, talentLevel: 1 },
          { expectedCoefficient: 0.069984, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "resolveBonus1",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
