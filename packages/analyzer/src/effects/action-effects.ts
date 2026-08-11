import type { ScalingStat } from "@gscombat/calculator"
import {
  canEnterNightsoulBlessing, hasHexereiSecretRite,
  getCharacterBurstEnergyCost,
  isCombatActionEffectApplicable,
  isCombatActionEffectDeterministicallyActive, listCombatActionEffects,
  listCombatElementOverrideEffects,
  resolveMaximumNightsoulBurstTriggers,
  weaponInventory, type CombatActionEffect,
  type CombatActionMetadata,
  type CombatActionStatEffect
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"

import { countArtifactSet } from "../core/artifact-stats.js"
import {
  resolveBuildElement,
  resolvePrimaryDifferentElementOrRegionPartyCount,
  resolveTeamRegionCount
} from "../core/build-variant.js"

import {
  type AppliedCombatActionEffect,
  type ResolveAdditionalDamageEventEffectsInput,
  type ResolveCombatActionEffectCandidatesInput,
  type ResolveCombatActionEffectsInput,
  type ResolvedCombatActionEffects,
  type ResolveDependentActiveEffectIdsInput,
  type ResolveSelfAutomaticEquipmentEffectsInput
} from "./types.js"

export { EMPTY_COMBAT_ACTION_EFFECTS } from "./types.js"
export type {
  AppliedCombatActionEffect,
  ResolveAdditionalDamageEventEffectsInput,
  ResolveCombatActionEffectsInput, ResolvedAdditionalDamageEvent,
  ResolvedCombatActionEffects, ResolveDependentActiveEffectIdsInput, ResolvedFinalHpSourcedDamageBonus,
  ResolvedMatchedActionAdditiveDamageTerm,
  ResolveSelfAutomaticEquipmentEffectsInput
} from "./types.js"

interface EligibleActionEffect {
  readonly effect: CombatActionEffect
  readonly source: CharacterBuild
}

interface EligibleStatActionEffect {
  readonly effect: CombatActionStatEffect
  readonly source: CharacterBuild
}

/**
 * Materializes typed current-action effects without inferring cast order, duration, or a full rotation.
 *
 * Energy-recharge contributors resolve first so an Emblem four-piece bonus reads the final action ER.
 */
export function resolveCombatActionEffects(input: ResolveCombatActionEffectsInput): ResolvedCombatActionEffects {
  return resolveCombatActionEffectsForCandidates(input, listCombatActionEffects())
}

/**
 * Expands explicit snapshots with dependent effects and content-declared deterministic action-state effects.
 *
 * A dependent effect cannot be selected independently: it is derived only when every requirement is selected and
 * a unique or explicitly selected source build meets its source constraints. Deterministic effects require the
 * selected action to declare their state. Scenario constraints are still resolved by the normal evaluator.
 */
export function resolveDependentActiveEffectIds(input: ResolveDependentActiveEffectIdsInput): string[] {
  const effects = listCombatActionEffects()
  const elementOverrideEffects = listCombatElementOverrideEffects()
  const dependentEffects = effects.filter(
    (effect) => effect.requiredActiveEffectIds !== undefined && effect.deterministicSnapshotActivation === undefined
  )
  const deterministicEffects = effects.filter((effect) => effect.deterministicSnapshotActivation !== undefined)
  const dependentElementOverrideEffects = elementOverrideEffects.filter((effect) => effect.requiredActiveEffectIds !== undefined)
  const derivedEffectIds = new Set(
    [...dependentEffects, ...deterministicEffects, ...dependentElementOverrideEffects].map((effect) => effect.id)
  )
  const activeEffectIds = new Set(input.activeEffectIds.filter((effectId) => !derivedEffectIds.has(effectId)))
  let added = true

  while (added) {
    added = false
    for (const effect of dependentEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        effect.activation !== "active" ||
        activeEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId)) ||
        !hasActivatableEffectSource(effect, input)
      ) {
        continue
      }
      activeEffectIds.add(effect.id)
      added = true
    }
    for (const effect of deterministicEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        effect.activation !== "active" ||
        activeEffectIds.has(effect.id) ||
        !isDeterministicallyActiveForAction(effect, input.action) ||
        (requiredActiveEffectIds !== undefined &&
          !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId))) ||
        !hasActivatableEffectSource(effect, input)
      ) {
        continue
      }
      activeEffectIds.add(effect.id)
      added = true
    }
    for (const effect of dependentElementOverrideEffects) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        activeEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => activeEffectIds.has(effectId)) ||
        !hasActivatableElementOverrideSource(effect, input)
      ) {
        continue
      }
      activeEffectIds.add(effect.id)
      added = true
    }
  }

  return [...activeEffectIds]
}

function isDeterministicallyActiveForAction(
  effect: CombatActionEffect,
  action: CombatActionMetadata | undefined
): boolean {
  return (
    action !== undefined &&
    isCombatActionEffectApplicable(effect, action) &&
    isCombatActionEffectDeterministicallyActive(effect, action)
  )
}

