import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const EXAIPHANES_BLADE_ATTACK_PERCENT = [0.24, 0.24, 0.24, 0.24, 0.24] as const
export const EXAIPHANES_BLADE_RESONATED_ELEMENT_CRIT_DAMAGE = [0.42, 0.42, 0.42, 0.42, 0.42] as const

/** Typed Traveler-only contributions of Exaiphanes Blade. */
export const exaiphanesBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source" }, "旅行者默认共鸣五级（90级、精炼三阶）；由自身命中准备攻击力加成"),
    id: "weapon.exaiphanes-blade.after-hit.traveler.attack-percent",
    label: "星锋剑 · 共鸣五级（精炼三阶），旅行者命中后的攻击力",
    source: { kind: "weapon", weaponId: "ExaiphanesBlade" },
    target: "attackPercent",
    targetFilter: { recipientCharacterIds: ["Traveler"] },
    value: { kind: "fixed", value: 0.24 }
  },
  {
    activation: "automatic",
    id: "weapon.exaiphanes-blade.traveler.resonated-elements.crit-damage",
    label: "星锋剑 · 共鸣五级（精炼三阶），旅行者七种已共鸣元素的暴击伤害",
    source: { kind: "weapon", weaponId: "ExaiphanesBlade" },
    target: "critDamage",
    targetFilter: { recipientCharacterIds: ["Traveler"] },
    value: { kind: "fixed", value: 0.42 }
  }
]
