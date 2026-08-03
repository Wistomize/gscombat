import type { TravelerVariant } from "@gscombat/contracts"

import {
  showcaseArtifactSetIdByItemIdGenerated,
  showcaseCharacterMetadataGenerated,
  showcaseMetadataSource,
  showcaseWeaponMetadataGenerated
} from "./showcase-metadata.generated.js"

export type ShowcaseWeaponType = "bow" | "catalyst" | "claymore" | "polearm" | "sword"

export interface ShowcaseCharacterMetadata {
  readonly avatarId: number
  readonly characterId: string
  readonly label: string
  readonly lookupId: string
  readonly skillDepotId?: number
  readonly skillIds: readonly [number, number, number]
  readonly variant?: TravelerVariant
  readonly weaponType: ShowcaseWeaponType
}

export interface ShowcaseWeaponMetadata {
  readonly itemId: number
  readonly label: string
  readonly weaponId: string
  readonly weaponType: ShowcaseWeaponType
}

export interface ShowcaseArtifactMetadata {
  readonly itemId: number
  readonly setId: string
}

const characterMetadataByLookupId = new Map<string, ShowcaseCharacterMetadata>(
  showcaseCharacterMetadataGenerated.map((entry) => [entry.lookupId, entry])
)
const weaponMetadataByItemId = new Map<number, ShowcaseWeaponMetadata>(
  showcaseWeaponMetadataGenerated.map((entry) => [entry.itemId, entry])
)
export const showcaseArtifactMetadata: readonly ShowcaseArtifactMetadata[] = Object.entries(
  showcaseArtifactSetIdByItemIdGenerated
).map(([itemId, setId]) => ({ itemId: Number(itemId), setId }))
const artifactMetadataByItemId = new Map<number, ShowcaseArtifactMetadata>(
  showcaseArtifactMetadata.map((entry) => [entry.itemId, entry])
)

/** Resolves one Enka avatar and its optional Traveler skill-depot variant into the local character catalog. */
export function getShowcaseCharacterMetadata(
  avatarId: number,
  skillDepotId: number | undefined
): ShowcaseCharacterMetadata | undefined {
  const variantLookupId = skillDepotId === undefined ? undefined : `${avatarId}-${skillDepotId}`
  return (variantLookupId ? characterMetadataByLookupId.get(variantLookupId) : undefined) ?? characterMetadataByLookupId.get(String(avatarId))
}

/** Resolves one Enka weapon item ID into the local full weapon inventory. */
export function getShowcaseWeaponMetadata(itemId: number): ShowcaseWeaponMetadata | undefined {
  return weaponMetadataByItemId.get(itemId)
}

/** Resolves one Enka artifact item ID into the local full artifact-set inventory. */
export function getShowcaseArtifactMetadata(itemId: number): ShowcaseArtifactMetadata | undefined {
  return artifactMetadataByItemId.get(itemId)
}

export const showcaseCharacterMetadata: readonly ShowcaseCharacterMetadata[] = showcaseCharacterMetadataGenerated
export const showcaseWeaponMetadata: readonly ShowcaseWeaponMetadata[] = showcaseWeaponMetadataGenerated
export const pinnedShowcaseMetadataSource = showcaseMetadataSource
