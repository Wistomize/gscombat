import { equipmentCombatActionEffects } from "./registry/equipment-action-effects.generated.js"

import type { CatalogWeaponType } from "./catalog-presentation.js"
import { characterCombatCoverageRegistry } from "./combat-registry.js"
import { listCombatElementOverrideEffects } from "./combat-effects.js"
import type {
  CombatActionEffect,
  CombatActionMetadata,
  CombatActionReactionKind,
  CombatCharacterScenarioEffectOption,
  CombatElementOverrideEffect
} from "./combat/types.js"
import {
  listPublishedEquipmentCoverageClauses,
  type PublishedEquipmentCoverageClause
} from "./equipment-coverage-ledger.js"
import { isHexereiCharacter } from "./rules/hexerei.js"

/** A JSON-safe source requirement that a UI can validate against the configured team. */
export type CombatActionEffectOptionSource =
  | {
      readonly characterId: string
      readonly kind: "character"
      readonly minimumSourceConstellation?: number
    }
  | { readonly holder?: "party_member" | "primary"; readonly kind: "weapon"; readonly weaponId: string }
  | {
      readonly holder?: "party_member" | "primary"
      readonly kind: "artifact_set"
      readonly minimumPieces: number
      readonly setId: string
    }

/** A JSON-safe active snapshot choice that a UI can validate against the configured team. */
export interface CombatActionEffectOption {
  readonly exclusiveGroup?: string
  readonly exclusiveVariant?: string
  readonly id: string
  readonly label: string
  readonly recipientSourceRelation?: "not_source" | "source"
  /** IDs whose active selection derives this option instead of exposing an independent snapshot toggle. */
  readonly requiredActiveEffectIds?: string[]
  readonly selectionMode?: "optional" | "required"
  readonly source: CombatActionEffectOptionSource
}

/** One audited passive clause for equipment exposed in the current catalog. */
export type CombatEquipmentEffectCoverage = PublishedEquipmentCoverageClause

/** Lists every explicitly audited equipment passive clause for the currently selectable catalog. */
export function listCombatEquipmentEffectCoverage(): readonly CombatEquipmentEffectCoverage[] {
  return listPublishedEquipmentCoverageClauses()
}

/** Lists every maintained automatic or explicit current-action effect declaration. */
export function listCombatActionEffects(): readonly CombatActionEffect[] {
  return [...equipmentCombatActionEffects, ...characterCombatCoverageRegistry.flatMap((coverage) => coverage.actionEffects ?? [])]
}

/**
 * Checks whether an action matches the content-owned target restrictions for one action effect.
 *
 * Callers evaluating an elemental override may supply the final elements of every damage event. An action-scoped
 * effect may contribute only when its element filter covers every resulting event, preventing a partial override
 * from incorrectly buffing unrelated hits in the same selected action.
 */
export function isCombatActionEffectApplicable(
  effect: CombatActionEffect,
  action: CombatActionMetadata,
  effectiveElements: readonly CombatActionMetadata["element"][] = [action.element],
  recipientWeaponType?: CatalogWeaponType,
  candidateAmplifyingReactionKinds: readonly NonNullable<CombatActionMetadata["amplifyingReaction"]>["kind"][] = [],
  candidateReactionKinds: readonly CombatActionReactionKind[] = [],
  candidateSpecialReactionKinds?: readonly NonNullable<CombatActionMetadata["specialReaction"]>["kind"][]
): boolean {
  const filter = effect.targetFilter
  if (!filter) return true
  if (filter.actionIds && !filter.actionIds.includes(action.id)) return false
  if (filter.recipientCharacterIds && !filter.recipientCharacterIds.includes(action.characterId)) return false
  if (filter.recipientHexereiRequired && !isHexereiCharacter(action.characterId)) return false
  if (filter.excludedActionIds?.includes(action.id)) return false
  if (filter.recipientWeaponTypes && (!recipientWeaponType || !filter.recipientWeaponTypes.includes(recipientWeaponType))) {
    return false
  }
  const attackKind = action.attackKind ?? (action.talentSlot === "normal" ? "normal" : undefined)
  if (filter.attackKinds && (!attackKind || !filter.attackKinds.includes(attackKind))) return false
  if (
    filter.amplifyingReactionKinds &&
    ![...(action.amplifyingReaction ? [action.amplifyingReaction.kind] : []), ...candidateAmplifyingReactionKinds].some((kind) =>
      filter.amplifyingReactionKinds!.includes(kind)
    )
  ) {
    return false
  }
  if (
    filter.reactionKinds &&
    ![
      ...(action.additiveReaction ? [action.additiveReaction.kind] : []),
      ...(action.transformativeReaction ? [action.transformativeReaction.kind] : []),
      ...candidateReactionKinds
    ].some((kind) => filter.reactionKinds!.includes(kind))
  ) {
    return false
  }
  const specialReactionKinds = candidateSpecialReactionKinds ?? listDeclaredSpecialReactionKinds(action)
  if (filter.specialReactionKinds && !specialReactionKinds.some((kind) => filter.specialReactionKinds!.includes(kind))) {
    return false
  }
  const actionElements = effectiveElements.length > 0 ? effectiveElements : [action.element]
  const filterElements = filter.elements
  if (filterElements && !actionElements.every((element) => filterElements.includes(element))) return false
  return !filter.talentSlots || filter.talentSlots.includes(action.talentSlot)
}

