import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { GameDataRepository } from "./repository.js"
import { createGameDataSnapshot } from "./snapshot.js"
import type { GameDataSourceManifest, GiStatsDocument } from "./types.js"

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

const manifest: GameDataSourceManifest = {
  dataSha256: "fixture-sha256",
  dataUrl: "https://example.test/allStat_gen.json",
  gameVersion: "6.7",
  schemaVersion: 2,
  upstreamCommit: "fixture-commit",
  upstreamCommittedAt: "2026-07-09T13:05:30Z",
  upstreamLicense: "MIT",
  upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
}

const fixture: GiStatsDocument = {
  art: {
    data: {
      WanderersTroupe: {
        rarities: [4, 5],
        setNum: [2, 4],
        slots: ["flower", "plume", "sands", "goblet", "circlet"]
      },
      EmblemOfSeveredFate: {
        rarities: [4, 5],
        setNum: [2, 4],
        slots: ["flower", "plume", "sands", "goblet", "circlet"]
      }
    },
    main: { "5": { atk_: [0.07, 0.087] } },
    sub: { "5": { critRate_: [0.027, 0.031, 0.035, 0.039] } },
    subRoll: { fixture: true },
    subRollCorrection: { fixture: true }
  },
  char: {
    data: {
      RaidenShogun: {
        ascensionBonus: { atk: [0, 22.5], eleMas: [0, 100] },
        baseStats: { eleMas: 100 },
        birthday: { day: 26, month: 6 },
        ele: "electro",
        key: "RaidenShogun",
        lvlCurves: [{ base: 26.2542, curve: "GROW_CURVE_ATTACK_S5", key: "atk" }],
        rarity: 5,
        region: "inazuma",
        weaponType: "polearm"
      },
      Somnia: {
        ele: "electro",
        rarity: 5,
        weaponType: "catalyst"
      }
    },
    expCurve: { GROW_CURVE_ATTACK_S5: [-1, 1, 1.083] },
    skillParam: {
      RaidenShogun: {
        burst: [[4.008, 4.3086, 4.6092, 5.01, 5.3106, 5.6112, 6.012, 6.4128, 6.8136, 7.2144]],
        constellation1: [0.8, 0.2],
        passive2: [[0.006], [0.004]],
        upgradeableSkills: ["auto", "skill", "burst"]
      },
      Somnia: {
        skill: [[1.234, 2.345]]
      }
    }
  },
  weapon: {
    data: {
      SkywardSpine: {
        rarity: 5,
        weaponType: "polearm"
      },
      AquaSimulacra: {
        rarity: 5,
        refinementBonus: { hp_: [-1, 0.16, 0.2, 0.24, 0.28, 0.32] },
        weaponType: "bow"
      },
      EngulfingLightning: {
        ascensionBonus: { atk: [0, 31.1] },
        lvlCurves: [{ base: 45.9364, curve: "GROW_CURVE_ATTACK_301", key: "atk" }],
        rarity: 5,
        refinementBonus: { enerRech_: [0.3, 0.35, 0.4, 0.45, 0.5] },
        weaponType: "polearm"
      }
    },
    expCurve: { GROW_CURVE_ATTACK_301: [-1, 1, 1.083] }
  }
}

