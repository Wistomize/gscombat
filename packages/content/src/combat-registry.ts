import { characterCombatCoverageRegistry } from "./registry/character-combat.generated.js"

import type { TravelerElement } from "@gscombat/contracts"

import type {
  CharacterCombatCoverage,
  CombatActionMetadata,
  CombatCharacterTalentLevelConstellationBonus,
  CombatMetricDefinition
} from "./combat/types.js"

export type {
  CharacterCombatCoverage,
  CombatActionAdditionalDamageEvent,
  CombatActionAdditionalDamageEventEffect,
  CombatActionEffect,
  CombatActionEffectComputedScalar,
  CombatActionEffectScalar,
  CombatActionEffectSource,
  CombatActionEffectTarget,
  CombatActionEffectTargetFilter,
  CombatActionReactionKind,
  CombatActionEffectValue,
  CombatActionStatEffect,
  CombatAttackKind,
  CombatDirectSpecialReactionConfig,
  CombatActionEvaluator,
  CombatTransformativeReactionConfig,
  CombatActionCappedStatToAttackConversion,
  CombatCharacterScenarioEffectOption,
  CombatCharacterTalentLevelConstellationBonus,
  CombatActionFlatIntrinsicEffect,
  CombatActionIntrinsicEffect,
  CombatActionIntrinsicEffectTarget,
  CombatActionScenarioParameterLinearMultiplier,
  CombatActionScenarioParameterLookupMultiplier,
  CombatActionScenarioParameterMultiplier,
  CombatActionSourceStatIntrinsicEffect,
  CombatActionKind,
  CombatActionMetadata,
  CombatActionTimeline,
  CombatActionTalentLevelConstellationBonus,
  CombatCoverageStatus,
  CombatDamageBonusAttackType,
  CombatDamageEventTemplate,
  CombatDamageMetricDefinition,
  CombatDamageKind,
  CombatDamagePart,
  CombatDamageScalingTerm,
  CombatElementOverrideEffect,
  CombatEventSnapshot,
  CombatFlatStatBuffMetricDefinition,
  CombatHealingAdditionalScalingTerm,
  CombatHealingConditionalScalingBonus,
  CombatHealingSourceBonus,
  CombatMetricDefinition,
  CombatMetricKind,
  CombatMetricRecipientHpFractionRequirement,
  CombatMetricRecipientInSourceAreaRequirement,
  CombatMetricRecipientRequirement,
  CombatMetricSourceHpFractionRequirement,
  CombatMetricRatioConstellationBonus,
  CombatMetricRatioScenarioParameter,
  CombatMetricScalingStat,
  CombatMetricTalentParameter,
  CombatMetricTargetKind,
  CombatScalarMetricDefinition,
  CombatScalarMetricSemantic,
  CombatScalarMetricUnit,
  CombatEnemyScalarMetricDefinition,
  CombatFriendlyScalarMetricDefinition,
  CombatMeleeWeaponType,
  CombatParameterReference,
  CombatScaledHealingMetricDefinition,
  MultiScalingCombatDamagePart,
  SingleScalingCombatDamagePart,
  CombatTalentCoefficientSnapshotCheck,
  CombatTalentParameterGroupId,
  CombatTalentParameterSnapshotCheck,
  CombatTalentParameterReference,
  CombatTalentParameterSlot,
  CombatTalentSlot
} from "./combat/types.js"
/** Aggregates character-owned combat declarations without giving the registry any action semantics of its own. */
export { characterCombatCoverageRegistry }


/** Returns all characters that have an explicit combat coverage declaration. */
export function listCharacterCombatCoverage(): readonly CharacterCombatCoverage[] {
  return characterCombatCoverageRegistry
}

/** Finds a character's combat definition by its canonical game-data character ID. */
export function getCharacterCombatDefinition(characterId: string): CharacterCombatCoverage | undefined {
  return characterCombatCoverageRegistry.find((coverage) => coverage.characterId === characterId)
}

