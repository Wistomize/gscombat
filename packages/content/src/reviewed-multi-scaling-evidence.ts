import type { ScalingStat } from "@gscombat/calculator"

import type { CombatTalentParameterReference } from "./combat/types.js"

/** Locks one reviewed coefficient to its level-one or level-ten pinned snapshot value. */
export interface ReviewedMultiScalingEvidenceSnapshotCheck {
  readonly expectedCoefficient: number
  readonly talentLevel: 1 | 10
}

/** One manually reviewed stat-specific term in a multi-scaling damage part. */
export interface ReviewedMultiScalingEvidenceTerm {
  readonly coefficientMultiplierParameterId?: string
  readonly coefficientMultiplierScenarioParameterId?: string
  readonly coefficientMultiplierSnapshotChecks?: readonly ReviewedMultiScalingEvidenceSnapshotCheck[]
  readonly coefficientParameterId: string
  readonly explanation: string
  readonly groupId: CombatTalentParameterReference["groupId"]
  readonly minimumSourceAscension?: number
  readonly parameterIndex: number
  readonly snapshotChecks: readonly [
    ReviewedMultiScalingEvidenceSnapshotCheck,
    ...ReviewedMultiScalingEvidenceSnapshotCheck[]
  ]
  readonly stat: ScalingStat
  readonly symbol: string
  readonly talentSlot: CombatTalentParameterReference["talentSlot"]
}

/** Immutable source location that reviewers used to map a damage part's scaling terms. */
export interface ReviewedMultiScalingEvidenceSource {
  readonly sourcePath: string
  readonly upstreamCommit: string
  readonly upstreamRepository: string
}

/** A manually reviewed mapping required before a verified action may declare one or more explicit scaling terms. */
export interface ReviewedMultiScalingEvidenceRecord {
  readonly actionId: string
  readonly damagePartId: string
  readonly source: ReviewedMultiScalingEvidenceSource
  readonly terms: readonly [ReviewedMultiScalingEvidenceTerm, ...ReviewedMultiScalingEvidenceTerm[]]
}

/** Versioned registry of reviewed mappings for verified multi-scaling damage parts. */
export interface ReviewedMultiScalingEvidenceRegistry {
  readonly formatVersion: 1
  readonly records: readonly ReviewedMultiScalingEvidenceRecord[]
}

/**
 * Stores the human-reviewed mappings required by ADR 0010.
 *
 * Numeric checks remain beside the combat action; this registry records why each coefficient belongs to a stat term.
 */
const nahidaTriKarmaPurificationEvidence = {
  source: {
    sourcePath: "libs/gi/sheets/src/Characters/Nahida/index.tsx",
    upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
    upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
  },
  terms: [
    {
      coefficientParameterId: "tri-karma-purification-attack-ratio",
      explanation: "The pinned sheet binds skill[2] to karmaAtkDmg and uses it as the first split-scale Tri-Karma Purification term.",
      groupId: "skill",
      parameterIndex: 2,
      snapshotChecks: [
        { expectedCoefficient: 1.032, talentLevel: 1 },
        { expectedCoefficient: 1.8576, talentLevel: 10 }
      ],
      stat: "attack",
      symbol: "karmaAtkDmg",
      talentSlot: "skill"
    },
    {
      coefficientParameterId: "tri-karma-purification-elemental-mastery-ratio",
      explanation: "The pinned sheet binds skill[3] to karmaEleMasDmg and splitScaleDmgNode combines it with karmaAtkDmg in the same Tri-Karma Purification hit.",
      groupId: "skill",
      parameterIndex: 3,
      snapshotChecks: [
        { expectedCoefficient: 2.064, talentLevel: 1 },
        { expectedCoefficient: 3.7152, talentLevel: 10 }
      ],
      stat: "elementalMastery",
      symbol: "karmaEleMasDmg",
      talentSlot: "skill"
    }
  ]
} as const satisfies Omit<ReviewedMultiScalingEvidenceRecord, "actionId" | "damagePartId">

