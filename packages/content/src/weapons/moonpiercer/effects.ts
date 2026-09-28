import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const MOONPIERCER_LEAF_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected Verdant Leaf pickup contribution of Moonpiercer. */
export const moonpiercerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    weaponRecipientChoice: { group: "moonpiercer-leaf-recipient", label: "叶子拾取对象", defaultRecipient: "source" },
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", provider: "source", recipient: "source", reactionElements: ["dendro"] }, "本人可触发适用草相关反应时准备苏生之叶"),
    id: "weapon.moonpiercer.after-dendro-reaction.leaf-picked.attack-percent",
    label: "贯月矢 · 拾取苏生之叶后12秒内",
    source: { kind: "weapon", weaponId: "Moonpiercer", holder: "party_member", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    value: { kind: "refinement_table", values: MOONPIERCER_LEAF_ATTACK_PERCENT }
  }
]
