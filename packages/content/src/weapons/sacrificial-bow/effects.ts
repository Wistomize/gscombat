import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEquipmentCapability } from "../../combat/capabilities.js"

/** One reachable reset after the wearer's own skill deals damage; not an extra damage event. */
export const sacrificialBowCombatCapabilities: readonly CombatEquipmentCapability[] = [{
  weaponId: "SacrificialBow", capability: { id: "weapon.sacrificial-bow.skill-reset", label: "祭礼：前台战技伤害触发一次冷却重置",
    kind: "skill_reset", recipient: "self", sourceFieldPresence: "any", sustained: false }
}]

/** This equipment has no effect that alters the selected single-core-action metric. */
export const sacrificialBowCombatActionEffects: readonly CombatActionEffect[] = []
