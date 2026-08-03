import {
  bennettNationalBuiltinBuild,
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveActiveElementOverrideWindows } from "./active-element-overrides.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Expected action ${actionId}`)
  return action
}

function createChongyunBuild(): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: "test.chongyun.source",
    characterId: "Chongyun",
    talents: { ...raidenNationalBuiltinBuild.talents, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
  }
}

describe("active elemental override effects", () => {
  it("derives a primary build's Cryo normal-attack window from an active Chongyun field", () => {
    const chongyun = createChongyunBuild()
    const windows = resolveActiveElementOverrideWindows({
      activeEffectIds: ["chongyun.skill.chonghuas_frost_field"],
      gameData,
      primary: chongyun,
      targetAction: requireAction("chongyun.normal.auto.first_hit"),
      teammates: []
    })

    expect(windows).toEqual([
      {
        element: "cryo",
        end: 1,
        id: "chongyun.skill.chonghuas_frost_field",
        ownerId: chongyun.buildId,
        start: 0,
        target: "normal_attack"
      }
    ])
  })

  it("rejects an active field whose source character is absent from the configured team", () => {
    expect(() =>
      resolveActiveElementOverrideWindows({
        activeEffectIds: ["chongyun.skill.chonghuas_frost_field"],
        gameData,
        primary: raidenNationalBuiltinBuild,
        targetAction: requireAction("raiden.burst.initial_slash"),
        teammates: []
      })
    ).toThrow("requires Chongyun to be present")
  })

  it("does not construct a melee infusion window for an ineligible bow user", () => {
    const amber: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.amber.primary",
      characterId: "Amber",
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const windows = resolveActiveElementOverrideWindows({
      activeEffectIds: ["chongyun.skill.chonghuas_frost_field"],
      gameData,
      primary: amber,
      targetAction: requireAction("amber.normal.auto.first_hit"),
      teammates: [createChongyunBuild()]
    })

    expect(windows).toEqual([])
  })

  it("requires Bennett C6 before creating its field-gated Pyro normal-attack window", () => {
    const c5Bennett = { ...bennettNationalBuiltinBuild, buildId: "test.bennett.c5", constellation: 5 }
    const c6Bennett = { ...c5Bennett, buildId: "test.bennett.c6", constellation: 6 }
    const input = {
      activeEffectIds: ["bennett.burst.field", "bennett.constellation.6.pyro_infusion"],
      gameData,
      primary: c5Bennett,
      targetAction: requireAction("bennett.normal.auto.first_hit"),
      teammates: []
    }

    expect(() => resolveActiveElementOverrideWindows(input)).toThrow(
      "Active effect bennett.constellation.6.pyro_infusion requires Bennett constellation 6"
    )

    expect(
      resolveActiveElementOverrideWindows({
        ...input,
        activeEffectIds: ["bennett.constellation.6.pyro_infusion"],
        primary: c6Bennett
      })
    ).toEqual([])

    expect(resolveActiveElementOverrideWindows({ ...input, primary: c6Bennett })).toEqual([
      {
        element: "pyro",
        end: 1,
        id: "bennett.constellation.6.pyro_infusion",
        ownerId: c6Bennett.buildId,
        start: 0,
        target: "normal_attack"
      }
    ])
  })
})
