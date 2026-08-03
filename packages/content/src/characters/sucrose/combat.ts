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
    "Astable Anemohypostasis Creation - 6308 remains a verified lower-level C0 Anemo damage action from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but is not a selected support output. Catalyst Conversion exposes its fixed passive1[0] 50 Elemental Mastery share for a non-Sucrose teammate whose element matches Sucrose's triggering Swirl. Mollis Favonius exposes passive2[0] × Sucrose's Elemental Mastery after her Skill or Burst hits an opponent, again for a non-Sucrose teammate. Each passive table resolves at its fixed level-one value. C6's Pyro, Hydro, Electro, and Cryo elemental-damage bonuses are four mutually exclusive explicit current-action snapshots after the Burst absorbs that element; they can affect any party recipient, including Sucrose. The selected metrics and snapshots do not infer the triggering Swirl or elemental absorption, timing, target eligibility, or rotations; they exclude the unselected skill and burst damage, locked Hexerei states, and other constellations.",
  label: sucroseDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
