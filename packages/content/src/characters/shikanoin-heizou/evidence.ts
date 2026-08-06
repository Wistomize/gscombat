import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction",
    damagePartId: "heartstopper-strike-four-declension-conviction",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/ShikanoinHeizou/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "heartstopper-strike-tap-damage",
        explanation: "The pinned sheet maps skill[0] dmg to Heartstopper Strike's base Attack term.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 2.2752, talentLevel: 1 },
          { expectedCoefficient: 4.09536, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dmg",
        talentSlot: "skill"
      },
      {
        coefficientMultiplierScenarioParameterId: "declension-stack-count",
        coefficientParameterId: "heartstopper-strike-declension-damage-bonus-per-stack",
        explanation: "The pinned totalStacks_dmg expression adds one skill[1] declension_dmg_ term for each selected Declension stack.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.5688, talentLevel: 1 },
          { expectedCoefficient: 1.02384, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "declension_dmg_",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "heartstopper-strike-conviction-damage-bonus",
        explanation: "The pinned totalStacks_dmg expression adds skill[2] conviction_dmg_ when the selected stack count is four.",
        groupId: "skill",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 1.1376, talentLevel: 1 },
          { expectedCoefficient: 2.04768, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "conviction_dmg_",
        talentSlot: "skill"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
