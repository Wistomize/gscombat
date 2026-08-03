import {
  evaluateRotation,
  type RotationEnemyStats,
  type RotationResult
} from "@gscombat/calculator"
import {
  listCharacterTalentLevelConstellationBonuses,
  type CombatActionIntrinsicEffect,
  type CombatActionMetadata,
  type CombatActionTalentLevelConstellationBonus,
  type CombatParameterReference,
  type CombatTalentParameterSlot
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveBaseCombatStats, type ResolvedBaseCombatStats } from "./base-stats.js"
import { resolveTalentParameterOwnerId } from "./build-variant.js"

/** Input for a baseline calculation of one explicitly declared direct talent coefficient. */
export interface DeclaredDirectTalentActionInput {
  readonly action: CombatActionMetadata
  readonly build: CharacterBuild
  readonly coefficientParameterId: string
  readonly enemy: RotationEnemyStats
  readonly gameData: GameDataRepository
}

/** Input for resolving one reviewed talent coefficient from the immutable snapshot. */
export interface DeclaredTalentCoefficientInput {
  readonly action: CombatActionMetadata
  readonly build: CharacterBuild
  readonly coefficientParameterId: string
  readonly gameData: GameDataRepository
}

/** A reviewed coefficient paired with the scaling stat declared by content. */
export interface ResolvedDeclaredTalentCoefficient {
  readonly coefficient: number
  readonly scalingStat: NonNullable<CombatActionMetadata["scalingStat"]>
}

/** The resolved coefficient, baseline stats, and one-event rotation for a declared direct talent action. */
export interface DeclaredDirectTalentActionEvaluation {
  readonly coefficient: number
  readonly rotation: RotationResult
  readonly stats: ResolvedBaseCombatStats
}

/** Resolved source stats needed by an action-owned capped conversion into effective Attack. */
export interface DeclaredActionCappedStatToAttackConversionStats {
  readonly baseAttack: number
  readonly defense: number
  readonly elementalMastery: number
  readonly hp: number
}

/** Supplies the fully resolved source stats that action-owned intrinsic effects may read. */
export interface DeclaredActionIntrinsicEffectStats {
  readonly attack: number
  readonly defense: number
  readonly elementalMastery: number
  readonly hp: number
}

/** Collects action-owned contributions after applying their source, ascension, and snapshot gates. */
export interface ResolvedDeclaredActionIntrinsicEffects {
  readonly critRate: number
  readonly damageBonus: number
  readonly elementalMastery: number
}

/**
 * Evaluates a single direct talent hit from an explicitly selected content parameter reference.
 *
 * This is deliberately a baseline evaluator: it includes inherent character, weapon, and artifact
 * stats, but excludes character-kit conditions, weapon passives, artifact-set effects, team buffs,
 * and reactions. Action-declared constellation talent-level bonuses are included before reading the
 * reviewed skill parameter table.
 */
export function evaluateDeclaredDirectTalentAction(
  input: DeclaredDirectTalentActionInput
): DeclaredDirectTalentActionEvaluation {
  const { action, build, enemy, gameData } = input
  const { coefficient, scalingStat } = resolveDeclaredTalentCoefficient(input)
  const baseStats = resolveBaseCombatStats(build, gameData, action.element)
  const preliminaryIntrinsicEffects = resolveDeclaredActionIntrinsicEffects(action, build, gameData, baseStats)
  const cappedStatToAttackConversion = resolveDeclaredActionCappedStatToAttackConversion(
    action,
    build,
    gameData,
    { ...baseStats, elementalMastery: preliminaryIntrinsicEffects.elementalMastery }
  )
  const intrinsicEffects = resolveDeclaredActionIntrinsicEffects(action, build, gameData, {
    attack: baseStats.attack + cappedStatToAttackConversion,
    defense: baseStats.defense,
    elementalMastery: baseStats.elementalMastery,
    hp: baseStats.hp
  })
  const stats = {
    ...baseStats,
    attack: baseStats.attack + cappedStatToAttackConversion,
    critRate: baseStats.critRate + intrinsicEffects.critRate,
    damageBonus: baseStats.damageBonus + intrinsicEffects.damageBonus,
    elementalMastery: intrinsicEffects.elementalMastery,
    flatAttack: baseStats.flatAttack + cappedStatToAttackConversion
  }
  const rotation = evaluateRotation({
    duration: 1,
    enemy,
    events: [
      {
        canCrit: true,
        element: action.element,
        id: action.id,
        ownerId: action.characterId,
        scaling: { coefficient, stat: scalingStat },
        stats,
        time: 0
      }
    ]
  })
  return { coefficient, rotation, stats }
}

