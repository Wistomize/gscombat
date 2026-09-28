import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const EMBERWELL_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const EMBERWELL_STELLAR_REACTION_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed post-reaction contributions of Emberwell. */
export const emberwellCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.emberwell.after-reaction.attack-percent",
    label: "引火之源 · 触发元素反应后的攻击力（12秒内）",
    source: { kind: "weapon", weaponId: "Emberwell" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: EMBERWELL_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "stellar", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.emberwell.after-stellar-reaction.reaction-damage-bonus",
    label: "引火之源 · 触发星烁反应后的星超导/星扩散伤害（12秒内）",
    source: { kind: "weapon", weaponId: "Emberwell" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: EMBERWELL_STELLAR_REACTION_DAMAGE_BONUS }
  }
]
