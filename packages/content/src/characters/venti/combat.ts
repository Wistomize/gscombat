import type { CharacterCombatCoverage } from "../../combat/types.js"

import { ventiDefinition } from "./definition.js"

export const ventiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Venti",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "skyward-sonnet-press-damage",
          id: "skyward-sonnet-press-damage",
          snapshotChecks: [
            { expectedCoefficient: 2.76, talentLevel: 1 },
            { expectedCoefficient: 4.968, talentLevel: 10 }
          ]
        }
      ],
      element: ventiDefinition.element,
      evaluator: "declared_direct",
      id: "venti.skill.skyward_sonnet.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "skyward-sonnet-press-damage",
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
      characterId: "Venti",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "skyward-sonnet-hold-damage",
          id: "skyward-sonnet-hold",
          snapshotChecks: [
            { expectedCoefficient: 3.8, talentLevel: 1 },
            { expectedCoefficient: 6.84, talentLevel: 10 }
          ]
        }
      ],
      element: ventiDefinition.element,
      evaluator: "declared_direct",
      id: "venti.skill.skyward_sonnet.hold",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "skyward-sonnet-hold-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Venti",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "stormeye-continuous-damage",
          id: "stormeye-continuous-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.376, talentLevel: 1 },
            { expectedCoefficient: 0.6768, talentLevel: 10 }
          ]
        }
      ],
      element: ventiDefinition.element,
      evaluator: "declared_direct",
      id: "venti.burst.winds_grand_ode.stormeye.single_tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "stormeye-continuous-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "hexerei-stormeye-strengthened",
          label: "颂时风若强化暴风之眼",
          maximumValue: 1,
          minimumValue: 0
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
              parameterId: "hexerei-stormeye-strengthened",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.35, parameterValue: 1 }
              ]
            },
            damagePartId: "stormeye-continuous-damage",
            id: "stormeye-continuous-damage",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      actionParameterId: "hexerei-stormeye-strengthened",
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "venti.locked_passive.ode_to_time_winds.stormeye.original_damage_multiplier",
      label: "魔女的前夜礼·颂时风若 · 暴风之眼造成原本135%伤害",
      source: { characterId: "Venti", kind: "character" },
      target: "actionParameter",
      targetFilter: {
        actionIds: ["venti.burst.winds_grand_ode.stormeye.single_tick"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 1 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "venti.locked_passive.ode_to_time_winds.after_swirl.current_character_damage_bonus",
      label: "魔女的前夜礼·颂时风若 · 暴风之眼期间扩散后当前角色伤害提升",
      source: { characterId: "Venti", kind: "character" },
      target: "damageBonus",
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "active",
      id: "venti.skyward_sonnet.c2.anemo_resistance_shred",
      label: "高天之歌命中后 · C2 风元素抗性降低（10秒，基础效果）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "active",
      id: "venti.skyward_sonnet.c2.physical_resistance_shred",
      label: "高天之歌命中后 · C2 物理抗性降低（10秒，基础效果）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "active",
      id: "venti.constellation.4.hurricane_of_freedom.anemo_damage_bonus",
      label: "拾取元素微粒或元素晶球后 · C4 自由如风：风元素伤害加成（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["anemo"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.anemo_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 风元素抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["anemo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.cryo_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 冰元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "cryo" },
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.electro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 雷元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "electro" },
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.hydro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 水元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "hydro" },
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      id: "venti.windriders.c6.pyro_resistance_shred",
      label: "风神之诗的暴风之眼造成伤害后 · C6 火元素转化抗性降低（10秒）",
      source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: "pyro" },
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Venti",
  metrics: [
    {
      actionId: "venti.skill.skyward_sonnet.press",
      characterId: "Venti",
      id: "venti.skill.skyward_sonnet.press",
      kind: "damage",
      label: "高天之歌 / 点按单次命中（C0，无反应）",
      sourceActionId: "venti.skill.skyward_sonnet.press",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "venti.burst.winds_grand_ode.stormeye.single_tick",
      characterId: "Venti",
      id: "venti.burst.winds_grand_ode.stormeye.single_tick",
      kind: "damage",
      label: "风神之诗 / 暴风之眼单跳伤害",
      sourceActionId: "venti.burst.winds_grand_ode.stormeye.single_tick",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Skyward Sonnet press and one Stormeye tick are selected damage metrics. Ode to Time Winds contributes 50% current-character damage after Swirl and makes Venti's Stormeye deal 135% original damage under Hexerei: Secret Rite. Absorbed-element ticks, multi-hit duration, energy refunds, timing, and other constellations remain unmodeled.",
  label: ventiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
