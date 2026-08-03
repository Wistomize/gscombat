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
    "One Mist-Ritual Purification hit and Radiant Psalter's initial AoE remain verified lower-level C0 attack-scaling Hydro damage actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but neither is selected as Dahlia's display output. The selected support metric calculates one Favonian Favor's non-Hydro base absorption delivered to one friendly recipient as Dahlia's Max HP × burst[2] plus burst[1], before that recipient's Shield Strength; C3 adds three Burst levels. It excludes the 250% Hydro-damage absorption branch, shield duration and renewal timing, Benediction/Favonian Favor stack behavior, A1/A4 effects, C2's replacement shield, all other constellations, external effects, and rotation behavior.",
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
      label: "辉光圣歌 / 西风恩典护盾基础吸收量（C0、非水元素伤害）",
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
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
