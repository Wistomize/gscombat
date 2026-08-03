import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import { CharacterBuildSchema, type CharacterBuild, validateCharacterBuild } from "./builds.js"

function createArtifact(slot: CharacterBuild["artifacts"][number]["slot"]): CharacterBuild["artifacts"][number] {
  const mainStats = {
    circlet: "crit_rate",
    flower: "hp",
    goblet: "electro_damage_bonus",
    plume: "atk",
    sands: "energy_recharge"
  } as const
  return {
    id: `artifact-${slot}`,
    level: 20,
    mainStat: { stat: mainStats[slot], value: 0.466 },
    rarity: 5,
    setId: "EmblemOfSeveredFate",
    slot,
    substats: [
      { stat: "crit_damage", value: 0.14 },
      { stat: "atk_percent", value: 0.1 }
    ]
  }
}

const build: CharacterBuild = {
  artifacts: ["flower", "plume", "sands", "goblet", "circlet"].map((slot) =>
    createArtifact(slot as CharacterBuild["artifacts"][number]["slot"])
  ),
  ascension: 6,
  buildId: "raiden-default",
  characterId: "RaidenShogun",
  constellation: 2,
  gameDataVersion: "6.7",
  label: "雷神 · 绝缘充能",
  level: 90,
  source: { kind: "builtin", presetId: "raiden-national.default" },
  talents: { burst: 10, normal: 6, skill: 9 },
  weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
}

describe("CharacterBuild", () => {
  it("accepts a complete five-piece build", () => {
    expect(Value.Check(CharacterBuildSchema, build)).toBe(true)
    expect(validateCharacterBuild(build)).toEqual([])
  })

  it("requires an explicit element and gender variant for Traveler builds", () => {
    const travelerVariant = { element: "pyro", gender: "male", kind: "traveler" } as const
    const travelerBuild: CharacterBuild = {
      ...build,
      buildId: "traveler-pyro-male",
      characterId: "Traveler",
      variant: travelerVariant
    }
    const { variant: _variant, ...travelerBuildWithoutVariant } = travelerBuild
    const nonTravelerBuildWithVariant: CharacterBuild = { ...build, variant: travelerVariant }

    expect(Value.Check(CharacterBuildSchema, travelerBuild)).toBe(true)
    expect(validateCharacterBuild(travelerBuild)).toEqual([])
    expect(validateCharacterBuild(travelerBuildWithoutVariant)).toEqual([
      "Traveler builds must declare an element and gender variant"
    ])
    expect(validateCharacterBuild(nonTravelerBuildWithVariant)).toEqual([
      "Only Traveler builds may declare a character variant"
    ])
  })

  it("rejects malformed Traveler variants from direct runtime callers", () => {
    const malformedTravelerBuild = {
      ...build,
      buildId: "traveler-malformed-variant",
      characterId: "Traveler",
      variant: { element: "physical", gender: "unknown", kind: "not-traveler" }
    } as unknown as CharacterBuild

    expect(validateCharacterBuild(malformedTravelerBuild)).toEqual([
      "Traveler variants must use kind traveler",
      "Traveler variants must declare a supported element",
      "Traveler variants must declare female or male gender"
    ])
  })

  it("rejects duplicate slots and duplicate substats", () => {
    const invalid: CharacterBuild = {
      ...build,
      artifacts: build.artifacts.map((artifact, index) =>
        index === 4
          ? {
              ...artifact,
              slot: "goblet",
              substats: [
                { stat: "crit_damage", value: 0.07 },
                { stat: "crit_damage", value: 0.14 }
              ]
            }
          : artifact
      )
    }

    expect(validateCharacterBuild(invalid)).toEqual([
      "Missing artifact slot: circlet",
      "Artifact slots must be unique",
      "Artifact artifact-circlet contains duplicate substats"
    ])
  })
})
