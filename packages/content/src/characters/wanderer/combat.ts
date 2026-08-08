import type { CharacterCombatCoverage } from "../../combat/types.js"

import { wandererDefinition } from "./definition.js"

export const wandererCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Wanderer",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.68714, talentLevel: 1 },
            { expectedCoefficient: 1.3583, talentLevel: 10 }
          ]
        }
      ],
      element: wandererDefinition.element,
      evaluator: "declared_direct",
      id: "wanderer.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Wanderer",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "hanega-song-of-the-wind-skill-damage",
          id: "hanega-song-of-the-wind-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.952, talentLevel: 1 },
            { expectedCoefficient: 1.7136, talentLevel: 10 }
          ]
        }
      ],
      element: wandererDefinition.element,
      evaluator: "declared_direct",
      id: "wanderer.skill.hanega_song_of_the_wind.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "hanega-song-of-the-wind-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Wanderer",
      damageKind: "direct",
      damageParts: [
        {
          id: "windfavored-normal-attack-first-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "windfavored-normal-attack-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.329825, talentLevel: 1 },
                { expectedCoefficient: 1.5372, talentLevel: 10 }
              ],
              coefficientParameterId: "normal-attack-first-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.68714, talentLevel: 1 },
                { expectedCoefficient: 1.3583, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: wandererDefinition.element,
      evaluator: "declared_direct",
      id: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "windfavored-normal-attack-damage-multiplier",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  characterId: "Wanderer",
  metrics: [
    {
      actionId: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
      characterId: "Wanderer",
      id: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
      kind: "damage",
      label: "羽画·风姿华歌 / 风行状态普攻一段（C0，无反应）",
      sourceActionId: "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Hanega: Song of the Wind initial AoE remain verified raw C0 attack-scaling Anemo hits. The selected metric is one Normal Attack first hit during Windfavored: auto[0] times skill[1] times Attack, where auto[0] is 68.714% at Normal Talent Level 1 and 135.83% at Level 10, while skill[1] is the Windfavored Normal Attack multiplier of 132.9825% at Skill Level 1 and 153.72% at Level 10. It does not preset a target aura or reaction. Kuugo attacks, Kuugoryoku point consumption, absorption-related passives, external infusion, reactions, timing, constellations, external effects, and other character states remain unmodeled.",
  label: wandererDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
