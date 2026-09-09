import type { CharacterCombatCoverage } from "../../combat/types.js"

import { dahliaDefinition } from "./definition.js"

export const dahliaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Dahlia",
      element: dahliaDefinition.element,
      id: "dahlia.burst.radiant_psalter.favonian_favor.shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "radiant-psalter-shield-flat-absorption",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "radiant-psalter-shield-hp-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Dahlia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "mist-ritual-purification-damage",
          id: "mist-ritual-purification",
          snapshotChecks: [
            { expectedCoefficient: 2.328, talentLevel: 1 },
            { expectedCoefficient: 4.1904, talentLevel: 10 }
          ]
        }
      ],
      element: dahliaDefinition.element,
      evaluator: "declared_direct",
      id: "dahlia.skill.mist_ritual_purification",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "mist-ritual-purification-damage",
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
      characterId: "Dahlia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "radiant-psalter-initial-aoe-damage",
          id: "radiant-psalter-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 4.064, talentLevel: 1 },
            { expectedCoefficient: 7.3152, talentLevel: 10 }
          ]
        }
      ],
      element: dahliaDefinition.element,
      evaluator: "declared_direct",
      id: "dahlia.burst.radiant_psalter.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "radiant-psalter-initial-aoe-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Dahlia",
  detail:
    "One Mist-Ritual Purification hit and Radiant Psalter's initial AoE remain verified lower-level Hydro actions but are not selected outputs. The first support metric calculates one Favonian Favor's non-Hydro base absorption as Dahlia's Max HP × burst[2] plus burst[1], before recipient Shield Strength. The second reports C6's fixed 10% Attack Speed granted to the current active character while Favonian Favor is active; its revival clause changes survivability rather than a numeric combat metric. Shield renewal timing, Benediction stacks, and rotation behavior remain outside these outputs.",
  label: dahliaDefinition.name,
  metrics: [
    {
      characterId: "Dahlia",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "radiant-psalter-shield-flat-absorption",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 323.5577, talentLevel: 1 },
          { expectedValue: 711.8809, talentLevel: 10 }
        ]
      },
      id: "dahlia.burst.radiant_psalter.favonian_favor.base_absorption",
      kind: "scalar",
      label: "辉光圣歌 / 西风恩典护盾基础吸收量（非水元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "radiant-psalter-shield-hp-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.0336, talentLevel: 1 },
          { expectedValue: 0.06048, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "dahlia.burst.radiant_psalter.favonian_favor.shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      characterId: "Dahlia",
      id: "dahlia.constellation.6.may_all_rejoice.favonian_favor.attack_speed_bonus",
      kind: "scalar",
      minimumSourceConstellation: 6,
      label: "愿一切欢睦陪伴你 / C6 西风之眷状态下攻击速度提升",
      ratio: 0,
      ratioConstellationBonuses: [{ minimumConstellation: 6, value: 0.1 }],
      recipientRequirements: [],
      semantic: "attack_speed_bonus",
      sourceActionId: "dahlia.burst.radiant_psalter.favonian_favor.shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
