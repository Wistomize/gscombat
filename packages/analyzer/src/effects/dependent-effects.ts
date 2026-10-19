import {
  listCharacterCombatCoverage,
  isCombatActionEffectApplicable,
  isCombatActionEffectDeterministicallyActive,
  listCombatActionEffects,
  listCombatElementOverrideEffects
} from "@gscombat/content"
import { hasActivatableEffectSource, hasActivatableElementOverrideSource } from "./source-selection.js"
import type { ResolveDependentActiveEffectIdsInput } from "./types.js"
import { AnalysisInputError } from "../core/errors.js"

// Activation states may name a prerequisite, rather than a numeric effect declaration itself.
const registeredStateIds = new Set([
  ...listCharacterCombatCoverage().flatMap(coverage => (coverage.scenarioEffectOptions ?? []).map(option => option.id)),
  ...[...listCombatActionEffects(), ...listCombatElementOverrideEffects()].flatMap(effect =>
    [effect.id, ...(effect.requiredActiveEffectIds ?? [])])
])

/** Derives dependent and deterministic selections without evaluating damage or weapon choices. */
export function resolveDependentActiveEffectIds(input: ResolveDependentActiveEffectIdsInput): string[] {
  for (const id of input.activeEffectIds) {
    if (!registeredStateIds.has(id)) {
      throw new AnalysisInputError("invalid_effect_selection", `Active effect ${id} is not registered`)
    }
  }
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
