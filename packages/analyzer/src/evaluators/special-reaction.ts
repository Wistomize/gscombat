import {
  calculateDirectSpecialReactionDamage
} from "@gscombat/calculator"

import {
  resolveCombatActionEffects, type AppliedCombatActionEffect
} from "../effects/action-effects.js"
import { getBuffTotal, resolvePartyElements } from "./context.js"
import {
  resolveDeclaredActionTalentLevelConstellationBonuses
} from "./declared-action.js"
import { resolveActionScenarioParameters } from "./scenario-parameters.js"

export { getScenarioParameterMinimumSourceConstellation, resolveActionScenarioParameters } from "./scenario-parameters.js"

import type {
  DeclaredDirectScenarioInput,
  DeclaredSpecialReactionScenarioEvaluation, ResolvedDeclaredScenarioStats
} from "./types.js"

export type {
  DeclaredDirectActionPartEvaluation,
  DeclaredDirectActionScalingTermEvaluation,
  DeclaredDirectScenarioEvaluation,
  DeclaredDirectScenarioInput,
  DeclaredSpecialReactionScenarioEvaluation,
  DeclaredTransformativeScenarioEvaluation,
  ResolvedDeclaredScenarioStats,
  ResolvedStatContribution,
  ResolvedStatContributionStage
} from "./types.js"

import * as shared from "./shared.js"

export function evaluateDeclaredSpecialReactionScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredSpecialReactionScenarioEvaluation {
  const {
    activeEffectIds = [],
    activeEffectSourceBuildIds,
    action,
    artifactStatDeltas,
    build,
    buffs,
    enemy,
    enemyCount = 1,
    gameData,
    actionParameters,
    teammates = [],
    moonsignLevel = "none"
  } = input
  shared.assertDeclaredSpecialReactionAction(action)
  const resolvedActionParameters = resolveActionScenarioParameters(action, actionParameters, build.constellation)
  const parts = action.damageParts.map((part) =>
    shared.resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  const {
    baseStats,
    primaryDifferentElementTeammateCount,
    primaryElement,
    primarySameElementTeammateCount,
    resolvedActiveEffectIds,
    sourceFinalAttackByBuildId,
    sourceFinalDefenseByBuildId,
    sourceFinalElementalMasteryByBuildId,
    sourceFinalHpByBuildId,
    teamUniqueElementCount
  } = shared.resolveScenarioActionEffectContext({
    action,
    activeEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    ...(artifactStatDeltas === undefined ? {} : { artifactStatDeltas }),
    build,
    buffs,
    enemyCount,
    gameData,
    moonsignLevel,
    resolvedActionParameters,
    teammates
  })
  const actionEffects = resolveCombatActionEffects({
    action,
    activeEffectIds: resolvedActiveEffectIds,
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements: [action.element],
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  })
  const stats = shared.resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    actionEffects
  )
  const part = parts[0]
  if (!part) throw new Error(`Declared special-reaction action ${action.id} did not resolve a damage part`)
  const multiScalingPart = shared.hasResolvedMultipleScalingTerms(part) ? part : undefined
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    ...(multiScalingPart ? { scalingTerms: multiScalingPart.terms } : {}),
    talentMultiplier: multiScalingPart ? null : part.coefficient ?? 0
  }
  const baseDamageTerms = shared.resolveSpecialReactionBaseDamageTerms(action, part, stats.rotation)
  const baseDamage = shared.resolveSpecialReactionBaseDamage(action, part, stats.rotation)
  const result = calculateDirectSpecialReactionDamage(
    shared.resolveDirectSpecialReactionInput(
      action.specialReaction,
      baseDamage,
      baseDamageTerms,
      scenarioStats,
      actionEffects,
      getBuffTotal(buffs, "special_reaction_damage_bonus"),
      enemy.resistance,
      actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      resolvedActionParameters
    )
  )
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects: readonly AppliedCombatActionEffect[] = [
    ...shared.materializeDeferredStatEffects(
      actionEffects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ).filter(shared.isSpecialReactionStatEffect),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ]
  const rotation = shared.createDirectSpecialReactionRotation(action, build.buildId, result, appliedEffects)

  return { appliedEffects, parts, result, rotation, stats: scenarioStats }
}

/** Resolves the shared stat and source context used by direct and standalone transformative action metrics. */