/**
 * Resolves global and element-compatible stat effects for one independently owned additional damage event.
 *
 * Effects scoped to the triggering action's normal, charged, plunge, talent, or action ID do not modify the
 * independent hit. Its own final element is used only for global element-filtered effects such as physical
 * resistance reduction.
 */
export function resolveAdditionalDamageEventEffects(
  input: ResolveAdditionalDamageEventEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter((effect) =>
    isCombatActionEffectCompatibleWithAdditionalDamageEvent(effect)
  )
  return resolveCombatActionEffectsForCandidates(
    { ...input, effectiveElements: [input.additionalDamageEvent.element] },
    candidates
  )
}

/**
 * Resolves automatic equipment effects and optional fixed maximum-reachable stats owned by a metric source itself.
 *
 * This intentionally excludes selected active snapshots, party-owned artifact effects, source-stat-dependent character
 * effects, and effects that read team burst costs. Character stats are opt-in because declared damage scenarios already
 * apply them through the main current-action effect pipeline. Enemy-count conditions require explicit source context.
 */
export function resolveSelfAutomaticEquipmentEffects(
  input: ResolveSelfAutomaticEquipmentEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      isSelfAutomaticEquipmentEffect(effect) ||
      (input.includeMaximumReachableCharacterStatEffects === true &&
        isSelfMaximumReachableCharacterStatEffect(effect, input.primary))
  )
  const candidateInput: ResolveCombatActionEffectCandidatesInput = {
    action: input.action,
    activeEffectIds: [],
    baseEnergyRecharge: input.baseEnergyRecharge,
    ...(input.gameData === undefined ? {} : { gameData: input.gameData }),
    ...(input.enemyCount === undefined ? {} : { enemyCount: input.enemyCount }),
    ...(input.primaryElement === undefined ? {} : { primaryElement: input.primaryElement }),
    ...(input.primaryDifferentElementTeammateCount === undefined
      ? {}
      : { primaryDifferentElementTeammateCount: input.primaryDifferentElementTeammateCount }),
    ...(input.primarySameElementTeammateCount === undefined
      ? {}
      : { primarySameElementTeammateCount: input.primarySameElementTeammateCount }),
    ...(input.teamUniqueElementCount === undefined ? {} : { teamUniqueElementCount: input.teamUniqueElementCount }),
    primary: input.primary,
    teammates: input.teammates ?? []
  }
  const activeEffectIds = selectSelfMaximumReachableCharacterEffectIds(candidates, candidateInput)
  return resolveCombatActionEffectsForCandidates({ ...candidateInput, activeEffectIds }, candidates)
}

/** Resolves only a source character's maximum-reachable maximum-HP state for final-HP conversions. */
export function resolveSelfMaximumReachableCharacterHpEffects(
  input: ResolveSelfAutomaticEquipmentEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      isSelfMaximumReachableCharacterStatEffect(effect, input.primary) &&
      (effect.target === "hpFlat" || effect.target === "hpPercent")
  )
  const candidateInput: ResolveCombatActionEffectCandidatesInput = {
    action: input.action,
    activeEffectIds: [],
    baseEnergyRecharge: input.baseEnergyRecharge,
    ...(input.gameData === undefined ? {} : { gameData: input.gameData }),
    ...(input.enemyCount === undefined ? {} : { enemyCount: input.enemyCount }),
    ...(input.primaryElement === undefined ? {} : { primaryElement: input.primaryElement }),
    ...(input.primaryDifferentElementTeammateCount === undefined
      ? {}
      : { primaryDifferentElementTeammateCount: input.primaryDifferentElementTeammateCount }),
    ...(input.primarySameElementTeammateCount === undefined
      ? {}
      : { primarySameElementTeammateCount: input.primarySameElementTeammateCount }),
    ...(input.teamUniqueElementCount === undefined ? {} : { teamUniqueElementCount: input.teamUniqueElementCount }),
    primary: input.primary,
    teammates: input.teammates ?? []
  }
  const activeEffectIds = selectSelfMaximumReachableCharacterEffectIds(candidates, candidateInput)
  return resolveCombatActionEffectsForCandidates({ ...candidateInput, activeEffectIds }, candidates)
}

/**
 * Resolves selected maximum-reachable direct stat effects owned by the current source's own weapon or artifact set.
 *
 * The caller supplies IDs selected in a source-centric maximum-reachable scenario. Party-owned equipment effects and
 * effects that explicitly target another recipient are excluded, so a support source cannot inherit a teammate's
 * temporary team buff while its final stat snapshot is assembled.
 */
export function resolveSelfMaximumReachableEquipmentStatEffects(
  input: ResolveCombatActionEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      isSelfMaximumReachableEquipmentStatEffect(effect) &&
      isSelfMaximumReachableEquipmentStatEffectCompatibleWithSource(effect, input.primary)
  )
  return resolveCombatActionEffectsForCandidates(input, candidates)
}

