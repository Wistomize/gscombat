import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize",
    damagePartId: "masque-of-the-red-death-normal-attack-first-hit-at-full-bond",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Arlecchino/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "masque-of-the-red-death-normal-attack-first-hit",
        explanation: "The pinned sheet maps auto[0] normal.hitArr[0] to the first infused normal Attack term.",
        groupId: "auto",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.475004, talentLevel: 1 },
          { expectedCoefficient: 0.938961, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[0]",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "masque-of-the-red-death-normal-attack-bond-life-increase",
        coefficientMultiplierScenarioParameterId: "bond-of-life-percent",
        explanation: "The pinned infusion.normal_dmgInc auto[11] is multiplied by the declared pre-hit Bond of Life percentage for the same first normal hit.",
        groupId: "auto",
        parameterIndex: 11,
        snapshotChecks: [
          { expectedCoefficient: 1.204, talentLevel: 1 },
          { expectedCoefficient: 2.38, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "infusion.normal_dmgInc",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.cryo_aura_melt",
    damagePartId: "masque-of-the-red-death-normal-attack-first-hit-at-full-bond",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Arlecchino/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "masque-of-the-red-death-normal-attack-first-hit",
        explanation: "The pinned sheet maps auto[0] normal.hitArr[0] to the first infused normal Attack term.",
        groupId: "auto",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.475004, talentLevel: 1 },
          { expectedCoefficient: 0.938961, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[0]",
        talentSlot: "normal"
      },
      {
        coefficientParameterId: "masque-of-the-red-death-normal-attack-bond-life-increase",
        coefficientMultiplierScenarioParameterId: "bond-of-life-percent",
        explanation: "The pinned infusion.normal_dmgInc auto[11] is multiplied by the declared pre-hit Bond of Life percentage for the same first normal hit.",
        groupId: "auto",
        parameterIndex: 11,
        snapshotChecks: [
          { expectedCoefficient: 1.204, talentLevel: 1 },
          { expectedCoefficient: 2.38, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "infusion.normal_dmgInc",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
