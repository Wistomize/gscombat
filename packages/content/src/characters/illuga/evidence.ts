import type { ReviewedMultiScalingEvidenceRecord } from "../evidence.js"

/** Human-reviewed mappings for this character's multi-scaling damage parts. */
export const reviewedMultiScalingEvidence = [
  {
    actionId: "illuga.skill.dawnbearing_songbird.press",
    damagePartId: "dawnbearing-songbird-press",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Illuga/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "dawnbearing-songbird-press-elemental-mastery-ratio",
        explanation: "The pinned sheet passes skill[0] as the elemental-mastery term of pressDmg.",
        groupId: "skill",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 4.8256, talentLevel: 1 },
          { expectedCoefficient: 8.68608, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "pressDmgEleMas",
        talentSlot: "skill"
      },
      {
        coefficientParameterId: "dawnbearing-songbird-press-defense-ratio",
        explanation: "The pinned sheet passes skill[1] as the defense term of pressDmg.",
        groupId: "skill",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 2.4128, talentLevel: 1 },
          { expectedCoefficient: 4.34304, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "pressDmgDef",
        talentSlot: "skill"
      }
    ]
  },
  {
    actionId: "illuga.burst.song_of_the_nightbird.cast_damage",
    damagePartId: "nightbird-song-cast",
    source: {
      sourcePath: "libs/gi/sheets/src/Characters/Illuga/index.tsx",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    },
    terms: [
      {
        coefficientParameterId: "nightbird-song-cast-elemental-mastery-ratio",
        explanation: "The pinned sheet passes burst[0] as the elemental-mastery term of skillDmg.",
        groupId: "burst",
        parameterIndex: 0,
        snapshotChecks: [
          { expectedCoefficient: 8.272, talentLevel: 1 },
          { expectedCoefficient: 14.8896, talentLevel: 10 }
        ],
        stat: "elementalMastery",
        symbol: "skillDmgEleMas",
        talentSlot: "burst"
      },
      {
        coefficientParameterId: "nightbird-song-cast-defense-ratio",
        explanation: "The pinned sheet passes burst[1] as the defense term of skillDmg.",
        groupId: "burst",
        parameterIndex: 1,
        snapshotChecks: [
          { expectedCoefficient: 4.136, talentLevel: 1 },
          { expectedCoefficient: 7.4448, talentLevel: 10 }
        ],
        stat: "defense",
        symbol: "skillDmgDef",
        talentSlot: "burst"
      }
    ]
  }
] as const satisfies readonly ReviewedMultiScalingEvidenceRecord[]