/** Resolves explicitly selected defense snapshots while assembling a source build's final defense snapshot. */
export function resolveCombatActionDefenseEffects(
  input: ResolveCombatActionEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      effect.activation !== "automatic" &&
      (effect.target === "defenseFlat" || effect.target === "defensePercent")
  )
  return resolveCombatActionEffectsForCandidates(input, candidates)
}

/** Resolves explicitly selected attack snapshots while assembling a source build's final attack snapshot. */
export function resolveCombatActionAttackEffects(
  input: ResolveCombatActionEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      effect.activation !== "automatic" &&
      (effect.target === "attackPercent" || effect.target === "flatAttack")
  )
  return resolveCombatActionEffectsForCandidates(input, candidates)
}

/** Resolves only elemental-mastery effects while assembling a source build's final mastery snapshot. */
export function resolveCombatActionElementalMasteryEffects(
  input: ResolveCombatActionEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(
    (effect) =>
      (effect.target === "elementalMastery" &&
        effect.value.kind !== "final_elemental_mastery" &&
        effect.value.kind !== "source_final_defense") ||
      effect.target === "sourceFinalHpToElementalMastery"
  )
  return resolveCombatActionEffectsForCandidates(input, candidates)
}

import {
  hasActivatableEffectSource,
  hasActivatableElementOverrideSource
} from "./source-selection.js"

export {
  listSelectedSourceAttackSnapshotActivationEffectIds,
  listSelectedSourceAttackSnapshotEffectIds,
  listSelectedSourceDefenseSnapshotActivationEffectIds,
  listSelectedSourceDefenseSnapshotEffectIds
} from "./source-selection.js"
export type {
  SourceAttackSnapshotSelectionInput,
  SourceDefenseSnapshotSelectionInput,
  SourceStatSnapshotSelectionInput
} from "./source-selection.js"

