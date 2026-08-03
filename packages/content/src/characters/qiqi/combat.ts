import type { CharacterCombatCoverage } from "../../combat/types.js"

import { qiqiDefinition } from "./definition.js"

export const qiqiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "adeptus-art-preserver-of-fortune-initial-hit-damage",
          id: "adeptus-art-preserver-of-fortune-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.848, talentLevel: 1 },
            { expectedCoefficient: 5.1264, talentLevel: 10 }
          ]
        }
      ],
      element: qiqiDefinition.element,
      evaluator: "declared_direct",
      id: "qiqi.burst.adeptus_art_preserver_of_fortune.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "adeptus-art-preserver-of-fortune-initial-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "herald-of-frost-initial-hit-damage",
          id: "herald-of-frost-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.96, talentLevel: 1 },
            { expectedCoefficient: 1.728, talentLevel: 10 }
          ]
        }
      ],
      element: qiqiDefinition.element,
      evaluator: "declared_direct",
      id: "qiqi.skill.adeptus_art_herald_of_frost.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "herald-of-frost-initial-hit-damage",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Qiqi",
      element: qiqiDefinition.element,
      id: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-percentage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Qiqi",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.37754, talentLevel: 1 },
            { expectedCoefficient: 0.7463, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "qiqi.normal.auto.first_hit",
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
    }
  ],
  characterId: "Qiqi",
  metrics: [
    {
      characterId: "Qiqi",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 450.5507, talentLevel: 1 },
          { expectedValue: 991.2866, talentLevel: 10 }
        ]
      },
      id: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "仙法·寒病鬼差 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "skill",
          id: "herald-of-frost-continuous-regeneration-percentage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.696, talentLevel: 1 },
          { expectedValue: 1.2528, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "当前场上受治疗角色处于寒病鬼差的持续跟随范围内" }
      ],
      scalingStat: "attack",
      sourceActionId: "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "Adeptus Art: Preserver of Fortune's initial hit and one initial Herald of Frost skill hit are verified as baseline attack-scaling Cryo hits. Their raw parameter bindings are locked to the pinned 6.7 Genshin Optimizer localization encoding: Preserver of Fortune Skill DMG is burst[2] (2.848 at talent level one and 5.1264 at level ten), while Herald of Frost Skill DMG is skill[7] (0.96 and 1.728). The selected support metric verifies one Herald of Frost continuous-regeneration tick as Qiqi's ATK times skill[2] plus skill[3], then Qiqi's Healing Bonus and the selected active recipient's Incoming Healing Bonus; skill[2] is 0.696 and 1.2528, and skill[3] is 450.5507 and 991.2866. It requires the selected current on-field recipient to be within the Herald's follow range and emits no damage or reaction event. It excludes the Normal/Charged-Attack on-hit party healing, the burst Fortune-Preserving Talisman healing that requires a marked opponent to take damage, Herald follow-up and coordinated attacks, duration and timing, the A1 reaction-based Incoming Healing Bonus, passive talisman chance, C1 Energy, C6 revival, elemental infusions, reactions, and other character states.",
  label: qiqiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
