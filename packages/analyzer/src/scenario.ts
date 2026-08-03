import {
  getCombatActionDefinition,
  raidenNationalBuiltinScenario as contentRaidenNationalBuiltinScenario,
} from "@gscombat/content"
import {
  type ExpectedDamageResult,
  type RotationResult
} from "@gscombat/calculator"
import {
  type ArtifactStat,
  type EvaluationScenario,
  validateCharacterBuild
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveActiveElementOverrideWindows } from "./active-element-overrides.js"
import {
  type AppliedCombatActionEffect
} from "./action-effects.js"
import {
  evaluateDeclaredDirectScenarioAction,
  evaluateDeclaredSpecialReactionScenarioAction,
  evaluateDeclaredTransformativeScenarioAction,
  type ResolvedDeclaredScenarioStats
} from "./declared-scenario.js"
import { resolveTeamBuffs, type AppliedScenarioBuff } from "./scenario-buffs.js"
import { normalizeScenarioEffectSelections } from "./scenario-effect-selection.js"
import { resolveTeamState, type ResolvedTeamState } from "./team-state.js"

export const EFFECT_RAIDEN_SKILL_EYE = "raiden.skill.eye"
export const EFFECT_BENNETT_BURST_FIELD = "bennett.burst.field"

export type { AppliedScenarioBuff } from "./scenario-buffs.js"

export interface ScenarioTargetEvaluation {
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
  intervention: ScenarioIntervention
): ScenarioTargetEvaluation {
  const action = getVerifiedDamageAction(scenario)
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
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
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
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
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
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds === undefined
        ? {}
        : { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds }),
      action,
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
export function evaluateScenario(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  intervention: ScenarioIntervention = {}
): ScenarioEvaluation {
  if (scenario.gameDataVersion !== gameData.getManifest().gameVersion) {
    throw new Error(`Game-data version mismatch: scenario ${scenario.gameDataVersion}`)
  }
  assertScenarioBuildsAreValid(scenario)
  const teamState = resolveTeamState(scenario.primary, scenario.teammates, gameData)
  const normalizedScenario = normalizeScenarioEffectSelections(scenario, gameData, teamState)
  const action = getVerifiedDamageAction(normalizedScenario)
  const appliedBuffs = resolveTeamBuffs(normalizedScenario, gameData, teamState, action)
  const targetEvaluation = evaluateVerifiedTargetAction(normalizedScenario, gameData, appliedBuffs, intervention)
  return {
    ...targetEvaluation,
    actionExpectedDamage: targetEvaluation.rotation.dpr,
    appliedBuffs,
    appliedEffects: targetEvaluation.appliedEffects,
    teamState
  }
}

export const raidenNationalBuiltinScenario: EvaluationScenario = contentRaidenNationalBuiltinScenario
