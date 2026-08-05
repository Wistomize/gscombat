import {
  getCharacterBurstEnergyCost,
  hasHexereiSecretRite,
  isCombatActionEffectApplicable,
  isCombatActionEffectDeterministicallyActive,
  listCharacterTalentLevelConstellationBonuses,
  listCombatActionEffects,
  listCombatElementOverrideEffects,
  weaponInventory,
  type CombatActionAdditionalDamageEvent,
  type CombatActionEffectComputedScalar,
  type CombatActionEffect,
  type CombatActionEffectScalar,
  type CombatActionEffectTarget,
  type CombatActionEffectTargetFilter,
  type CombatActionReactionKind,
  type CombatActionStatEffect,
  type CombatActionMetadata,
  type CombatElementOverrideEffect
} from "@gscombat/content"
import type { AmplifyingReactionConfig, DirectSpecialReactionKind, Element, ScalingStat } from "@gscombat/calculator"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { countArtifactSet } from "./artifact-stats.js"

/** One content-owned automatic or explicitly selected snapshot contribution resolved for a target action. */
export interface AppliedCombatActionEffect {
  readonly actionParameterId?: string
  /** Present while resolving a capped final-maximum-HP conversion before it is materialized for the UI trace. */
  readonly finalHpMaximumValue?: number
  readonly id: string
  readonly label: string
  /** Present only for a stat term that is added to the selected hit before shared multipliers. */
  readonly scalingStat?: ScalingStat
  /** Source-stat snapshot retained for an auditable special-reaction base-damage term. */
  readonly scalingStatValue?: number
  readonly sourceId: string
  readonly target: CombatActionEffectTarget | "flatAttack" | "talentLevel"
  readonly targetFilter?: CombatActionEffectTargetFilter
  readonly value: number
}

/** An independently evaluated, equipment-owned hit added to one selected core action. */
export interface ResolvedAdditionalDamageEvent {
  readonly canCrit: CombatActionAdditionalDamageEvent["canCrit"]
  readonly critPolicy?: CombatActionAdditionalDamageEvent["critPolicy"]
  readonly coefficient: number
  readonly element: Element
  readonly expectedTriggerProbability: number
  readonly flatDamage?: number
  readonly id: string
  readonly label: string
  readonly reactionPolicy: CombatActionAdditionalDamageEvent["reactionPolicy"]
  readonly scalingStat: CombatActionAdditionalDamageEvent["scalingStat"]
  readonly sourceId: string
}

/** One stat-scaled contribution added to the selected action's existing hit rather than a new hit. */
export interface ResolvedMatchedActionAdditiveDamageTerm {
  readonly coefficient: number
  readonly id: string
  readonly label: string
  readonly scalingStat: ScalingStat
  readonly sourceId: string
}

/** One final-maximum-HP elemental-damage conversion with its independently applied cap. */
export interface ResolvedFinalHpSourcedDamageBonus {
  readonly maximumValue?: number
  readonly multiplier: number
}

/** Stat-stage totals and auditable source entries materialized for the selected action only. */
export interface ResolvedCombatActionEffects {
  readonly additionalDamageEvents: readonly ResolvedAdditionalDamageEvent[]
  readonly appliedEffects: readonly AppliedCombatActionEffect[]
  readonly attackPercent: number
  readonly baseDamageFlat: number
  readonly flatAttack: number
  readonly critDamage: number
  readonly critRate: number
  readonly damageBonus: number
  /** Adds to the selected action's configured Vaporize or Melt multiplier bonus. */
  readonly amplifyingReactionBonus: number
  /** Adds only to the selected ordinary reaction's dedicated formula stage. */
  readonly reactionDamageBonus: number
  /** Adds after a selected transformative reaction's level, multiplier, and reaction-bonus calculation. */
  readonly transformativeReactionFlatDamageAddition: number
  /** Adds only to the selected direct Moon or Stellar reaction's dedicated formula stage. */
  readonly specialReactionDamageBonus: number
  /** Adds directly to the selected special-reaction event's base damage before its dedicated multipliers. */
  readonly specialReactionBaseDamageFlat: number
  /** Adds to the selected special-reaction event's independent base-damage-bonus stage. */
  readonly specialReactionBaseDamageBonus: number
  readonly specialReactionFlatDamageAddition: number
  /** Adds to the selected special-reaction event's final elevation stage. */
  readonly specialReactionElevation: number
  readonly defenseFlat: number
  readonly defensePercent: number
  readonly enemyDefenseIgnore: number
  readonly enemyDefenseReduction: number
  readonly enemyResistanceReduction: number
  readonly energyRecharge: number
  readonly elementalMastery: number
  /** Sum of self-owned final-maximum-HP-to-flat-attack ratios, applied after final HP is known. */
  readonly finalHpToFlatAttack: number
  /** Sum of self-owned final-maximum-HP-to-elemental-mastery ratios, applied after final HP is known. */
  readonly finalHpToElementalMastery: number
  /** Sum of self-owned resolved-elemental-mastery-to-flat-attack ratios, applied after the mastery stat stage. */
  readonly finalElementalMasteryToFlatAttack: number
  /** Self-owned final-maximum-HP damage-bonus conversions, each retaining its independent cap. */
  readonly finalHpToDamageBonuses: readonly ResolvedFinalHpSourcedDamageBonus[]
  /** Self-owned final-maximum-HP conversions applied only to the holder's native element. */
  readonly finalHpToOwnElementDamageBonuses: readonly ResolvedFinalHpSourcedDamageBonus[]
  readonly hpFlat: number
  readonly hpPercent: number
  /** Terms appended to eligible existing action hits before that hit's common multipliers. */
  readonly matchedActionAdditiveDamageTerms: readonly ResolvedMatchedActionAdditiveDamageTerm[]
}