/** Lists all direct Moon or Stellar formula kinds declared by an action or one of its timed hit events. */
function listDeclaredSpecialReactionKinds(
  action: CombatActionMetadata
): readonly NonNullable<CombatActionMetadata["specialReaction"]>["kind"][] {
  return [
    ...new Set([
      ...(action.specialReaction ? [action.specialReaction.kind] : []),
      ...(action.timeline?.damageEvents.flatMap((event) => (event.specialReaction ? [event.specialReaction.kind] : [])) ?? [])
    ])
  ]
}

/** Lists active snapshot choices that can affect the selected action before source-build validation. */
export function listActiveCombatActionEffectsForAction(action: CombatActionMetadata): readonly CombatActionEffect[] {
  return listCombatActionEffects().filter(
    (effect) => effect.activation === "active" && isCombatActionEffectApplicable(effect, action)
  )
}

/** Returns whether content declares an active effect as established by the selected action. */
export function isCombatActionEffectDeterministicallyActive(
  effect: CombatActionEffect,
  action: CombatActionMetadata
): boolean {
  const activation = effect.deterministicSnapshotActivation
  if (effect.activation !== "active" || activation === undefined) return false
  const actionCapabilities = action.deterministicSnapshotCapabilities ?? []
  return activation.requiredActionSnapshotCapabilities.every((capability) => actionCapabilities.includes(capability))
}

/** Projects maintained source-owned snapshots into UI choices for the selected action. */
export function listActiveCombatActionEffectOptionsForAction(
  action: CombatActionMetadata
): readonly CombatActionEffectOption[] {
  return listActiveCombatActionEffectsForAction(action)
    .filter((effect) => effect.deterministicSnapshotActivation === undefined)
    .map((effect) => ({
      ...(effect.exclusivity === undefined ? {} : { exclusiveGroup: effect.exclusivity.group }),
      ...(effect.exclusivity === undefined ? {} : { exclusiveVariant: effect.exclusivity.variant }),
      id: effect.id,
      label: effect.label,
      ...(effect.requiredActiveEffectIds === undefined
        ? {}
        : { requiredActiveEffectIds: [...effect.requiredActiveEffectIds] }),
      ...(effect.targetFilter?.recipientSourceRelation === undefined
        ? {}
        : { recipientSourceRelation: effect.targetFilter.recipientSourceRelation }),
      ...(effect.selectionMode === undefined ? {} : { selectionMode: effect.selectionMode }),
      source: projectCombatActionEffectOptionSource(effect.source)
    }))
}

/** Projects character-owned selectable scenario states that can affect the selected action. */
export function listCharacterScenarioEffectOptionsForAction(
  action: CombatActionMetadata
): readonly CombatActionEffectOption[] {
  return characterCombatCoverageRegistry.flatMap((coverage) =>
    (coverage.scenarioEffectOptions ?? [])
      .filter((option) => option.actionIds === undefined || option.actionIds.includes(action.id))
      .map((option) => projectCharacterScenarioEffectOption(coverage.characterId, option))
  )
}

/** Lists source-owned elemental override snapshots that can target one declared normal-attack action. */
export function listActiveCombatElementOverrideEffectOptionsForAction(
  action: CombatActionMetadata,
  targetWeaponType: CatalogWeaponType
): readonly CombatActionEffectOption[] {
  if (!action.timeline?.damageEvents.some((event) => event.elementOverrideTarget === "normal_attack")) return []
  return listCombatElementOverrideEffects()
    .filter((effect) => effect.eligibleWeaponTypes.some((weaponType) => weaponType === targetWeaponType))
    .map(projectCombatElementOverrideEffectOption)
}

/** Lists every active snapshot that the scenario can select for the target action and weapon family. */
export function listActiveScenarioEffectOptionsForAction(
  action: CombatActionMetadata,
  targetWeaponType: CatalogWeaponType
): readonly CombatActionEffectOption[] {
  const options = [
    ...listActiveCombatActionEffectOptionsForAction(action),
    ...listActiveCombatElementOverrideEffectOptionsForAction(action, targetWeaponType)
  ]
  return options.filter((option, index) => options.findIndex((candidate) => candidate.id === option.id) === index)
}

function projectCombatActionEffectOptionSource(
  source: CombatActionEffect["source"]
): CombatActionEffectOptionSource {
  switch (source.kind) {
    case "artifact_set":
      return {
        ...(source.holder === undefined ? {} : { holder: source.holder }),
        kind: source.kind,
        minimumPieces: source.minimumPieces,
        setId: source.setId
      }
    case "character":
      return {
        characterId: source.characterId,
        kind: source.kind,
        ...(source.minimumSourceConstellation === undefined
          ? {}
          : { minimumSourceConstellation: source.minimumSourceConstellation })
      }
    case "weapon":
      return {
        ...(source.holder === undefined ? {} : { holder: source.holder }),
        kind: source.kind,
        weaponId: source.weaponId
      }
  }
}

function projectCharacterScenarioEffectOption(
  characterId: string,
  option: CombatCharacterScenarioEffectOption
): CombatActionEffectOption {
  return {
    id: option.id,
    label: option.label,
    source: {
      characterId,
      kind: "character",
      ...(option.minimumSourceConstellation === undefined
        ? {}
        : { minimumSourceConstellation: option.minimumSourceConstellation })
    }
  }
}

function projectCombatElementOverrideEffectOption(effect: CombatElementOverrideEffect): CombatActionEffectOption {
  return {
    id: effect.id,
    label: effect.label,
    ...(effect.requiredActiveEffectIds === undefined
      ? {}
      : { requiredActiveEffectIds: [...effect.requiredActiveEffectIds] }),
    source: {
      characterId: effect.sourceCharacterId,
      kind: "character",
      ...(effect.minimumSourceConstellation === undefined
        ? {}
        : { minimumSourceConstellation: effect.minimumSourceConstellation })
    }
  }
}
