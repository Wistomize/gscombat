import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
    damagePartId: "shunsuiken-first-hit",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/KamisatoAyato/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "shunsuiken-first-hit-damage",
        explanation: "The pinned sheet maps skill[0] to dm.skill.dmgArr[0] and creates the first Shunsuiken hit as an Attack-scaled normal-damage node.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.5289, talentLevel: 1 },
          { expectedCoefficient: 1.0455, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "dm.skill.dmgArr[0]",
        talentSlot: "skill"
      },
      {
        coefficientMultiplierScenarioParameterId: "namisen-stack-count",
        coefficientParameterId: "namisen-damage-increase-per-stack",
        explanation: "The pinned skillStacks_dmgInc expression adds one skill[4] times max-HP term for each selected Namisen stack before the normal-damage multipliers.",
        groupId: "skill",
        parameterIndex: 4,
        snapshotChecks: [
          { expectedCoefficient: 0.005611, talentLevel: 1 },
          { expectedCoefficient: 0.011091, talentLevel: 10 }
        ],
        stat: "hp",
        symbol: "skillStacks_dmgInc",
        talentSlot: "skill"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
