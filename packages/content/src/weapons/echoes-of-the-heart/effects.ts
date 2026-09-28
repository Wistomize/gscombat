import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const ECHOES_OF_THE_HEART_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const ECHOES_OF_THE_HEART_STELLAR_REACTION_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed post-reaction contributions of Echoes of the Heart. */
export const echoesOfTheHeartCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.echoes-of-the-heart.after-reaction.elemental-mastery",
    label: "寸心余响 · 触发元素反应后的元素精通（12秒内）",
    source: { kind: "weapon", weaponId: "EchoesOfTheHeart" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: ECHOES_OF_THE_HEART_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "stellar", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.echoes-of-the-heart.after-stellar-reaction.reaction-damage-bonus",
    label: "寸心余响 · 触发星烁反应后的星超导/星扩散伤害（12秒内）",
    source: { kind: "weapon", weaponId: "EchoesOfTheHeart" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: ECHOES_OF_THE_HEART_STELLAR_REACTION_DAMAGE_BONUS }
  }
]
