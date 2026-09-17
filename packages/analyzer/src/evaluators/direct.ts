import {
  calculateStellarSwirlReactionExpectedDamage,
  calculateDirectSpecialReactionDamage,
  evaluateExpectedDamage,
  evaluateRotation, type DamageAction, type ExpectedDamageResult,
  type Modifier, type RotationResult
} from "@gscombat/calculator"
import type {
  CombatActionMetadata
} from "@gscombat/content"

import {
  resolveAdditionalDamageEventEffects, resolveCombatActionEffects, type AppliedCombatActionEffect, type ResolvedCombatActionEffects
} from "../effects/action-effects.js"
import { getBuffTotal, resolvePartyElements } from "./context.js"
import { resolveBuildElement } from "../core/build-variant.js"
import {
  resolveDeclaredActionTalentLevelConstellationBonuses
} from "./declared-action.js"
import { resolveActionScenarioParameters } from "./scenario-parameters.js"

export { getScenarioParameterMinimumSourceConstellation, resolveActionScenarioParameters } from "./scenario-parameters.js"

import type {
  DeclaredDirectScenarioEvaluation,
  DeclaredDirectScenarioInput, ResolvedDeclaredScenarioStats
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

import { resolveFieldContext } from "../core/field-presence.js"
import * as shared from "./shared.js"

export function evaluateDeclaredDirectScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredDirectScenarioEvaluation {
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
    rotationAuras,
    rotationEffects,
    rotationElementOverrides,
    teammates = [],
    moonsignLevel = "none"
  } = input
  const fieldContext = input.fieldContext ?? resolveFieldContext(action, build, teammates)
  shared.assertDeclaredDirectAction(action)
  if (shared.hasDeclaredMixedSpecialReactionEvents(action)) return evaluateDeclaredMixedSpecialReactionScenarioAction(input)
  const talent = shared.getDamageTalentSlot(action)
  const resolvedActionParameters = new Map(
    resolveActionScenarioParameters(action, actionParameters, build.constellation)
  )
  let parts = action.damageParts.map((part) =>
    shared.resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  let timeline = shared.resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  const effectiveElements = shared.resolveDeclaredActionEffectElements(
    action,
    build.buildId,
    timeline,
    rotationElementOverrides
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
    sourceElementalMasteryBeforeShareByBuildId,
    sourceFinalHpByBuildId,
    teamUniqueElementCount
  } = shared.resolveScenarioActionEffectContext({
    action,
    fieldContext,
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
  const legacyScalingStat = action.scalingStat
  const candidateAmplifyingReactionKinds = shared.resolveActualDynamicAmplifyingReactionKinds(
    action,
    build.buildId,
    action.additiveReaction ?? action.amplifyingReaction,
    legacyScalingStat,
    timeline,
    baseStats.rotation,
    enemy,
    rotationAuras,
    rotationElementOverrides
  )
  const actionEffects = resolveCombatActionEffects({
    targetFrozen: input.targetFrozen ?? false,
    action,
    fieldContext,
    activeEffectIds: resolvedActiveEffectIds,
    ...(candidateAmplifyingReactionKinds.length > 0 ? { candidateAmplifyingReactionKinds } : {}),
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements,
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    sourceElementalMasteryBeforeShareByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  })
  shared.applyActionParameterEffects(action, resolvedActionParameters, actionEffects.appliedEffects)
  parts = action.damageParts.map((part) =>
    shared.resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  timeline = shared.resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  const effectiveDefenseReduction = enemy.defenseReduction + actionEffects.enemyDefenseReduction
  const stats = shared.resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    actionEffects
  )
  const multiScalingPart = parts.find(shared.hasResolvedMultipleScalingTerms)
  const additiveReaction = shared.resolveAdditiveReactionWithActionEffects(
    action.additiveReaction,
    actionEffects.reactionDamageBonus
  )
  const amplifyingReaction = shared.resolveAmplifyingReactionWithActionEffects(
    action.amplifyingReaction,
    actionEffects.amplifyingReactionBonus
  )
  const declaredReaction = additiveReaction ?? amplifyingReaction
  const matchedActionDamageScalingTerms = shared.resolveMatchedActionDamageScalingTerms(
    actionEffects,
    resolvedActionParameters
  )
  const talentMultiplier = multiScalingPart
    ? null
    : parts.reduce((total, part) => total + (part.coefficient ?? 0), 0)
  const scenarioStats: ResolvedDeclaredScenarioStats = {
    ...stats.scenario,
    ...(action.scenarioParameters && action.scenarioParameters.length > 0
      ? { actionParameters: Object.fromEntries(resolvedActionParameters) }
      : {}),
    ...(multiScalingPart ? { scalingTerms: multiScalingPart.terms } : {}),
    talentMultiplier
  }
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects: readonly AppliedCombatActionEffect[] = [
    ...shared.materializeDeferredStatEffects(
      actionEffects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ]
  const actionModifiers: Modifier[] = [
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "baseDamageFlat")
      .map((effect) => ({
        filter: { actionId: action.id },
        kind: "base_damage_flat" as const,
        source: effect.id,
        value: effect.value
      })),
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "enemyResistanceReduction")
      .map((effect) => ({
        element: action.element,
        kind: "resistance_reduction" as const,
        source: effect.id,
        value: effect.value
      })),
    ...actionEffects.appliedEffects
      .filter((effect) => effect.target === "enemyDefenseIgnore")
      .map((effect) => ({
        filter: { actionId: action.id },
        kind: "defense_ignore" as const,
        source: effect.id,
        value: effect.value
      }))
  ]
  const directDamageScalingTerms = shared.createDirectDamageScalingTerms(
    action.id,
    legacyScalingStat,
    talentMultiplier,
    multiScalingPart,
    matchedActionDamageScalingTerms
  )
  const damageAction: DamageAction = directDamageScalingTerms
    ? {
        ...(additiveReaction ? { additiveReaction } : {}),
        ...(amplifyingReaction ? { amplifyingReaction } : {}),
        canCrit: true,
        scalingTerms: directDamageScalingTerms,
        tags: {
          actionId: action.id,
          element: action.element,
          ownerId: action.characterId,
          talent
        }
      }
    : {
        ...(additiveReaction ? { additiveReaction } : {}),
        ...(amplifyingReaction ? { amplifyingReaction } : {}),
        canCrit: true,
        multiplier: talentMultiplier ?? 0,
        scalingStat: shared.requireLegacyScalingStat(action.id, legacyScalingStat),
        tags: {
          actionId: action.id,
          element: action.element,
          ownerId: action.characterId,
          talent
        }
      }
  const result = evaluateExpectedDamage({
    action: damageAction,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    modifiers: actionModifiers,
    stats: {
      attackPercent: scenarioStats.attackPercent,
      baseAttack: scenarioStats.baseAttack,
      critDamage: scenarioStats.critDamage,
      critRate: scenarioStats.critRate,
      damageBonus: scenarioStats.damageBonus,
      defense: stats.rotation.defense,
      elementalMastery: scenarioStats.elementalMastery,
      flatAttack: scenarioStats.flatAttack,
      hp: stats.rotation.hp,
      level: build.level
    }
  })
  const declaredRotationEvents = timeline.events.map((event) =>
    shared.createDeclaredRotationEvent(
      action,
      build.buildId,
      declaredReaction,
      legacyScalingStat,
      matchedActionDamageScalingTerms,
      actionEffects.baseDamageFlat,
      stats.rotation,
      event,
      actionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      actionEffects.enemyDefenseIgnore,
      actionEffects.amplifyingReactionBonus
    )
  )
  const additionalDamageEventTime = timeline.events[0]?.time ?? 0
  const additionalDamageEventSnapshotTime = timeline.events[0]?.statSnapshotTime ?? 0
  const additionalDamageEventAppliedEffects: AppliedCombatActionEffect[] = []
  const additionalDamageRotationEvents = actionEffects.additionalDamageEvents.map((event) => {
    const additionalDamageEventEffects = resolveAdditionalDamageEventEffects({
    targetFrozen: input.targetFrozen ?? false,
      action,
      fieldContext,
      activeEffectIds: resolvedActiveEffectIds,
      ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
      additionalDamageEvent: event,
      baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    gameData,
    moonsignLevel,
    primary: build,
      ...(primaryElement === null ? {} : { primaryElement }),
      sourceFinalDefenseByBuildId,
      sourceFinalAttackByBuildId,
      sourceFinalHpByBuildId,
      sourceFinalElementalMasteryByBuildId,
      sourceElementalMasteryBeforeShareByBuildId,
      ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
      ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
      ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
      teamElements: resolvePartyElements(build, teammates, gameData),
      teammates
    })
    const additionalDamageEventStats = shared.resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      additionalDamageEventEffects
    )
    const eventAppliedEffects = shared.materializeDeferredStatEffects(
      additionalDamageEventEffects.appliedEffects,
      additionalDamageEventStats.rotation.hp,
      additionalDamageEventStats.elementalMasteryForAttackConversion
    )
    additionalDamageEventAppliedEffects.push(...eventAppliedEffects)
    return shared.createAdditionalDamageRotationEvent(
      action.id,
      build.buildId,
      additionalDamageEventStats.additionalDamageEventRotation,
      event,
      eventAppliedEffects,
      additionalDamageEventTime,
      additionalDamageEventSnapshotTime,
      additionalDamageEventEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      additionalDamageEventEffects.enemyDefenseIgnore,
      additionalDamageEventEffects.baseDamageFlat,
      shared.resolveMatchedActionDamageScalingTerms(additionalDamageEventEffects, resolvedActionParameters)
    )
  })
  const rotation = evaluateRotation({
    duration: timeline.duration,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    ...(rotationEffects ? { effects: rotationEffects } : {}),
    ...(rotationElementOverrides ? { elementOverrides: rotationElementOverrides } : {}),
    ...(rotationAuras ? { sustainedAuras: rotationAuras } : {}),
    events: [...declaredRotationEvents, ...additionalDamageRotationEvents].sort((left, right) => left.time - right.time)
  })
  return {
    appliedEffects: shared.deduplicateAppliedEffects([...appliedEffects, ...additionalDamageEventAppliedEffects]),
    parts,
    result,
    rotation,
    stats: scenarioStats
  }
}

/**
 * Evaluates a verified direct action whose timeline contains both ordinary direct hits and independent Moon or
 * Stellar-reaction hits. The two event families deliberately resolve their effects and formula stages separately.
 */
function evaluateDeclaredMixedSpecialReactionScenarioAction(
  input: DeclaredDirectScenarioInput
): DeclaredDirectScenarioEvaluation {
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
    rotationAuras,
    rotationEffects,
    rotationElementOverrides,
    teammates = [],
    moonsignLevel = "none"
  } = input
  const fieldContext = input.fieldContext ?? resolveFieldContext(action, build, teammates)
  shared.assertDeclaredDirectAction(action)
  shared.getDamageTalentSlot(action)
  const resolvedActionParameters = new Map(
    resolveActionScenarioParameters(action, actionParameters, build.constellation)
  )
  let parts = action.damageParts.map((part) =>
    shared.resolveDamagePart(action, build, part, gameData, resolvedActionParameters)
  )
  let timeline = shared.resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  let damagePartEvents = timeline.events.filter(shared.isDeclaredDamagePartTimelineEvent)
  let ordinaryEvents = damagePartEvents.filter((event) => event.specialReaction === undefined)
  let specialEvents = timeline.events.filter(shared.isDeclaredSpecialReactionTimelineEvent)
  let stellarSwirlReactionEvents = timeline.events.filter(shared.isDeclaredStellarSwirlReactionTimelineEvent)
  const ordinaryTimeline = { duration: timeline.duration, events: ordinaryEvents }
  const effectiveElements = shared.resolveDeclaredActionEffectElements(
    action,
    build.buildId,
    ordinaryTimeline,
    rotationElementOverrides
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
    sourceElementalMasteryBeforeShareByBuildId,
    sourceFinalHpByBuildId,
    teamUniqueElementCount
  } = shared.resolveScenarioActionEffectContext({
    action,
    fieldContext,
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
  const legacyScalingStat = action.scalingStat
  const candidateAmplifyingReactionKinds = shared.resolveActualDynamicAmplifyingReactionKinds(
    action,
    build.buildId,
    action.additiveReaction ?? action.amplifyingReaction,
    legacyScalingStat,
    ordinaryTimeline,
    baseStats.rotation,
    enemy,
    rotationAuras,
    rotationElementOverrides
  )
  const actionEffectContext = {
    action,
    fieldContext,
    activeEffectIds: resolvedActiveEffectIds,
    ...(candidateAmplifyingReactionKinds.length > 0 ? { candidateAmplifyingReactionKinds } : {}),
    ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
    baseEnergyRecharge: baseStats.scenario.energyRecharge,
    enemyCount,
    effectiveElements,
    gameData,
    moonsignLevel,
    primary: build,
    ...(primaryElement === null ? {} : { primaryElement }),
    sourceFinalDefenseByBuildId,
    sourceFinalAttackByBuildId,
    sourceFinalHpByBuildId,
    sourceFinalElementalMasteryByBuildId,
    sourceElementalMasteryBeforeShareByBuildId,
    ...(primaryDifferentElementTeammateCount === null ? {} : { primaryDifferentElementTeammateCount }),
    ...(primarySameElementTeammateCount === null ? {} : { primarySameElementTeammateCount }),
    ...(teamUniqueElementCount === null ? {} : { teamUniqueElementCount }),
    teamElements: resolvePartyElements(build, teammates, gameData),
    teammates
  }
  const specialReactionKinds = [
    ...new Set([
      ...specialEvents.map((event) => event.specialReaction.kind),
      ...(stellarSwirlReactionEvents.length > 0 ? ["stellar_swirl" as const] : [])
    ])
  ]
  const parameterEffects = resolveCombatActionEffects({
    targetFrozen: input.targetFrozen ?? false,
    ...actionEffectContext,
    candidateSpecialReactionKinds: specialReactionKinds
  })
  shared.applyActionParameterEffects(action, resolvedActionParameters, parameterEffects.appliedEffects)
  parts = action.damageParts.map((part) => shared.resolveDamagePart(action, build, part, gameData, resolvedActionParameters))
  timeline = shared.resolveDeclaredTimeline(action, build, gameData, parts, resolvedActionParameters)
  damagePartEvents = timeline.events.filter(shared.isDeclaredDamagePartTimelineEvent)
  ordinaryEvents = damagePartEvents.filter((event) => event.specialReaction === undefined)
  specialEvents = timeline.events.filter(shared.isDeclaredSpecialReactionTimelineEvent)
  stellarSwirlReactionEvents = timeline.events.filter(shared.isDeclaredStellarSwirlReactionTimelineEvent)
  const resolvedOrdinaryTimeline = { duration: timeline.duration, events: ordinaryEvents }
  const ordinaryActionEffects = resolveCombatActionEffects({
    targetFrozen: input.targetFrozen ?? false,
    ...actionEffectContext,
    candidateSpecialReactionKinds: [],
    effectiveElements: shared.resolveDeclaredActionEffectElements(
      action,
      build.buildId,
      resolvedOrdinaryTimeline,
      rotationElementOverrides
    )
  })
  const ordinaryStats = shared.resolveStats(
    build,
    action,
    gameData,
    buffs,
    artifactStatDeltas,
    resolvedActionParameters,
    ordinaryActionEffects
  )
  const ordinaryPartIds = new Set(ordinaryEvents.map((event) => event.part.id))
  const ordinaryParts = parts.filter((part) => ordinaryPartIds.has(part.id))
  const ordinaryMultiScalingPart = ordinaryParts.find(shared.hasResolvedMultipleScalingTerms)
  const ordinaryTalentMultiplier = ordinaryMultiScalingPart
    ? null
    : ordinaryParts.reduce((total, part) => total + (part.coefficient ?? 0), 0)
  const ordinaryScenarioStats = shared.createDeclaredScenarioStats(
    action,
    resolvedActionParameters,
    ordinaryStats.scenario,
    ordinaryMultiScalingPart,
    ordinaryTalentMultiplier
  )
  const effectiveDefenseReduction = enemy.defenseReduction + ordinaryActionEffects.enemyDefenseReduction
  const additiveReaction = shared.resolveAdditiveReactionWithActionEffects(
    action.additiveReaction,
    ordinaryActionEffects.reactionDamageBonus
  )
  const amplifyingReaction = shared.resolveAmplifyingReactionWithActionEffects(
    action.amplifyingReaction,
    ordinaryActionEffects.amplifyingReactionBonus
  )
  const declaredReaction = additiveReaction ?? amplifyingReaction
  const matchedActionDamageScalingTerms = shared.resolveMatchedActionDamageScalingTerms(
    ordinaryActionEffects,
    resolvedActionParameters
  )
  const ordinaryAppliedEffects = shared.materializeDeferredStatEffects(
    ordinaryActionEffects.appliedEffects,
    ordinaryStats.rotation.hp,
    ordinaryStats.elementalMasteryForAttackConversion
  )
  const declaredRotationEvents = ordinaryEvents.map((event) =>
    shared.createDeclaredRotationEvent(
      action,
      build.buildId,
      declaredReaction,
      legacyScalingStat,
      matchedActionDamageScalingTerms,
      ordinaryActionEffects.baseDamageFlat,
      ordinaryStats.rotation,
      event,
      ordinaryActionEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      ordinaryActionEffects.enemyDefenseIgnore,
      ordinaryActionEffects.amplifyingReactionBonus
    )
  )
  const additionalDamageEventTime = ordinaryEvents[0]?.time ?? 0
  const additionalDamageEventSnapshotTime = ordinaryEvents[0]?.statSnapshotTime ?? 0
  const additionalDamageEventAppliedEffects: AppliedCombatActionEffect[] = []
  const additionalDamageRotationEvents = ordinaryActionEffects.additionalDamageEvents.map((event) => {
    const additionalDamageEventEffects = resolveAdditionalDamageEventEffects({
    targetFrozen: input.targetFrozen ?? false,
      ...actionEffectContext,
      additionalDamageEvent: event,
      candidateSpecialReactionKinds: [],
      effectiveElements: [event.element]
    })
    const additionalDamageEventStats = shared.resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      additionalDamageEventEffects
    )
    const eventAppliedEffects = shared.materializeDeferredStatEffects(
      additionalDamageEventEffects.appliedEffects,
      additionalDamageEventStats.rotation.hp,
      additionalDamageEventStats.elementalMasteryForAttackConversion
    )
    additionalDamageEventAppliedEffects.push(...eventAppliedEffects)
    return shared.createAdditionalDamageRotationEvent(
      action.id,
      build.buildId,
      additionalDamageEventStats.additionalDamageEventRotation,
      event,
      eventAppliedEffects,
      additionalDamageEventTime,
      additionalDamageEventSnapshotTime,
      additionalDamageEventEffects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
      additionalDamageEventEffects.enemyDefenseIgnore,
      additionalDamageEventEffects.baseDamageFlat,
      shared.resolveMatchedActionDamageScalingTerms(additionalDamageEventEffects, resolvedActionParameters)
    )
  })
  const ordinaryRotation = evaluateRotation({
    duration: timeline.duration,
    enemy: {
      defenseReduction: effectiveDefenseReduction,
      level: enemy.level,
      resistance: enemy.resistance
    },
    ...(rotationEffects ? { effects: rotationEffects } : {}),
    ...(rotationElementOverrides ? { elementOverrides: rotationElementOverrides } : {}),
    ...(rotationAuras ? { sustainedAuras: rotationAuras } : {}),
    events: [...declaredRotationEvents, ...additionalDamageRotationEvents].sort((left, right) => left.time - right.time)
  })
  const specialEffectsByEventId = new Map<string, ResolvedCombatActionEffects>()
  const specialStatsByEventId = new Map<string, ReturnType<typeof shared.resolveStats>>()
  const resolveSpecialEffects = (
    event: (typeof specialEvents)[number]
  ) => {
    const known = specialEffectsByEventId.get(event.id)
    if (known) return known
    const effects = resolveCombatActionEffects({
    targetFrozen: input.targetFrozen ?? false,
      ...actionEffectContext,
      candidateEventId: event.id,
      candidateSpecialReactionKinds: [event.specialReaction.kind],
      effectiveElements: [action.element]
    })
    specialEffectsByEventId.set(event.id, effects)
    return effects
  }
  const resolveSpecialStats = (event: (typeof specialEvents)[number]) => {
    const known = specialStatsByEventId.get(event.id)
    if (known) return known
    const stats = shared.resolveStats(
      build,
      action,
      gameData,
      buffs,
      artifactStatDeltas,
      resolvedActionParameters,
      resolveSpecialEffects(event)
    )
    specialStatsByEventId.set(event.id, stats)
    return stats
  }
  const specialEventResults = specialEvents.map((event) => {
    const effects = resolveSpecialEffects(event)
    const stats = resolveSpecialStats(event)
    const scenarioStats = shared.createDeclaredScenarioStats(
      action,
      resolvedActionParameters,
      stats.scenario,
      shared.hasResolvedMultipleScalingTerms(event.part) ? event.part : undefined,
      shared.hasResolvedMultipleScalingTerms(event.part) ? null : event.part.coefficient ?? 0
    )
    const baseDamageTerms = shared.resolveSpecialReactionBaseDamageTerms(
      action,
      event.part,
      stats.rotation,
      event.coefficientMultiplier
    )
    const baseDamage = baseDamageTerms.reduce((total, term) => total + term.coefficient * term.value, 0)
    const result = calculateDirectSpecialReactionDamage(
      shared.resolveDirectSpecialReactionInput(
        event.specialReaction,
        baseDamage,
        baseDamageTerms,
        scenarioStats,
        effects,
        getBuffTotal(buffs, "special_reaction_damage_bonus"),
        enemy.resistance,
        effects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction"),
        resolvedActionParameters
      )
    )
    const appliedEffects = shared.materializeDeferredStatEffects(
      effects.appliedEffects,
      stats.rotation.hp,
      stats.elementalMasteryForAttackConversion
    ).filter(shared.isSpecialReactionStatEffect)
    return { appliedEffects, event, result, scenarioStats }
  })
  const party = [build, ...teammates]
  const stellarSwirlReactionEventResults = stellarSwirlReactionEvents.map((event) => {
    // Element restrictions belong to weighted slots, not to the candidate party.
    const participants = party
    const participantEvaluations = participants.map((participant) => {
      const participantTeammates = party.filter((candidate) => candidate.buildId !== participant.buildId)
      const participantAction: CombatActionMetadata = { ...action, characterId: participant.characterId }
      const participantDeltas = participant.buildId === build.buildId ? artifactStatDeltas : undefined
      const participantContext = shared.resolveScenarioParticipantContext({
        action: participantAction,
        activeEffectIds: resolvedActiveEffectIds,
        ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
        ...(participantDeltas === undefined ? {} : { artifactStatDeltas: participantDeltas }),
        build: participant,
        buffs,
        enemyCount,
        gameData,
        moonsignLevel,
        resolvedActionParameters,
        teammates: participantTeammates
      })
      const effects = resolveCombatActionEffects({
    targetFrozen: input.targetFrozen ?? false,
        action: participantAction,
        fieldContext,
        actionOwnerBuildId: build.buildId,
        activeEffectIds: participantContext.resolvedActiveEffectIds,
        ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
        baseEnergyRecharge: participantContext.baseStats.scenario.energyRecharge,
        candidateEventId: event.id,
        candidateSpecialReactionKinds: ["stellar_swirl"],
        effectiveElements: [action.element],
        enemyCount,
        gameData,
        moonsignLevel,
        primary: participant,
        ...(participantContext.primaryElement === null ? {} : { primaryElement: participantContext.primaryElement }),
        sourceFinalAttackByBuildId,
        sourceFinalDefenseByBuildId,
        sourceFinalElementalMasteryByBuildId,
        sourceElementalMasteryBeforeShareByBuildId,
        sourceFinalHpByBuildId,
        ...(participantContext.primaryDifferentElementTeammateCount === null
          ? {}
          : { primaryDifferentElementTeammateCount: participantContext.primaryDifferentElementTeammateCount }),
        ...(participantContext.primarySameElementTeammateCount === null
          ? {}
          : { primarySameElementTeammateCount: participantContext.primarySameElementTeammateCount }),
        ...(participantContext.teamUniqueElementCount === null
          ? {}
          : { teamUniqueElementCount: participantContext.teamUniqueElementCount }),
        teamElements: resolvePartyElements(participant, participantTeammates, gameData),
        teammates: participantTeammates
      })
      const stats = shared.resolveStats(
        participant,
        participantAction,
        gameData,
        buffs,
        participantDeltas,
        resolvedActionParameters,
        effects
      )
      const appliedEffects = shared.materializeDeferredStatEffects(
        effects.appliedEffects,
        stats.rotation.hp,
        stats.elementalMasteryForAttackConversion
      ).filter(shared.isSpecialReactionStatEffect)
      return {
        appliedEffects,
        input: {
          element: resolveBuildElement(participant, gameData) ?? action.element,
          ascensionBonus: effects.specialReactionElevation,
          baseDamageBonus: effects.specialReactionBaseDamageBonus,
          baseDamageFlat: effects.specialReactionBaseDamageFlat,
          baseDamageMultiplier: effects.specialReactionBaseDamageMultiplier,
          critDamage: stats.rotation.critDamage,
          critRate: stats.rotation.critRate,
          elementalMastery: stats.rotation.elementalMastery,
          enemyResistance: enemy.resistance,
          flatDamageAddition: effects.specialReactionFlatDamageAddition,
          level: participant.level,
          participantId: participant.buildId,
          reactionDamageBonus:
            effects.specialReactionDamageBonus + getBuffTotal(buffs, "special_reaction_damage_bonus"),
          resistanceReduction:
            effects.enemyResistanceReduction + getBuffTotal(buffs, "enemy_resistance_reduction")
        },
        label: participant.label,
        participantId: participant.buildId,
        scenarioStats: stats.scenario
      }
    })
    const result = calculateStellarSwirlReactionExpectedDamage({
      event: event.stellarSwirlReaction.event,
      participants: participantEvaluations.map((participant) => participant.input),
      ...(event.stellarSwirlReaction.vortexLevel === undefined
        ? {}
        : { vortexLevel: event.stellarSwirlReaction.vortexLevel })
    })
    const rotationEvent = shared.createDeclaredStellarSwirlReactionRotationEvent(
      action,
      build.buildId,
      event,
      result,
      participantEvaluations
    )
    return {
      appliedEffects: participantEvaluations.flatMap((participant) => participant.appliedEffects),
      rotationEvent,
      scenarioStats: participantEvaluations.find((participant) => participant.participantId === build.buildId)?.scenarioStats
    }
  })
  const specialRotationEvents = specialEventResults.map(({ appliedEffects, event, result }) =>
    shared.createDeclaredSpecialReactionRotationEvent(action, build.buildId, event, result, appliedEffects)
  )
  const rotationEvents = [
    ...ordinaryRotation.events,
    ...specialRotationEvents,
    ...stellarSwirlReactionEventResults.map((entry) => entry.rotationEvent)
  ].sort((left, right) => left.time - right.time)
  const dpr = rotationEvents.reduce((total, event) => total + event.expectedDamage, 0)
  const rotation: RotationResult = { dpr, dps: dpr / timeline.duration, duration: timeline.duration, events: rotationEvents }
  const constellationTalentBonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
  const appliedEffects = shared.deduplicateAppliedEffects([
    ...ordinaryAppliedEffects,
    ...additionalDamageEventAppliedEffects,
    ...specialEventResults.flatMap((entry) => entry.appliedEffects),
    ...stellarSwirlReactionEventResults.flatMap((entry) => entry.appliedEffects),
    ...constellationTalentBonuses.map((bonus) => ({
      id: bonus.id,
      label: bonus.label,
      sourceId: build.buildId,
      target: "talentLevel" as const,
      value: bonus.value
    }))
  ])
  const firstSpecialScenarioStats = specialEventResults[0]?.scenarioStats ?? stellarSwirlReactionEventResults[0]?.scenarioStats
  const stats = ordinaryEvents.length > 0 || !firstSpecialScenarioStats ? ordinaryScenarioStats : firstSpecialScenarioStats
  const result: ExpectedDamageResult = {
    critDamage: rotationEvents.reduce((total, event) => total + event.critDamage, 0),
    expectedDamage: rotation.dpr,
    nonCritDamage: rotationEvents.reduce((total, event) => total + event.nonCritDamage, 0),
    trace: []
  }
  return { appliedEffects, parts, result, rotation, stats }
}

/**
 * Evaluates one explicitly declared transformative reaction without deriving aura state, hit timing, or repeated
 * reaction ticks. The content action represents exactly one resolved reaction event.
 */
