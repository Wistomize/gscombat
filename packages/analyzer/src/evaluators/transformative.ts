import {
  evaluateRotation, type ExpectedDamageResult, type RotationEventResult
} from "@gscombat/calculator"

import {
  resolveCombatActionEffects
} from "../effects/action-effects.js"
import { getBuffTotal, resolvePartyElements } from "./context.js"
import { resolveActionScenarioParameters } from "./scenario-parameters.js"

export { getScenarioParameterMinimumSourceConstellation, resolveActionScenarioParameters } from "./scenario-parameters.js"

import type {
  DeclaredDirectScenarioInput, DeclaredTransformativeScenarioEvaluation,
  ResolvedDeclaredScenarioStats
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

export function evaluateDeclaredTransformativeScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredTransformativeScenarioEvaluation {
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
  shared.assertDeclaredTransformativeAction(action)
  const resolvedActionParameters = resolveActionScenarioParameters(action, actionParameters, build.constellation)
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
    candidateReactionKinds: [action.transformativeReaction.kind],
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
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    talentMultiplier: null
  }
  const appliedEffects = shared.materializeDeferredStatEffects(
    actionEffects.appliedEffects,
    stats.rotation.hp,
    stats.elementalMasteryForAttackConversion
  )
  const rotation = evaluateRotation({
    duration: 1,
    enemy: {
      defenseReduction: enemy.defenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    events: [
      {
        canCrit: false,
        element: action.element,
        hitCount: 1,
        id: `${action.id}.single-reaction`,
        ownerId: build.buildId,
        reaction: {
          ...action.transformativeReaction,
          bonus: actionEffects.reactionDamageBonus,
          ...(actionEffects.transformativeReactionFlatDamageAddition === 0
            ? {}
            : { flatDamageAddition: actionEffects.transformativeReactionFlatDamageAddition })
        },
        ...(actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction") > 0
          ? {
              resistanceReduction:
                actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction")
            }
          : {}),
        scaling: { coefficient: 0, stat: "elementalMastery" },
        stats: stats.rotation,
        time: 0
      }
    ]
  })
  const event = rotation.events[0]
  if (!event) throw new Error(`Declared transformative action ${action.id} did not produce a reaction event`)
  return {
    appliedEffects,
    result: createTransformativeExpectedDamageResult(event),
    rotation,
    stats: scenarioStats
  }
}

/** Projects a single transformative rotation event into the legacy result shape while retaining its exact formula. */
function createTransformativeExpectedDamageResult(event: RotationEventResult): ExpectedDamageResult {
  const trace: Array<ExpectedDamageResult["trace"][number]> = []
  for (const entry of event.trace) {
    if (entry.kind === "transformative_reaction") {
      trace.push({
        after: entry.after,
        before: entry.before,
        formula: {
          baseDamage: entry.baseDamage,
          bonus: entry.bonus,
          elementalMastery: entry.elementalMastery,
          flatDamageAddition: entry.flatDamageAddition,
          kind: "transformative_reaction",
          multiplier: entry.multiplier,
          reaction: entry.reaction
        },
        source: "reaction",
        stage: "transformative_reaction"
      })
      continue
    }
    if (entry.kind === "resistance") {
      trace.push({
        after: entry.after,
        before: entry.before,
        formula: {
          effectiveResistance: entry.effectiveResistance,
          kind: "resistance",
          multiplier: entry.multiplier,
          resistance: entry.baseResistance,
          resistanceReduction: entry.resistanceReduction
        },
        source: "enemy",
        stage: "resistance"
      })
    }
  }
  return {
    critDamage: event.critDamage,
    expectedDamage: event.expectedDamage,
    nonCritDamage: event.nonCritDamage,
    trace
  }
}

/**
 * Evaluates one explicit direct Moon or stellar-reaction action. The action declaration supplies
 * one damage part and any bounded current-window snapshot; it never derives an aura sequence or
 * a full rotation.
 */
