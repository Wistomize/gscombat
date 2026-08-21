import { raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  resolveBuildElement,
  resolvePrimaryDifferentElementTeammateCount,
  resolvePrimarySameElementTeammateCount,
  resolveTalentParameterOwnerId,
  resolveTeamUniqueElementCount
} from "../../../src/core/build-variant.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

describe("build variants", () => {
  it("uses the selected Traveler element while retaining snapshot elements for ordinary characters", () => {
    expect(
      resolveBuildElement(
        {
          ...raidenNationalBuiltinBuild,
          buildId: "test.traveler.pyro-female",
          characterId: "Traveler",
          variant: { element: "pyro", gender: "female", kind: "traveler" }
        },
        gameData
      )
    ).toBe("pyro")
    expect(resolveBuildElement(raidenNationalBuiltinBuild, gameData)).toBe("electro")
  })

  it("counts only known configured party elements and honors Traveler variants", () => {
    const pyroTraveler: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.traveler.pyro-female",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "female", kind: "traveler" }
    }
    const unknownCharacter: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.unknown-element",
      characterId: "Somnia"
    }

    expect(resolveTeamUniqueElementCount([raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild], gameData)).toBe(2)
    expect(
      resolveTeamUniqueElementCount([raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild, pyroTraveler], gameData)
    ).toBe(3)
    expect(resolveTeamUniqueElementCount([raidenNationalBuiltinBuild, unknownCharacter], gameData)).toBeNull()
  })

  it("counts only teammates whose element differs from the configured primary build", () => {
    const pyroTraveler: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.traveler.pyro-female",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "female", kind: "traveler" }
    }
    const electroTeammate: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.raiden.electro-teammate"
    }
    const unknownCharacter: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.unknown-element",
      characterId: "Somnia"
    }

    expect(resolvePrimaryDifferentElementTeammateCount(raidenNationalBuiltinBuild, [], gameData)).toBe(0)
    expect(
      resolvePrimaryDifferentElementTeammateCount(
        raidenNationalBuiltinBuild,
        [electroTeammate, xingqiuNationalBuiltinBuild],
        gameData
      )
    ).toBe(1)
    expect(
      resolvePrimaryDifferentElementTeammateCount(
        raidenNationalBuiltinBuild,
        [xingqiuNationalBuiltinBuild, pyroTraveler],
        gameData
      )
    ).toBe(2)
    expect(resolvePrimaryDifferentElementTeammateCount(raidenNationalBuiltinBuild, [unknownCharacter], gameData)).toBeNull()
  })

  it("counts only teammates whose element matches the configured primary build", () => {
    const electroTeammate: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.raiden.electro-teammate"
    }
    const unknownCharacter: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.unknown-element",
      characterId: "Somnia"
    }

    expect(resolvePrimarySameElementTeammateCount(raidenNationalBuiltinBuild, [], gameData)).toBe(0)
    expect(
      resolvePrimarySameElementTeammateCount(
        raidenNationalBuiltinBuild,
        [electroTeammate, xingqiuNationalBuiltinBuild],
        gameData
      )
    ).toBe(1)
    expect(
      resolvePrimarySameElementTeammateCount(
        raidenNationalBuiltinBuild,
        [xingqiuNationalBuiltinBuild],
        gameData
      )
    ).toBe(0)
    expect(resolvePrimarySameElementTeammateCount(raidenNationalBuiltinBuild, [unknownCharacter], gameData)).toBeNull()
  })

  it("rejects malformed Traveler variants before resolving an element", () => {
    const malformedTravelerBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.malformed",
      characterId: "Traveler",
      variant: { element: "physical", gender: "unknown", kind: "not-traveler" }
    } as unknown as CharacterBuild

    expect(() => resolveBuildElement(malformedTravelerBuild, gameData)).toThrow(
      "Traveler variants must use kind traveler"
    )
  })

  it("rejects a fixed Traveler action owner that conflicts with the selected variant", () => {
    const travelerPyroMaleBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.pyro-male",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "male", kind: "traveler" }
    }
    const action = {
      characterId: "Traveler",
      talentParameterOwnerId: "TravelerAnemoF"
    } as CombatActionMetadata

    expect(() => resolveTalentParameterOwnerId(action, travelerPyroMaleBuild)).toThrow(
      "does not match the selected Traveler variant"
    )
  })

  it("derives a matching gender owner for an element-restricted Traveler action", () => {
    const action = {
      characterId: "Traveler",
      id: "test.traveler.pyro.skill",
      travelerElement: "pyro"
    } as CombatActionMetadata
    const travelerPyroMaleBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.pyro-male",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "male", kind: "traveler" }
    }

    expect(resolveTalentParameterOwnerId(action, travelerPyroMaleBuild)).toBe("TravelerPyroM")
    expect(() =>
      resolveTalentParameterOwnerId(
        action,
        {
          ...travelerPyroMaleBuild,
          buildId: "test.traveler.anemo-female",
          variant: { element: "anemo", gender: "female", kind: "traveler" }
        }
      )
    ).toThrow("requires Traveler pyro, not anemo")
  })

  it("resolves the preview Cryo Traveler talent owners without changing the canonical character ID", () => {
    const action = {
      characterId: "Traveler",
      id: "test.traveler.cryo.burst",
      travelerElement: "cryo"
    } as CombatActionMetadata
    const cryoTraveler: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.cryo-female",
      characterId: "Traveler",
      variant: { element: "cryo", gender: "female", kind: "traveler" }
    }

    expect(resolveTalentParameterOwnerId(action, cryoTraveler)).toBe("TravelerCryoF")
  })

  it("rejects element-restricted Traveler actions on another character or with a fixed owner", () => {
    const travelerAction = {
      characterId: "Traveler",
      id: "test.traveler.pyro.skill",
      travelerElement: "pyro"
    } as CombatActionMetadata
    const fixedOwnerAction = {
      ...travelerAction,
      talentParameterOwnerId: "TravelerPyroF"
    }

    expect(() => resolveTalentParameterOwnerId(travelerAction, raidenNationalBuiltinBuild)).toThrow(
      "requires Traveler pyro, not RaidenShogun"
    )
    expect(() =>
      resolveTalentParameterOwnerId(
        { ...travelerAction, characterId: "RaidenShogun" },
        raidenNationalBuiltinBuild
      )
    ).toThrow("can only declare travelerElement when it belongs to Traveler")
    expect(() =>
      resolveTalentParameterOwnerId(
        fixedOwnerAction,
        {
          ...raidenNationalBuiltinBuild,
          buildId: "test.traveler.pyro-female",
          characterId: "Traveler",
          variant: { element: "pyro", gender: "female", kind: "traveler" }
        }
      )
    ).toThrow("cannot declare a fixed talent parameter owner")
  })
})