/** Input used to derive active effects whose content declaration depends on other active snapshots. */
export interface ResolveDependentActiveEffectIdsInput {
  readonly activeEffectIds: readonly string[]
  /** Explicit source selections remain available for a dependent effect with multiple compatible party owners. */
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  /** When present, deterministic action-state effects are derived without a user-selected snapshot ID. */
  readonly action?: CombatActionMetadata
  readonly primary: CharacterBuild
  readonly teammates: readonly CharacterBuild[]
}

export const EMPTY_COMBAT_ACTION_EFFECTS: ResolvedCombatActionEffects = {
  additionalDamageEvents: [],
  appliedEffects: [],
  attackPercent: 0,
  baseDamageFlat: 0,
  flatAttack: 0,
  critDamage: 0,
  critRate: 0,
  damageBonus: 0,
  amplifyingReactionBonus: 0,
  reactionDamageBonus: 0,
  transformativeReactionFlatDamageAddition: 0,
  specialReactionDamageBonus: 0,
  specialReactionBaseDamageFlat: 0,
  specialReactionBaseDamageBonus: 0,
  specialReactionFlatDamageAddition: 0,
  specialReactionElevation: 0,
  defenseFlat: 0,
  defensePercent: 0,
  enemyDefenseIgnore: 0,
  enemyDefenseReduction: 0,
  enemyResistanceReduction: 0,
  energyRecharge: 0,
  elementalMastery: 0,
  finalHpToFlatAttack: 0,
  finalHpToElementalMastery: 0,
  finalElementalMasteryToFlatAttack: 0,
  finalHpToDamageBonuses: [],
  finalHpToOwnElementDamageBonuses: [],
  hpFlat: 0,
  hpPercent: 0,
  matchedActionAdditiveDamageTerms: []
}

