import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "noelle.burst.sweeping_time.normal_attack_combo",
    damagePartId: "sweeping-time-normal-hit-one",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Noelle/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sweeping-time-normal-hit-one-attack-ratio",
        explanation: "The pinned sheet maps auto[0] to the first normal hit's attack term.",
        groupId: "auto",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.7912, talentLevel: 1 },
          { expectedCoefficient: 1.564, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[0]",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.4, talentLevel: 1 },
          { expectedCoefficient: 0.72, talentLevel: 10 }
        ],
        coefficientParameterId: "sweeping-time-normal-hit-one-attack-ratio",
        explanation: "At C0, Sweeping Time adds auto[0] multiplied by burst[2] defToAtk as the defense term.",
        groupId: "auto",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 0.7912, talentLevel: 1 },
          { expectedCoefficient: 1.564, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "normal.hitArr[0] × defToAtk",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "noelle.burst.sweeping_time.normal_attack_combo",
    damagePartId: "sweeping-time-normal-hit-two",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Noelle/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sweeping-time-normal-hit-two-attack-ratio",
        explanation: "The pinned sheet maps auto[1] to the second normal hit's attack term.",
        groupId: "auto",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.73358, talentLevel: 1 },
          { expectedCoefficient: 1.4501, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[1]",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.4, talentLevel: 1 },
          { expectedCoefficient: 0.72, talentLevel: 10 }
        ],
        coefficientParameterId: "sweeping-time-normal-hit-two-attack-ratio",
        explanation: "At C0, Sweeping Time adds auto[1] multiplied by burst[2] defToAtk as the defense term.",
        groupId: "auto",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 0.73358, talentLevel: 1 },
          { expectedCoefficient: 1.4501, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "normal.hitArr[1] × defToAtk",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "noelle.burst.sweeping_time.normal_attack_combo",
    damagePartId: "sweeping-time-normal-hit-three",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Noelle/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sweeping-time-normal-hit-three-attack-ratio",
        explanation: "The pinned sheet maps auto[2] to the third normal hit's attack term.",
        groupId: "auto",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 0.86258, talentLevel: 1 },
          { expectedCoefficient: 1.7051, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[2]",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.4, talentLevel: 1 },
          { expectedCoefficient: 0.72, talentLevel: 10 }
        ],
        coefficientParameterId: "sweeping-time-normal-hit-three-attack-ratio",
        explanation: "At C0, Sweeping Time adds auto[2] multiplied by burst[2] defToAtk as the defense term.",
        groupId: "auto",
        parameterIndex: 2,
        snapshotChecks: [
          { expectedCoefficient: 0.86258, talentLevel: 1 },
          { expectedCoefficient: 1.7051, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "normal.hitArr[2] × defToAtk",
        talentSlot: "normal"
      }
    ]
  },
  {
    actionId: "noelle.burst.sweeping_time.normal_attack_combo",
    damagePartId: "sweeping-time-normal-hit-four",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Noelle/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "sweeping-time-normal-hit-four-attack-ratio",
        explanation: "The pinned sheet maps auto[3] to the fourth normal hit's attack term.",
        groupId: "auto",
        parameterIndex: 3,
        snapshotChecks: [
          { expectedCoefficient: 1.13434, talentLevel: 1 },
          { expectedCoefficient: 2.2423, talentLevel: 10 }
        ],
        stat: "attack",
        symbol: "normal.hitArr[3]",
        talentSlot: "normal"
      },
      {
        coefficientMultiplierParameterId: "sweeping-time-defense-to-attack-ratio",
        coefficientMultiplierSnapshotChecks: [
          { expectedCoefficient: 0.4, talentLevel: 1 },
          { expectedCoefficient: 0.72, talentLevel: 10 }
        ],
        coefficientParameterId: "sweeping-time-normal-hit-four-attack-ratio",
        explanation: "At C0, Sweeping Time adds auto[3] multiplied by burst[2] defToAtk as the defense term.",
        groupId: "auto",
        parameterIndex: 3,
        snapshotChecks: [
          { expectedCoefficient: 1.13434, talentLevel: 1 },
          { expectedCoefficient: 2.2423, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "normal.hitArr[3] × defToAtk",
        talentSlot: "normal"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
