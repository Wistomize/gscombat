import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "kachina.skill.go_go_turbo_twirly.mounted_attack",
    damagePartId: "turbo-twirly-mounted",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Kachina/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "turbo-twirly-mounted-damage",
        explanation: "The pinned sheet maps skill[0] to Turbo Twirly's mounted Defense-scaled damage term.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.8776, talentLevel: 1 },
          { expectedCoefficient: 1.57968, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "mountedDmg",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "the-weight-of-stone-defense-damage-increase",
        explanation: "At ascension 4+, The Weight of Stone adds passive2[0] as an independent Defense term to the mounted attack.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
        stat: "defense",
        symbol: "a4_skill_dmgInc",
        talentSlot: "passive"
      }
    ]
  },
  {
    actionId: "kachina.skill.go_go_turbo_twirly.independent_attack",
    damagePartId: "turbo-twirly-independent",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Kachina/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "turbo-twirly-independent-damage",
        explanation: "The pinned sheet maps skill[1] to Turbo Twirly's independent Defense-scaled damage term.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.6376, talentLevel: 1 },
          { expectedCoefficient: 1.14768, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "independentDmg",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "the-weight-of-stone-defense-damage-increase",
        explanation: "At ascension 4+, The Weight of Stone adds passive2[0] as an independent Defense term to the independent attack.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
        stat: "defense",
        symbol: "a4_skill_dmgInc",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
