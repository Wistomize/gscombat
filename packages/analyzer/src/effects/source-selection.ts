import {
  listCombatActionEffects,
  type CombatActionEffect,
  type CombatElementOverrideEffect
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"

import { countArtifactSet } from "../core/artifact-stats.js"
import type { ResolveDependentActiveEffectIdsInput } from "./types.js"

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

export function hasActivatableEffectSource(
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

export function hasActivatableElementOverrideSource(
  effect: CombatElementOverrideEffect,
  input: ResolveDependentActiveEffectIdsInput
): boolean {
  const sources = [input.primary, ...input.teammates].filter(
    (build) => build.characterId === effect.sourceCharacterId
  )
  const source = sources.length === 1 ? sources[0] : undefined
  return source !== undefined && source.constellation >= (effect.minimumSourceConstellation ?? 0)
}

export function listSourceCandidates(
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
  return [primary, ...teammates].filter(
    (build) =>
      build.characterId === source.characterId &&
      (source.travelerElement === undefined ||
        (build.variant?.kind === "traveler" && build.variant.element === source.travelerElement))
  )
}

function isSelfSnapshotOwnedBy(effect: CombatActionEffect, build: CharacterBuild): boolean {
  const source = effect.source
  if (source.kind === "weapon") {
    return build.weapon.weaponId === source.weaponId
  }
  if (source.kind === "artifact_set") {
    return countArtifactSet(build, source.setId) >= source.minimumPieces
  }
  return (
    build.characterId === source.characterId &&
    build.ascension >= (source.minimumSourceAscension ?? 0) &&
    build.constellation >= (source.minimumSourceConstellation ?? 0) &&
    (source.travelerElement === undefined ||
      (build.variant?.kind === "traveler" && build.variant.element === source.travelerElement))
  )
}
