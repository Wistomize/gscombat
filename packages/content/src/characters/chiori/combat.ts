import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chioriDefinition } from "./definition.js"

export const chioriCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.494104, talentLevel: 1 },
            { expectedCoefficient: 0.976718, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "chiori.normal.auto.first_hit",
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
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          id: "tamoto-attack",
          scalingTerms: [
            {
              coefficientParameterId: "tamoto-attack-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.8208, talentLevel: 1 },
                { expectedCoefficient: 1.47744, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "tamoto-attack-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.026, talentLevel: 1 },
                { expectedCoefficient: 1.8468, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: chioriDefinition.element,
      evaluator: "declared_direct",
      id: "chiori.skill.fluttering_hasode.tamoto_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tamoto-attack-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "tamoto-attack-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          id: "hiyoku-twin-blades",
          scalingTerms: [
            {
              coefficientParameterId: "hiyoku-twin-blades-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 2.5632, talentLevel: 1 },
                { expectedCoefficient: 4.61376, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "hiyoku-twin-blades-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 3.204, talentLevel: 1 },
                { expectedCoefficient: 5.7672, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: chioriDefinition.element,
      evaluator: "declared_direct",
      id: "chiori.burst.hiyoku_twin_blades",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hiyoku-twin-blades-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "hiyoku-twin-blades-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "normal",
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "c6-tailor-made-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.494104, talentLevel: 1 },
            { expectedCoefficient: 0.976718, talentLevel: 10 }
          ]
        }
      ],
      element: chioriDefinition.element,
      evaluator: "declared_direct",
      id: "chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit",
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
          id: "c6-tailor-made-normal-attack-current",
          label: "C6 万理一空：已触发量体裁衣后续效果并进行普通攻击",
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
              parameterId: "c6-tailor-made-normal-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-tailor-made-normal-attack-first-hit",
            id: "c6-tailor-made-normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "chiori.constellation.6.sole_principle_pursuit.normal_attack.defense_additive_damage",
      label: "万理一空 · C6 触发量体裁衣后续效果后普通攻击伤害追加235%防御力",
      source: { characterId: "Chiori", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit"],
        attackKinds: ["normal"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 2.35 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "defense"
      }
    }
  ],
  characterId: "Chiori",
  metrics: [
    {
      actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      characterId: "Chiori",
      id: "chiori.skill.fluttering_hasode.single_tamoto_attack",
      kind: "damage",
      label: "羽袖一触 / 单个「袖」单次攻击",
      sourceActionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      characterId: "Chiori",
      id: "chiori.skill.fluttering_hasode.coordinated_tamoto_attack",
      kind: "damage",
      label: "羽袖一触 / 单次协同攻击",
      sourceActionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chiori.burst.hiyoku_twin_blades",
      characterId: "Chiori",
      id: "chiori.burst.hiyoku_twin_blades",
      kind: "damage",
      label: "二刀之形·比翼 / 技能伤害",
      sourceActionId: "chiori.burst.hiyoku_twin_blades",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit",
      characterId: "Chiori",
      id: "chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "万理一空 / C6 裁锦岩附魔普通攻击首段（235%防御力加算，无反应）",
      sourceActionId: "chiori.constellation.6.sole_principle_pursuit.tailor_made.normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile verifies one dual-scaling Tamoto attack, its same-damage coordinated trigger, and Hiyoku: Twin Blades. C6's dedicated Tailor-Made action is zero through C5 and, at C6, evaluates one first Normal Attack hit after Chiori triggers Tailor-Made's follow-up and receives its Geo infusion: the normal talent's Attack coefficient plus 235% of final Defense in the same base-damage stage. The fixed 7.0 Simplified Chinese constellation text applies this Defense addition only to Normal Attacks, not Charged or Plunging Attacks. Its 12-second Skill cooldown reduction changes frequency and is outside this single-hit metric. Tamoto count still depends on Geo constructs and constellations; timing, other passives, reactions, and other character states remain in progress.",
  label: chioriDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
