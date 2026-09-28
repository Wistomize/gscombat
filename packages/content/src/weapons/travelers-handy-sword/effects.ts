import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEquipmentCapability } from "../../combat/capabilities.js"

/** Healing is a preparation capability, never an additional damage event. */
export const travelersHandySwordCombatCapabilities: readonly CombatEquipmentCapability[] = [{
  weaponId: "TravelersHandySword", capability: { id: "weapon.travelers-handy-sword.pickup-healing",
    label: "旅行剑 · 前台拾取元素微粒/晶球自疗", kind: "healing", recipient: "self",
    sourceFieldPresence: "on_field", sustained: false, requiresParticlePickup: true }
}]

/** This equipment has no effect that alters the selected single-core-action metric. */
export const travelersHandySwordCombatActionEffects: readonly CombatActionEffect[] = []
