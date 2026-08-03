import { characterCombatCoverageRegistry } from "./combat-registry.js"
import type { CombatElementOverrideEffect } from "./combat/types.js"

/** Lists every source-owned elemental normal-attack override effect maintained by combat content. */
export function listCombatElementOverrideEffects(): readonly CombatElementOverrideEffect[] {
  return characterCombatCoverageRegistry.flatMap((coverage) => coverage.effects ?? [])
}

/** Finds one maintained elemental normal-attack override effect by its stable effect ID. */
export function getCombatElementOverrideEffectDefinition(
  effectId: string
): CombatElementOverrideEffect | undefined {
  return listCombatElementOverrideEffects().find((effect) => effect.id === effectId)
}
