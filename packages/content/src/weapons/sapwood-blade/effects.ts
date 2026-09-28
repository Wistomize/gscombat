import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SAPWOOD_BLADE_LEAF_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected Seed of Consciousness pickup contribution of Sapwood Blade. */
export const sapwoodBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    weaponRecipientChoice: { group: "forest-leaf-recipient", label: "叶子拾取对象", defaultRecipient: "source" },
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", provider: "source", recipient: "source", reactionElements: ["dendro"] }, "本人可触发适用草相关反应时准备种识之叶"),
    exclusivity: { group: "forest-leaf-elemental-mastery", variant: "sapwood", automaticPriority: "refinement" },
    id: "weapon.sapwood-blade.after-dendro-reaction.leaf-picked.elemental-mastery",
    label: "原木刀 · 拾取种识之叶后12秒内",
    source: { holder: "party_member", kind: "weapon", weaponId: "SapwoodBlade", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: SAPWOOD_BLADE_LEAF_ELEMENTAL_MASTERY }
  }
]
