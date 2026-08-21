import type { CombatActionEffect } from "../../combat/types.js"

export const EXAIPHANES_BLADE_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.32, 0.4] as const
export const EXAIPHANES_BLADE_RESONATED_ELEMENT_CRIT_DAMAGE = [0, 0.42, 0.42, 0.42, 0.42] as const

/** Typed Traveler-only contributions of Exaiphanes Blade. */
export const exaiphanesBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.exaiphanes-blade.after-hit.traveler.attack-percent",
    label: "星锋剑 · 旅行者命中敌人后的攻击力（8秒内）",
    source: { kind: "weapon", weaponId: "ExaiphanesBlade" },
    target: "attackPercent",
    targetFilter: { recipientCharacterIds: ["Traveler"] },
    value: { kind: "refinement_table", values: EXAIPHANES_BLADE_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    id: "weapon.exaiphanes-blade.traveler.resonated-elements.crit-damage",
    label: "星锋剑 · 旅行者已与七种元素共鸣过的暴击伤害（精炼二阶起）",
    source: { kind: "weapon", weaponId: "ExaiphanesBlade" },
    target: "critDamage",
    targetFilter: { recipientCharacterIds: ["Traveler"] },
    value: { kind: "refinement_table", values: EXAIPHANES_BLADE_RESONATED_ELEMENT_CRIT_DAMAGE }
  }
]