/** Resolves a content-declared talent coefficient at the build's configured talent level. */
export function resolveDeclaredTalentCoefficient(
  input: DeclaredTalentCoefficientInput
): ResolvedDeclaredTalentCoefficient {
  const scalingStat = validateActionForBaselineEvaluation(input.action, input.build)
  const coefficient = resolveDeclaredTalentCoefficientValue(input)
  return { coefficient, scalingStat }
}

/** Resolves one reviewed talent coefficient without assuming that its hit has only one scaling stat. */
export function resolveDeclaredTalentCoefficientValue(input: DeclaredTalentCoefficientInput): number {
  const { action, build, coefficientParameterId, gameData } = input
  validateActionForCoefficientResolution(action, build)
  const reference = getTalentCoefficientReference(action, coefficientParameterId)
  const talentLevel = getConfiguredTalentLevel(action, build, reference)
  const talentParameterOwnerId = resolveTalentParameterOwnerId(action, build)
  const coefficient = gameData.getCharacterSkillParameter(
    talentParameterOwnerId,
    reference.groupId,
    reference.parameterIndex,
    talentLevel
  )
  if (coefficient === undefined) {
    throw new Error(
      `Missing talent coefficient ${coefficientParameterId} for ${talentParameterOwnerId} at level ${talentLevel}`
    )
  }
  return coefficient
}

/** Lists the configured constellation talent-level bonuses that apply to the selected action. */
export function resolveDeclaredActionTalentLevelConstellationBonuses(
  action: CombatActionMetadata,
  build: CharacterBuild
): readonly CombatActionTalentLevelConstellationBonus[] {
  const declaredBonuses = action.talentLevelConstellationBonuses ?? []
  const declaredBonusKeys = new Set(
    declaredBonuses.map((bonus) => getActionTalentLevelConstellationBonusKey(action, bonus))
  )
  const referencedTalentSlots = new Set(
    (action.parameterReferences ?? [])
      .filter((reference) => reference.source === "talent")
      .map((reference) => reference.talentSlot)
      .filter(isLevelledTalentParameterSlot)
  )
  const travelerElement = build.variant?.kind === "traveler" ? build.variant.element : undefined
  const characterBonuses = listCharacterTalentLevelConstellationBonuses(action.characterId, travelerElement)
    .filter((bonus) => referencedTalentSlots.has(bonus.talentSlot))
    .filter(
      (bonus) =>
        !declaredBonusKeys.has(
          getActionTalentLevelConstellationBonusKey(action, {
            minimumSourceConstellation: bonus.minimumSourceConstellation,
            talentSlot: bonus.talentSlot
          })
        )
    )
    .map((bonus) => ({
      id: getCharacterTalentLevelConstellationBonusId(action, bonus),
      label: `C${bonus.minimumSourceConstellation} · ${getTalentSlotLabel(bonus.talentSlot)}天赋等级 +${bonus.value}`,
      minimumSourceConstellation: bonus.minimumSourceConstellation,
      talentSlot: bonus.talentSlot,
      value: bonus.value
    }))
  return [...declaredBonuses, ...characterBonuses]
    .filter((bonus) => build.constellation >= bonus.minimumSourceConstellation)
    .sort(
      (left, right) =>
        left.minimumSourceConstellation - right.minimumSourceConstellation || left.id.localeCompare(right.id)
    )
}

function getCharacterTalentLevelConstellationBonusId(
  action: CombatActionMetadata,
  bonus: Pick<CombatActionTalentLevelConstellationBonus, "minimumSourceConstellation" | "talentSlot">
): string {
  const characterActionPrefix = action.id.split(".")[0] ?? action.characterId
  return `${characterActionPrefix}.constellation.${bonus.minimumSourceConstellation}.${bonus.talentSlot}-talent-level`
}

function getActionTalentLevelConstellationBonusKey(
  action: CombatActionMetadata,
  bonus: Pick<CombatActionTalentLevelConstellationBonus, "minimumSourceConstellation" | "talentSlot">
): string {
  return `${bonus.minimumSourceConstellation}:${getActionTalentLevelConstellationBonusSlot(action, bonus) ?? "none"}`
}

function getActionTalentLevelConstellationBonusSlot(
  action: CombatActionMetadata,
  bonus: Pick<CombatActionTalentLevelConstellationBonus, "talentSlot">
): CombatTalentParameterSlot | undefined {
  if (bonus.talentSlot) return bonus.talentSlot
  return isLevelledTalentParameterSlot(action.talentSlot) ? action.talentSlot : undefined
}

