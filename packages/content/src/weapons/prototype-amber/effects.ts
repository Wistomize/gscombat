import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEquipmentCapability } from "../../combat/capabilities.js"

/** A prepared burst supplies party healing; the healing amount is not a damage event. */
export const prototypeAmberCombatCapabilities: readonly CombatEquipmentCapability[] = [{
  weaponId: "PrototypeAmber", capability: { id: "weapon.prototype-amber.party-healing", label: "试作金珀 · 元素爆发后的全队治疗",
    kind: "healing", recipient: "party", sourceFieldPresence: "any", sustained: true }
}]

/** This equipment has no effect that alters the selected single-core-action metric. */
export const prototypeAmberCombatActionEffects: readonly CombatActionEffect[] = []