describe("versioned game-data snapshot", () => {
  it("imports and queries characters, skills, weapons, and artifact sets", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-game-data-"))
    temporaryDirectories.push(directory)
    const databasePath = join(directory, "game-data.sqlite")

    createGameDataSnapshot({ databasePath, document: fixture, manifest })

    using repository = new GameDataRepository(databasePath)

    expect(repository.getManifest()).toEqual(manifest)
    expect(repository.getCharacter("RaidenShogun")).toMatchObject({
      element: "electro",
      rarity: 5,
      weaponType: "polearm"
    })
    expect(repository.getCharacterSkillParameter("RaidenShogun", "burst", 0, 10)).toBe(7.2144)
    expect(repository.getCharacterSkillParameterGroup("RaidenShogun", "upgradeableSkills")).toEqual([
      "auto",
      "skill",
      "burst"
    ])
    expect(repository.getCharacterBaseStats("RaidenShogun")).toEqual({ eleMas: 100 })
    expect(repository.getCharacterSkillParameterGroupSummary("RaidenShogun", "burst")).toEqual({
      maximumTalentLevel: 10,
      minimumTalentLevel: 1,
      parameterCount: 1
    })
    expect(repository.listCharacterSkillParameterOwnerIds()).toEqual(["RaidenShogun"])
    expect(repository.getCharacterSkillParameterValue("RaidenShogun", "burst", [0, 9])).toBe(7.2144)
    expect(repository.getCharacterSkillParameterValue("RaidenShogun", "constellation1", [1])).toBe(0.2)
    expect(repository.getCharacterSkillParameterValue("RaidenShogun", "passive2", [1, 0])).toBe(0.004)
    expect(repository.listCharacterSkillParameterGroupIds("RaidenShogun")).toEqual([
      "burst",
      "constellation1",
      "passive2",
      "upgradeableSkills"
    ])
    expect(repository.listCharacters()).toHaveLength(1)
    expect(repository.getCharacterStat("RaidenShogun", "atk", 2, 1)).toBeCloseTo(50.9332986)
    expect(repository.getCharacterStat("RaidenShogun", "eleMas", 90, 1)).toBe(200)
    expect(repository.getWeapon("EngulfingLightning")).toEqual({
      id: "EngulfingLightning",
      rarity: 5,
      weaponType: "polearm"
    })
    expect(repository.getWeaponStat("EngulfingLightning", "atk", 2, 1)).toBeCloseTo(80.8491212)
    expect(repository.getWeaponRefinementParameter("EngulfingLightning", "enerRech_", 5)).toBe(0.5)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 1)).toBe(0.16)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 2)).toBe(0.2)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 3)).toBe(0.24)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 4)).toBe(0.28)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 5)).toBe(0.32)
    expect(repository.getWeaponRefinementParameter("AquaSimulacra", "hp_", 6)).toBeUndefined()
    expect(repository.getArtifactSet("EmblemOfSeveredFate")).toMatchObject({
      rarities: [4, 5],
      setBonuses: [2, 4]
    })
    expect(repository.getArtifactMainStat(5, "atk_", 1)).toBe(0.087)
    expect(repository.getArtifactSubstatRolls(5, "critRate_")).toEqual([0.027, 0.031, 0.035, 0.039])
    expect(repository.getCounts()).toEqual({
      artifactSets: 2,
      characterSkillParameterGroups: 4,
      characterSkillParameters: 12,
      characters: 1,
      weapons: 3
    })
  })

  it("lists weapons and artifact sets in stable ID order", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-game-data-"))
    temporaryDirectories.push(directory)
    const databasePath = join(directory, "game-data.sqlite")

    createGameDataSnapshot({ databasePath, document: fixture, manifest })

    using repository = new GameDataRepository(databasePath)

    expect(repository.listWeapons()).toEqual([
      { id: "AquaSimulacra", rarity: 5, weaponType: "bow" },
      { id: "EngulfingLightning", rarity: 5, weaponType: "polearm" },
      { id: "SkywardSpine", rarity: 5, weaponType: "polearm" }
    ])
    expect(repository.listArtifactSets()).toEqual([
      {
        id: "EmblemOfSeveredFate",
        rarities: [4, 5],
        setBonuses: [2, 4],
        slots: ["flower", "plume", "sands", "goblet", "circlet"]
      },
      {
        id: "WanderersTroupe",
        rarities: [4, 5],
        setBonuses: [2, 4],
        slots: ["flower", "plume", "sands", "goblet", "circlet"]
      }
    ])
  })

  it("returns undefined for unknown records", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-game-data-"))
    temporaryDirectories.push(directory)
    const databasePath = join(directory, "game-data.sqlite")

    createGameDataSnapshot({ databasePath, document: fixture, manifest })

    using repository = new GameDataRepository(databasePath)

    expect(repository.getCharacter("Unknown")).toBeUndefined()
    expect(repository.getCharacterSkillParameter("Unknown", "burst", 0, 10)).toBeUndefined()
    expect(repository.getCharacterSkillParameterGroup("Unknown", "burst")).toBeUndefined()
    expect(repository.getCharacterSkillParameterValue("Unknown", "burst", [0, 0])).toBeUndefined()
    expect(repository.listCharacterSkillParameterGroupIds("Unknown")).toEqual([])
    expect(repository.getWeapon("Unknown")).toBeUndefined()
    expect(repository.getArtifactSet("Unknown")).toBeUndefined()
  })

  it("excludes the upstream non-playable Somnia record and its talent parameters", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-game-data-"))
    temporaryDirectories.push(directory)
    const databasePath = join(directory, "game-data.sqlite")

    createGameDataSnapshot({ databasePath, document: fixture, manifest })

    using repository = new GameDataRepository(databasePath)

    expect(repository.getCharacter("Somnia")).toBeUndefined()
    expect(repository.getCharacterSkillParameter("Somnia", "skill", 0, 1)).toBeUndefined()
    expect(repository.getCharacterSkillParameterGroup("Somnia", "skill")).toBeUndefined()
    expect(repository.listCharacterSkillParameterOwnerIds()).not.toContain("Somnia")
    expect(repository.listCharacters()).not.toContainEqual(expect.objectContaining({ id: "Somnia" }))
  })
})
