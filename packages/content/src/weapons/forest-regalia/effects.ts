import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const FOREST_REGALIA_LEAF_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected Seed of Consciousness pickup contribution of Forest Regalia. */
export const forestRegaliaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    weaponRecipientChoice: { group: "forest-leaf-recipient", label: "叶子拾取对象", defaultRecipient: "source" },
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", provider: "source", recipient: "source", reactionElements: ["dendro"] }, "本人可触发适用草相关反应时准备种识之叶"),
    exclusivity: { group: "forest-leaf-elemental-mastery", variant: "regalia", automaticPriority: "refinement" },
    id: "weapon.forest-regalia.after-dendro-reaction.leaf-picked.elemental-mastery",
    label: "森林王器 · 拾取种识之叶后12秒内",
    source: { kind: "weapon", weaponId: "ForestRegalia", holder: "party_member", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: FOREST_REGALIA_LEAF_ELEMENTAL_MASTERY }
  }
]
