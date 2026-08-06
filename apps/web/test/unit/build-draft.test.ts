import { raidenNationalBuiltinBuild } from "@gscombat/content"
import { type CatalogResponse, validateCharacterBuild } from "@gscombat/contracts"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createLocalDraftBuild } from "../../features/build-editor/build-draft.js"

const catalog: CatalogResponse = {
  artifactSets: [],
  buffPresets: [],
  characters: [
    {
      characterId: "Mona",
      label: "莫娜",
      primaryActionIds: [],
      primaryActions: [],
      supportMetrics: [],
      weaponType: "catalyst"
    },
    {
      characterId: "Traveler",
      label: "旅行者",
      primaryActionIds: [],
      primaryActions: [],
      supportMetrics: [],
      weaponType: "sword"
    }
  ],
  weapons: [
    { label: "渔获", rarity: 4, weaponId: "TheCatch", weaponType: "polearm" },
    { label: "试作金珀", rarity: 4, weaponId: "PrototypeAmber", weaponType: "catalyst" },
    { label: "西风剑", rarity: 4, weaponId: "FavoniusSword", weaponType: "sword" }
  ]
}

afterEach(() => vi.useRealTimers())

describe("local character-build drafts", () => {
  it("creates a valid independent local draft with the first compatible catalog weapon", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-28T00:00:00.000Z"))
    const mona = catalog.characters[0]
    if (!mona) throw new Error("Missing Mona catalog fixture")

    const draft = createLocalDraftBuild(raidenNationalBuiltinBuild, catalog, mona)

    expect(draft).toMatchObject({
      buildId: "local.draft.Mona.1785196800000",
      characterId: "Mona",
      label: "莫娜 · 新建配置",
      source: { kind: "local" },
      weapon: {
        ascension: raidenNationalBuiltinBuild.weapon.ascension,
        level: raidenNationalBuiltinBuild.weapon.level,
        refinement: raidenNationalBuiltinBuild.weapon.refinement,
        weaponId: "PrototypeAmber"
      }
    })
    expect(draft.variant).toBeUndefined()
    expect(draft.artifacts).not.toBe(raidenNationalBuiltinBuild.artifacts)
    expect(draft.artifacts[0]).not.toBe(raidenNationalBuiltinBuild.artifacts[0])
    expect(validateCharacterBuild(draft)).toEqual([])
  })

  it("uses the required Dendro female variant for a Traveler draft", () => {
    const traveler = catalog.characters[1]
    if (!traveler) throw new Error("Missing Traveler catalog fixture")

    const draft = createLocalDraftBuild(raidenNationalBuiltinBuild, catalog, traveler)

    expect(draft).toMatchObject({
      characterId: "Traveler",
      source: { kind: "local" },
      variant: { element: "dendro", gender: "female", kind: "traveler" },
      weapon: { weaponId: "FavoniusSword" }
    })
    expect(validateCharacterBuild(draft)).toEqual([])
  })

  it("fails clearly instead of assigning a weapon from the wrong weapon type", () => {
    const mona = catalog.characters[0]
    if (!mona) throw new Error("Missing Mona catalog fixture")
    const catalogWithoutCatalysts: CatalogResponse = {
      ...catalog,
      weapons: catalog.weapons.filter((weapon) => weapon.weaponType !== "catalyst")
    }

    expect(() => createLocalDraftBuild(raidenNationalBuiltinBuild, catalogWithoutCatalysts, mona)).toThrow(
      "目录中没有已维护的法器"
    )
  })
})
