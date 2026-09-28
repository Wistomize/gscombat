import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const BLADE_OF_ATONEMENT_ELEMENTAL_MASTERY = [64, 80, 96, 112, 128] as const
export const BLADE_OF_ATONEMENT_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed post-reaction contributions of Blade of Atonement. */
export const bladeOfAtonementCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.blade-of-atonement.after-reaction.elemental-mastery",
    label: "救赎之斩 · 触发元素反应后的元素精通（12秒内）",
    source: { kind: "weapon", weaponId: "BladeOfAtonement" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: BLADE_OF_ATONEMENT_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "stellar", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.blade-of-atonement.after-stellar-reaction.attack-percent",
    label: "救赎之斩 · 触发星烁反应后的攻击力（12秒内）",
    source: { kind: "weapon", weaponId: "BladeOfAtonement" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: BLADE_OF_ATONEMENT_ATTACK_PERCENT }
  }
]
