import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xinyanDefinition } from "./definition.js"

export const xinyanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sweeping-fervor-swing-damage",
          id: "sweeping-fervor-swing-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.696, talentLevel: 1 },
            { expectedCoefficient: 3.0528, talentLevel: 10 }
          ]
        }
      ],
      element: xinyanDefinition.element,
      evaluator: "declared_direct",
      id: "xinyan.skill.sweeping_fervor.swing",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sweeping-fervor-swing-damage",
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
      characterId: "Xinyan",
      element: xinyanDefinition.element,
      id: "xinyan.skill.sweeping_fervor.level_three_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-defense-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-flat-absorption",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "riff-revolution-skill-damage",
          id: "riff-revolution-initial-strum",
          snapshotChecks: [
            { expectedCoefficient: 3.408, talentLevel: 1 },
            { expectedCoefficient: 6.1344, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xinyan.burst.riff_revolution.initial_strum",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "riff-revolution-skill-damage",
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
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7654, talentLevel: 1 },
            { expectedCoefficient: 1.513, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xinyan.normal.auto.first_hit",
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
      attackKind: "charged",
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-looping-damage",
          id: "c6-charged-attack-looping-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.625455, talentLevel: 1 },
            { expectedCoefficient: 1.236364, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-looping-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-charged-attack-current",
          label: "C6 地狱里摇摆 / 当前重击循环命中",
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
              parameterId: "c6-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-charged-attack-looping-hit",
            elementalApplication: { icd: { kind: "none" } },
            id: "c6-charged-attack-looping-hit",
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
      id: "xinyan.constellation.2.impromptu_opening.initial_strum.crit_rate",
      label: "C2 · 开场即兴段：叛逆刮弦初段物理伤害暴击率 +100%",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: {
        actionIds: ["xinyan.burst.riff_revolution.initial_strum"],
        elements: ["physical"]
      },
      value: { kind: "fixed", value: 1 }
    },
    {
      activation: "active",
      id: "xinyan.constellation.4.wildfire_rhythm.sweeping_fervor.physical_resistance_reduction",
      label: "节奏的传染 · C4 热情拂扫已命中目标（物理抗性降低 15%，12秒）",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "automatic",
      id: "xinyan.constellation.6.rockin_in_a_flame.charged_attack.defense_to_flat_attack",
      label: "地狱里摇摆 · C6 重击时基于50%防御力获得攻击力加成",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 6 },
      target: "flatAttack",
      targetFilter: {
        actionIds: ["xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "source_final_defense", multiplier: { kind: "fixed", value: 0.5 } }
    }
  ],
  characterId: "Xinyan",
  metrics: [
    {
      actionId: "xinyan.burst.riff_revolution.initial_strum",
      characterId: "Xinyan",
      id: "xinyan.burst.riff_revolution.initial_strum",
      kind: "damage",
      label: "叛逆刮弦 / 开场单次物理命中（无反应）",
      sourceActionId: "xinyan.burst.riff_revolution.initial_strum",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Xinyan",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-flat-absorption",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 692.8066, talentLevel: 1 },
          { expectedValue: 1524.29, talentLevel: 10 }
        ]
      },
      id: "xinyan.skill.sweeping_fervor.level_three_shield.base_absorption",
      kind: "scalar",
      label: "热情拂扫 / 三级护盾基础吸收量（非火元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-defense-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1.44, talentLevel: 1 },
          { expectedValue: 2.592, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "defense",
      semantic: "shield",
      sourceActionId: "xinyan.skill.sweeping_fervor.level_three_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      actionId: "xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit",
      characterId: "Xinyan",
      id: "xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "地狱里摇摆 / 重击循环单次物理命中（50%防御力转攻击力）",
      sourceActionId: "xinyan.constellation.6.rockin_in_a_flame.charged_attack.looping_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Xinyan remains a hybrid profile: Sweeping Fervor's swing, Riff Revolution's opening Physical strum, and one uninfused normal first hit are verified lower-level actions, while the selected burst metric retains one C0 Physical opening strum against one enemy. The selected shield metric calculates the level-three Sweeping Fervor shield created by hitting three or more enemies: non-Pyro base absorption is Xinyan's Defense × skill[5] plus skill[6], before the recipient's Shield Strength; C3 adds three Skill levels. The 250% Pyro-damage absorption branch is deliberately not merged into this non-Pyro base value. C2 automatically adds 100% Crit Rate only to Riff Revolution's opening Physical strum; the calculator clamps its final expected Crit Rate to 100%. C4 can be selected as an explicit current-action snapshot after the user confirms Sweeping Fervor hit the target and its Physical Resistance reduction remains active: the target's Physical Resistance is reduced by 15%. It does not infer the hit, target, 12-second duration, timing, or a rotation. C6 exposes one Physical Charged-Attack looping hit: its current-action range is zero through C5 and one at C6, while exactly 50% of Xinyan's final Defense is added to that same hit's effective Attack before the charged coefficient resolves. Its stamina clause does not enter damage. It excludes the separate level-one and level-two shields, level-three periodic Pyro damage, target count; C2's burst-created level-three shield; C5's Burst-level increase; elemental infusions, reactions, passives, external effects, and other character states.",
  label: xinyanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