function resolveCombatActionEffectsForCandidates(
  input: ResolveCombatActionEffectCandidatesInput,
  candidates: readonly CombatActionEffect[]
): ResolvedCombatActionEffects {
  assertActiveEffectSourceSelections(input)
  assertSelectedActiveEffectExclusivity(input.activeEffectIds)
  const recipientWeaponType = weaponInventory.find((weapon) => weapon.id === input.primary.weapon.weaponId)?.weaponType
  const eligibleEffects = candidates
    .filter((effect) =>
      isCombatActionEffectApplicable(
        effect,
        input.action,
        input.effectiveElements,
        recipientWeaponType,
        input.candidateAmplifyingReactionKinds,
        input.candidateReactionKinds,
        input.candidateSpecialReactionKinds
      )
    )
    .flatMap((effect) => resolveEligibleActionEffect(effect, input))
  assertExclusiveActionEffectsAreCompatible(eligibleEffects.map(({ effect }) => effect))
  const additionalDamageEvents = eligibleEffects.flatMap(({ effect, source }) =>
    effect.target === "additionalDamageEvent" ? [resolveAdditionalDamageEvent(effect, source, input)] : []
  )
  const matchedActionAdditiveDamageTerms = eligibleEffects.flatMap(({ effect, source }) =>
    effect.target === "matchedActionAdditiveDamageTerm" ? [resolveMatchedActionAdditiveDamageTerm(effect, source)] : []
  )
  const additionalDamageEventsById = new Map(additionalDamageEvents.map((event) => [event.id, event]))
  const matchedActionTermsById = new Map(matchedActionAdditiveDamageTerms.map((term) => [term.id, term]))
  const statEffects = eligibleEffects.filter(isEligibleStatActionEffect)
  const energyRechargeEffects = statEffects.filter(({ effect }) => effect.target === "energyRecharge")
  const energyRechargeValues = new Map<string, number>()
  for (const { effect, source } of energyRechargeEffects) {
    energyRechargeValues.set(effect.id, resolveEffectValue(effect, input, input.baseEnergyRecharge, source))
  }
  const finalEnergyRecharge = input.baseEnergyRecharge + sumValues(energyRechargeValues.values())
  const appliedEffects = eligibleEffects.map(({ effect, source }) => {
    const finalHpMaximumValue = resolveFinalHpMaximumValue(effect, source)
    const scalingSnapshot = resolveSpecialReactionBaseDamageScalingSnapshot(effect, input, source)
    return {
      ...(effect.target !== "additionalDamageEvent" &&
      effect.target !== "matchedActionAdditiveDamageTerm" &&
      effect.actionParameterId !== undefined
        ? { actionParameterId: effect.actionParameterId }
        : {}),
      id: effect.id,
      label: effect.label,
      sourceId: source.buildId,
      target:
        effect.target === "sourceFinalHpToElementalMastery"
          ? "elementalMastery"
          : effect.target === "sourceFinalElementalMasteryToFlatAttack"
            ? "flatAttack"
            : effect.target === "sourceFinalElementalMasteryToEnergyRecharge"
              ? "energyRecharge"
              : effect.target === "sourceFinalDefenseToDamageBonus"
                ? "damageBonus"
                : effect.target === "sourceFinalAttackToDamageBonus"
                  ? "damageBonus"
                : effect.target,
      ...(finalHpMaximumValue === undefined ? {} : { finalHpMaximumValue }),
      ...(effect.target === "matchedActionAdditiveDamageTerm" ? { scalingStat: effect.value.scalingStat } : {}),
      ...(scalingSnapshot === undefined ? {} : scalingSnapshot),
      ...(effect.targetFilter === undefined ? {} : { targetFilter: effect.targetFilter }),
      value:
        effect.target === "additionalDamageEvent"
          ? resolveExpectedAdditionalDamageEventCoefficient(additionalDamageEventsById.get(effect.id), effect.id)
          : effect.target === "matchedActionAdditiveDamageTerm"
            ? resolveMatchedActionAdditiveDamageTermCoefficient(matchedActionTermsById.get(effect.id), effect.id)
            : energyRechargeValues.get(effect.id) ?? resolveEffectValue(effect, input, finalEnergyRecharge, source)
    }
  })
  const finalHpToDamageBonuses = listFinalHpSourcedDamageBonuses(appliedEffects, "finalHpToDamageBonus")
  const finalHpToOwnElementDamageBonuses = listFinalHpSourcedDamageBonuses(
    appliedEffects,
    "finalHpToOwnElementDamageBonus"
  )
  return {
    additionalDamageEvents,
    appliedEffects,
    attackPercent: sumEffectTarget(appliedEffects, "attackPercent"),
    baseDamageFlat: sumEffectTarget(appliedEffects, "baseDamageFlat"),
    flatAttack: sumEffectTarget(appliedEffects, "flatAttack"),
    critDamage: sumEffectTarget(appliedEffects, "critDamage"),
    critRate: sumEffectTarget(appliedEffects, "critRate"),
    damageBonus: sumEffectTarget(appliedEffects, "damageBonus"),
    amplifyingReactionBonus: sumEffectTarget(appliedEffects, "amplifyingReactionBonus"),
    reactionDamageBonus: sumEffectTarget(appliedEffects, "reactionDamageBonus"),
    transformativeReactionFlatDamageAddition: sumEffectTarget(appliedEffects, "transformativeReactionFlatDamageAddition"),
    specialReactionDamageBonus: sumEffectTarget(appliedEffects, "specialReactionDamageBonus"),
    specialReactionBaseDamageFlat: sumEffectTarget(appliedEffects, "specialReactionBaseDamageFlat"),
    specialReactionBaseDamageBonus: sumEffectTarget(appliedEffects, "specialReactionBaseDamageBonus"),
    specialReactionFlatDamageAddition: sumEffectTarget(appliedEffects, "specialReactionFlatDamageAddition"),
    specialReactionElevation: sumEffectTarget(appliedEffects, "specialReactionElevation"),
    defenseFlat: sumEffectTarget(appliedEffects, "defenseFlat"),
    defensePercent: sumEffectTarget(appliedEffects, "defensePercent"),
    enemyDefenseIgnore: sumEffectTarget(appliedEffects, "enemyDefenseIgnore"),
    enemyDefenseReduction: sumEffectTarget(appliedEffects, "enemyDefenseReduction"),
    enemyResistanceReduction: sumEffectTarget(appliedEffects, "enemyResistanceReduction"),
    energyRecharge: sumEffectTarget(appliedEffects, "energyRecharge"),
    elementalMastery: sumEffectTarget(appliedEffects, "elementalMastery"),
    finalHpToFlatAttack: sumEffectTarget(appliedEffects, "finalHpToFlatAttack"),
    finalHpToElementalMastery: sumEffectTarget(appliedEffects, "finalHpToElementalMastery"),
    finalElementalMasteryToFlatAttack: sumEffectTarget(appliedEffects, "finalElementalMasteryToFlatAttack"),
    finalHpToDamageBonuses,
    finalHpToOwnElementDamageBonuses,
    hpFlat: sumEffectTarget(appliedEffects, "hpFlat"),
    hpPercent: sumEffectTarget(appliedEffects, "hpPercent"),
    matchedActionAdditiveDamageTerms
  }
}

function resolveSpecialReactionBaseDamageScalingSnapshot(
  effect: CombatActionEffect,
  input: ResolveCombatActionEffectCandidatesInput,
  source: CharacterBuild
): { readonly scalingStat: ScalingStat; readonly scalingStatValue: number } | undefined {
  if (effect.target !== "specialReactionBaseDamageFlat") return undefined
  if (effect.value.kind === "source_final_defense") {
    const value = input.sourceFinalDefenseByBuildId?.get(source.buildId)
    return value === undefined ? undefined : { scalingStat: "defense", scalingStatValue: value }
  }
  if (effect.value.kind === "source_final_attack") {
    const value = input.sourceFinalAttackByBuildId?.get(source.buildId)
    return value === undefined ? undefined : { scalingStat: "attack", scalingStatValue: value }
  }
  if (effect.value.kind === "final_elemental_mastery") {
    const value = input.sourceFinalElementalMasteryByBuildId?.get(source.buildId)
    return value === undefined ? undefined : { scalingStat: "elementalMastery", scalingStatValue: value }
  }
  if (effect.value.kind === "final_hp") {
    const value = input.sourceFinalHpByBuildId?.get(source.buildId)
    return value === undefined ? undefined : { scalingStat: "hp", scalingStatValue: value }
  }
  return undefined
}

