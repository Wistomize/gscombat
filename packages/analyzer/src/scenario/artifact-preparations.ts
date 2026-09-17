import { getCombatActionDefinition, listCombatActionEffects } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { getBuildFieldPresence, resolveFieldContext } from "../core/field-presence.js"
import type { AppliedCombatActionEffect } from "../effects/types.js"
import { resolveCombatEffectLifecycle } from "./effect-lifecycle.js"

/** Explains preparation independently of damage totals; called once for the baseline, never for each candidate. */
export function explainArtifactPreparations(
  scenario: EvaluationScenario, gameData: GameDataRepository, applied: readonly AppliedCombatActionEffect[]
) {
  if (!scenario.targetActionId) return []
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (!action) return []
  const builds = [scenario.primary, ...scenario.teammates]
  const fieldContext = resolveFieldContext(action, scenario.primary, scenario.teammates, scenario.conditions.onFieldBuildId)
  const activeEffectIds = scenario.conditions.activeEffectIds ?? []
  const effects = listCombatActionEffects()
  return builds.flatMap((source) => effects.flatMap((effect) => {
    const equipmentSource = effect.source
    if (equipmentSource.kind !== "artifact_set" || !effect.lifecycle || effect.lifecycle.kind === "constant" ||
      source.artifacts.filter((piece) => piece.setId === equipmentSource.setId).length < equipmentSource.minimumPieces) return []
    const sourceChoice = scenario.conditions.activeEffectSourceBuildIds?.[effect.id]
    const state = resolveCombatEffectLifecycle({
      lifecycle: effect.lifecycle, source, recipient: scenario.primary, builds, gameData, fieldContext,
      enemyCount: scenario.conditions.enemyCount, targetFrozen: scenario.conditions.targetFrozen ?? false, activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds ? { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds } : {}),
      selected: activeEffectIds.includes(effect.id) && (sourceChoice === undefined
        ? source.buildId === scenario.primary.buildId || equipmentSource.holder === "party_member"
        : sourceChoice === source.buildId)
    })
    const isApplied = applied.some((entry) => entry.id === effect.id && entry.sourceId === source.buildId)
    return [{
      effectId: effect.id, label: effect.label, sourceBuildId: source.buildId, sourceCharacterId: source.characterId,
      sourcePresence: getBuildFieldPresence(fieldContext, source.buildId),
      qualified: state.eligible, applied: isApplied, capabilitySourceIds: [...state.capabilitySourceIds],
      reason: isApplied ? state.reason : state.eligible
        ? `${state.reason}；准备资格满足，但本指标的伤害类型/状态不匹配、属于其他角色自用效果，或同名效果已去重。`
        : state.reason
    }]
  }))
}
