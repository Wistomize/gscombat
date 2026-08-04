import { describe, expect, it } from "vitest"

import { buildApp } from "./app.js"
import { EnkaShowcaseClient, normalizeEnkaShowcase } from "./showcase.js"
import { showcaseCharacterMetadata, showcaseWeaponMetadata } from "./showcase-metadata.js"

const artifactSlots = [
  ["EQUIP_BRACER", "FIGHT_PROP_HP", 4780, 94513],
  ["EQUIP_NECKLACE", "FIGHT_PROP_ATTACK", 311, 94523],
  ["EQUIP_SHOES", "FIGHT_PROP_CHARGE_EFFICIENCY", 51.8, 94533],
  ["EQUIP_RING", "FIGHT_PROP_ELEC_ADD_HURT", 46.6, 94543],
  ["EQUIP_DRESS", "FIGHT_PROP_CRITICAL", 31.1, 94553]
] as const

function createArtifactEquips() {
  return artifactSlots.map(([equipType, mainPropId, propValue, itemId]) => ({
    flat: {
      equipType,
      itemType: "ITEM_RELIQUARY",
      rankLevel: 5,
      reliquaryMainstat: { mainPropId, propValue },
      reliquarySubstats: [
        { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 14 },
        { appendPropId: "FIGHT_PROP_ATTACK_PERCENT", propValue: 9.9 }
      ]
    },
    itemId,
    reliquary: { level: 21 }
  }))
}