function isSelfAutomaticEquipmentEffect(effect: CombatActionEffect): boolean {
  if (!isCombatActionStatEffect(effect)) return false
  if (effect.activation !== "automatic" || effect.value.kind === "team_burst_energy_cost") {
    return false
  }
  if (effect.source.kind === "weapon") return effect.source.holder !== "party_member"
  return effect.source.kind === "artifact_set" && effect.source.holder !== "party_member"
}

/** Ranks mutually exclusive maximum-reachable variants by explicit stack/state strength and declaration order. */
export function getMaximumReachableEffectPriority(effect: CombatActionEffect, declarationIndex: number): number {
  const variant = effect.exclusivity?.variant ?? ""
  const numericValues = [...variant.matchAll(/\d+/g)].map((match) => Number(match[0]))
  const numericPriority = numericValues.length > 0 ? Math.max(...numericValues) * 1000 : 0
  const namedPriority = /full|both|maximum|with-shield|three-stack/.test(variant) ? 100_000 : 0
  return namedPriority + numericPriority + declarationIndex
}

function selectSelfMaximumReachableCharacterEffectIds(
  candidates: readonly CombatActionEffect[],
  input: ResolveCombatActionEffectCandidatesInput
): readonly string[] {
  const eligible = candidates.flatMap((effect, declarationIndex) => {
    if (effect.source.kind !== "character" || effect.activation !== "maximum_reachable") return []
    if (effect.source.minimumSourceAscension !== undefined && input.primary.ascension < effect.source.minimumSourceAscension) {
      return []
    }
    if (
      effect.source.minimumSourceConstellation !== undefined &&
      input.primary.constellation < effect.source.minimumSourceConstellation
    ) return []
    if (!matchesEffectCondition(effect, input)) return []
    return [{ declarationIndex, effect }]
  })
  const bestByGroup = new Map<string, (typeof eligible)[number]>()
  const selectedIds = new Set<string>()
  for (const candidate of eligible) {
    const group = candidate.effect.exclusivity?.group
    if (!group) {
      selectedIds.add(candidate.effect.id)
      continue
    }
    const current = bestByGroup.get(group)
    if (
      !current ||
      getMaximumReachableEffectPriority(candidate.effect, candidate.declarationIndex) >
        getMaximumReachableEffectPriority(current.effect, current.declarationIndex)
    ) bestByGroup.set(group, candidate)
  }
  for (const candidate of eligible) {
    const group = candidate.effect.exclusivity?.group
    if (!group) continue
    const selectedVariant = bestByGroup.get(group)?.effect.exclusivity?.variant
    if (selectedVariant === candidate.effect.exclusivity?.variant) selectedIds.add(candidate.effect.id)
  }
  return [...selectedIds]
}

function isSelfMaximumReachableCharacterStatEffect(effect: CombatActionEffect, source: CharacterBuild): boolean {
  if (!isCombatActionStatEffect(effect)) return false
  if (
    effect.activation !== "maximum_reachable" ||
    effect.source.kind !== "character" ||
    effect.source.characterId !== source.characterId ||
    (effect.source.travelerElement !== undefined &&
      (source.variant?.kind !== "traveler" || source.variant.element !== effect.source.travelerElement)) ||
    effect.targetFilter?.recipientSourceRelation === "not_source" ||
    !["fixed", "refinement_table", "talent_parameter"].includes(effect.value.kind)
  ) return false
  return [
    "attackPercent",
    "critDamage",
    "critRate",
    "defenseFlat",
    "defensePercent",
    "elementalMastery",
    "energyRecharge",
    "finalHpToFlatAttack",
    "flatAttack",
    "hpFlat",
    "hpPercent"
  ].includes(effect.target)
}

function isSelfMaximumReachableEquipmentStatEffect(effect: CombatActionEffect): boolean {
  if (
    effect.activation !== "active" &&
    effect.activation !== "maximum_reachable"
  ) {
    return false
  }
  const source = effect.source
  if (source.kind === "character" || source.holder === "party_member") return false
  if (effect.targetFilter?.recipientSourceRelation === "not_source") return false
  return (
    effect.target === "attackPercent" ||
    effect.target === "defenseFlat" ||
    effect.target === "defensePercent" ||
    effect.target === "flatAttack" ||
    effect.target === "hpFlat" ||
    effect.target === "hpPercent" ||
    effect.target === "elementalMastery"
  )
}

/** Keeps a source-only equipment snapshot from inheriting a passive restricted to another character. */
function isSelfMaximumReachableEquipmentStatEffectCompatibleWithSource(
  effect: CombatActionEffect,
  source: CharacterBuild
): boolean {
  const recipientCharacterIds = effect.targetFilter?.recipientCharacterIds
  return recipientCharacterIds === undefined || recipientCharacterIds.includes(source.characterId)
}

