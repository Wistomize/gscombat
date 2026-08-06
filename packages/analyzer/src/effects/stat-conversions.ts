import type { ResolvedCombatActionEffects } from "./types.js"

export function resolveFinalHpToFlatAttack(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToFlatAttack">
): number {
  return finalHp * effects.finalHpToFlatAttack
}

/** Resolves self-owned elemental mastery derived from final maximum HP. */
export function resolveFinalHpToElementalMastery(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToElementalMastery">
): number {
  return finalHp * effects.finalHpToElementalMastery
}

/** Resolves a self-owned flat-attack passive from the fully assembled elemental-mastery stat stage. */
export function resolveFinalElementalMasteryToFlatAttack(
  finalElementalMastery: number,
  effects: Pick<ResolvedCombatActionEffects, "finalElementalMasteryToFlatAttack">
): number {
  return finalElementalMastery * effects.finalElementalMasteryToFlatAttack
}

/** Resolves final-maximum-HP damage bonuses, enforcing each effect's own cap before summing. */
export function resolveFinalHpToDamageBonus(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToDamageBonuses">
): number {
  return resolveFinalHpSourcedDamageBonuses(finalHp, effects.finalHpToDamageBonuses)
}

/** Resolves native-element damage bonuses from final maximum HP, enforcing each effect's own cap before summing. */
export function resolveFinalHpToOwnElementDamageBonus(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToOwnElementDamageBonuses">
): number {
  return resolveFinalHpSourcedDamageBonuses(finalHp, effects.finalHpToOwnElementDamageBonuses)
}

function resolveFinalHpSourcedDamageBonuses(
  finalHp: number,
  effects: ResolvedCombatActionEffects["finalHpToDamageBonuses"]
): number {
  return effects.reduce((total, effect) => {
    const value = finalHp * effect.multiplier
    return total + (effect.maximumValue === undefined ? value : Math.min(value, effect.maximumValue))
  }, 0)
}
