import type { CharacterCombatCoverage } from "../../combat/types.js"

import { monaDefinition } from "./definition.js"

export const monaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.376, talentLevel: 1 },
            { expectedCoefficient: 0.6768, talentLevel: 10 }
          ]
        }
      ],
      element: monaDefinition.element,
      evaluator: "declared_direct",
      id: "mona.normal.auto.first_hit",
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
      characterId: "Mona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "mirror-reflection-of-doom-continuous-damage",
          id: "phantom-continuous-damage-tick",
          snapshotChecks: [
            { expectedCoefficient: 0.32, talentLevel: 1 },
            { expectedCoefficient: 0.576, talentLevel: 10 }
          ]
        }
      ],
      element: monaDefinition.element,
      evaluator: "declared_direct",
      id: "mona.skill.mirror_reflection_of_doom.phantom.tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "mirror-reflection-of-doom-continuous-damage",
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
      characterId: "Mona",
      element: monaDefinition.element,
      id: "mona.burst.stellaris_phantasm.omen",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "charged",
      characterId: "Mona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "c6-rhetorics-of-calamitas-charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 1.4972, talentLevel: 1 },
            { expectedCoefficient: 2.69496, talentLevel: 10 }
          ]
        }
      ],
      element: monaDefinition.element,
      evaluator: "declared_direct",
      id: "mona.normal.charged_attack.c6_illusory_torrent_movement",
      intrinsicEffects: [
        {
          fixedValue: 0.6,
          kind: "flat",
          label: "厄运的修辞 · C6 虚实流动移动时间",
          scenarioParameterMultiplier: {
            base: 0,
            parameterId: "c6-illusory-torrent-movement-seconds",
            perParameterValue: 1
          },
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3],
          defaultValue: 0,
          id: "c6-illusory-torrent-movement-seconds",
          label: "C6 厄运的修辞：虚实流动移动秒数（每秒重击伤害提高60%）",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 3, maximumValue: 3, minimumSourceConstellation: 6, minimumValue: 0 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "mona.locked_passive.true_origin_of_astral_steps.three_mercurial_radiance_stacks.vaporize_bonus",
      label: "魔女的前夜礼·天步真原 · 3层水星天的辉光蒸发伤害提升",
      source: { characterId: "Mona", kind: "character" },
      target: "amplifyingReactionBonus",
      targetFilter: {
        amplifyingReactionKinds: ["vaporize_forward", "vaporize_reverse"],
        recipientSourceRelation: "not_source"
      },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      id: "mona.burst.stellaris_phantasm.omen.damage_bonus",
      label: "星命定轨 · 星异伤害加成",
      source: { characterId: "Mona", kind: "character" },
      target: "damageBonus",
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "active",
      id: "mona.constellation.4.prophecy_of_oblivion.omen_target.crit_rate",
      label: "灭绝的预言 · C4 目标仍处于星异状态时队伍攻击暴击率 +15%",
      source: { characterId: "Mona", kind: "character", minimumSourceConstellation: 4 },
      target: "critRate",
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "automatic",
      id: "mona.passive.waterborne_destiny.energy_recharge_to_hydro_damage_bonus",
      label: "托付于命运吧 · 元素充能效率的20%转化为水元素伤害加成",
      source: { characterId: "Mona", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["hydro"], recipientSourceRelation: "source" },
      value: {
        kind: "source_stat",
        multiplier: { kind: "fixed", value: 0.2 },
        sourceStat: "energyRecharge"
      }
    }
  ],
  characterId: "Mona",
  metrics: [
    {
      characterId: "Mona",
      id: "mona.burst.stellaris_phantasm.omen.damage_bonus",
      kind: "scalar",
      label: "星命定轨 / 星异伤害加成",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.42, talentLevel: 1 },
          { expectedValue: 0.6, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: "mona.burst.stellaris_phantasm.omen",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      actionId: "mona.normal.charged_attack.c6_illusory_torrent_movement",
      characterId: "Mona",
      id: "mona.normal.charged_attack.c6_illusory_torrent_movement",
      kind: "damage",
      label: "厄运的修辞 / 虚实流动后重击（C6 可选0–3秒、无反应）",
      sourceActionId: "mona.normal.charged_attack.c6_illusory_torrent_movement",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Stellaris Phantasm's Omen remains the selected support metric. True Origin of Astral Steps contributes the maximum three Mercurial Radiance stacks as 15% Vaporize reaction bonus to another party member under Hexerei: Secret Rite. Mona's A4 now automatically converts 20% of her full Energy Recharge into Hydro Damage Bonus for her Hydro actions. The charged-attack metric exposes C6 Illusory Torrent movement as a bounded zero-to-three-second action snapshot: the value is locked to zero through C5, while a C6 build defaults to the maximum three seconds and adds 60% Damage Bonus per second, up to 180%, to the next single Charged Attack. Omen extension changes duration rather than the selected hit amount; Bubble rupture, timing, and other character states remain unmodeled.",
  label: monaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
