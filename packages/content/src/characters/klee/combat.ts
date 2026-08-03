import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kleeDefinition } from "./definition.js"

export const kleeCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7216, talentLevel: 1 },
            { expectedCoefficient: 1.29888, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.normal.auto.first_hit",
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
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "jumpy-dumpty-damage",
          id: "jumpy-dumpty-single-bounce",
          snapshotChecks: [
            { expectedCoefficient: 0.952, talentLevel: 1 },
            { expectedCoefficient: 1.7136, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.skill.jumpy_dumpty.single_bounce",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "jumpy-dumpty-damage",
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
      attackKind: "charged",
      characterId: "Klee",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 1.5736, talentLevel: 1 },
            { expectedCoefficient: 2.83248, talentLevel: 10 }
          ]
        }
      ],
      element: kleeDefinition.element,
      evaluator: "declared_direct",
      id: "klee.normal.charged_attack.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3],
          defaultValue: 0,
          id: "boom-badge-count",
          label: "轰轰勋章数量",
          maximumValue: 3,
          minimumValue: 0
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
              parameterId: "boom-badge-count",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.15, parameterValue: 1 },
                { multiplier: 1.3, parameterValue: 2 },
                { multiplier: 1.5, parameterValue: 3 }
              ]
            },
            damagePartId: "charged-attack",
            elementalApplication: { icd: { kind: "none" } },
            id: "charged-attack",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  characterId: "Klee",
  actionEffects: [
    {
      actionParameterId: "boom-badge-count",
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "klee.locked_passive.spark_magic.three_boom_badges.original_damage_multiplier",
      label: "魔女的前夜礼·火花魔法 · 3枚轰轰勋章使嘭嘭轰击造成原本150%伤害",
      source: { characterId: "Klee", kind: "character" },
      target: "actionParameter",
      targetFilter: { actionIds: ["klee.normal.charged_attack.single_hit"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 3 }
    },
    {
      activation: "active",
      id: "klee.constellation.1.chained_reactions.spark_triggered.attack_percent",
      label: "连环轰隆 · C1 火花已触发后（攻击力提高60%，12秒）",
      source: { characterId: "Klee", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "klee.constellation.2.sparkling_burst.enemy_defense_reduction",
      label: "目标减防已生效：蹦蹦炸弹诡雷爆炸命中后 · C2 防御力降低（23%，10秒；不作用于触发命中）",
      source: { characterId: "Klee", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.23 }
    }
  ],
  metrics: [
    {
      actionId: "klee.normal.charged_attack.single_hit",
      characterId: "Klee",
      id: "klee.normal.charged_attack.single_hit",
      kind: "damage",
      label: "砰砰礼物 / 重击单次命中·水底蒸发",
      sourceActionId: "klee.normal.charged_attack.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected metric is one charged-attack hit with dynamic Vaporize from an explicit Hydro aura. Spark Magic now resolves the maximum three Boom Badges as an independent 150% original-damage multiplier under Hexerei: Secret Rite. C1 and C2 remain explicit snapshots; mines, remaining bounces, burst recurrence, timing, and other constellations remain unmodeled.",
  label: kleeDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
