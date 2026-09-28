import { evaluateDeclaredDirectScenarioAction as evaluateDirect } from "./direct.js"
import { evaluateDeclaredSpecialReactionScenarioAction as evaluateSpecial } from "./special-reaction.js"
import { evaluateDeclaredTransformativeScenarioAction as evaluateTransformative } from "./transformative.js"
import type { DeclaredDirectScenarioInput, DeclaredDirectScenarioEvaluation,
  DeclaredSpecialReactionScenarioEvaluation, DeclaredTransformativeScenarioEvaluation } from "./types.js"

// The internal reuse context is not part of the public evaluator contract.
export const evaluateDeclaredDirectScenarioAction:
  (input: DeclaredDirectScenarioInput) => DeclaredDirectScenarioEvaluation = evaluateDirect
export const evaluateDeclaredSpecialReactionScenarioAction:
  (input: DeclaredDirectScenarioInput) => DeclaredSpecialReactionScenarioEvaluation = evaluateSpecial
export const evaluateDeclaredTransformativeScenarioAction:
  (input: DeclaredDirectScenarioInput) => DeclaredTransformativeScenarioEvaluation = evaluateTransformative
export { getScenarioParameterMinimumSourceConstellation, resolveActionScenarioParameters } from "./scenario-parameters.js"
export { resolveScenarioSourceStatMaps } from "./source-stats.js"
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
