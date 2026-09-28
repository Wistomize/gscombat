import {
  isCombatActionEffectApplicable,
  isCombatActionEffectDeterministicallyActive,
  listCombatActionEffects,
  listCombatElementOverrideEffects
} from "@gscombat/content"
import { hasActivatableEffectSource, hasActivatableElementOverrideSource } from "./source-selection.js"
import type { ResolveDependentActiveEffectIdsInput } from "./types.js"

/** Derives dependent and deterministic selections without evaluating damage or weapon choices. */
export function resolveDependentActiveEffectIds(input: ResolveDependentActiveEffectIdsInput): string[] {
  const effects = listCombatActionEffects()
  const elementOverrideEffects = listCombatElementOverrideEffects()
  const dependentEffects = effects.filter(
    (effect) => effect.requiredActiveEffectIds !== undefined && effect.deterministicSnapshotActivation === undefined
  )
  const deterministicEffects = effects.filter((effect) => effect.deterministicSnapshotActivation !== undefined)
  const dependentElementOverrideEffects = elementOverrideEffects.filter((effect) => effect.requiredActiveEffectIds !== undefined)
  const derivedEffectIds = new Set(
    [...dependentEffects, ...deterministicEffects, ...dependentElementOverrideEffects].map((effect) => effect.id)
  )
  const activeEffectIds = new Set(input.activeEffectIds.filter((effectId) => !derivedEffectIds.has(effectId)))
  let added = true

  while (added) {
    added = false
    for (const effect of dependentEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        effect.activation !== "active" ||
        activeEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId)) ||
        !hasActivatableEffectSource(effect, input)
      ) continue
      activeEffectIds.add(effect.id)
      added = true
    }
    for (const effect of deterministicEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        effect.activation !== "active" ||
        activeEffectIds.has(effect.id) ||
        input.action === undefined ||
        !isCombatActionEffectApplicable(effect, input.action) ||
        !isCombatActionEffectDeterministicallyActive(effect, input.action) ||
        (requiredActiveEffectIds !== undefined &&
          !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId))) ||
        !hasActivatableEffectSource(effect, input)
      ) continue
      activeEffectIds.add(effect.id)
      added = true
    }
    for (const effect of dependentElementOverrideEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        activeEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId)) ||
        !hasActivatableElementOverrideSource(effect, input)
      ) continue
      activeEffectIds.add(effect.id)
      added = true
    }
  }

  return [...activeEffectIds]
}