function getTalentSlotLabel(talentSlot: CombatTalentParameterSlot): string {
  if (talentSlot === "normal") return "普通攻击"
  if (talentSlot === "skill") return "元素战技"
  if (talentSlot === "burst") return "元素爆发"
  return "固有天赋"
}

function isLevelledTalentParameterSlot(
  talentSlot: string
): talentSlot is Exclude<CombatTalentParameterSlot, "passive"> {
  return talentSlot === "normal" || talentSlot === "skill" || talentSlot === "burst"
}

/** Resolves all explicit source-kit contributions that belong to the current action's stat pipeline. */
export function resolveDeclaredActionIntrinsicEffects(
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  stats: DeclaredActionIntrinsicEffectStats,
  actionParameters?: ReadonlyMap<string, number>
): ResolvedDeclaredActionIntrinsicEffects {
  const effects = action.intrinsicEffects ?? []
  const elementalMastery = stats.elementalMastery + sumIntrinsicEffects(
    effects,
    "elementalMastery",
    action,
    build,
    gameData,
    stats,
    actionParameters
  )
  const effectiveStats = { ...stats, elementalMastery }
  return {
    critRate: sumIntrinsicEffects(effects, "critRate", action, build, gameData, effectiveStats, actionParameters),
    damageBonus: sumIntrinsicEffects(
      effects,
      "damageBonus",
      action,
      build,
      gameData,
      effectiveStats,
      actionParameters
    ),
    elementalMastery
  }
}

/** Resolves an action-owned capped source-stat conversion into additive effective Attack. */
export function resolveDeclaredActionCappedStatToAttackConversion(
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  stats: DeclaredActionCappedStatToAttackConversionStats
): number {
  const conversion = action.cappedStatToAttackConversion
  if (!conversion) return 0
  const ratio = resolveDeclaredTalentCoefficientValue({
    action,
    build,
    coefficientParameterId: conversion.ratioParameterId,
    gameData
  })
  const capRatio = resolveDeclaredTalentCoefficientValue({
    action,
    build,
    coefficientParameterId: conversion.capRatioParameterId,
    gameData
  })
  return Math.min(stats[conversion.scalingStat] * ratio, stats.baseAttack * capRatio)
}

function sumIntrinsicEffects(
  effects: readonly CombatActionIntrinsicEffect[],
  target: CombatActionIntrinsicEffect["target"],
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  stats: DeclaredActionIntrinsicEffectStats,
  actionParameters: ReadonlyMap<string, number> | undefined
): number {
  return effects
    .filter((effect) => effect.target === target)
    .reduce(
      (total, effect) =>
        total + resolveIntrinsicEffectValue(effect, action, build, gameData, stats, actionParameters),
      0
    )
}

function resolveIntrinsicEffectValue(
  effect: CombatActionIntrinsicEffect,
  action: CombatActionMetadata,
  build: CharacterBuild,
  gameData: GameDataRepository,
  stats: DeclaredActionIntrinsicEffectStats,
  actionParameters: ReadonlyMap<string, number> | undefined
): number {
  if (
    effect.minimumSourceAscension !== undefined &&
    build.ascension < effect.minimumSourceAscension
  ) {
    return 0
  }
  const scenarioMultiplier = resolveIntrinsicEffectScenarioMultiplier(effect, action, actionParameters)
  if (effect.kind === "flat") {
    const value =
      effect.fixedValue ??
      resolveDeclaredTalentCoefficientValue({
        action,
        build,
        coefficientParameterId: requireIntrinsicEffectCoefficientParameterId(effect, action.id),
        gameData
      })
    return value * (effect.valueMultiplier ?? 1) * scenarioMultiplier
  }

  const coefficient = resolveDeclaredTalentCoefficientValue({
    action,
    build,
    coefficientParameterId: effect.coefficientParameterId,
    gameData
  })
  const sourceStatOffset = resolveOptionalIntrinsicEffectCoefficient(
    action,
    build,
    effect.sourceStatOffsetParameterId,
    gameData
  )
  const sourceStatMaximum = resolveOptionalIntrinsicEffectCoefficient(
    action,
    build,
    effect.sourceStatMaximumParameterId,
    gameData
  )
  const maximumValueParameter = resolveOptionalIntrinsicEffectCoefficient(
    action,
    build,
    effect.maximumValueParameterId,
    gameData
  )
  const maximumValue = effect.maximumValue ?? maximumValueParameter
  const eligibleSourceStat = Math.max(stats[effect.sourceStat] - (sourceStatOffset ?? 0), 0)
  const boundedSourceStat = sourceStatMaximum === undefined
    ? eligibleSourceStat
    : Math.min(eligibleSourceStat, sourceStatMaximum)
  const value = boundedSourceStat * coefficient * (effect.valueMultiplier ?? 1)
  return (maximumValue === undefined ? value : Math.min(value, maximumValue)) * scenarioMultiplier
}

