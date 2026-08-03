import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chongyunDefinition } from "./definition.js"

export const chongyunCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Chongyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "first-hit-damage",
          id: "first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.70004, talentLevel: 1 },
            { expectedCoefficient: 1.3838, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "chongyun.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "first-hit",
            elementalApplication: {
              activation: "while_element_overridden",
              icd: { groupId: "chongyun.normal", kind: "standard" }
            },
            elementOverrideTarget: "normal_attack",
            id: "first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Chongyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spirit-blade-chonghuas-layered-frost-damage",
          id: "spirit-blade-chonghuas-layered-frost",
          snapshotChecks: [
            { expectedCoefficient: 1.7204, talentLevel: 1 },
            { expectedCoefficient: 3.09672, talentLevel: 10 }
          ]
        }
      ],
      element: chongyunDefinition.element,
      evaluator: "declared_direct",
      id: "chongyun.skill.spirit_blade_chonghuas_layered_frost",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "spirit-blade-chonghuas-layered-frost-damage",
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
      characterId: "Chongyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spirit-blade-cloud-parting-star-single-blade-damage",
          id: "spirit-blade-cloud-parting-star-single-blade",
          snapshotChecks: [
            { expectedCoefficient: 1.424, talentLevel: 1 },
            { expectedCoefficient: 2.5632, talentLevel: 10 }
          ]
        }
      ],
      element: chongyunDefinition.element,
      evaluator: "declared_direct",
      id: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "spirit-blade-cloud-parting-star-single-blade-damage",
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
  characterId: "Chongyun",
  metrics: [
    {
      actionId: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      characterId: "Chongyun",
      id: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      kind: "damage",
      label: "灵刃·云开星落 / 单枚灵刃（C0、无反应）",
      sourceActionId: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Cloud-Parting Star blade is the selected C0, no-reaction, attack-scaling Cryo damage metric. It uses the burst's first parameter (142.4% ATK at talent level 1; 256.32% at level 10). The first normal hit and one Spirit Blade: Chonghua's Layered Frost hit are separately verified. Chonghua's Frost Field is a source-locked Cryo normal-attack override for eligible melee weapons when its active effect is selected. The selected metric excludes the other two C0 burst blades, the C6 fourth blade and bonus, field infusion, passives, constellations, elemental aura and reactions, external buffs, timing, and rotation behavior.",
  effects: [
    {
      durationChecks: [
        { expectedCoefficient: 15, talentLevel: 1 },
        { expectedCoefficient: 15, talentLevel: 10 }
      ],
      durationParameter: {
        groupId: "skill",
        id: "frost-field-duration",
        parameterIndex: 2,
        source: "talent",
        talentSlot: "skill"
      },
      eligibleWeaponTypes: ["sword", "claymore", "polearm"],
      element: "cryo",
      id: "chongyun.skill.chonghuas_frost_field",
      label: "灵刃·重华叠霜 / 领域附魔",
      sourceCharacterId: "Chongyun",
      target: "normal_attack"
    }
  ],
  label: chongyunDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
