import { AnalysisPreparation } from "../core/analysis-preparation.js"
import { resolveFieldContext } from "../core/field-presence.js"
import {
  type CriticalStatsTransform,
  type ExpectedDamageResult,
  type RotationResult
} from "@gscombat/calculator"
import {
  getCombatActionDefinition,
  listCombatMetrics,
  raidenNationalBuiltinScenario as contentRaidenNationalBuiltinScenario
} from "@gscombat/content"
import {
  validateCharacterBuild,
  type ArtifactStat,
  type EvaluationScenario
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import {
  type AppliedCombatActionEffect
} from "../effects/action-effects.js"
import { resolveActiveElementOverrideWindows } from "../effects/active-element-overrides.js"
import { normalizeScenarioEffectSelections } from "../effects/effect-selection.js"
import { validateWeaponChoices } from "../effects/weapon-state.js"
import { evaluateDeclaredDirectScenarioAction } from "../evaluators/direct.js"
import { evaluateDeclaredSpecialReactionScenarioAction } from "../evaluators/special-reaction.js"
import { evaluateDeclaredTransformativeScenarioAction } from "../evaluators/transformative.js"
import type { ResolvedDeclaredScenarioStats } from "../evaluators/types.js"
import { resolveTeamBuffs, type AppliedScenarioBuff } from "./buffs.js"
import { resolveTeamState, type ResolvedTeamState } from "./team-state.js"

export type { AppliedScenarioBuff } from "./buffs.js"

export interface ScenarioTargetEvaluation {
  readonly eventStatContributions?: Readonly<Record<string, ResolvedDeclaredScenarioStats["statContributions"]>>
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  /** Legacy aggregate formula trace retained for one-hit compatibility. */
  readonly result: ExpectedDamageResult
  readonly rotation: RotationResult
  readonly stats: ResolvedDeclaredScenarioStats
}

export interface ScenarioEvaluation extends ScenarioTargetEvaluation {
  /** Total expected damage of the selected core action, never a full-rotation DPR or DPS. */
  readonly actionExpectedDamage: number
  readonly appliedBuffs: readonly AppliedScenarioBuff[]
  readonly teamState: ResolvedTeamState
}

export interface ScenarioIntervention {
  readonly transformCriticalStats?: CriticalStatsTransform
  readonly artifactStatDeltas?: Partial<Readonly<Record<ArtifactStat, number>>>
}

function getVerifiedDamageAction(scenario: EvaluationScenario) {
  const action = getCombatActionDefinition(scenario.targetActionId)
  if (!action || action.kind !== "damage" || action.status !== "verified") {
    throw new Error(`Target action ${scenario.targetActionId} is not registered as a verified damage action`)
  }
  if (action.characterId !== scenario.primary.characterId) {
    throw new Error(`Target action ${action.id} belongs to ${action.characterId}, not ${scenario.primary.characterId}`)
  }
  const selectableMetrics = listCombatMetrics().filter(
    (metric) => metric.kind === "damage" && metric.status === "verified" && metric.actionId === action.id
  )
  const minimumSourceConstellation = Math.min(
    ...selectableMetrics.map((metric) => metric.minimumSourceConstellation ?? 0)
  )
  if (selectableMetrics.length > 0 && scenario.primary.constellation < minimumSourceConstellation) {
    throw new Error(
      `Target action ${action.id} requires source constellation ${minimumSourceConstellation}, ` +
        `but build has constellation ${scenario.primary.constellation}`
    )
  }
  return action
}

function assertScenarioBuildsAreValid(scenario: EvaluationScenario): void {
  for (const build of [scenario.primary, ...scenario.teammates]) {
    const errors = validateCharacterBuild(build)
    if (errors.length > 0) {
      throw new Error(`Invalid character build ${build.buildId}: ${errors.join("; ")}`)
    }
  }
}

function evaluateVerifiedTargetAction(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  appliedBuffs: readonly AppliedScenarioBuff[],
  intervention: ScenarioIntervention,
  preparation: AnalysisPreparation
): ScenarioTargetEvaluation {
  const action = getVerifiedDamageAction(scenario)
  const fieldContext = { ...resolveFieldContext(action, scenario.primary, scenario.teammates, scenario.conditions.onFieldBuildId),
    targetIsSlime: scenario.conditions.targetIsSlime ?? false,
    arrowHitsWeakPoint: scenario.conditions.arrowHitsWeakPoint ?? false,
    ...(scenario.conditions.weaponEffectChoices ? { weaponEffectChoices: scenario.conditions.weaponEffectChoices } : {}) }
  const moonsignLevel = resolveTeamState(scenario.primary, scenario.teammates, gameData).moonsign.level
  if (action.evaluator === "declared_direct") {
    const artifactStatDeltas = intervention.artifactStatDeltas
    const rotationElementOverrides = resolveActiveElementOverrideWindows({
      activeEffectIds: scenario.conditions.activeEffectIds,
      gameData,
      primary: scenario.primary,
      targetAction: action,
      teammates: scenario.teammates
    })
    return evaluateDeclaredDirectScenarioAction({
      ...(intervention.transformCriticalStats ? { transformCriticalStats: intervention.transformCriticalStats } : {}),
      preparation,
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
      fieldContext,
      targetFrozen: scenario.conditions.targetFrozen ?? false,
      ...(scenario.conditions.actionParameters ? { actionParameters: scenario.conditions.actionParameters } : {}),
      build: scenario.primary,
      buffs: appliedBuffs,
      enemy: scenario.enemy,
      enemyCount: scenario.conditions.enemyCount,
      gameData,
      moonsignLevel,
      teammates: scenario.teammates,
      ...(scenario.conditions.targetAuraWindows ? { rotationAuras: scenario.conditions.targetAuraWindows } : {}),
      ...(rotationElementOverrides.length > 0 ? { rotationElementOverrides } : {}),
      ...(artifactStatDeltas ? { artifactStatDeltas } : {})
    })
  }
  if (action.evaluator === "declared_transformative") {
    const artifactStatDeltas = intervention.artifactStatDeltas
    return evaluateDeclaredTransformativeScenarioAction({
      preparation,
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
      fieldContext,
      targetFrozen: scenario.conditions.targetFrozen ?? false,
      ...(scenario.conditions.actionParameters ? { actionParameters: scenario.conditions.actionParameters } : {}),
      build: scenario.primary,
      buffs: appliedBuffs,
      enemy: scenario.enemy,
      enemyCount: scenario.conditions.enemyCount,
      gameData,
      moonsignLevel,
      teammates: scenario.teammates,
      ...(artifactStatDeltas ? { artifactStatDeltas } : {})
    })
  }
  if (action.evaluator === "declared_special_reaction") {
    const artifactStatDeltas = intervention.artifactStatDeltas
    return evaluateDeclaredSpecialReactionScenarioAction({
      ...(intervention.transformCriticalStats ? { transformCriticalStats: intervention.transformCriticalStats } : {}),
      preparation,
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
      fieldContext,
      targetFrozen: scenario.conditions.targetFrozen ?? false,
      ...(scenario.conditions.actionParameters ? { actionParameters: scenario.conditions.actionParameters } : {}),
      build: scenario.primary,
      buffs: appliedBuffs,
      enemy: scenario.enemy,
      enemyCount: scenario.conditions.enemyCount,
      gameData,
      moonsignLevel,
      teammates: scenario.teammates,
      ...(artifactStatDeltas ? { artifactStatDeltas } : {})
    })
  }
  throw new Error(`No evaluator is registered for verified target action ${action.id}`)
}

/** Evaluates a normalized team scenario through the supported target-action implementation. */
export function evaluatePreparedScenario(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  intervention: ScenarioIntervention = {},
  preparation = new AnalysisPreparation(gameData)
): ScenarioEvaluation {
  if (scenario.gameDataVersion !== gameData.getManifest().gameVersion) {
    throw new Error(`Game-data version mismatch: scenario ${scenario.gameDataVersion}`)
  }
  assertScenarioBuildsAreValid(scenario)
  const teamState = resolveTeamState(scenario.primary, scenario.teammates, gameData)
  validateWeaponChoices(scenario)
  const normalizedScenario = normalizeScenarioEffectSelections(scenario, gameData, teamState)
  const action = getVerifiedDamageAction(normalizedScenario)
  const appliedBuffs = resolveTeamBuffs(normalizedScenario, gameData, teamState, action)
  const targetEvaluation = evaluateVerifiedTargetAction(normalizedScenario, gameData, appliedBuffs, intervention, preparation)
  return {
    ...targetEvaluation,
    actionExpectedDamage: targetEvaluation.rotation.dpr,
    appliedBuffs,
    appliedEffects: targetEvaluation.appliedEffects,
    teamState
  }
}

/** Public isolated evaluation creates its own preparation lifetime. */
export function evaluateScenario(scenario: EvaluationScenario, gameData: GameDataRepository,
  intervention: ScenarioIntervention = {}): ScenarioEvaluation {
  return evaluatePreparedScenario(scenario, gameData, intervention)
}

export const raidenNationalBuiltinScenario: EvaluationScenario = contentRaidenNationalBuiltinScenario
