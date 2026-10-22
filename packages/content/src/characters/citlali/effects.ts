import type { CombatEffectLifecycle } from "../../combat/capabilities.js"
import type { CombatActionEffect } from "../../combat/types.js"

// Talent and constellation wording: https://wiki.hoyolab.com/m/genshin/entry/7300?lang=zh-tw
const preparedOnFieldBuff: CombatEffectLifecycle = {
  kind: "conditional",
  preparation: "qualified",
  retention: "retain_on_exit",
  trigger: { event: "skill_cast", sourceFieldPresence: "on_field" },
  applicability: { recipientFieldPresence: "on_field" },
  explanation: "施放霜昼黑星后伊兹帕帕存在；茜特菈莉退场不移除效果，但只作用于其他当前场上角色"
}

const afterFrozenOrMelt: CombatEffectLifecycle = {
  kind: "conditional",
  preparation: "qualified",
  retention: "retain_on_exit",
  trigger: {
    event: "capability",
    sourceFieldPresence: "any",
    capability: { kind: "reaction_trigger", provider: "source", recipient: "source",
      elements: ["cryo"], counterpartElements: ["hydro", "pyro"], reactionFamily: "any" }
  },
  explanation: "伊兹帕帕存在期间，队伍具备冰与水/火附着能力，按已触发冻结或融化准备；减抗留在敌人上，也作用于后台火/水伤害"
}

export const citlaliCombatEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "citlali.passive.mamaloaco_frigid_rain.pyro_hydro_resistance_reduction",
    label: "五重天的寒雨 · 冻结或融化后火元素与水元素抗性降低20%",
    lifecycle: afterFrozenOrMelt,
    source: { characterId: "Citlali", kind: "character", minimumSourceAscension: 1 },
    target: "enemyResistanceReduction",
    targetFilter: { elements: ["pyro", "hydro"] },
    value: { kind: "fixed", value: 0.2 }
  },
  {
    activation: "automatic",
    id: "citlali.constellation.1.blade_of_the_four_hundred_stars.base_damage",
    label: "四百星的芒刃 · C1 消耗星之刃，其他前台角色基础伤害增加茜特菈莉元素精通的200%",
    lifecycle: preparedOnFieldBuff,
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 1 },
    target: "baseDamageFlat",
    targetFilter: { recipientSourceRelation: "not_source", talentSlots: ["normal", "skill", "burst"] },
    value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 2 } }
  },
  {
    activation: "automatic",
    id: "citlali.constellation.2.heart_devourers_travail.self_elemental_mastery",
    label: "吞心者的巡行 · C2 茜特菈莉自身元素精通提高125",
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 2 },
    target: "elementalMastery",
    targetFilter: { recipientSourceRelation: "source" },
    value: { kind: "fixed", value: 125 }
  },
  {
    activation: "automatic",
    id: "citlali.constellation.2.heart_devourers_travail.on_field_elemental_mastery",
    label: "吞心者的巡行 · C2 白曜护盾庇护或伊兹帕帕跟随的其他前台角色元素精通提高250",
    lifecycle: preparedOnFieldBuff,
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 2 },
    target: "elementalMastery",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "fixed", value: 250 }
  },
  {
    activation: "automatic",
    id: "citlali.constellation.2.heart_devourers_travail.pyro_hydro_resistance_reduction",
    label: "吞心者的巡行 · C2 五重天的寒雨额外降低火元素与水元素抗性20%",
    lifecycle: afterFrozenOrMelt,
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 2, minimumSourceAscension: 1 },
    target: "enemyResistanceReduction",
    targetFilter: { elements: ["pyro", "hydro"] },
    value: { kind: "fixed", value: 0.2 }
  },
  {
    activation: "maximum_reachable",
    id: "citlali.constellation.6.teoiztac_secret_pact.maximum_secret_law.pyro_hydro_damage_bonus",
    label: "原动天的密契 · C6 秘律之数40点时全队火元素与水元素伤害加成60%",
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 6 },
    target: "damageBonus",
    targetFilter: { elements: ["pyro", "hydro"] },
    value: { kind: "fixed", value: 0.6 }
  },
  {
    activation: "maximum_reachable",
    id: "citlali.constellation.6.teoiztac_secret_pact.maximum_secret_law.self_damage_bonus",
    label: "原动天的密契 · C6 秘律之数40点时茜特菈莉造成的伤害提升100%",
    source: { characterId: "Citlali", kind: "character", minimumSourceConstellation: 6 },
    target: "damageBonus",
    targetFilter: { recipientSourceRelation: "source" },
    value: { kind: "fixed", value: 1 }
  }
]
