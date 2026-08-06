import type {
  analyzeScenario,
  CombatMetricEvaluation,
  CombatMetricFormula,
  evaluateScenario
} from "@gscombat/analyzer"
import type { RotationEventResult, RotationTraceEntry } from "@gscombat/calculator"
import type {
  AnalysisResponse,
  SupportMetricFormula,
  SupportMetricResult
} from "@gscombat/contracts"

function serializeRotationTraceEntry(trace: RotationTraceEntry) {
  if (trace.kind !== "scaling_terms") return { ...trace }
  return { ...trace, terms: trace.terms.map((term) => ({ ...term })) }
}

/** Projects an internal rotation event into a JSON-safe analysis response with its event-level formula trace. */
export function serializeRotationEvent(event: RotationEventResult) {
  const { appliedEffectIds, elementalApplication, elementOverride, trace, ...baseEvent } = event
  return {
    ...baseEvent,
    appliedEffectIds: [...appliedEffectIds],
    ...(elementalApplication ? { elementalApplication: { ...elementalApplication } } : {}),
    ...(elementOverride ? { elementOverride: { ...elementOverride } } : {}),
    trace: trace.map(serializeRotationTraceEntry)
  }
}

/** Copies one non-damage metric formula tree into a mutable, JSON-safe response value. */
export function serializeSupportMetricFormula(formula: CombatMetricFormula): SupportMetricFormula {
  if (formula.kind === "rotation_events") {
    throw new Error("Support metric responses cannot contain a damage rotation formula")
  }
  if (formula.kind === "term") return { ...formula }
  if (formula.kind === "condition") {
    return {
      ...formula,
      condition: { ...formula.condition },
      operand: serializeSupportMetricFormula(formula.operand)
    }
  }
  if (formula.kind === "maximum" || formula.kind === "minimum") {
    return {
      ...formula,
      operands: [serializeSupportMetricFormula(formula.operands[0]), serializeSupportMetricFormula(formula.operands[1])]
    }
  }
  return { ...formula, operands: formula.operands.map(serializeSupportMetricFormula) }
}

/** Copies a verified non-damage metric evaluation into its stable public response representation. */
export function serializeSupportMetricResult(
  metric: Exclude<CombatMetricEvaluation, { readonly kind: "damage" }>
): SupportMetricResult {
  const conditions = metric.conditions.map((condition) => ({ ...condition }))
  const formula = serializeSupportMetricFormula(metric.formula)
  if (metric.kind === "healing") {
    const {
      actualRestoredFormula,
      actualRestoredValue,
      conditions: _conditions,
      formula: _formula,
      missingHp,
      recipient,
      ...baseMetric
    } = metric
    return {
      ...baseMetric,
      ...(actualRestoredFormula === undefined
        ? {}
        : { actualRestoredFormula: serializeSupportMetricFormula(actualRestoredFormula) }),
      ...(actualRestoredValue === undefined ? {} : { actualRestoredValue }),
      ...(missingHp === undefined ? {} : { missingHp }),
      conditions,
      formula,
      recipient: { ...recipient }
    }
  }
  if (metric.kind === "stat_buff") {
    const { conditions: _conditions, formula: _formula, recipient, ...baseMetric } = metric
    return { ...baseMetric, conditions, formula, recipient: { ...recipient } }
  }
  const {
    affectedElement,
    appliesTo,
    conditions: _conditions,
    formula: _formula,
    maximumValue,
    scalingStat,
    scalingValue,
    target,
    ...baseMetric
  } = metric
  return {
    ...baseMetric,
    ...(affectedElement === undefined ? {} : { affectedElement }),
    ...(appliesTo === undefined ? {} : { appliesTo: [...appliesTo] }),
    ...(maximumValue === undefined ? {} : { maximumValue }),
    ...(scalingStat === undefined ? {} : { scalingStat }),
    ...(scalingValue === undefined ? {} : { scalingValue }),
    conditions,
    formula,
    target: { ...target }
  }
}

/** Projects one complete analysis evaluation into the stable public response shape. */
export function serializeAnalysisResponse(
  evaluation: ReturnType<typeof evaluateScenario>,
  analysis: ReturnType<typeof analyzeScenario>
): AnalysisResponse {
  const { scalingTerms, statContributions, ...resolvedStats } = evaluation.stats
  return {
    analysis: {
      ...analysis,
      effectiveArtifacts: [...analysis.effectiveArtifacts],
      marginalSubstats: [...analysis.marginalSubstats],
      progressionGains: [...analysis.progressionGains],
      weapons: [...analysis.weapons]
    },
    engineVersion: "scenario-1",
    evaluation: {
      appliedEffects: [...evaluation.appliedEffects],
      appliedBuffs: [...evaluation.appliedBuffs],
      formulaAuthority: "rotation_events",
      result: { ...evaluation.result, trace: [...evaluation.result.trace] },
      rotation: {
        dpr: evaluation.rotation.dpr,
        dps: evaluation.rotation.dps,
        duration: evaluation.rotation.duration,
        events: evaluation.rotation.events.map(serializeRotationEvent)
      },
      teamState: {
        activeResonanceIds: [...evaluation.teamState.activeResonanceIds],
        hexereiSecretRite: evaluation.teamState.hexereiSecretRite,
        moonsign: {
          characterBuildIds: [...evaluation.teamState.moonsign.characterBuildIds],
          characterCount: evaluation.teamState.moonsign.characterCount,
          level: evaluation.teamState.moonsign.level
        },
        nightsoulBurst: {
          characterBuildIds: [...evaluation.teamState.nightsoulBurst.characterBuildIds],
          characterCount: evaluation.teamState.nightsoulBurst.characterCount,
          cooldownSeconds: evaluation.teamState.nightsoulBurst.cooldownSeconds,
          hasXilonenIndependentTrigger: evaluation.teamState.nightsoulBurst.hasXilonenIndependentTrigger
        }
      },
      stats: {
        ...resolvedStats,
        statContributions: [...statContributions],
        ...(scalingTerms ? { scalingTerms: [...scalingTerms] } : {})
      }
    }
  }
}
