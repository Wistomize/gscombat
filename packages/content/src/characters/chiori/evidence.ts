import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
    damagePartId: "tamoto-attack",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Chiori/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "tamoto-attack-attack-ratio",
        explanation: "The pinned sheet passes skill[0] as the attack term of turretDmg.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.8208, talentLevel: 1 },
          { expectedCoefficient: 1.47744, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "turretDmg_atk",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "tamoto-attack-defense-ratio",
        explanation: "The pinned sheet passes skill[1] as the defense term of turretDmg.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 1.026, talentLevel: 1 },
          { expectedCoefficient: 1.8468, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "turretDmg_def",
        talentSlot: "skill"
      }
    ]
  },
  {
    actionId: "chiori.burst.hiyoku_twin_blades",
    damagePartId: "hiyoku-twin-blades",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Chiori/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "hiyoku-twin-blades-attack-ratio",
        explanation: "The pinned sheet passes burst[0] as the attack term of bloomDmg.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 2.5632, talentLevel: 1 },
          { expectedCoefficient: 4.61376, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "bloomDmg_atk",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "hiyoku-twin-blades-defense-ratio",
        explanation: "The pinned sheet passes burst[1] as the defense term of bloomDmg.",
        groupId: "burst",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 3.204, talentLevel: 1 },
          { expectedCoefficient: 5.7672, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "bloomDmg_def",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
