import type { CharacterCombatCoverage } from "../../combat/types.js"

import { skirkDefinition } from "./definition.js"

const skirkC6RetaliationActionId = "skirk.constellation.6.to_the_source.damage_taken_retaliation.three_hits"
const skirkC1CrystalBladeActionId = "skirk.constellation.1.far_to_fall.void_rift.crystal_blade"

export const skirkCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.54524, talentLevel: 1 },
            { expectedCoefficient: 1.0778, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "skirk.normal.auto.first_hit",
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
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "seven-phase-flash-normal-attack-fifth-hit-damage",
          id: "seven-phase-flash-normal-attack-fifth-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.966244, talentLevel: 1 },
            { expectedCoefficient: 3.886761, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "seven-phase-flash-normal-attack-fifth-hit-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [3],
          defaultValue: 3,
          id: "a4-deaths-crossing-stack-count",
          label: "固有天赋 · 返至湮灭：满3层死河渡断",
          maximumValue: 3,
          minimumValue: 3
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "a4-deaths-crossing-stack-count",
              values: [{ multiplier: 1.7, parameterValue: 3 }]
            },
            damagePartId: "seven-phase-flash-normal-attack-fifth-hit",
            id: "seven-phase-flash-normal-attack-fifth-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "havoc-ruin-slash-damage",
          id: "havoc-ruin-slash",
          snapshotChecks: [
            { expectedCoefficient: 1.2276, talentLevel: 1 },
            { expectedCoefficient: 2.20968, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: "skirk.burst.havoc_ruin.slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "havoc-ruin-slash-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [3],
          defaultValue: 3,
          id: "a4-deaths-crossing-stack-count",
          label: "固有天赋 · 返至湮灭：满3层死河渡断",
          maximumValue: 3,
          minimumValue: 3
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "a4-deaths-crossing-stack-count",
              values: [{ multiplier: 1.6, parameterValue: 3 }]
            },
            damagePartId: "havoc-ruin-slash",
            id: "havoc-ruin-slash",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "seven-phase-flash-normal-attack-fifth-hit-damage",
          id: "damage-taken-retaliation",
          snapshotChecks: [
            { expectedCoefficient: 1.966244, talentLevel: 1 },
            { expectedCoefficient: 3.886761, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: skirkC6RetaliationActionId,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "seven-phase-flash-normal-attack-fifth-hit-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-damage-taken-retaliation-ready",
          label: "C6 至源：七相闪期间受伤并消耗1层湮灭·裂解",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-damage-taken-retaliation-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "damage-taken-retaliation",
            hitCount: 3,
            id: "damage-taken-retaliation-three-hits",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "seven-phase-flash-normal-attack-fifth-hit-damage",
          id: "void-rift-crystal-blade",
          snapshotChecks: [
            { expectedCoefficient: 1.966244, talentLevel: 1 },
            { expectedCoefficient: 3.886761, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: skirkC1CrystalBladeActionId,
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "seven-phase-flash-normal-attack-fifth-hit-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c1-void-rift-absorbed",
          label: "C1 远落：通过固有天赋吸收一个虚境裂隙",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 1, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c1-void-rift-absorbed",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "void-rift-crystal-blade",
            id: "void-rift-crystal-blade",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.2.into_the_abyss.after_havoc_extinction.attack_percent",
      label: "入渊 · C2 施放湮灭·断后七相闪期间攻击力提高70%",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: {
        actionIds: [
          "skirk.skill.seven_phase_flash.normal.fifth_hit",
          skirkC1CrystalBladeActionId,
          skirkC6RetaliationActionId
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.7 }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.4.fractured_flow.maximum_deaths_crossing.attack_percent",
      label: "断流 · C4 满3层死河渡断（攻击力提高40%）",
      source: {
        characterId: "Skirk",
        kind: "character",
        minimumSourceAscension: 4,
        minimumSourceConstellation: 4
      },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.1.far_to_fall.void_rift.crystal_blade.damage",
      label: "远落 · C1 吸收虚境裂隙召唤晶刃（500%攻击力冰元素重击伤害）",
      source: {
        characterId: "Skirk",
        kind: "character",
        minimumSourceAscension: 1,
        minimumSourceConstellation: 1
      },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: [skirkC1CrystalBladeActionId], recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 5 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.damage_taken_retaliation.damage",
      label: "至源 · C6 七相闪期间受伤反击（三段，每段180%攻击力冰元素重击伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: [skirkC6RetaliationActionId], recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 1.8 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.seven_phase_flash.fifth_hit.first_coordinated_attack",
      label: "至源 · C6 七相闪第五段命中时消耗1层湮灭·裂解（第一段协同攻击，180%攻击力冰元素普攻伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.skill.seven_phase_flash.normal.fifth_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 3.06 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "normal"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.seven_phase_flash.fifth_hit.second_coordinated_attack",
      label: "至源 · C6 七相闪第五段命中时消耗1层湮灭·裂解（第二段协同攻击，180%攻击力冰元素普攻伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.skill.seven_phase_flash.normal.fifth_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 3.06 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "normal"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.seven_phase_flash.fifth_hit.third_coordinated_attack",
      label: "至源 · C6 七相闪第五段命中时消耗1层湮灭·裂解（第三段协同攻击，180%攻击力冰元素普攻伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.skill.seven_phase_flash.normal.fifth_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 3.06 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "normal"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.havoc_ruin.maximum_sever_stacks.first_coordinated_attack",
      label: "至源 · C6 湮灭·尽消耗满层3层湮灭·裂解（第一段750%攻击力冰元素爆发伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.burst.havoc_ruin.slash"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 12 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "burst"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.havoc_ruin.maximum_sever_stacks.second_coordinated_attack",
      label: "至源 · C6 湮灭·尽消耗满层3层湮灭·裂解（第二段750%攻击力冰元素爆发伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.burst.havoc_ruin.slash"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 12 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "burst"
      }
    },
    {
      activation: "maximum_reachable",
      id: "skirk.constellation.6.to_the_source.havoc_ruin.maximum_sever_stacks.third_coordinated_attack",
      label: "至源 · C6 湮灭·尽消耗满层3层湮灭·裂解（第三段750%攻击力冰元素爆发伤害）",
      source: { characterId: "Skirk", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["skirk.burst.havoc_ruin.slash"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 12 },
        element: "cryo",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "burst"
      }
    }
  ],
  characterId: "Skirk",
  metrics: [
    {
      actionId: skirkC1CrystalBladeActionId,
      characterId: "Skirk",
      id: skirkC1CrystalBladeActionId,
      kind: "damage",
      minimumSourceConstellation: 1,
      label: "远落 / C1 吸收一个虚境裂隙的晶刃伤害",
      sourceActionId: skirkC1CrystalBladeActionId,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "skirk.burst.havoc_ruin.slash",
      characterId: "Skirk",
      id: "skirk.burst.havoc_ruin.slash",
      kind: "damage",
      label: "湮灭·尽 / 斩击单段（满3层死河渡断；C6自动追加满3层协同攻击）",
      sourceActionId: "skirk.burst.havoc_ruin.slash",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: skirkC6RetaliationActionId,
      characterId: "Skirk",
      id: skirkC6RetaliationActionId,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "至源 / C6 七相闪受伤反击三段总伤害",
      sourceActionId: skirkC6RetaliationActionId,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      characterId: "Skirk",
      id: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      kind: "damage",
      label: "七相闪 / 第五段普攻（无反应；C6自动追加三段协同攻击）",
      sourceActionId: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit remains a verified raw action. The maintained Seven-Phase Flash metric is the fifth normal hit at the maximum three Death's Crossing stacks, so Return to Oblivion multiplies it to 170% of its original damage. C2's post-Havoc: Extinction window adds 70% Attack, and C4 adds 40% Attack at the same three-stack snapshot. At C6, the fifth hit consumes one Havoc: Sever stack and adds three coordinated Normal Attack hits; each starts at 180% Attack and inherits the maintained 170% original-damage multiplier, producing 306% Attack before shared multipliers. The Havoc: Ruin metric includes one slash at the maximum 160% Return to Oblivion multiplier and, at C6 with three Sever stacks, three coordinated Burst hits whose 750% coefficients likewise become 1200% each. A third C6 metric covers the damage-taken branch: three 180%-Attack Cryo hits treated as Charged Attack damage, together with its 80% incoming-damage reduction stated only as trigger context. These are fixed maximum source-action snapshots rather than a stack-generation or full-rotation model. Target aura, Melt, Freeze, other Seven-Phase Flash hits, and timing remain outside the selected metrics.",
  label: skirkDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
