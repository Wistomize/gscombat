import type { createCombatAuthoringAuditReport, createCombatCoverageReport } from "@gscombat/analyzer"
import {
  normalizeProjectedMetricLabel,
  type CombatActionMetadata,
  type CombatDamagePart,
  type CombatElementOverrideEffect,
  type CombatMetricDefinition,
  type MultiScalingCombatDamagePart
} from "@gscombat/content"
import type { CombatAuthoringAuditReport, CombatCoverageReport } from "@gscombat/contracts"

type SerializedCombatAction = CombatCoverageReport["characters"][number]["actions"][number]
type SerializedCombatTimelineEvent = NonNullable<SerializedCombatAction["timeline"]>["damageEvents"][number]

function hasMultipleScalingTerms(part: CombatDamagePart): part is MultiScalingCombatDamagePart {
  return part.scalingTerms !== undefined
}

/** Projects immutable combat content into mutable JSON-safe coverage response data. */
export function serializeCombatAction(
  action: CombatActionMetadata
): SerializedCombatAction {
  const {
    damageParts,
    intrinsicEffects,
    parameterReferences,
    scenarioParameters,
    timeline,
    ...baseAction
  } = action
  return {
    ...baseAction,
    ...(damageParts
      ? {
          damageParts: damageParts.map((part) => {
            if (hasMultipleScalingTerms(part)) {
              return {
                id: part.id,
                scalingTerms: part.scalingTerms.map(
                  ({ coefficientMultiplierSnapshotChecks: _multiplierChecks, snapshotChecks: _snapshotChecks, ...term }) => ({
                    ...term
                  })
                )
              }
            }
            const { snapshotChecks: _snapshotChecks, ...serializedPart } = part
            return { ...serializedPart }
          })
        }
      : {}),
    ...(intrinsicEffects ? { intrinsicEffects: intrinsicEffects.map(serializeCombatIntrinsicEffect) } : {}),
    ...(timeline
      ? {
          timeline: {
            damageEvents: timeline.damageEvents.map(serializeCombatTimelineEvent),
            duration: timeline.duration
          }
        }
      : {}),
    ...(parameterReferences
      ? {
          parameterReferences: parameterReferences.map((reference) =>
            reference.source === "raw" ? { ...reference, path: [...reference.path] } : { ...reference }
          )
        }
      : {}),
    ...(scenarioParameters
      ? {
          scenarioParameters: scenarioParameters.map(({
            allowedValues,
            maximumValueByParameter,
            rangeBySourceConstellation,
            ...parameter
          }) => ({
            ...parameter,
            ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
            ...(maximumValueByParameter
              ? {
                  maximumValueByParameter: {
                    ...maximumValueByParameter,
                    values: maximumValueByParameter.values.map((value) => ({ ...value }))
                  }
                }
              : {}),
            ...(rangeBySourceConstellation
              ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
              : {})
          }))
        }
      : {})
  }
}

/** Copies one discriminated timeline event without leaking maintainer-only snapshot checks. */
function serializeCombatTimelineEvent(
  event: NonNullable<CombatActionMetadata["timeline"]>["damageEvents"][number]
): SerializedCombatTimelineEvent {
  const baseTiming = {
    at: event.at,
    ...(event.hitCount === undefined
      ? {}
      : { hitCount: typeof event.hitCount === "number" ? event.hitCount : { ...event.hitCount } }),
    id: event.id,
    ...(event.maximumSourceConstellation === undefined
      ? {}
      : { maximumSourceConstellation: event.maximumSourceConstellation }),
    ...(event.minimumSourceConstellation === undefined
      ? {}
      : { minimumSourceConstellation: event.minimumSourceConstellation })
  }
  const timing = event.snapshot === "time"
    ? { ...baseTiming, snapshot: "time" as const, snapshotAt: event.snapshotAt }
    : { ...baseTiming, snapshot: event.snapshot }
  if (event.stellarSwirlReaction !== undefined) {
    const stellarSwirlReaction = event.stellarSwirlReaction.event === "trigger"
      ? { event: "trigger" as const }
      : {
          event: "vortex" as const,
          vortexLevel: requireStellarVortexLevel(event.stellarSwirlReaction.vortexLevel, event.id)
        }
    return {
      ...timing,
      stellarSwirlReaction
    }
  }

  const coefficientMultiplier = event.coefficientMultiplier
  const elementalApplication = event.elementalApplication
  return {
    ...timing,
    ...(coefficientMultiplier
      ? {
          coefficientMultiplier:
            coefficientMultiplier.kind === "scenario_parameter_lookup"
              ? {
                  ...coefficientMultiplier,
                  values: coefficientMultiplier.values.map((value) => ({ ...value }))
                }
              : {
                  base: coefficientMultiplier.base,
                  kind: coefficientMultiplier.kind,
                  parameterId: coefficientMultiplier.parameterId,
                  perParameterTalentCoefficientId: coefficientMultiplier.perParameterTalentCoefficientId
                }
        }
      : {}),
    damagePartId: event.damagePartId,
    ...(elementalApplication
      ? {
          elementalApplication: {
            ...elementalApplication,
            icd: { ...elementalApplication.icd }
          }
        }
      : {}),
    ...(event.elementOverrideTarget === undefined ? {} : { elementOverrideTarget: event.elementOverrideTarget }),
    ...(event.specialReaction === undefined ? {} : { specialReaction: { ...event.specialReaction } })
  }
}