interface ResolveCombatActionEffectCandidatesInput {
  readonly action: CombatActionMetadata
  /** Event-level Vaporize or Melt kinds possible from the scenario's explicit target-aura windows. */
  readonly candidateAmplifyingReactionKinds?: readonly AmplifyingReactionConfig["kind"][]
  /** Ordinary reaction kinds directly declared by the metric or derived from its explicit target setup. */
  readonly candidateReactionKinds?: readonly CombatActionReactionKind[]
  /** Direct Moon or Stellar kinds belonging to the current event class, when the selected action mixes formula paths. */
  readonly candidateSpecialReactionKinds?: readonly DirectSpecialReactionKind[]
  readonly activeEffectIds: readonly string[]
  /** Explicit source-build choices for active effects with multiple eligible party-owned holders. */
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  /** Final elements of every declared target event after source-owned elemental overrides. */
  readonly effectiveElements?: readonly CombatActionMetadata["element"][]
  /** Energy recharge after character, weapon, artifact stats, external buffs, and intervention deltas. */
  readonly baseEnergyRecharge: number
  /** Pinned game data required only by character effects that read a configured talent parameter. */
  readonly gameData?: GameDataRepository
  /** Party-derived Moonsign state used by current-action equipment variants. */
  readonly moonsignLevel?: "none" | "nascent_gleam" | "ascendant_gleam"
  /** Number of enemies configured for the selected action, when an eligible effect needs it. */
  readonly enemyCount?: number
  /** Primary build's native element when known; needed by effects restricted to that element rather than all damage. */
  readonly primaryElement?: CombatActionMetadata["element"]
  readonly primary: CharacterBuild
  /** Final maximum HP keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalHpByBuildId?: ReadonlyMap<string, number>
  /** Final elemental mastery keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalElementalMasteryByBuildId?: ReadonlyMap<string, number>
  /** Final defense keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalDefenseByBuildId?: ReadonlyMap<string, number>
  /** Final attack keyed by eligible effect source build, resolved before source-owned conversion effects. */
  readonly sourceFinalAttackByBuildId?: ReadonlyMap<string, number>
  /** Number of configured teammates whose elemental identity differs from the primary build. */
  readonly primaryDifferentElementTeammateCount?: number
  /** Number of configured teammates whose elemental identity matches the primary build. */
  readonly primarySameElementTeammateCount?: number
  /** Number of distinct known elements across the configured primary and teammates. */
  readonly teamUniqueElementCount?: number
  /** Native elements of every configured party member, used by element-count conditions. */
  readonly teamElements?: readonly Exclude<Element, "physical">[]
  readonly teammates: readonly CharacterBuild[]
}

/** Input needed to resolve maintained equipment passives and selected character snapshots for one action. */
export interface ResolveCombatActionEffectsInput extends ResolveCombatActionEffectCandidatesInput {
  /** Number of enemies configured for the selected action. */
  readonly enemyCount: number
}

/** Input for resolving only the stat effects that can modify one owned additional damage event. */
export interface ResolveAdditionalDamageEventEffectsInput extends ResolveCombatActionEffectsInput {
  readonly additionalDamageEvent: ResolvedAdditionalDamageEvent
}

/** Input for effects that are always available from the metric source's own equipped weapon or artifact set. */
export interface ResolveSelfAutomaticEquipmentEffectsInput {
  readonly action: CombatActionMetadata
  /** Source energy recharge before any typed equipment effect is applied. */
  readonly baseEnergyRecharge: number
  /** Optional explicit source-action enemy count; when absent, enemy-count passives remain unapplied. */
  readonly enemyCount?: number
  /** Primary build's native element when a self-owned automatic effect needs it. */
  readonly primaryElement?: CombatActionMetadata["element"]
  readonly primary: CharacterBuild
  /** Other configured party members for static composition-gated self passives. */
  readonly teammates?: readonly CharacterBuild[]
  /** Number of configured teammates whose elemental identity differs from the primary build. */
  readonly primaryDifferentElementTeammateCount?: number
  /** Number of configured teammates whose elemental identity matches the primary build. */
  readonly primarySameElementTeammateCount?: number
  /** Number of distinct known elements across the configured primary and teammates. */
  readonly teamUniqueElementCount?: number
}

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
 * Resolves automatic effects owned by a metric source itself.
 *
 * This intentionally excludes active snapshots, character effects, party-owned artifact effects, and effects that
 * read team burst costs. Enemy-count conditions resolve only when the caller supplies an explicit source context.
 */