interface ExclusiveActionEffect {
  readonly exclusivity?: CombatActionEffect["exclusivity"]
  readonly label: string
}

function assertSelectedActiveEffectExclusivity(activeEffectIds: readonly string[]): void {
  const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
  const selectedActiveEffects = activeEffectIds.flatMap((effectId) => {
    const effect = effectsById.get(effectId)
    return effect?.activation === "active" ? [effect] : []
  })
  assertExclusiveActionEffectsAreCompatible(selectedActiveEffects)
}

function assertExclusiveActionEffectsAreCompatible(effects: readonly ExclusiveActionEffect[]): void {
  const variantsByGroup = new Map<string, Map<string, string>>()
  for (const effect of effects) {
    const exclusivity = effect.exclusivity
    if (!exclusivity) continue
    const variants = variantsByGroup.get(exclusivity.group) ?? new Map<string, string>()
    variants.set(exclusivity.variant, effect.label)
    variantsByGroup.set(exclusivity.group, variants)
  }
  for (const [group, variants] of variantsByGroup) {
    if (variants.size <= 1) continue
    throw new Error(`Selected ${group} effects cannot stack: ${[...variants.values()].join(", ")}`)
  }
}

function isEligibleStatActionEffect(effect: EligibleActionEffect): effect is EligibleStatActionEffect {
  return isCombatActionStatEffect(effect.effect)
}

function isCombatActionStatEffect(effect: CombatActionEffect): effect is CombatActionStatEffect {
  return effect.target !== "additionalDamageEvent" && effect.target !== "matchedActionAdditiveDamageTerm"
}

function isCombatActionEffectCompatibleWithAdditionalDamageEvent(effect: CombatActionEffect): boolean {
  if (
    !isCombatActionStatEffect(effect) ||
    effect.target === "amplifyingReactionBonus" ||
    effect.target === "reactionDamageBonus" ||
    effect.target === "transformativeReactionFlatDamageAddition" ||
    effect.target === "specialReactionDamageBonus" ||
    effect.target === "specialReactionBaseDamageFlat" ||
    effect.target === "specialReactionBaseDamageBonus" ||
    effect.target === "specialReactionFlatDamageAddition" ||
    effect.target === "specialReactionElevation"
  ) {
    return false
  }
  const filter = effect.targetFilter
  return (
    !filter ||
    (!filter.actionIds &&
      !filter.amplifyingReactionKinds &&
      !filter.reactionKinds &&
      !filter.attackKinds &&
      !filter.recipientWeaponTypes &&
      !filter.talentSlots)
  )
}

function resolveEligibleActionEffect(
  effect: CombatActionEffect,
  input: ResolveCombatActionEffectCandidatesInput
): readonly EligibleActionEffect[] {
  if (!hasRequiredActiveEffects(effect, input.activeEffectIds)) return []
  if (
    effect.deterministicSnapshotActivation !== undefined &&
    !isCombatActionEffectDeterministicallyActive(effect, input.action)
  ) {
    return []
  }
  if (!matchesEffectCondition(effect, input)) return []
  if (effect.target === "finalHpToOwnElementDamageBonus") {
    const effectiveElements = input.effectiveElements ?? [input.action.element]
    if (input.primaryElement === undefined || !effectiveElements.some((element) => element === input.primaryElement)) {
      return []
    }
  }
  const isSelectedActiveEffect = input.activeEffectIds.includes(effect.id)
  if (effect.activation !== "automatic" && !isSelectedActiveEffect) return []
  const selectedSourceBuildId = input.activeEffectSourceBuildIds?.[effect.id]
  const effectSource = effect.source
  const selectedTeammateSource = input.teammates.find((build) => build.buildId === selectedSourceBuildId)
  const selectedTeammateOwnsSelfEffect =
    selectedTeammateSource !== undefined &&
    (effectSource.kind === "weapon"
      ? selectedTeammateSource.weapon.weaponId === effectSource.weaponId
      : effectSource.kind === "artifact_set"
        ? countArtifactSet(selectedTeammateSource, effectSource.setId) >= effectSource.minimumPieces
        : false)
  if (
    effectSource.kind !== "character" &&
    effectSource.holder !== "party_member" &&
    selectedTeammateOwnsSelfEffect
  ) {
    return []
  }
  const sources = resolveEffectSources(
    effect,
    input.primary,
    input.teammates,
    input.activeEffectSourceBuildIds?.[effect.id]
  )
  if (sources.length === 0) {
    if (effect.activation !== "automatic" && isSelectedActiveEffect) {
      throw new Error(`Active effect ${effect.id} requires its source build in the configured team`)
    }
    return []
  }
  return sources.flatMap((source) => {
    if (effect.source.kind === "character") {
      const requiredAscension = effect.source.minimumSourceAscension
      if (requiredAscension !== undefined && source.ascension < requiredAscension) return []
      const requiredConstellation = effect.source.minimumSourceConstellation
      if (requiredConstellation !== undefined && source.constellation < requiredConstellation) {
        if (effect.activation !== "automatic" && isSelectedActiveEffect) {
          throw new Error(
            `Active effect ${effect.id} requires ${effect.source.characterId} constellation ${requiredConstellation}, ` +
              `but source build has constellation ${source.constellation}`
          )
        }
        return []
      }
    }
    const recipientSourceRelation = effect.targetFilter?.recipientSourceRelation
    if (recipientSourceRelation === "not_source" && source.buildId === input.primary.buildId) {
      return []
    }
    if (recipientSourceRelation === "source" && source.buildId !== input.primary.buildId) {
      return []
    }
    if (
      (effect.target === "finalHpToFlatAttack" ||
        effect.target === "finalHpToElementalMastery" ||
        effect.target === "finalHpToDamageBonus" ||
        effect.target === "finalHpToOwnElementDamageBonus") &&
      source.buildId !== input.primary.buildId
    ) {
      throw new Error(`Final-HP conversion ${effect.id} must be owned by the primary build`)
    }
    if (effect.target === "finalElementalMasteryToFlatAttack" && source.buildId !== input.primary.buildId) {
      throw new Error(`Final-elemental-mastery conversion ${effect.id} must be owned by the primary build`)
    }
    if (effect.target === "matchedActionAdditiveDamageTerm" && source.buildId !== input.primary.buildId) {
      throw new Error(`Same-hit additive damage ${effect.id} must be owned by the primary build`)
    }
    return [{ effect, source }]
  })
}