/** Narrows an audited Stellar-Vortex level for the public discriminated response schema. */
function requireStellarVortexLevel(level: 1 | 2 | undefined, eventId: string): 1 | 2 {
  if (level === 1 || level === 2) return level
  throw new Error(`Stellar-Swirl vortex event ${eventId} must declare level 1 or 2`)
}

/** Copies one action-owned intrinsic effect into the mutable JSON coverage response. */
function serializeCombatIntrinsicEffect(
  effect: NonNullable<CombatActionMetadata["intrinsicEffects"]>[number]
) {
  if (effect.kind === "flat") {
    const { scenarioParameterMultiplier, snapshotChecks, ...baseEffect } = effect
    return {
      ...baseEffect,
      ...(snapshotChecks ? { snapshotChecks: snapshotChecks.map((check) => ({ ...check })) } : {}),
      ...(scenarioParameterMultiplier
        ? { scenarioParameterMultiplier: serializeCombatIntrinsicEffectScenarioMultiplier(scenarioParameterMultiplier) }
        : {})
    }
  }
  const {
    maximumValueSnapshotChecks,
    scenarioParameterMultiplier,
    snapshotChecks,
    sourceStatMaximumSnapshotChecks,
    sourceStatOffsetSnapshotChecks,
    ...baseEffect
  } = effect
  return {
    ...baseEffect,
    ...(snapshotChecks ? { snapshotChecks: snapshotChecks.map((check) => ({ ...check })) } : {}),
    ...(maximumValueSnapshotChecks
      ? { maximumValueSnapshotChecks: maximumValueSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(sourceStatMaximumSnapshotChecks
      ? { sourceStatMaximumSnapshotChecks: sourceStatMaximumSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(sourceStatOffsetSnapshotChecks
      ? { sourceStatOffsetSnapshotChecks: sourceStatOffsetSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(scenarioParameterMultiplier
      ? { scenarioParameterMultiplier: serializeCombatIntrinsicEffectScenarioMultiplier(scenarioParameterMultiplier) }
      : {})
  }
}

/** Copies one action-owned scenario multiplier into the mutable JSON coverage response. */
function serializeCombatIntrinsicEffectScenarioMultiplier(
  multiplier: NonNullable<NonNullable<CombatActionMetadata["intrinsicEffects"]>[number]["scenarioParameterMultiplier"]>
) {
  if (!("values" in multiplier)) return { ...multiplier }
  return { ...multiplier, values: multiplier.values.map((value) => ({ ...value })) }
}

/** Copies one content-owned elemental override effect into the mutable JSON API response. */
export function serializeCombatElementOverrideEffect(effect: CombatElementOverrideEffect) {
  return {
    ...effect,
    durationChecks: effect.durationChecks.map((check) => ({ ...check })),
    durationParameter: { ...effect.durationParameter },
    eligibleWeaponTypes: [...effect.eligibleWeaponTypes]
  }
}

/** Projects a content-owned metric declaration into the stable public selection catalog. */
export function serializeCombatMetric(
  metric: CombatMetricDefinition
): CombatCoverageReport["characters"][number]["metrics"][number] {
  return {
    id: metric.id,
    kind: metric.kind,
    label: normalizeProjectedMetricLabel(metric.label),
    ...(metric.minimumSourceConstellation === undefined
      ? {}
      : { minimumSourceConstellation: metric.minimumSourceConstellation }),
    sourceActionId: metric.sourceActionId,
    status: metric.status,
    target: metric.target
  }
}

/** Serializes a complete combat-coverage report without leaking readonly domain collections. */
export function serializeCombatCoverageReport(
  report: ReturnType<typeof createCombatCoverageReport>
): CombatCoverageReport {
  return {
    characterStatusCounts: { ...report.characterStatusCounts },
    characters: report.characters.map((character) => ({
      ...character,
      actions: character.actions.map(serializeCombatAction),
      effects: character.effects.map(serializeCombatElementOverrideEffect),
      metrics: character.metrics.map(serializeCombatMetric),
      parameterGroups: [...character.parameterGroups]
    })),
    totalCharacters: report.totalCharacters,
    verifiedActionCount: report.verifiedActionCount,
    verifiedMetricCount: report.verifiedMetricCount
  }
}

/** Serializes a complete combat-authoring audit report into mutable response values. */
export function serializeCombatAuthoringAuditReport(
  report: ReturnType<typeof createCombatAuthoringAuditReport>
): CombatAuthoringAuditReport {
  return {
    characters: report.characters.map((character) => ({
      ...character,
      candidateTalentParameterOwners: character.candidateTalentParameterOwners.map((owner) => ({
        ...owner,
        coreTalentGroups: { ...owner.coreTalentGroups }
      })),
      declaredActionIds: [...character.declaredActionIds],
      inherentBaseStats: { ...character.inherentBaseStats }
    })),
    readinessCounts: { ...report.readinessCounts },
    totalStaticCharacters: report.totalStaticCharacters,
    unboundTalentParameterOwnerIds: [...report.unboundTalentParameterOwnerIds]
  }
}
