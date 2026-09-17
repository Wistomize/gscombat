import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chongyunDefinition } from "./definition.js"

export const chongyunCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("chongyun", 2),
    ...declareWeaponHitCapabilities(chongyunDefinition),
    declareHitCapability("chongyun.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["cryo"]),
  ],
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
    },
    {
      characterId: "Chongyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spirit-blade-cloud-parting-star-single-blade-damage",
          id: "spirit-blade-cloud-parting-star-full-cast",
          snapshotChecks: [
            { expectedCoefficient: 1.424, talentLevel: 1 },
            { expectedCoefficient: 2.5632, talentLevel: 10 }
          ]
        }
      ],
      element: chongyunDefinition.element,
      evaluator: "declared_direct",
      id: "chongyun.burst.spirit_blade_cloud_parting_star.full_cast",
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
      scenarioParameters: [
        {
          allowedValues: [3, 4],
          defaultValue: 3,
          id: "cloud-parting-star-blade-count",
          label: "灵刃·云开星落本次落下的灵刃数量",
          maximumValue: 3,
          minimumValue: 3,
          rangeBySourceConstellation: [
            { defaultValue: 4, maximumValue: 4, minimumSourceConstellation: 6, minimumValue: 4 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "spirit-blade-cloud-parting-star-full-cast",
            hitCount: { kind: "scenario_parameter", parameterId: "cloud-parting-star-blade-count" },
            id: "spirit-blade-cloud-parting-star-full-cast",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "chongyun.constellation.6.gallant_journey.cloud_parting_star.damage_bonus",
      label: "四灵捧圣 · C6 目标生命值百分比低于重云时，灵刃·云开星落伤害提高15%",
      source: { characterId: "Chongyun", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
          "chongyun.burst.spirit_blade_cloud_parting_star.full_cast"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Chongyun",
  metrics: [
    {
      actionId: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      characterId: "Chongyun",
      id: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      kind: "damage",
      label: "灵刃·云开星落 / 单枚灵刃（无反应）",
      sourceActionId: "chongyun.burst.spirit_blade_cloud_parting_star.single_blade",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chongyun.burst.spirit_blade_cloud_parting_star.full_cast",
      characterId: "Chongyun",
      id: "chongyun.burst.spirit_blade_cloud_parting_star.full_cast",
      kind: "damage",
      label: "灵刃·云开星落 / 本次完整落剑总伤害（C6 自动由3枚变为4枚）",
      sourceActionId: "chongyun.burst.spirit_blade_cloud_parting_star.full_cast",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Cloud-Parting Star blade and the complete cast are selected no-reaction, attack-scaling Cryo metrics. Each blade uses the burst's first parameter (142.4% ATK at talent level 1; 256.32% at level 10). The complete cast contains three blades through C5 and automatically contains the fourth blade at C6. At C6, its 15% damage bonus is an explicit snapshot selected only when the target's current HP percentage is lower than Chongyun's. The first normal hit and one Spirit Blade: Chonghua's Layered Frost hit are separately verified. Chonghua's Frost Field is a source-locked Cryo normal-attack override for eligible melee weapons when its active effect is selected. Field infusion, elemental aura and reactions, external buffs, timing, and rotation behavior remain unmodeled.",
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