function hasRequiredActiveEffects(effect: CombatActionEffect, activeEffectIds: readonly string[]): boolean {
  return effect.requiredActiveEffectIds?.every((effectId) => activeEffectIds.includes(effectId)) ?? true
}

/** Resolves a self-owned flat-attack passive after every maximum-HP contribution has been assembled. */
export {
  resolveFinalElementalMasteryToFlatAttack,
  resolveFinalHpToDamageBonus,
  resolveFinalHpToElementalMastery,
  resolveFinalHpToFlatAttack,
  resolveFinalHpToOwnElementDamageBonus
} from "./stat-conversions.js"

function matchesEffectCondition(effect: CombatActionEffect, input: ResolveCombatActionEffectCandidatesInput): boolean {
  if (!effect.condition) return true
  if (effect.condition.kind === "hexerei_secret_rite") {
    return hasHexereiSecretRite([input.primary, ...input.teammates].map((build) => build.characterId))
  }
  if (effect.condition.kind === "moonsign_level") {
    const rank = { ascendant_gleam: 2, nascent_gleam: 1, none: 0 } as const
    return input.moonsignLevel !== undefined && rank[input.moonsignLevel] >= rank[effect.condition.minimum]
  }
  if (effect.condition.kind === "source_nightsoul_blessing") return true
  if (effect.condition.kind === "primary_nightsoul_blessing") {
    return canEnterNightsoulBlessing(input.primary) === effect.condition.required
  }
  if (effect.condition.kind === "team_nightsoul_burst") {
    return (
      resolveMaximumNightsoulBurstTriggers(
        [input.primary, ...input.teammates],
        effect.condition.windowSeconds
      ) >= effect.condition.minimumTriggers
    )
  }
  if (effect.condition.kind === "team_element_count") {
    const condition = effect.condition
    const gameData = input.gameData
    const elements = input.teamElements ?? (gameData
      ? [input.primary, ...input.teammates].flatMap((build) => {
          const element = resolveBuildElement(build, gameData)
          return element === null || element === "physical" ? [] : [element]
        })
      : undefined)
    if (elements === undefined) return false
    const count = elements.filter((element) => condition.elements.includes(element)).length
    return count >= condition.minimum && (condition.maximum === undefined || count <= condition.maximum)
  }
  if (effect.condition.kind === "team_element_subset") {
    const condition = effect.condition
    const elements = input.teamElements
    if (elements === undefined || elements.length !== input.teammates.length + 1) return false
    if (!elements.every((element) => condition.allowedElements.includes(element))) return false
    return condition.requiredElements?.every((required) => elements.includes(required)) ?? true
  }
  if (effect.condition.kind === "team_unique_element_count") {
    return input.teamUniqueElementCount !== undefined && input.teamUniqueElementCount >= effect.condition.minimum
  }
  if (effect.condition.kind === "primary_different_element_teammate_count") {
    const count = input.primaryDifferentElementTeammateCount
    if (count === undefined || count < effect.condition.minimum) return false
    return effect.condition.maximum === undefined || count <= effect.condition.maximum
  }
  if (effect.condition.kind === "primary_same_element_teammate_count") {
    const count = input.primarySameElementTeammateCount
    if (count === undefined || count < effect.condition.minimum) return false
    return effect.condition.maximum === undefined || count <= effect.condition.maximum
  }
  if (effect.condition.kind === "primary_burst_energy_cost") {
    const energyCost = getCharacterBurstEnergyCost(input.primary)
    if (energyCost === undefined || (effect.condition.minimum !== undefined && energyCost < effect.condition.minimum)) {
      return false
    }
    return effect.condition.maximum === undefined || energyCost <= effect.condition.maximum
  }
  if (effect.condition.kind === "team_region_count") {
    if (input.gameData === undefined) return false
    const count = resolveTeamRegionCount([input.primary, ...input.teammates], effect.condition.region, input.gameData)
    return count >= effect.condition.minimum && (effect.condition.maximum === undefined || count <= effect.condition.maximum)
  }
  if (effect.condition.kind === "primary_different_element_or_region_party_count") {
    if (input.gameData === undefined) return false
    const count = resolvePrimaryDifferentElementOrRegionPartyCount(
      input.primary,
      input.teammates,
      effect.condition.region,
      input.gameData
    )
    if (count === null || count < effect.condition.minimum) return false
    return effect.condition.maximum === undefined || count <= effect.condition.maximum
  }
  if (input.enemyCount === undefined) return false
  if (effect.condition.minimum !== undefined && input.enemyCount < effect.condition.minimum) return false
  return effect.condition.maximum === undefined || input.enemyCount <= effect.condition.maximum
}

