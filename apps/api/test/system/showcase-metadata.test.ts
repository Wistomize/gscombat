import { artifactSetInventory, supportedCharacters, weaponInventory } from "@gscombat/content"
import { describe, expect, it } from "vitest"

import {
  getShowcaseArtifactMetadata,
  getShowcaseCharacterMetadata,
  getShowcaseWeaponMetadata,
  pinnedShowcaseMetadataSource,
  showcaseArtifactMetadata,
  showcaseCharacterMetadata,
  showcaseWeaponMetadata
} from "../../src/services/showcase/metadata.js"

describe("generated showcase metadata", () => {
  it("covers the complete local character catalog and all Traveler variants", () => {
    const nonTravelerIds = showcaseCharacterMetadata
      .filter((entry) => entry.characterId !== "Traveler")
      .map((entry) => entry.characterId)
    const expectedNonTravelerIds = supportedCharacters
      .filter((entry) => entry.characterId !== "Traveler")
      .map((entry) => entry.characterId)
    const travelerVariants = showcaseCharacterMetadata
      .filter((entry) => entry.characterId === "Traveler")
      .map((entry) => `${entry.variant?.gender}.${entry.variant?.element}`)

    expect(new Set(nonTravelerIds)).toEqual(new Set(expectedNonTravelerIds))
    expect(nonTravelerIds).toHaveLength(expectedNonTravelerIds.length)
    expect(new Set(travelerVariants)).toEqual(
      new Set(
        ["female", "male"].flatMap((gender) =>
          ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"].map(
            (element) => `${gender}.${element}`
          )
        )
      )
    )
    expect(travelerVariants).toHaveLength(14)
    for (const entry of showcaseCharacterMetadata) {
      expect(getShowcaseCharacterMetadata(entry.avatarId, entry.skillDepotId)).toEqual(entry)
    }
  })

  it("covers every local weapon and artifact set by concrete Enka item IDs", () => {
    expect(new Set(showcaseWeaponMetadata.map((entry) => entry.weaponId))).toEqual(
      new Set(weaponInventory.map((entry) => entry.id))
    )
    expect(new Set(showcaseArtifactMetadata.map((entry) => entry.setId))).toEqual(
      new Set(artifactSetInventory.map((entry) => entry.id))
    )
    for (const entry of showcaseWeaponMetadata) expect(getShowcaseWeaponMetadata(entry.itemId)).toEqual(entry)
    for (const entry of showcaseArtifactMetadata) expect(getShowcaseArtifactMetadata(entry.itemId)).toEqual(entry)
  })

  it("pins Enka provenance and audited coverage counts", () => {
    expect(pinnedShowcaseMetadataSource).toMatchObject({
      artifactSetCount: artifactSetInventory.length,
      characterCount: supportedCharacters.length,
      repository: "https://github.com/EnkaNetwork/API-docs",
      travelerVariantCount: 14,
      weaponCount: weaponInventory.length
    })
    expect(pinnedShowcaseMetadataSource.commit).toMatch(/^[0-9a-f]{40}$/)
  })
})