export function resolveSelfAutomaticEquipmentEffects(
  input: ResolveSelfAutomaticEquipmentEffectsInput
): ResolvedCombatActionEffects {
  const candidates = listCombatActionEffects().filter(isSelfAutomaticEquipmentEffect)
  return resolveCombatActionEffectsForCandidates(
    {
      action: input.action,
      activeEffectIds: [],
      baseEnergyRecharge: input.baseEnergyRecharge,
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
    },
    candidates
  )
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

/** Input for finding the source-owned self snapshots implied by a selected source-defense conversion. */
export interface SourceStatSnapshotSelectionInput {
  readonly activeEffectIds: readonly string[]
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  readonly primary: CharacterBuild
  readonly sourceBuild: CharacterBuild
  readonly teammates: readonly CharacterBuild[]
}

export type SourceDefenseSnapshotSelectionInput = SourceStatSnapshotSelectionInput
export type SourceAttackSnapshotSelectionInput = SourceStatSnapshotSelectionInput

/** Lists a selected source build's self-stat snapshots implied by a source-defense conversion. */
export function listSelectedSourceDefenseSnapshotEffectIds(
  input: SourceDefenseSnapshotSelectionInput
): readonly string[] {
  return listSelectedSourceStatSnapshotEffectIds(input, "source_final_defense")
}

/**
 * Lists a selected source build's defense snapshots together with the state IDs required to activate them.
 *
 * Source-stat resolution evaluates only defense targets, but its selected snapshot can itself require the
 * source-final-defense conversion that established the snapshot. Keeping that prerequisite here prevents a
 * state-dependent self snapshot from being silently discarded while the source stat is assembled.
 */
export function listSelectedSourceDefenseSnapshotActivationEffectIds(
  input: SourceDefenseSnapshotSelectionInput
): readonly string[] {
  return listSnapshotActivationEffectIds(listSelectedSourceDefenseSnapshotEffectIds(input))
}

/** Lists a selected source build's self-stat snapshots implied by a source-attack conversion. */
export function listSelectedSourceAttackSnapshotEffectIds(
  input: SourceAttackSnapshotSelectionInput
): readonly string[] {
  return listSelectedSourceStatSnapshotEffectIds(input, "source_final_attack")
}

/**
 * Lists a selected source build's attack snapshots together with the state IDs required to activate them.
 *
 * This is intentionally separate from the recipient-facing snapshot list: the prerequisite conversion must be
 * visible while resolving the source's own attack, but is not independently applied to the recipient action.
 */
export function listSelectedSourceAttackSnapshotActivationEffectIds(
  input: SourceAttackSnapshotSelectionInput
): readonly string[] {
  return listSnapshotActivationEffectIds(listSelectedSourceAttackSnapshotEffectIds(input))
}

function listSelectedSourceStatSnapshotEffectIds(
  input: SourceStatSnapshotSelectionInput,
  conversionKind: "source_final_attack" | "source_final_defense"
): readonly string[] {
  const selectedEffectIds = new Set(input.activeEffectIds)
  const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
  return [
    ...new Set(
      listCombatActionEffects().flatMap((effect) => {
        if (
          !selectedEffectIds.has(effect.id) ||
          (effect.activation !== "active" && effect.activation !== "maximum_reachable") ||
          effect.value.kind !== conversionKind
        ) {
          return []
        }
        const snapshotEffectIds = getSourceStatSnapshotEffectIds(effect, conversionKind)
        return snapshotEffectIds.filter((snapshotEffectId) => {
          const snapshotEffect = effectsById.get(snapshotEffectId)
          return (
            snapshotEffect !== undefined &&
            isSourceStatConversionSelectedForBuild(effect, input) &&
            isSelfSnapshotOwnedBy(snapshotEffect, input.sourceBuild)
          )
        })
      })
    )
  ]
}

/** Adds every recursively required state ID so a self snapshot can pass normal activation checks. */
function listSnapshotActivationEffectIds(snapshotEffectIds: readonly string[]): readonly string[] {
  const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
  const activeEffectIds = new Set(snapshotEffectIds)
  const pendingEffectIds = [...snapshotEffectIds]
  while (pendingEffectIds.length > 0) {
    const effectId = pendingEffectIds.pop()
    if (effectId === undefined) continue
    for (const requiredEffectId of effectsById.get(effectId)?.requiredActiveEffectIds ?? []) {
      if (activeEffectIds.has(requiredEffectId)) continue
      activeEffectIds.add(requiredEffectId)
      pendingEffectIds.push(requiredEffectId)
    }
  }
  return [...activeEffectIds]
}

function getSourceStatSnapshotEffectIds(
  effect: CombatActionEffect,
  conversionKind: "source_final_attack" | "source_final_defense"
): readonly string[] {
  if (conversionKind === "source_final_defense") {
    return effect.value.kind === "source_final_defense" ? effect.value.sourceDefenseSnapshotEffectIds ?? [] : []
  }
  return effect.value.kind === "source_final_attack" ? effect.value.sourceAttackSnapshotEffectIds ?? [] : []
}

function isSourceStatConversionSelectedForBuild(
  effect: CombatActionEffect,
  input: SourceStatSnapshotSelectionInput
): boolean {
  const sourceCandidates = listSourceCandidates(effect, input.primary, input.teammates)
  if (!sourceCandidates.some((build) => build.buildId === input.sourceBuild.buildId)) return false
  if (effect.source.kind === "weapon" && effect.source.resolveAllMatchingPartySources === true) return true
  const selectedSourceBuildId = input.activeEffectSourceBuildIds?.[effect.id]
  if (selectedSourceBuildId !== undefined) return selectedSourceBuildId === input.sourceBuild.buildId
  return sourceCandidates.length === 1
}

function hasActivatableEffectSource(
  effect: CombatActionEffect,
  input: ResolveDependentActiveEffectIdsInput
): boolean {
  const candidates = listSourceCandidates(effect, input.primary, input.teammates)
  const selectedSourceBuildId = input.activeEffectSourceBuildIds?.[effect.id]
  const sources =
    selectedSourceBuildId === undefined
      ? effect.source.kind === "weapon" && effect.source.resolveAllMatchingPartySources === true
        ? candidates
        : candidates.length === 1
          ? candidates
          : []
      : candidates.filter((build) => build.buildId === selectedSourceBuildId)
  return sources.some((source) => {
    if (effect.source.kind !== "character") return true
    return source.constellation >= (effect.source.minimumSourceConstellation ?? 0)
  })
}

function hasActivatableElementOverrideSource(
  effect: CombatElementOverrideEffect,
  input: ResolveDependentActiveEffectIdsInput
): boolean {
  const sources = [input.primary, ...input.teammates].filter(
    (build) => build.characterId === effect.sourceCharacterId
  )
  const source = sources.length === 1 ? sources[0] : undefined
  return source !== undefined && source.constellation >= (effect.minimumSourceConstellation ?? 0)
}

function listSourceCandidates(
  effect: CombatActionEffect,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): readonly CharacterBuild[] {
  const source = effect.source
  if (source.kind === "weapon") {
    const builds = source.holder === "party_member" ? [primary, ...teammates] : [primary]
    return builds.filter((build) => build.weapon.weaponId === source.weaponId)
  }
  if (source.kind === "artifact_set") {
    const builds = source.holder === "party_member" ? [primary, ...teammates] : [primary]
    return builds.filter((build) => countArtifactSet(build, source.setId) >= source.minimumPieces)
  }
  return [primary, ...teammates].filter((build) => build.characterId === source.characterId)
}

function isSelfSnapshotOwnedBy(effect: CombatActionEffect, build: CharacterBuild): boolean {
  const source = effect.source
  if (source.kind === "weapon") {
    return build.weapon.weaponId === source.weaponId
  }
  if (source.kind === "artifact_set") {
    return countArtifactSet(build, source.setId) >= source.minimumPieces
  }
  return build.characterId === source.characterId
}

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
export function resolveFinalHpToFlatAttack(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToFlatAttack">
): number {
  return finalHp * effects.finalHpToFlatAttack
}

/** Resolves self-owned elemental mastery derived from final maximum HP. */
export function resolveFinalHpToElementalMastery(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToElementalMastery">
): number {
  return finalHp * effects.finalHpToElementalMastery
}

/** Resolves a self-owned flat-attack passive from the fully assembled elemental-mastery stat stage. */
export function resolveFinalElementalMasteryToFlatAttack(
  finalElementalMastery: number,
  effects: Pick<ResolvedCombatActionEffects, "finalElementalMasteryToFlatAttack">
): number {
  return finalElementalMastery * effects.finalElementalMasteryToFlatAttack
}

/** Resolves final-maximum-HP damage bonuses, enforcing each effect's own cap before summing. */
export function resolveFinalHpToDamageBonus(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToDamageBonuses">
): number {
  return resolveFinalHpSourcedDamageBonuses(finalHp, effects.finalHpToDamageBonuses)
}

/** Resolves native-element damage bonuses from final maximum HP, enforcing each effect's own cap before summing. */
export function resolveFinalHpToOwnElementDamageBonus(
  finalHp: number,
  effects: Pick<ResolvedCombatActionEffects, "finalHpToOwnElementDamageBonuses">
): number {
  return resolveFinalHpSourcedDamageBonuses(finalHp, effects.finalHpToOwnElementDamageBonuses)
}

function matchesEffectCondition(effect: CombatActionEffect, input: ResolveCombatActionEffectCandidatesInput): boolean {
  if (!effect.condition) return true
  if (effect.condition.kind === "hexerei_secret_rite") {
    return hasHexereiSecretRite([input.primary, ...input.teammates].map((build) => build.characterId))
  }
  if (effect.condition.kind === "moonsign_level") {
    const rank = { ascendant_gleam: 2, nascent_gleam: 1, none: 0 } as const
    return input.moonsignLevel !== undefined && rank[input.moonsignLevel] >= rank[effect.condition.minimum]
  }
  if (effect.condition.kind === "primary_character_region") {
    return input.gameData?.getCharacter(input.primary.characterId)?.region === effect.condition.region
  }
  if (effect.condition.kind === "team_element_count") {
    const condition = effect.condition
    const elements = input.teamElements
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
  if (source.kind === "weapon") {
    const sourceCandidates = source.holder === "party_member" ? [primary, ...teammates] : [primary]
    const matchingSources = sourceCandidates.filter((build) => build.weapon.weaponId === source.weaponId)
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
        (build) => countArtifactSet(build, artifactSource.setId) >= artifactSource.minimumPieces
      ),
      selectedSourceBuildId,
      false
    )
  }
  const characterId = source.characterId
  const matchingSources = [primary, ...teammates].filter(
    (build) => build.characterId === characterId
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

function resolveEffectValue(
  effect: CombatActionStatEffect,
  input: ResolveCombatActionEffectCandidatesInput,
  energyRecharge: number,
  source: CharacterBuild
): number {
  if (effect.value.kind === "fixed" || effect.value.kind === "refinement_table") {
    return resolveEffectScalar(effect.value, source)
  }
  if (effect.value.kind === "talent_parameter") {
    if (effect.source.kind !== "character") {
      throw new Error(`Talent-parameter effect ${effect.id} must use a character source`)
    }
    const parameter = resolveComputedEffectScalar(
      { kind: "talent_parameter", parameter: effect.value.parameter },
      effect.id,
      input,
      source
    )
    const constellationMultiplier = (effect.value.constellationMultiplierBonuses ?? [])
      .filter((bonus) => source.constellation >= bonus.minimumSourceConstellation)
      .reduce((total, bonus) => total + bonus.value, 0)
    return parameter * ((effect.value.multiplier ?? 1) + constellationMultiplier)
  }
  if (effect.value.kind === "final_hp") {
    const multiplier = resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    if (
      effect.target === "finalHpToFlatAttack" ||
      effect.target === "finalHpToElementalMastery" ||
      effect.target === "finalHpToDamageBonus" ||
      effect.target === "finalHpToOwnElementDamageBonus"
    ) return multiplier
    const finalHp = input.sourceFinalHpByBuildId?.get(source.buildId)
    if (finalHp === undefined) {
      throw new Error(`Source final-HP conversion ${effect.id} requires final HP for ${source.buildId}`)
    }
    const value = Math.max(finalHp + (effect.value.offset ?? 0), 0) * multiplier
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined ? value : Math.min(value, resolveEffectScalar(maximumValue, source))
  }
  if (effect.value.kind === "final_elemental_mastery") {
    const multiplier = resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    if (effect.target === "finalElementalMasteryToFlatAttack") return multiplier
    const finalElementalMastery = input.sourceFinalElementalMasteryByBuildId?.get(source.buildId)
    if (finalElementalMastery === undefined) {
      throw new Error(`Source final-elemental-mastery conversion ${effect.id} requires elemental mastery for ${source.buildId}`)
    }
    const value = Math.max(finalElementalMastery + (effect.value.offset ?? 0), 0) * multiplier
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_final_defense") {
    const finalDefense = input.sourceFinalDefenseByBuildId?.get(source.buildId)
    if (finalDefense === undefined) {
      throw new Error(`Source final-defense conversion ${effect.id} requires defense for ${source.buildId}`)
    }
    const value = Math.max(finalDefense + (effect.value.offset ?? 0), 0) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_final_attack") {
    const finalAttack = input.sourceFinalAttackByBuildId?.get(source.buildId)
    if (finalAttack === undefined) {
      throw new Error(`Source final-attack conversion ${effect.id} requires attack for ${source.buildId}`)
    }
    const value = Math.max(finalAttack + (effect.value.offset ?? 0), 0) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
    const maximumValue = effect.value.maximumValue
    return maximumValue === undefined
      ? value
      : Math.min(value, resolveComputedEffectScalar(maximumValue, effect.id, input, source))
  }
  if (effect.value.kind === "source_base_attack") {
    const gameData = input.gameData
    if (!gameData) throw new Error(`Source base-attack effect ${effect.id} requires game data`)
    const characterAttack = gameData.getCharacterStat(source.characterId, "atk", source.level, source.ascension)
    const weaponAttack = gameData.getWeaponStat(
      source.weapon.weaponId,
      "atk",
      source.weapon.level,
      source.weapon.ascension
    )
    if (characterAttack === undefined || weaponAttack === undefined) {
      throw new Error(`Source base-attack effect ${effect.id} is missing base attack for ${source.buildId}`)
    }
    return (characterAttack + weaponAttack) *
      resolveComputedEffectScalar(effect.value.multiplier, effect.id, input, source)
  }
  if (effect.value.kind === "source_stat") {
    const value = (energyRecharge + (effect.value.offset ?? 0)) * resolveEffectScalar(effect.value.multiplier, source)
    const minimumValue = effect.value.minimumValue
    const maximumValue = effect.value.maximumValue
    const lowerBoundedValue = minimumValue === undefined ? value : Math.max(value, resolveEffectScalar(minimumValue, source))
    return maximumValue === undefined
      ? lowerBoundedValue
      : Math.min(lowerBoundedValue, resolveEffectScalar(maximumValue, source))
  }
  const teamBurstEnergyCost = resolveTeamBurstEnergyCost(input.primary, input.teammates, effect.id)
  const value = teamBurstEnergyCost * resolveEffectScalar(effect.value.multiplier, source)
  const maximumValue = effect.value.maximumValue
  return maximumValue === undefined ? value : Math.min(value, resolveEffectScalar(maximumValue, source))
}

function resolveFinalHpMaximumValue(effect: CombatActionEffect, source: CharacterBuild): number | undefined {
  if (
    (effect.target !== "finalHpToDamageBonus" && effect.target !== "finalHpToOwnElementDamageBonus") ||
    effect.value.kind !== "final_hp"
  ) {
    return undefined
  }
  const maximumValue = effect.value.maximumValue
  return maximumValue === undefined ? undefined : resolveEffectScalar(maximumValue, source)
}

function listFinalHpSourcedDamageBonuses(
  effects: readonly AppliedCombatActionEffect[],
  target: "finalHpToDamageBonus" | "finalHpToOwnElementDamageBonus"
): readonly ResolvedFinalHpSourcedDamageBonus[] {
  return effects.flatMap((effect) => {
    if (effect.target !== target) return []
    if (effect.finalHpMaximumValue === undefined) return [{ multiplier: effect.value }]
    return [{ maximumValue: effect.finalHpMaximumValue, multiplier: effect.value }]
  })
}

function resolveFinalHpSourcedDamageBonuses(
  finalHp: number,
  effects: readonly ResolvedFinalHpSourcedDamageBonus[]
): number {
  return effects.reduce((total, effect) => {
    const value = finalHp * effect.multiplier
    return total + (effect.maximumValue === undefined ? value : Math.min(value, effect.maximumValue))
  }, 0)
}

function resolveAdditionalDamageEvent(
  effect: Extract<CombatActionEffect, { readonly target: "additionalDamageEvent" }>,
  source: CharacterBuild,
  input: ResolveCombatActionEffectCandidatesInput
): ResolvedAdditionalDamageEvent {
  const event = effect.value
  const expectedTriggerProbability =
    typeof event.expectedTriggerProbability === "number"
      ? event.expectedTriggerProbability
      : resolveEffectScalar(event.expectedTriggerProbability, source)
  if (
    !Number.isFinite(expectedTriggerProbability) ||
    expectedTriggerProbability < 0 ||
    expectedTriggerProbability > 1
  ) {
    throw new Error(`Additional damage event ${effect.id} must use a probability from zero to one`)
  }
  const recipientMultiplier = event.recipientFinalAttackFlatDamageMultiplier
  const sourceMultiplier = event.sourceFinalAttackFlatDamageMultiplier
  const recipientFinalAttack = input.sourceFinalAttackByBuildId?.get(input.primary.buildId)
  const sourceFinalAttack = input.sourceFinalAttackByBuildId?.get(source.buildId)
  if (recipientMultiplier !== undefined && recipientFinalAttack === undefined) {
    throw new Error(`Additional damage event ${effect.id} requires the recipient's final attack`)
  }
  if (sourceMultiplier !== undefined && sourceFinalAttack === undefined) {
    throw new Error(`Additional damage event ${effect.id} requires the source's final attack`)
  }
  const flatDamage =
    (recipientFinalAttack ?? 0) *
      (recipientMultiplier === undefined ? 0 : resolveComputedEffectScalar(recipientMultiplier, effect.id, input, source)) +
    (sourceFinalAttack ?? 0) *
      (sourceMultiplier === undefined ? 0 : resolveComputedEffectScalar(sourceMultiplier, effect.id, input, source))
  const usesRecipientNativeElement = event.element === "recipient_native"
  const element = usesRecipientNativeElement ? input.primaryElement : event.element
  if (element === undefined || (usesRecipientNativeElement && element === "physical")) {
    throw new Error(`Additional damage event ${effect.id} requires the recipient's native elemental identity`)
  }
  return {
    canCrit: event.canCrit,
    ...(event.critPolicy === undefined ? {} : { critPolicy: event.critPolicy }),
    coefficient: resolveEffectScalar(event.coefficient, source),
    element,
    expectedTriggerProbability,
    ...(flatDamage === 0 ? {} : { flatDamage }),
    id: effect.id,
    label: effect.label,
    reactionPolicy: event.reactionPolicy,
    scalingStat: event.scalingStat,
    sourceId: source.buildId
  }
}

function resolveMatchedActionAdditiveDamageTerm(
  effect: Extract<CombatActionEffect, { readonly target: "matchedActionAdditiveDamageTerm" }>,
  source: CharacterBuild
): ResolvedMatchedActionAdditiveDamageTerm {
  return {
    coefficient: resolveEffectScalar(effect.value.coefficient, source),
    id: effect.id,
    label: effect.label,
    scalingStat: effect.value.scalingStat,
    sourceId: source.buildId
  }
}

function resolveExpectedAdditionalDamageEventCoefficient(
  event: ResolvedAdditionalDamageEvent | undefined,
  effectId: string
): number {
  if (!event) throw new Error(`Missing resolved additional damage event ${effectId}`)
  return (event.coefficient + (event.flatDamage ?? 0)) * event.expectedTriggerProbability
}

function resolveMatchedActionAdditiveDamageTermCoefficient(
  term: ResolvedMatchedActionAdditiveDamageTerm | undefined,
  effectId: string
): number {
  if (!term) throw new Error(`Missing resolved same-hit additive damage term ${effectId}`)
  return term.coefficient
}

function resolveEffectScalar(value: CombatActionEffectScalar, primary: CharacterBuild): number {
  if (value.kind === "fixed") return value.value
  const index = Math.min(Math.max(primary.weapon.refinement, 1), value.values.length) - 1
  return value.values[index] ?? 0
}

function resolveComputedEffectScalar(
  value: CombatActionEffectComputedScalar,
  effectId: string,
  input: ResolveCombatActionEffectCandidatesInput,
  source: CharacterBuild
): number {
  if (value.kind !== "talent_parameter") return resolveEffectScalar(value, source)
  const gameData = input.gameData
  if (!gameData) throw new Error(`Talent-parameter effect ${effectId} requires game data`)
  const reference = value.parameter
  const configuredLevel = reference.talentSlot === "passive"
    ? 1
    : reference.talentSlot === "normal"
      ? source.talents.normal
      : reference.talentSlot === "skill"
        ? source.talents.skill
        : source.talents.burst
  const travelerElement = source.variant?.kind === "traveler" ? source.variant.element : undefined
  const talentBonus = listCharacterTalentLevelConstellationBonuses(source.characterId, travelerElement)
    .filter((bonus) => bonus.talentSlot === reference.talentSlot)
    .filter((bonus) => source.constellation >= bonus.minimumSourceConstellation)
    .reduce((total, bonus) => total + bonus.value, 0)
  const talentLevel = Math.min(configuredLevel + talentBonus, 15)
  const parameter = gameData.getCharacterSkillParameter(
    source.characterId,
    reference.groupId,
    reference.parameterIndex,
    talentLevel
  )
  if (parameter === undefined) {
    throw new Error(`Missing talent parameter ${reference.id} for ${source.characterId} at level ${talentLevel}`)
  }
  return parameter * (value.multiplier ?? 1)
}

function resolveTeamBurstEnergyCost(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  effectId: string
): number {
  const party = [primary, ...teammates]
  if (party.length !== 4) {
    throw new Error(`Effect ${effectId} requires a fully configured four-character party`)
  }
  return party.reduce((total, build) => {
    const burstEnergyCost = getCharacterBurstEnergyCost(build)
    if (burstEnergyCost === undefined) {
      throw new Error(`Burst energy cost for ${build.characterId} is not maintained`)
    }
    return total + burstEnergyCost
  }, 0)
}

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