/** Returns the selected character's shared talent-level constellation mappings. */
export function listCharacterTalentLevelConstellationBonuses(
  characterId: string,
  travelerElement?: TravelerElement
): readonly CombatCharacterTalentLevelConstellationBonus[] {
  return (getCharacterCombatDefinition(characterId)?.talentLevelConstellationBonuses ?? []).filter(
    (bonus) => bonus.travelerElement === undefined || bonus.travelerElement === travelerElement
  )
}

/** Returns every explicitly declared action across the content coverage registry. */
export function listCombatActions(): readonly CombatActionMetadata[] {
  const declaredActions = characterCombatCoverageRegistry.flatMap((coverage) => coverage.actions)
  const declaredActionIds = new Set(declaredActions.map((action) => action.id))
  const derivedActions = new Map<string, CombatActionMetadata>()
  for (const action of declaredActions) {
    const noReactionActionId = getNoReactionActionId(action, declaredActionIds)
    if (!noReactionActionId || declaredActionIds.has(noReactionActionId) || derivedActions.has(noReactionActionId)) continue
    const { amplifyingReaction: _amplifyingReaction, ...withoutReaction } = action
    derivedActions.set(noReactionActionId, { ...withoutReaction, id: noReactionActionId })
  }
  return [...declaredActions, ...derivedActions.values()]
}

/** Returns every maintainer-selected, self-owned metric across the combat coverage registry. */
export function listCombatMetrics(): readonly CombatMetricDefinition[] {
  const declaredMetrics = characterCombatCoverageRegistry.flatMap((coverage) => coverage.metrics ?? [])
  const declaredActions = characterCombatCoverageRegistry.flatMap((coverage) => coverage.actions)
  const declaredActionIds = new Set(declaredActions.map((action) => action.id))
  const actionById = new Map(declaredActions.map((action) => [action.id, action]))
  const derivedMetrics = new Map<string, CombatMetricDefinition>()
  for (const metric of declaredMetrics) {
    if (metric.kind !== "damage") continue
    const action = actionById.get(metric.actionId)
    if (!action) continue
    const noReactionActionId = getNoReactionActionId(action, declaredActionIds)
    if (!noReactionActionId || derivedMetrics.has(noReactionActionId)) continue
    derivedMetrics.set(noReactionActionId, {
      ...metric,
      actionId: noReactionActionId,
      id: noReactionActionId,
      label: getNoReactionMetricLabel(metric.label),
      sourceActionId: noReactionActionId
    })
  }
  return [...declaredMetrics, ...derivedMetrics.values()]
}

function getNoReactionActionId(
  action: CombatActionMetadata,
  declaredActionIds: ReadonlySet<string>
): string | undefined {
  if (action.element !== "pyro" || !action.amplifyingReaction) return undefined
  const baseId = action.id.replace(/\.(hydro_aura_vaporize|cryo_aura_melt|reverse_vaporize)$/, "")
  if (baseId === action.id) return `${action.id}.no_reaction`
  return declaredActionIds.has(baseId) ? baseId : `${baseId}.no_reaction`
}

function getNoReactionMetricLabel(label: string): string {
  const withoutReaction = label.replace(/\s*·?\s*(水底蒸发|冰底融化|蒸发|融化).*$/, "")
  return `${withoutReaction} · 无反应`
}

/** Returns every self-owned metric selected for one character. */
export function listCharacterCombatMetrics(characterId: string): readonly CombatMetricDefinition[] {
  return getCharacterCombatDefinition(characterId)?.metrics ?? []
}

/** Finds one declared combat action by its stable action ID. */
export function getCombatActionDefinition(actionId: string): CombatActionMetadata | undefined {
  return listCombatActions().find((action) => action.id === actionId)
}

/** Finds one self-owned combat metric by its stable metric ID. */
export function getCombatMetricDefinition(metricId: string): CombatMetricDefinition | undefined {
  return listCombatMetrics().find((metric) => metric.id === metricId)
}

/** Finds a character coverage declaration by canonical game-data character ID. */
export function getCharacterCombatCoverage(characterId: string): CharacterCombatCoverage | undefined {
  return getCharacterCombatDefinition(characterId)
}

/** Finds one declared action by its stable action ID. */
export function getCombatAction(actionId: string): CombatActionMetadata | undefined {
  return getCombatActionDefinition(actionId)
}