function assertActiveEffectSourceSelections(input: ResolveCombatActionEffectCandidatesInput): void {
  for (const effectId of Object.keys(input.activeEffectSourceBuildIds ?? {})) {
    if (!input.activeEffectIds.includes(effectId)) {
      throw new Error(`Active effect source selection ${effectId} requires the effect to be selected`)
    }
  }
}

function resolveEffectSources(
  effect: CombatActionEffect,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  selectedSourceBuildId: string | undefined
): readonly CharacterBuild[] {
  const source = effect.source
  const matchesSourceCondition = (build: CharacterBuild) =>
    effect.condition?.kind !== "source_nightsoul_blessing" ||
    canEnterNightsoulBlessing(build) === effect.condition.required
  if (source.kind === "weapon") {
    const sourceCandidates = source.holder === "party_member" ? [primary, ...teammates] : [primary]
    const matchingSources = sourceCandidates.filter(
      (build) => build.weapon.weaponId === source.weaponId && matchesSourceCondition(build)
    )
    if (source.resolveAllMatchingPartySources === true && selectedSourceBuildId !== undefined) {
      throw new Error(`Effect ${effect.id} resolves every matching party source and cannot select only ${selectedSourceBuildId}`)
    }
    return resolveEffectSourceCandidates(
      effect.id,
      matchingSources,
      selectedSourceBuildId,
      source.resolveAllMatchingPartySources === true
    )
  }
  if (source.kind === "artifact_set") {
    const artifactSource = source
    const sourceCandidates = artifactSource.holder === "party_member" ? [primary, ...teammates] : [primary]
    return resolveEffectSourceCandidates(
      effect.id,
      sourceCandidates.filter(
        (build) =>
          countArtifactSet(build, artifactSource.setId) >= artifactSource.minimumPieces && matchesSourceCondition(build)
      ),
      selectedSourceBuildId,
      false
    )
  }
  const characterId = source.characterId
  const matchingSources = [primary, ...teammates].filter(
    (build) =>
      build.characterId === characterId &&
      (source.travelerElement === undefined ||
        (build.variant?.kind === "traveler" && build.variant.element === source.travelerElement)) &&
      matchesSourceCondition(build)
  )
  return resolveEffectSourceCandidates(effect.id, matchingSources, selectedSourceBuildId, false, characterId)
}

function resolveEffectSourceCandidates(
  effectId: string,
  candidates: readonly CharacterBuild[],
  selectedSourceBuildId: string | undefined,
  resolveAllMatchingSources: boolean,
  characterId?: string
): readonly CharacterBuild[] {
  if (candidates.length === 0) return []
  if (selectedSourceBuildId !== undefined) {
    const selectedSource = candidates.find((build) => build.buildId === selectedSourceBuildId)
    if (selectedSource) return [selectedSource]
    throw new Error(`Active effect ${effectId} cannot use selected source build ${selectedSourceBuildId}`)
  }
  if (resolveAllMatchingSources) return candidates
  const soleCandidate = candidates[0]
  if (candidates.length === 1 && soleCandidate) return [soleCandidate]
  if (characterId) throw new Error(`Active effect ${effectId} requires exactly one ${characterId} source build`)
  throw new Error(`Active effect ${effectId} has multiple eligible source builds; select one explicitly`)
}

import {
  listFinalHpSourcedDamageBonuses,
  resolveAdditionalDamageEvent,
  resolveEffectValue,
  resolveExpectedAdditionalDamageEventCoefficient,
  resolveFinalHpMaximumValue,
  resolveMatchedActionAdditiveDamageTerm,
  resolveMatchedActionAdditiveDamageTermCoefficient
} from "./value-resolution.js"

function sumEffectTarget(
  effects: readonly AppliedCombatActionEffect[],
  target: Exclude<AppliedCombatActionEffect["target"], "matchedActionAdditiveDamageTerm" | "talentLevel">
): number {
  return effects.reduce((total, effect) => total + (effect.target === target ? effect.value : 0), 0)
}

function sumValues(values: Iterable<number>): number {
  let total = 0
  for (const value of values) total += value
  return total
}