function resolveIntrinsicEffectScenarioMultiplier(
  effect: CombatActionIntrinsicEffect,
  action: CombatActionMetadata,
  actionParameters: ReadonlyMap<string, number> | undefined
): number {
  const multiplier = effect.scenarioParameterMultiplier
  if (!multiplier) return 1
  const parameterDefinition = action.scenarioParameters?.find((parameter) => parameter.id === multiplier.parameterId)
  const parameterValue = actionParameters?.get(multiplier.parameterId) ?? parameterDefinition?.defaultValue
  const value = "values" in multiplier
    ? multiplier.values.find((entry) => entry.parameterValue === parameterValue)?.multiplier
    : multiplier.base + multiplier.perParameterValue * (parameterValue ?? Number.NaN)
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    throw new Error(`Intrinsic effect for action ${action.id} has no valid scenario multiplier`)
  }
  return value
}

function requireIntrinsicEffectCoefficientParameterId(
  effect: Extract<CombatActionIntrinsicEffect, { readonly kind: "flat" }>,
  actionId: string
): string {
  if (effect.coefficientParameterId) return effect.coefficientParameterId
  throw new Error(`Intrinsic effect for action ${actionId} must declare a coefficient parameter or fixed value`)
}

function resolveOptionalIntrinsicEffectCoefficient(
  action: CombatActionMetadata,
  build: CharacterBuild,
  coefficientParameterId: string | undefined,
  gameData: GameDataRepository
): number | undefined {
  if (!coefficientParameterId) return undefined
  return resolveDeclaredTalentCoefficientValue({ action, build, coefficientParameterId, gameData })
}

function validateActionForBaselineEvaluation(
  action: CombatActionMetadata,
  build: CharacterBuild
): NonNullable<CombatActionMetadata["scalingStat"]> {
  if (action.damageKind !== "direct") throw new Error(`Declared action ${action.id} must declare direct damage`)
  validateActionForCoefficientResolution(action, build)
  const scalingStat = action.scalingStat
  if (!scalingStat) throw new Error(`Declared action ${action.id} must declare a scaling stat`)
  return scalingStat
}

function validateActionForCoefficientResolution(action: CombatActionMetadata, build: CharacterBuild): void {
  if (action.status === "unsupported") throw new Error(`Declared action ${action.id} is unsupported`)
  if (action.kind !== "damage") throw new Error(`Declared action ${action.id} must be a damage action`)
  if (action.damageKind !== "direct" && action.damageKind !== "special_reaction") {
    throw new Error(`Declared action ${action.id} must declare direct or special-reaction damage`)
  }
  if (action.characterId !== build.characterId) {
    throw new Error(`Declared action ${action.id} belongs to ${action.characterId}, not ${build.characterId}`)
  }
}

function getTalentCoefficientReference(
  action: CombatActionMetadata,
  coefficientParameterId: string
): Extract<CombatParameterReference, { readonly source: "talent" }> {
  const reference = action.parameterReferences?.find((parameter) => parameter.id === coefficientParameterId)
  if (!reference) {
    throw new Error(`Declared action ${action.id} does not declare coefficient parameter ${coefficientParameterId}`)
  }
  if (reference.source !== "talent") {
    throw new Error(`Declared coefficient parameter ${coefficientParameterId} must reference a talent value`)
  }
  return reference
}

function getConfiguredTalentLevel(
  action: CombatActionMetadata,
  build: CharacterBuild,
  reference: Extract<CombatParameterReference, { readonly source: "talent" }>
): number {
  if (reference.talentSlot === "passive") return 1
  const configuredLevel =
    reference.talentSlot === "normal"
        ? build.talents.normal
        : reference.talentSlot === "skill"
          ? build.talents.skill
          : build.talents.burst
  const constellationBonus = resolveDeclaredActionTalentLevelConstellationBonuses(action, build)
    .filter((bonus) => getActionTalentLevelConstellationBonusSlot(action, bonus) === reference.talentSlot)
    .reduce((total, bonus) => total + bonus.value, 0)
  return Math.min(configuredLevel + constellationBonus, 15)
}