export const reviewedMultiScalingEvidenceRegistry = {
  formatVersion: 1,
  records: [
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
          explanation:
            "The pinned sheet maps burst[0] to dmg and uses it as the base Attack-scaling term of the initial Musou no Hitotachi hit.",
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
          explanation:
            "The pinned sheet maps burst[1] to resolveBonus1, multiplies it by the selected Resolve stack count, and adds it to burst[0] before Attack scaling.",
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
    },
    {
      actionId: "eula.burst.glacial_illumination.lightfall_sword.explosion",
      damagePartId: "lightfall-sword-explosion",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Eula/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "lightfall-sword-base-damage",
          explanation:
            "The pinned sheet maps burst[1] to lightFallSwordDmg and adds it as the base attack-scaling term of the Lightfall Sword explosion.",
          groupId: "burst",
          parameterIndex: 1,
          snapshotChecks: [
            { expectedCoefficient: 3.67048, talentLevel: 1 },
            { expectedCoefficient: 7.2556, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "lightFallSwordDmg",
          talentSlot: "burst"
        },
        {
          coefficientMultiplierScenarioParameterId: "lightfall-sword-stack-count",
          coefficientParameterId: "lightfall-sword-damage-per-stack",
          explanation:
            "The pinned sheet maps burst[2] to lightFallSwordDmgPerStack and adds it once per Lightfall Sword energy stack to the same attack-scaling explosion.",
          groupId: "burst",
          parameterIndex: 2,
          snapshotChecks: [
            { expectedCoefficient: 0.74992, talentLevel: 1 },
            { expectedCoefficient: 1.4824, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "lightFallSwordDmgPerStack",
          talentSlot: "burst"
        }
      ]
    },
    {
      actionId: "dehya.burst.flame_manes_fist",
      damagePartId: "flame-manes-fist",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Dehya/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "flame-manes-fist-attack",
          explanation:
            "The pinned sheet binds burst[0] to fistDmgAtk and passes it as the first Flame-Mane's Fist term.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.987, talentLevel: 1 },
            { expectedCoefficient: 1.7766, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "fistDmgAtk",
          talentSlot: "burst"
        },
        {
          coefficientParameterId: "flame-manes-fist-hp",
          explanation:
            "The pinned sheet binds burst[1] to fistDmgHp and passes it as the second Flame-Mane's Fist term.",
          groupId: "burst",
          parameterIndex: 1,
          snapshotChecks: [
            { expectedCoefficient: 0.01692, talentLevel: 1 },
            { expectedCoefficient: 0.030456, talentLevel: 10 }
          ],
          stat: "hp",
          symbol: "fistDmgHp",
          talentSlot: "burst"
        }
      ]
    },
    {
      actionId: "nefer.skill.senet_strategy.dance_of_a_thousand_nights.initial_hit",
      damagePartId: "dance-of-a-thousand-nights-initial-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "dance-of-a-thousand-nights-attack",
          explanation:
            "The pinned sheet binds skill[0] to skillDmgAtk and splitScaleDmgNode combines it with the elemental-mastery term in the same initial skill hit.",
          groupId: "skill",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.76384, talentLevel: 1 },
            { expectedCoefficient: 1.374912, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "skillDmgAtk",
          talentSlot: "skill"
        },
        {
          coefficientParameterId: "dance-of-a-thousand-nights-elemental-mastery",
          explanation:
            "The pinned sheet binds skill[1] to skillDmgEleMas and splitScaleDmgNode combines it with the attack term in the same initial skill hit.",
          groupId: "skill",
          parameterIndex: 1,
          snapshotChecks: [
            { expectedCoefficient: 1.52768, talentLevel: 1 },
            { expectedCoefficient: 2.749824, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "skillDmgEleMas",
          talentSlot: "skill"
        }
      ]
    },
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
    },
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
    },
    {
      actionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      damagePartId: "arataki-kesagiri-chain",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/AratakiItto/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
          explanation: "The pinned sheet binds auto[5] to akSlash and uses it as the charged-hit attack ratio.",
          groupId: "auto",
          parameterIndex: 5,
          snapshotChecks: [
            { expectedCoefficient: 0.9116, talentLevel: 1 },
            { expectedCoefficient: 1.802, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "akSlash",
          talentSlot: "normal"
        },
        {
          coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 0.576, talentLevel: 1 },
            { expectedCoefficient: 1.0368, talentLevel: 10 }
          ],
          coefficientParameterId: "arataki-kesagiri-chain-attack-ratio",
          explanation:
            "The pinned sheet multiplies akSlash by burst[1] defConv before adding the resulting defense term to the charged hit.",
          groupId: "auto",
          parameterIndex: 5,
          snapshotChecks: [
            { expectedCoefficient: 0.9116, talentLevel: 1 },
            { expectedCoefficient: 1.802, talentLevel: 10 }
          ],
          stat: "defense",
          symbol: "akSlash × defConv",
          talentSlot: "normal"
        },
        {
          coefficientParameterId: "superlative-superstrength-defense-damage-increase",
          explanation:
            "At ascension 4+, the pinned nodeA4Bonus adds passive2[0] once as an independent defense term to every Arataki Kesagiri chain hit.",
          groupId: "passive2",
          minimumSourceAscension: 4,
          parameterIndex: 0,
          snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
          stat: "defense",
          symbol: "nodeA4Bonus",
          talentSlot: "passive"
        }
      ]
    },
    {
      actionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
      damagePartId: "arataki-kesagiri-final",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/AratakiItto/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
          explanation: "The pinned sheet binds auto[6] to akFinal and uses it as the final charged-hit attack ratio.",
          groupId: "auto",
          parameterIndex: 6,
          snapshotChecks: [
            { expectedCoefficient: 1.9092, talentLevel: 1 },
            { expectedCoefficient: 3.774, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "akFinal",
          talentSlot: "normal"
        },
        {
          coefficientMultiplierParameterId: "royal-descent-defense-to-attack-ratio",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 0.576, talentLevel: 1 },
            { expectedCoefficient: 1.0368, talentLevel: 10 }
          ],
          coefficientParameterId: "arataki-kesagiri-final-attack-ratio",
          explanation:
            "The pinned sheet multiplies akFinal by burst[1] defConv before adding the resulting defense term to the charged hit.",
          groupId: "auto",
          parameterIndex: 6,
          snapshotChecks: [
            { expectedCoefficient: 1.9092, talentLevel: 1 },
            { expectedCoefficient: 3.774, talentLevel: 10 }
          ],
          stat: "defense",
          symbol: "akFinal × defConv",
          talentSlot: "normal"
        },
        {
          coefficientParameterId: "superlative-superstrength-defense-damage-increase",
          explanation:
            "At ascension 4+, the pinned nodeA4Bonus adds passive2[0] once as an independent defense term to the Arataki Kesagiri final hit.",
          groupId: "passive2",
          minimumSourceAscension: 4,
          parameterIndex: 0,
          snapshotChecks: [{ expectedCoefficient: 0.35, talentLevel: 1 }],
          stat: "defense",
          symbol: "nodeA4Bonus",
          talentSlot: "passive"
        }
      ]
    },
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
    },
    {
      actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit",
      damagePartId: "tri-karma-purification",
      ...nahidaTriKarmaPurificationEvidence
    },
    {
      actionId: "nahida.skill.all_schemes_to_know.tri_karma_purification.single_hit.spread",
      damagePartId: "tri-karma-purification",
      ...nahidaTriKarmaPurificationEvidence
    },
    {
      actionId: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      damagePartId: "chisel-light-mirror-projection-attack",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Alhaitham/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "chisel-light-mirror-projection-attack-attack-ratio",
          explanation: "The pinned splitScaleDmgNode maps skill[3] mirrorDmgAtk into the one Projection Attack attack term.",
          groupId: "skill",
          parameterIndex: 3,
          snapshotChecks: [
            { expectedCoefficient: 0.672, talentLevel: 1 },
            { expectedCoefficient: 1.2096, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "mirrorDmgAtk",
          talentSlot: "skill"
        },
        {
          coefficientParameterId: "chisel-light-mirror-projection-attack-elemental-mastery-ratio",
          explanation: "The same pinned splitScaleDmgNode maps skill[4] mirrorDmgEm into the same one Projection Attack elemental-mastery term.",
          groupId: "skill",
          parameterIndex: 4,
          snapshotChecks: [
            { expectedCoefficient: 1.344, talentLevel: 1 },
            { expectedCoefficient: 2.4192, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "mirrorDmgEm",
          talentSlot: "skill"
        }
      ]
    },
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
          explanation:
            "The pinned sheet maps skill[0] to dm.skill.dmgArr[0] and creates the first Shunsuiken hit as an Attack-scaled normal-damage node.",
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
          explanation:
            "The pinned skillStacks_dmgInc expression adds one skill[4] times max-HP term for each selected Namisen stack before the normal-damage multipliers.",
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
    },
    {
      actionId: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
      damagePartId: "shadowpiercing-shot",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Sethos/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "shadowpiercing-shot-attack-scaling",
          explanation:
            "The pinned splitScaleDmgNode maps auto[6] shadowAtk into the Attack term of one Shadowpiercing Shot.",
          groupId: "auto",
          parameterIndex: 6,
          snapshotChecks: [
            { expectedCoefficient: 1.4, talentLevel: 1 },
            { expectedCoefficient: 2.52, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "shadowAtk",
          talentSlot: "normal"
        },
        {
          coefficientParameterId: "shadowpiercing-shot-elemental-mastery-scaling",
          explanation:
            "The same pinned splitScaleDmgNode maps auto[7] shadowEm into the Elemental Mastery term of the same Shadowpiercing Shot.",
          groupId: "auto",
          parameterIndex: 7,
          snapshotChecks: [
            { expectedCoefficient: 1.3456, talentLevel: 1 },
            { expectedCoefficient: 2.42208, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "shadowEm",
          talentSlot: "normal"
        }
      ]
    },
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      damagePartId: "sunfell-slice",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Mavuika/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "sunfell-slice-base-damage",
          explanation: "The pinned sheet maps burst[0] skillDmg to the base Attack term of the Sunfell Slice.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 4.448, talentLevel: 1 },
            { expectedCoefficient: 8.0064, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "skillDmg",
          talentSlot: "burst"
        },
        {
          coefficientMultiplierScenarioParameterId: "fighting-spirit",
          coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
          explanation:
            "The pinned sunfell_dmgInc expression multiplies burst[2] by selected Fighting Spirit and Attack, then adds it to the same Sunfell Slice base damage.",
          groupId: "burst",
          parameterIndex: 2,
          snapshotChecks: [
            { expectedCoefficient: 0.016, talentLevel: 1 },
            { expectedCoefficient: 0.0288, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "sunfell_dmgInc",
          talentSlot: "burst"
        }
      ]
    },
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      damagePartId: "sunfell-slice",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Mavuika/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "sunfell-slice-base-damage",
          explanation: "The pinned sheet maps burst[0] skillDmg to the base Attack term of the Sunfell Slice.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 4.448, talentLevel: 1 },
            { expectedCoefficient: 8.0064, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "skillDmg",
          talentSlot: "burst"
        },
        {
          coefficientMultiplierScenarioParameterId: "fighting-spirit",
          coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
          explanation:
            "The pinned sunfell_dmgInc expression multiplies burst[2] by selected Fighting Spirit and Attack, then adds it to the same Sunfell Slice base damage.",
          groupId: "burst",
          parameterIndex: 2,
          snapshotChecks: [
            { expectedCoefficient: 0.016, talentLevel: 1 },
            { expectedCoefficient: 0.0288, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "sunfell_dmgInc",
          talentSlot: "burst"
        }
      ]
    },
    {
      actionId: "beidou.skill.tidecaller.full_counter",
      damagePartId: "tidecaller-full-counter-damage",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Beidou/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "tidecaller-base-damage",
          explanation: "The pinned sheet maps skill[2] dmgBase to Tidecaller's base Attack term.",
          groupId: "skill",
          parameterIndex: 2,
          snapshotChecks: [
            { expectedCoefficient: 1.216, talentLevel: 1 },
            { expectedCoefficient: 2.1888, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "dmgBase",
          talentSlot: "skill"
        },
        {
          coefficientMultiplierScenarioParameterId: "tidecaller-counter-hit-count",
          coefficientParameterId: "tidecaller-damage-bonus-on-hit-taken",
          explanation:
            "The pinned skillDmgTwoHits expression adds skill[3] onHitDmgBonus once for each selected full-counter hit.",
          groupId: "skill",
          parameterIndex: 3,
          snapshotChecks: [
            { expectedCoefficient: 1.6, talentLevel: 1 },
            { expectedCoefficient: 2.88, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "onHitDmgBonus",
          talentSlot: "skill"
        }
      ]
    },
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
          explanation:
            "The pinned totalStacks_dmg expression adds one skill[1] declension_dmg_ term for each selected Declension stack.",
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
          explanation:
            "The pinned totalStacks_dmg expression adds skill[2] conviction_dmg_ when the selected stack count is four.",
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
    },
    {
      actionId: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
      damagePartId: "windfavored-normal-attack-first-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Wanderer/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientMultiplierParameterId: "windfavored-normal-attack-damage-multiplier",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 1.329825, talentLevel: 1 },
            { expectedCoefficient: 1.5372, talentLevel: 10 }
          ],
          coefficientParameterId: "normal-attack-first-hit-damage",
          explanation:
            "The pinned Windfavored normal-damage node multiplies auto[0] by skill[1] before applying Attack scaling.",
          groupId: "auto",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.68714, talentLevel: 1 },
            { expectedCoefficient: 1.3583, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "normal.hitArr[0] × windfavoredNormalDmg",
          talentSlot: "normal"
        }
      ]
    },
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      damagePartId: "niwabi-fire-dance-fifth-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Yoimiya/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 1.37909, talentLevel: 1 },
            { expectedCoefficient: 1.61744, talentLevel: 10 }
          ],
          coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
          explanation:
            "The pinned Niwabi Fire-Dance normal-damage node multiplies auto[4] by skill[3] before applying Attack scaling.",
          groupId: "auto",
          parameterIndex: 4,
          snapshotChecks: [
            { expectedCoefficient: 1.05864, talentLevel: 1 },
            { expectedCoefficient: 1.88871, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "normal.hitArr[4] × normalDmg_",
          talentSlot: "normal"
        }
      ]
    },
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      damagePartId: "niwabi-fire-dance-fifth-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Yoimiya/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 1.37909, talentLevel: 1 },
            { expectedCoefficient: 1.61744, talentLevel: 10 }
          ],
          coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
          explanation:
            "The pinned Niwabi Fire-Dance normal-damage node multiplies auto[4] by skill[3] before applying Attack scaling.",
          groupId: "auto",
          parameterIndex: 4,
          snapshotChecks: [
            { expectedCoefficient: 1.05864, talentLevel: 1 },
            { expectedCoefficient: 1.88871, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "normal.hitArr[4] × normalDmg_",
          talentSlot: "normal"
        }
      ]
    },
    {
      actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      damagePartId: "phantom-performance-second-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "phantom-performance-second-hit-attack",
          explanation:
            "The pinned Phantom Performance node maps skill[4] nefer2Atk into its direct Attack term.",
          groupId: "skill",
          parameterIndex: 4,
          snapshotChecks: [
            { expectedCoefficient: 0.2464, talentLevel: 1 },
            { expectedCoefficient: 0.44352, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "nefer2Atk",
          talentSlot: "skill"
        },
        {
          coefficientParameterId: "phantom-performance-second-hit-elemental-mastery",
          explanation:
            "The same pinned Phantom Performance node maps skill[5] nefer2EleMas into its direct Elemental Mastery term.",
          groupId: "skill",
          parameterIndex: 5,
          snapshotChecks: [
            { expectedCoefficient: 0.4928, talentLevel: 1 },
            { expectedCoefficient: 0.88704, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "nefer2EleMas",
          talentSlot: "skill"
        }
      ]
    },
    {
      actionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
      damagePartId: "phantom-performance-self-second-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Nefer/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "phantom-performance-self-second-hit-attack",
          explanation:
            "The pinned Phantom Performance node maps skill[6] nefer3Atk into its second self-hit Attack term.",
          groupId: "skill",
          parameterIndex: 6,
          snapshotChecks: [
            { expectedCoefficient: 0.32032, talentLevel: 1 },
            { expectedCoefficient: 0.576576, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "nefer3Atk",
          talentSlot: "skill"
        },
        {
          coefficientParameterId: "phantom-performance-self-second-hit-elemental-mastery",
          explanation:
            "The same pinned Phantom Performance node maps skill[7] nefer3EleMas into its second self-hit Elemental Mastery term.",
          groupId: "skill",
          parameterIndex: 7,
          snapshotChecks: [
            { expectedCoefficient: 0.64064, talentLevel: 1 },
            { expectedCoefficient: 1.153152, talentLevel: 10 }
          ],
          stat: "elementalMastery",
          symbol: "nefer3EleMas",
          talentSlot: "skill"
        }
      ]
    },
    {
      actionId: "razor.burst.lightning_fang.wolf_spirit.fourth_hit",
      damagePartId: "lightning-fang-wolf-spirit-fourth-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Razor/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientMultiplierParameterId: "lightning-fang-wolf-spirit-damage-multiplier",
          coefficientMultiplierSnapshotChecks: [
            { expectedCoefficient: 0.24, talentLevel: 1 },
            { expectedCoefficient: 0.432, talentLevel: 10 }
          ],
          coefficientParameterId: "normal-attack-fourth-hit-damage",
          explanation:
            "The pinned companionDmg4 node multiplies auto[3] normal.hitArr[3] by burst[1] companionDmg and Attack.",
          groupId: "auto",
          parameterIndex: 3,
          snapshotChecks: [
            { expectedCoefficient: 1.36048, talentLevel: 1 },
            { expectedCoefficient: 2.42722, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "dm.normal.hitArr[3] × dm.burst.companionDmg",
          talentSlot: "normal"
        }
      ]
    },
    {
      actionId: "varesa.normal.fiery_passion.high_plunge.follow_up_strike",
      damagePartId: "fiery-passion-high-plunge-with-follow-up-strike",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Varesa/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "fiery-passion-high-plunge-impact-damage",
          explanation:
            "The pinned fphigh node uses auto[15] dm.fp.plunging.high as the Fiery Passion High Plunge Attack term.",
          groupId: "auto",
          parameterIndex: 15,
          snapshotChecks: [
            { expectedCoefficient: 2.794334, talentLevel: 1 },
            { expectedCoefficient: 5.523683, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "dm.fp.plunging.high",
          talentSlot: "normal"
        },
        {
          coefficientParameterId: "rainbow-upon-the-burning-mountain-fiery-passion-impact-bonus",
          explanation:
            "The pinned fpPlungingAddl pre-multiplier maps passive1[1] fpImpact_dmgInc into the same plunge impact's Attack term.",
          groupId: "passive1",
          parameterIndex: 1,
          snapshotChecks: [{ expectedCoefficient: 1.8, talentLevel: 1 }],
          stat: "attack",
          symbol: "dm.passive1.fpImpact_dmgInc",
          talentSlot: "passive"
        }
      ]
    },
    {
      actionId: "zhongli.burst.planet_befall.meteor",
      damagePartId: "planet-befall-meteor",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Zhongli/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "planet-befall-meteor-damage",
          explanation: "The pinned sheet maps burst[0] to Planet Befall's Attack-scaled meteor term.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 4.0108, talentLevel: 1 },
            { expectedCoefficient: 8.9972, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "dm.burst.meteor",
          talentSlot: "burst"
        },
        {
          coefficientParameterId: "dominance-of-earth-meteor-hp-ratio",
          explanation:
            "At ascension 4+, Dominance of Earth adds passive2[2] as an independent max-HP term to this meteor.",
          groupId: "passive2",
          minimumSourceAscension: 4,
          parameterIndex: 2,
          snapshotChecks: [{ expectedCoefficient: 0.33, talentLevel: 1 }],
          stat: "hp",
          symbol: "dm.passive2.burst_",
          talentSlot: "passive"
        }
      ]
    },
    {
      actionId: "aino.burst.precision_hydronic_cooler.water_ball",
      damagePartId: "precision-hydronic-cooler-water-ball",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Aino/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "precision-hydronic-cooler-water-ball-damage",
          explanation: "The pinned sheet maps burst[0] to one Precision Hydronic Cooler water-ball Attack term.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.20112, talentLevel: 1 },
            { expectedCoefficient: 0.362016, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "waterBallDmg",
          talentSlot: "burst"
        },
        {
          coefficientParameterId: "precision-hydronic-cooler-a4-elemental-mastery-ratio",
          explanation:
            "At ascension 4+, the pinned A4 burst_dmgInc adds passive2[0] as an independent Elemental Mastery term.",
          groupId: "passive2",
          minimumSourceAscension: 4,
          parameterIndex: 0,
          snapshotChecks: [{ expectedCoefficient: 0.5, talentLevel: 1 }],
          stat: "elementalMastery",
          symbol: "a4_burst_dmgInc",
          talentSlot: "passive"
        }
      ]
    },
    {
      actionId: "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      damagePartId: "pactsworn-pathclearer-normal-attack-first-hit",
      source: {
        sourcePath: "libs/gi/sheets/src/Characters/Cyno/index.tsx",
        upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
        upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
      },
      terms: [
        {
          coefficientParameterId: "pactsworn-pathclearer-normal-attack-first-hit-damage",
          explanation: "The pinned sheet maps burst[0] to the transformed first normal Attack term.",
          groupId: "burst",
          parameterIndex: 0,
          snapshotChecks: [
            { expectedCoefficient: 0.782832, talentLevel: 1 },
            { expectedCoefficient: 1.547459, talentLevel: 10 }
          ],
          stat: "attack",
          symbol: "burstNormal.hitArr[0]",
          talentSlot: "burst"
        },
        {
          coefficientParameterId: "featherfall-judgment-normal-attack-elemental-mastery-ratio",
          explanation:
            "At ascension 4+, Featherfall Judgment adds passive2[0] as an independent Elemental Mastery term to transformed normal damage.",
          groupId: "passive2",
          minimumSourceAscension: 4,
          parameterIndex: 0,
          snapshotChecks: [{ expectedCoefficient: 1.5, talentLevel: 1 }],
          stat: "elementalMastery",
          symbol: "a4_burstNormal_dmgInc",
          talentSlot: "passive"
        }
      ]
    },
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
          explanation:
            "At ascension 4+, The Weight of Stone adds passive2[0] as an independent Defense term to the mounted attack.",
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
          explanation:
            "At ascension 4+, The Weight of Stone adds passive2[0] as an independent Defense term to the independent attack.",
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
          explanation:
            "The pinned infusion.normal_dmgInc auto[11] is multiplied by the declared pre-hit Bond of Life percentage for the same first normal hit.",
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
          explanation:
            "The pinned infusion.normal_dmgInc auto[11] is multiplied by the declared pre-hit Bond of Life percentage for the same first normal hit.",
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
  ]
} as const satisfies ReviewedMultiScalingEvidenceRegistry

/** Finds the reviewed evidence for one declared multi-scaling damage part. */
export function getReviewedMultiScalingEvidence(
  actionId: string,
  damagePartId: string
): ReviewedMultiScalingEvidenceRecord | undefined {
  return reviewedMultiScalingEvidenceRegistry.records.find(
    (record) => record.actionId === actionId && record.damagePartId === damagePartId
  )
}
