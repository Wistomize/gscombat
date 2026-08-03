import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sucroseDefinition } from "./definition.js"

export const sucroseCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Sucrose",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "astable-anemohypostasis-creation-6308-damage",
          id: "astable-anemohypostasis-creation-6308",
          snapshotChecks: [
            { expectedCoefficient: 2.112, talentLevel: 1 },
            { expectedCoefficient: 3.8016, talentLevel: 10 }
          ]
        }
      ],
      element: sucroseDefinition.element,
      evaluator: "declared_direct",
      id: "sucrose.skill.astable_anemohypostasis_creation_6308",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "astable-anemohypostasis-creation-6308-damage",
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
      characterId: "Sucrose",
      element: sucroseDefinition.element,
      id: "sucrose.passive.catalyst_conversion.elemental_mastery_share",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive1",
          id: "catalyst-conversion-elemental-mastery-share",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Sucrose",
      element: sucroseDefinition.element,
      id: "sucrose.passive.mollis_favonius.elemental_mastery_share",
      kind: "support",
      parameterReferences: [
        {
          groupId: "passive2",
          id: "mollis-favonius-elemental-mastery-share",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      status: "verified",
      talentSlot: "passive"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "sucrose.locked_passive.seven_cycle_theory.small_spirit.party_damage_bonus",
      label: "魔女的前夜礼·七循之理 · 小型风灵召唤后全队伤害提升",
      source: { characterId: "Sucrose", kind: "character" },
      target: "damageBonus",
      value: { kind: "fixed", value: 0.057143 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "sucrose.locked_passive.seven_cycle_theory.large_spirit.hexerei_damage_bonus",
      label: "魔女的前夜礼·七循之理 · 大型风灵召唤后魔导角色伤害提升",
      source: { characterId: "Sucrose", kind: "character" },
      target: "damageBonus",
      targetFilter: { recipientHexereiRequired: true },
      value: { kind: "fixed", value: 0.071429 }
    },
    {
      activation: "maximum_reachable",
      id: "sucrose.passive.catalyst_conversion.elemental_mastery_share",
      label: "触媒转换 · 对应元素队友元素精通提升",
      source: { characterId: "Sucrose", kind: "character", minimumSourceAscension: 1 },
      target: "elementalMastery",
      targetFilter: {
        elements: ["pyro", "hydro", "electro", "cryo"],
        recipientSourceRelation: "not_source"
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive1",
          id: "catalyst-conversion-elemental-mastery-share",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "sucrose.passive.mollis_favonius.elemental_mastery_share",
      label: "小小的慧风 · 队友元素精通提升",
      source: { characterId: "Sucrose", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.2 } }
    },
    {
      activation: "active",
      exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "pyro" },
      id: "sucrose.constellation.6.chaotic_entropy.pyro_damage_bonus",
      label: "禁·风灵作成·柒伍同构贰型发生火元素转化后 · C6 混元熵增论（火元素伤害加成，8秒）",
      source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "hydro" },
      id: "sucrose.constellation.6.chaotic_entropy.hydro_damage_bonus",
      label: "禁·风灵作成·柒伍同构贰型发生水元素转化后 · C6 混元熵增论（水元素伤害加成，8秒）",
      source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "electro" },
      id: "sucrose.constellation.6.chaotic_entropy.electro_damage_bonus",
      label: "禁·风灵作成·柒伍同构贰型发生雷元素转化后 · C6 混元熵增论（雷元素伤害加成，8秒）",
      source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      exclusivity: { group: "sucrose-chaotic-entropy-c6-absorbed-element", variant: "cryo" },
      id: "sucrose.constellation.6.chaotic_entropy.cryo_damage_bonus",
      label: "禁·风灵作成·柒伍同构贰型发生冰元素转化后 · C6 混元熵增论（冰元素伤害加成，8秒）",
      source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Sucrose",
  metrics: [
    {
      characterId: "Sucrose",
      flatParameter: {
        reference: {
          groupId: "passive1",
          id: "catalyst-conversion-elemental-mastery-share",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 50, talentLevel: 1 }]
      },
      id: "sucrose.passive.catalyst_conversion.elemental_mastery_share",
      kind: "scalar",
      label: "触媒转换 / 对应元素队友元素精通提升",
      recipientRequirements: [],
      semantic: "elemental_mastery_buff",
      sourceActionId: "sucrose.passive.catalyst_conversion.elemental_mastery_share",
      status: "verified",
      target: "friendly_recipient",
      unit: "elemental_mastery"
    },
    {
      characterId: "Sucrose",
      id: "sucrose.passive.mollis_favonius.elemental_mastery_share",
      kind: "scalar",
      label: "小小的慧风 / 队友元素精通提升",
      ratioParameter: {
        reference: {
          groupId: "passive2",
          id: "mollis-favonius-elemental-mastery-share",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        snapshotChecks: [{ expectedValue: 0.2, talentLevel: 1 }]
      },
      recipientRequirements: [],
      scalingStat: "elementalMastery",
      semantic: "elemental_mastery_buff",
      sourceActionId: "sucrose.passive.mollis_favonius.elemental_mastery_share",
      status: "verified",
      target: "friendly_recipient",
      unit: "elemental_mastery"
    }
  ],
  detail:
    "Catalyst Conversion and Mollis Favonius remain the selected Elemental Mastery support outputs. Seven-Cycle Theory contributes 5.7143% party damage after a small spirit and another 7.1429% only to Hexerei recipients after a large spirit. C6 absorption remains explicit; timing, target eligibility, and rotations are not inferred.",
  label: sucroseDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
