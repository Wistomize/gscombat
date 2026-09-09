import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "layla.skill.nights_of_formal_focus.shooting_star.single_hit",
    damagePartId: "shooting-star",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Layla/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "shooting-star-attack-damage",
        explanation: "The pinned sheet maps skill[1] to one Shooting Star's Attack term.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.1472, talentLevel: 1 },
          { expectedCoefficient: 0.26496, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "shootingStar.dmg",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "a4-shooting-star-max-hp-additive-damage",
        explanation: "At ascension 4+, Like Nascent Light adds passive2[0] of Layla's Max HP to each Shooting Star.",
        groupId: "passive2",
        minimumSourceAscension: 4,
        parameterIndex: 0,
        snapshotChecks: [{ expectedCoefficient: 0.015, talentLevel: 1 }],
        stat: "hp",
        symbol: "a4ShootingStar.hp",
        talentSlot: "passive"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
