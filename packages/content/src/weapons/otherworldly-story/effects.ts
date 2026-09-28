import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEquipmentCapability } from "../../combat/capabilities.js"

/** Does not turn a teammate's particle reception into off-field pickup healing. */
export const otherworldlyStoryCombatCapabilities: readonly CombatEquipmentCapability[] = [{
  weaponId: "OtherworldlyStory", capability: { id: "weapon.otherworldly-story.pickup-healing",
    label: "异世界行记 · 前台拾取元素微粒/晶球自疗", kind: "healing", recipient: "self",
    sourceFieldPresence: "on_field", sustained: false, requiresParticlePickup: true }
}]

/** This equipment has no effect that alters the selected single-core-action metric. */
export const otherworldlyStoryCombatActionEffects: readonly CombatActionEffect[] = []
