import { describe, expect, it } from "vitest"

import {
  officialChineseCharacterNameAudit,
  officialChineseCharacterNameAuditSource,
  officialChineseTravelerNameAuditException
} from "./character-name-audit.js"
import { characterCatalogPresentation } from "./catalog-presentation.js"

function sortedIds(ids: readonly string[]): string[] {
  return [...ids].sort()
}

function duplicateIds(ids: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return sortedIds([...duplicates])
}

describe("official Chinese character presentation audit", () => {
  it("pins every selectable character name to the reviewed 7.0 chs localization evidence", () => {
    const presentationIds = characterCatalogPresentation.map((character) => character.characterId)
    const auditIds = officialChineseCharacterNameAudit.map((character) => character.characterId)
    const auditById = new Map(officialChineseCharacterNameAudit.map((character) => [character.characterId, character]))

    expect(officialChineseCharacterNameAuditSource).toMatchObject({
      gameVersion: "7.0",
      locale: "chs",
      upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    })
    expect(officialChineseCharacterNameAudit).toHaveLength(119)
    expect(duplicateIds(auditIds)).toEqual([])
    expect(sortedIds(auditIds)).toEqual(sortedIds(presentationIds))

    for (const presentation of characterCatalogPresentation) {
      const audit = auditById.get(presentation.characterId)

      expect(audit).toBeDefined()
      expect(audit?.label).toBe(presentation.label)
      expect(audit?.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(presentation.label).toMatch(/\p{Script=Han}/u)
      expect(
        `${officialChineseCharacterNameAuditSource.assetPathPrefix}${presentation.characterId}${
          officialChineseCharacterNameAuditSource.assetPathSuffix
        }`
      ).toBe(`libs/gi/dm-localization/assets/locales/chs/char_${presentation.characterId}_gen.json`)
    }
  })

  it("keeps Traveler as the intentional generic official label, with both playable-name sources pinned", () => {
    const travelerAudit = officialChineseCharacterNameAudit.find((entry) => entry.characterId === "Traveler")

    expect(travelerAudit?.label).toBe(officialChineseTravelerNameAuditException.label)
    expect(officialChineseTravelerNameAuditException).toMatchObject({
      characterId: "Traveler",
      label: "旅行者"
    })
    expect(officialChineseTravelerNameAuditException.variants).toEqual([
      expect.objectContaining({ characterId: "TravelerF", label: "荧" }),
      expect.objectContaining({ characterId: "TravelerM", label: "空" })
    ])
    for (const variant of officialChineseTravelerNameAuditException.variants) {
      expect(variant.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
    }
  })
})