describe("Enka showcase normalization", () => {
  it("normalizes a complete supported Raiden build and percentage units", () => {
    const payload = {
      avatarInfoList: [
        {
          avatarId: 10000052,
          equipList: [
            {
              flat: { itemType: "ITEM_WEAPON" },
              itemId: 13509,
              weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
            },
            ...createArtifactEquips()
          ],
          propMap: { 1002: { val: "6" }, 4001: { val: "90" } },
          skillLevelMap: { 10521: 6, 10522: 9, 10525: 10 },
          talentIdList: [1, 2]
        }
      ],
      playerInfo: { nickname: "旅行者" },
      ttl: 60
    }

    const result = normalizeEnkaShowcase(payload, "123456789", "6.7", "2026-07-20T00:00:00.000Z")

    expect(result).toMatchObject({ nickname: "旅行者", ttl: 60, uid: "123456789" })
    expect(result.builds).toHaveLength(1)
    expect(result.builds[0]).toMatchObject({
      characterId: "RaidenShogun",
      constellation: 2,
      talents: { burst: 10, normal: 6, skill: 9 },
      weapon: { refinement: 1, weaponId: "EngulfingLightning" }
    })
    expect(result.builds[0]?.artifacts[2]?.mainStat.value).toBeCloseTo(0.518)
    expect(result.builds[0]?.artifacts[0]?.substats[0]?.value).toBeCloseTo(0.14)
  })

  it("normalizes every maintained non-Traveler character without a showcase whitelist", () => {
    const characters = showcaseCharacterMetadata.filter((entry) => entry.characterId !== "Traveler")
    const avatarInfoList = characters.map((character) => {
      const weapon = showcaseWeaponMetadata.find((entry) => entry.weaponType === character.weaponType)
      if (!weapon) throw new Error(`Missing test weapon for ${character.weaponType}`)
      return {
        avatarId: character.avatarId,
        equipList: [
          {
            flat: { itemType: "ITEM_WEAPON" },
            itemId: weapon.itemId,
            weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
          },
          ...createArtifactEquips()
        ],
        propMap: { 1002: { val: "6" }, 4001: { val: "90" } },
        skillLevelMap: Object.fromEntries(character.skillIds.map((skillId, index) => [skillId, 8 + index])),
        talentIdList: []
      }
    })

    const result = normalizeEnkaShowcase({ avatarInfoList, ttl: 60 }, "123456789", "6.7")

    expect(result.builds).toHaveLength(116)
    expect(new Set(result.builds.map((build) => build.characterId))).toEqual(
      new Set(characters.map((character) => character.characterId))
    )
  })

  it("resolves Traveler gender, element, and talent IDs from skillDepotId", () => {
    const traveler = showcaseCharacterMetadata.find((entry) => entry.lookupId === "10000005-508")
    const weapon = showcaseWeaponMetadata.find((entry) => entry.weaponType === "sword")
    const skillDepotId = traveler?.skillDepotId
    if (!traveler || !weapon || skillDepotId === undefined) {
      throw new Error("Missing generated Traveler showcase fixture")
    }
    const result = normalizeEnkaShowcase(
      {
        avatarInfoList: [
          {
            avatarId: traveler.avatarId,
            equipList: [
              {
                flat: { itemType: "ITEM_WEAPON" },
                itemId: weapon.itemId,
                weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
              },
              ...createArtifactEquips()
            ],
            propMap: { 1002: { val: "6" }, 4001: { val: "90" } },
            skillDepotId,
            skillLevelMap: Object.fromEntries(traveler.skillIds.map((skillId, index) => [skillId, 8 + index])),
            talentIdList: []
          }
        ]
      },
      "123456789",
      "6.7"
    )

    expect(result.builds[0]).toMatchObject({
      characterId: "Traveler",
      talents: { burst: 10, normal: 8, skill: 9 },
      variant: { element: "pyro", gender: "male", kind: "traveler" }
    })
  })

  it("imports builds with partial equipped artifact collections", () => {
    const gorou = showcaseCharacterMetadata.find((entry) => entry.avatarId === 10000055)
    const weapon = showcaseWeaponMetadata.find((entry) => entry.weaponType === gorou?.weaponType)
    if (!gorou || !weapon) throw new Error("Missing generated Gorou showcase fixture")

    const result = normalizeEnkaShowcase(
      {
        avatarInfoList: [
          {
            avatarId: 10000052,
            equipList: [
              {
                flat: { itemType: "ITEM_WEAPON" },
                itemId: 13509,
                weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
              },
              ...createArtifactEquips()
            ],
            propMap: { 1002: { val: "6" }, 4001: { val: "90" } },
            skillLevelMap: { 10521: 6, 10522: 9, 10525: 10 },
            talentIdList: []
          },
          {
            avatarId: gorou.avatarId,
            equipList: [
              {
                flat: { itemType: "ITEM_WEAPON" },
                itemId: weapon.itemId,
                weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
              },
              ...createArtifactEquips().slice(0, 4)
            ]
          }
        ]
      },
      "249548209",
      "6.7"
    )

    expect(result.builds).toHaveLength(2)
    expect(result.builds[0]?.characterId).toBe("RaidenShogun")
    expect(result.builds[1]).toMatchObject({ characterId: "Gorou" })
    expect(result.builds[1]?.artifacts).toHaveLength(4)
    expect(result.skipped).toEqual([])
  })

  it("imports builds with no equipped artifacts", () => {
    const gorou = showcaseCharacterMetadata.find((entry) => entry.avatarId === 10000055)
    const weapon = showcaseWeaponMetadata.find((entry) => entry.weaponType === gorou?.weaponType)
    if (!gorou || !weapon) throw new Error("Missing generated Gorou showcase fixture")

    const result = normalizeEnkaShowcase(
      {
        avatarInfoList: [
          {
            avatarId: gorou.avatarId,
            equipList: [
              {
                flat: { itemType: "ITEM_WEAPON" },
                itemId: weapon.itemId,
                weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
              }
            ]
          }
        ]
      },
      "249548209",
      "6.7"
    )

    expect(result.builds).toHaveLength(1)
    expect(result.builds[0]).toMatchObject({ characterId: "Gorou" })
    expect(result.builds[0]?.artifacts).toEqual([])
    expect(result.skipped).toEqual([])
  })

  it("summarizes unsupported avatars without leaking their upstream identifiers", () => {
    const result = normalizeEnkaShowcase({ avatarInfoList: [{ avatarId: 19999999 }] }, "123456789", "6.7")

    expect(result).toMatchObject({ builds: [], skipped: [{ count: 1, reason: "unsupported_character" }] })
  })

  it("returns 200 from the import endpoint when Enka includes a partial artifact collection", async () => {
    const gorou = showcaseCharacterMetadata.find((entry) => entry.avatarId === 10000055)
    const bow = showcaseWeaponMetadata.find((entry) => entry.weaponType === gorou?.weaponType)
    if (!gorou || !bow) throw new Error("Missing generated Gorou showcase fixture")
    const payload = {
      avatarInfoList: [
        {
          avatarId: 10000052,
          equipList: [
            {
              flat: { itemType: "ITEM_WEAPON" },
              itemId: 13509,
              weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
            },
            ...createArtifactEquips()
          ],
          propMap: { 1002: { val: "6" }, 4001: { val: "90" } },
          skillLevelMap: { 10521: 6, 10522: 9, 10525: 10 },
          talentIdList: []
        },
        {
          avatarId: gorou.avatarId,
          equipList: [
            {
              flat: { itemType: "ITEM_WEAPON" },
              itemId: bow.itemId,
              weapon: { affixMap: { 1: 0 }, level: 90, promoteLevel: 6 }
            },
            ...createArtifactEquips().slice(0, 4)
          ]
        }
      ],
      ttl: 60
    }
    const app = buildApp({
      showcaseImporter: new EnkaShowcaseClient({
        baseUrl: "https://enka.example/api/uid",
        fetch: async () => new Response(JSON.stringify(payload), { status: 200 })
      })
    })

    try {
      const response = await app.inject({
        method: "POST",
        payload: { uid: "249548209" },
        url: "/v1/showcase/import"
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        builds: [{ characterId: "RaidenShogun" }, { artifacts: [{}, {}, {}, {}], characterId: "Gorou" }],
        skipped: [],
        ttl: 60,
        uid: "249548209"
      })
    } finally {
      await app.close()
    }
  })
})
