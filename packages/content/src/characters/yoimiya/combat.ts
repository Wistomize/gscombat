import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yoimiyaDefinition } from "./definition.js"

export const yoimiyaCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("yoimiya", 2),
    ...declareWeaponHitCapabilities(yoimiyaDefinition),
    declareHitCapability("yoimiya.kit.skill_burst_hits", "战技/爆发直接命中准备", ["burst"], ["pyro"]),
  ],
  actions: [
    {
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.3564, talentLevel: 1 },
            { expectedCoefficient: 0.63585, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "yoimiya.normal.auto.first_hit",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          id: "niwabi-fire-dance-fifth-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.37909, talentLevel: 1 },
                { expectedCoefficient: 1.61744, talentLevel: 10 }
              ],
              coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.05864, talentLevel: 1 },
                { expectedCoefficient: 1.88871, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "niwabi-fire-dance-fifth-hit-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "niwabi-fire-dance-normal-damage-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          id: "niwabi-fire-dance-fifth-hit",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.37909, talentLevel: 1 },
                { expectedCoefficient: 1.61744, talentLevel: 10 }
              ],
              coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.05864, talentLevel: 1 },
                { expectedCoefficient: 1.88871, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "niwabi-fire-dance-fifth-hit-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "niwabi-fire-dance-normal-damage-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ryukin-saxifrage-skill-damage",
          id: "ryukin-saxifrage-initial-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.272, talentLevel: 1 },
            { expectedCoefficient: 2.2896, talentLevel: 10 }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.burst.ryukin_saxifrage.initial_arrow",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "ryukin-saxifrage-skill-damage",
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
      attackKind: "normal",
      characterId: "Yoimiya",
      damageKind: "direct",
      damageParts: [
        {
          id: "c6-niwabi-fire-dance-fifth-hit-blazing-arrow",
          scalingTerms: [
            {
              coefficientMultiplierParameterId: "niwabi-fire-dance-normal-damage-multiplier",
              coefficientMultiplierSnapshotChecks: [
                { expectedCoefficient: 1.37909, talentLevel: 1 },
                { expectedCoefficient: 1.61744, talentLevel: 10 }
              ],
              coefficientParameterId: "niwabi-fire-dance-fifth-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.05864, talentLevel: 1 },
                { expectedCoefficient: 1.88871, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: yoimiyaDefinition.element,
      evaluator: "declared_direct",
      id: "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "niwabi-fire-dance-fifth-hit-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "niwabi-fire-dance-normal-damage-multiplier",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-naganohara-meteor-swarm-ready",
          label: "C6 长野原龙势流星群：焰硝庭火舞普攻追加琉金火光的期望伤害",
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
              parameterId: "c6-naganohara-meteor-swarm-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0.6, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-niwabi-fire-dance-fifth-hit-blazing-arrow",
            id: "c6-niwabi-fire-dance-fifth-hit-blazing-arrow",
            expectedTriggerProbability: 0.5,
            minimumSourceConstellation: 6,
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
      id: "yoimiya.constellation.1.agate_ryukin.aurous_blaze_enemy_defeated.attack_percent",
      label: "赤玉琉金 · C1 宵宫自己的琉金火光影响敌人被击败后（攻击力提高20%，20秒）",
      source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "yoimiya.constellation.2.a_procession_of_jewels.pyro_critical_hit.pyro_damage_bonus",
      label: "万灯送火 · C2 火元素伤害暴击后火元素伤害加成（25%，6秒）",
      source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Yoimiya",
  metrics: [
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      characterId: "Yoimiya",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      kind: "damage",
      label: "焰硝庭火舞 / 第五段普攻·水底蒸发",
      sourceActionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      characterId: "Yoimiya",
      id: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      kind: "damage",
      label: "焰硝庭火舞 / 第五段普攻·冰底融化",
      sourceActionId: "yoimiya.normal.niwabi_fire_dance.fifth_hit.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction",
      characterId: "Yoimiya",
      id: "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "长野原龙势流星群 / 第五段追加琉金火光期望伤害（无反应）",
      sourceActionId: "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and Ryuukin Saxifrage's initial firework arrow remain verified baseline direct hits. The selected core action is one fifth normal-attack hit while Niwabi Fire-Dance is active: Attack × auto[4] × skill[3]. The pinned 6.7 snapshot gives auto[4] as 1.05864 at Normal Attack Level 1 and 1.88871 at Level 10, and skill[3] as the Niwabi Fire-Dance normal-damage multiplier, 1.37909 at Skill Level 1 and 1.61744 at Level 10. Two mutually exclusive target-aura alternatives reuse this exact one hit: Hydro aura uses Pyro-on-Hydro Vaporize and Cryo aura uses Pyro-on-Cryo Melt. C6 exposes one separate no-reaction expected-damage metric for the extra Blazing Arrow: 50% trigger probability × 60% original normal-attack damage = 30% of the corresponding fifth hit. It deliberately does not multiply that expected arrow by Vaporize or Melt, because the extra arrow shares the normal-attack ICD and changes the reaction sequence rather than inheriting the selected hit's reaction. C1 can be selected only after an enemy affected by Yoimiya's own Aurous Blaze was defeated during that mark's duration; it adds 20% Attack for the following 20 seconds. C2 can be selected after Yoimiya's Pyro damage critically hits and adds 25% Pyro Damage Bonus. Target count, the Aurous Blaze mark and transfer, the complete normal-attack ICD sequence, burst explosions, passives, external effects, and rotation behavior remain outside these single-event metrics.",
  label: yoimiyaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
