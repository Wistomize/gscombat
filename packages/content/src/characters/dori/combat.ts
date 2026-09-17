import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { doriDefinition } from "./definition.js"

export const doriCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("dori", 2),
    ...declareWeaponHitCapabilities(doriDefinition),
    declareHitCapability("dori.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["electro"]),
  ],
  actions: [
    {
      characterId: "Dori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.90214, talentLevel: 1 },
            { expectedCoefficient: 1.7833, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "dori.normal.auto.first_hit",
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
      attackKind: "normal",
      characterId: "Dori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "c6-electro-infused-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.90214, talentLevel: 1 },
            { expectedCoefficient: 1.7833, talentLevel: 10 }
          ]
        }
      ],
      element: doriDefinition.element,
      evaluator: "declared_direct",
      id: "dori.constellation.6.sprinkling_weight.electro_normal.first_hit",
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
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-electro-infusion-ready",
          label: "C6 漫掷万镒：施放元素战技后3秒内的雷元素附魔",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-electro-infusion-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-electro-infused-normal-attack-first-hit",
            hitCount: { kind: "scenario_parameter", parameterId: "c6-electro-infusion-ready" },
            id: "c6-electro-infused-normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Dori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "troubleshooter-cannon-initial-shot-damage",
          id: "troubleshooter-cannon-initial-shot",
          snapshotChecks: [
            { expectedCoefficient: 1.4728, talentLevel: 1 },
            { expectedCoefficient: 2.65104, talentLevel: 10 }
          ]
        }
      ],
      element: doriDefinition.element,
      evaluator: "declared_direct",
      id: "dori.skill.spirit_warding_lamp_troubleshooter_cannon.initial_shot",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "troubleshooter-cannon-initial-shot-damage",
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
      characterId: "Dori",
      element: doriDefinition.element,
      id: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "jinni-continuous-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "jinni-continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Dori",
  metrics: [
    {
      actionId: "dori.constellation.6.sprinkling_weight.electro_normal.first_hit",
      characterId: "Dori",
      id: "dori.constellation.6.sprinkling_weight.electro_normal.first_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "漫掷万镒 / C6 雷元素附魔普通攻击第一段（无反应）",
      sourceActionId: "dori.constellation.6.sprinkling_weight.electro_normal.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Dori",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "jinni-continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 641.97955, talentLevel: 1 },
          { expectedValue: 1412.4622, talentLevel: 10 }
        ]
      },
      id: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "卡萨扎莱宫的无微不至 / 镇灵单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "jinni-continuous-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.0667, talentLevel: 1 },
          { expectedValue: 0.12006, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为与镇灵相连的当前场上角色" }
      ],
      recipientIncomingHealingBonuses: [
        {
          label: "特许经营 · C4 与镇灵相连且生命值不高于50%时受治疗加成",
          minimumSourceConstellation: 4,
          recipientRequirement: {
            comparison: "at_most",
            kind: "recipient_hp_fraction",
            label: "受治疗角色当前生命值不高于50%",
            threshold: 0.5
          },
          value: 0.5
        }
      ],
      scalingStat: "hp",
      sourceActionId: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Dori",
      id: "dori.constellation.6.sprinkling_weight.normal_attack.nearby_party.healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "漫掷万镒 / C6 普通攻击命中附近队伍治疗量",
      minimumSourceConstellation: 6,
      ratio: 0.04,
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为普通攻击命中时附近的队伍角色" }
      ],
      scalingStat: "hp",
      sourceActionId: "dori.constellation.6.sprinkling_weight.electro_normal.first_hit",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One initial Spirit-Warding Lamp: Troubleshooter Cannon shot remains a verified lower-level damage action. The selected support metric is one Jinni healing tick for the current on-field character linked to Jinni: Dori's max HP × burst[1] + burst[2], then Dori's Healing Bonus and that recipient's Incoming Healing Bonus. The pinned 6.7 snapshot gives burst[1] as 0.0667 at Talent Level 1 and 0.12006 at Level 10, and burst[2] as 641.97955 and 1412.4622; C3 adds three Burst levels. At C4, a linked recipient at or below 50% HP receives the declared 50% Incoming Healing Bonus; the Energy Recharge branch remains outside healing. At C6, dedicated metrics expose the first Normal Attack hit during the three-second post-Skill Electro infusion and that hit's nearby-party healing equal to 4% of Dori's maximum HP before healing modifiers. Trigger cadence and multi-recipient aggregation are not inferred. The Jinni metric emits no damage or reaction event and excludes connector damage, Elemental Energy restoration, duration and tick count, external effects, timing, and all other character states.",
  label: doriDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
