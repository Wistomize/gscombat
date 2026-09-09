import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

const source = {
  sourcePath: "libs/gi/sheets/src/Characters/Varka/index.tsx",
  upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d",
  upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
} as const

function createVarkaSpecialActionEvidence(input: {
  actionId: string
  coefficientParameterId: string
  damagePartId: string
  parameterIndex: number
  snapshotChecks: readonly [
    { readonly expectedCoefficient: number; readonly talentLevel: 1 },
    { readonly expectedCoefficient: number; readonly talentLevel: 10 }
  ]
  symbol: string
}): ReviewedMultiScalingEvidenceRecord {
  return {
    actionId: input.actionId,
    damagePartId: input.damagePartId,
    source,
    terms: [
      {
        coefficientMultiplierScenarioParameterId: "c1-lyrical-libation-original-damage-percent",
        coefficientParameterId: input.coefficientParameterId,
        explanation:
          "The pinned Varka sheet multiplies this Skill-table Attack coefficient by Lyrical Libation's " +
          "C1 original-DMG state; the action timeline separately resolves Dawn Wind's March.",
        groupId: "skill",
        parameterIndex: input.parameterIndex,
        snapshotChecks: input.snapshotChecks,
        stat: "attack",
        symbol: input.symbol,
        talentSlot: "skill"
      }
    ]
  }
}

const phecElements = ["cryo", "electro", "hydro", "pyro"] as const

/** Human-reviewed mappings for Varka's C1-scaled special Skill and special Charged Attack components. */
export const reviewedMultiScalingEvidence = [
  createVarkaSpecialActionEvidence({
    actionId: "varka.skill.four_winds_ascension.anemo_damage",
    coefficientParameterId: "four-winds-ascension-anemo-damage",
    damagePartId: "four_winds_ascension-anemo_damage",
    parameterIndex: 14,
    snapshotChecks: [
      { expectedCoefficient: 0.9464, talentLevel: 1 },
      { expectedCoefficient: 1.70352, talentLevel: 10 }
    ],
    symbol: "dm.skill.fourWindDmg2 × c1Phec_sturm_mult_"
  }),
  ...phecElements.map((element) =>
    createVarkaSpecialActionEvidence({
      actionId: `varka.skill.four_winds_ascension.corresponding_${element}_damage`,
      coefficientParameterId: "four-winds-ascension-corresponding-element-damage",
      damagePartId: `four_winds_ascension-corresponding_${element}_damage`,
      parameterIndex: 13,
      snapshotChecks: [
        { expectedCoefficient: 1.7576, talentLevel: 1 },
        { expectedCoefficient: 3.16368, talentLevel: 10 }
      ],
      symbol: "dm.skill.fourWindDmg1 × c1Phec_sturm_mult_"
    })
  ),
  createVarkaSpecialActionEvidence({
    actionId: "varka.skill.azure_devour.anemo_damage",
    coefficientParameterId: "azure-devour-anemo-damage",
    damagePartId: "azure_devour-anemo_damage",
    parameterIndex: 16,
    snapshotChecks: [
      { expectedCoefficient: 0.504, talentLevel: 1 },
      { expectedCoefficient: 0.9072, talentLevel: 10 }
    ],
    symbol: "dm.skill.azureDmg2 × c1Phec_sturm_mult_"
  }),
  ...phecElements.map((element) =>
    createVarkaSpecialActionEvidence({
      actionId: `varka.skill.azure_devour.corresponding_${element}_damage`,
      coefficientParameterId: "azure-devour-corresponding-element-damage",
      damagePartId: `azure_devour-corresponding_${element}_damage`,
      parameterIndex: 15,
      snapshotChecks: [
        { expectedCoefficient: 0.936, talentLevel: 1 },
        { expectedCoefficient: 1.6848, talentLevel: 10 }
      ],
      symbol: "dm.skill.azureDmg1 × c1Phec_sturm_mult_"
    })
  )
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
