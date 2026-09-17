import type { CombatActionEffect } from "./types.js"

/** Rejects ambiguous authored defaults once when the equipment registry is assembled. */
export function assertWeaponComparisonDefaults(effects: readonly CombatActionEffect[]): void {
  const defaults = effects.filter((effect) => effect.weaponComparisonDefault !== undefined)
  for (const [index, effect] of defaults.entries()) {
    const recipients = effect.weaponComparisonDefault!.recipientCharacterIds
    if (effect.source.kind !== "weapon" || (recipients !== "all" && recipients.length === 0)) {
      throw new Error(`Invalid weapon comparison default: ${effect.id}`)
    }
    if (!effect.exclusivity) continue
    for (const other of defaults.slice(0, index)) {
      if (other.source.kind !== "weapon" || other.source.weaponId !== effect.source.weaponId ||
        other.exclusivity?.group !== effect.exclusivity.group || other.exclusivity.variant === effect.exclusivity.variant) continue
      const otherRecipients = other.weaponComparisonDefault!.recipientCharacterIds
      if (recipients === "all" || otherRecipients === "all" || recipients.some((id) => otherRecipients.includes(id))) {
        throw new Error(`Conflicting weapon comparison defaults in ${effect.exclusivity.group}: ${other.id}, ${effect.id}`)
      }
    }
  }
}
