import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  createGameDataSnapshot,
  DEFAULT_GAME_DATA_PATH,
  GameDataRepository,
  type GameDataSourceManifest,
  type GiStatsDocument
} from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { createCombatAuthoringAuditReport } from "../../src/audit/authoring.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

describe("combat authoring audit", () => {
  it("lists structurally ready characters without inferring their action semantics", () => {
    const report = createCombatAuthoringAuditReport(gameData)
    const xiangling = report.characters.find((character) => character.staticCharacterId === "Xiangling")

    expect(report).toMatchObject({
      readinessCounts: {
        ready_for_semantic_authoring: 116,
        requires_explicit_variant_binding: 1,
        missing_talent_parameters: 0
      },
      totalStaticCharacters: 117
    })
    expect(Object.values(report.readinessCounts).reduce((total, count) => total + count, 0)).toBe(
      report.totalStaticCharacters
    )
    expect(xiangling).toMatchObject({
      declaredActionIds: [
        "xiangling.burst.pyronado.reverse_vaporize",
        "xiangling.skill.guoba.single_flame_breath",
        "xiangling.normal.auto.first_hit"
      ],
      inherentBaseStats: {},
      readiness: "ready_for_semantic_authoring",
      selectedTalentParameterOwnerId: "Xiangling",
      staticCharacterId: "Xiangling"
    })
    expect(xiangling?.candidateTalentParameterOwners).toMatchObject([
      {
        coreTalentGroups: {
          burst: { maximumTalentLevel: 15, minimumTalentLevel: 1, parameterCount: 7 }
        },
        talentParameterOwnerId: "Xiangling"
      }
    ])
    expect(report.characters.find((character) => character.staticCharacterId === "Lauma")?.inherentBaseStats).toEqual({
      eleMas: 200
    })
    expect(report.characters.find((character) => character.staticCharacterId === "Nefer")?.inherentBaseStats).toEqual({
      eleMas: 100
    })
  })

  it("does not mark an empty core parameter group as ready for semantic authoring", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-authoring-audit-"))
    const databasePath = join(directory, "game-data.sqlite")
    const talentLevels = Array.from({ length: 15 }, (_, index) => index + 1)
    const manifest: GameDataSourceManifest = {
      dataSha256: "fixture-sha256",
      dataUrl: "https://example.test/allStat_gen.json",
      gameVersion: "6.7",
      schemaVersion: 2,
      upstreamCommit: "fixture-commit",
      upstreamCommittedAt: "2026-07-21T00:00:00Z",
      upstreamLicense: "MIT",
      upstreamRepository: "https://example.test/upstream"
    }
    const document: GiStatsDocument = {
      art: { data: {}, main: {}, sub: {}, subRoll: {}, subRollCorrection: {} },
      char: {
        data: { TestCharacter: { ele: "hydro", rarity: 4, weaponType: "bow" } },
        expCurve: {},
        skillParam: { TestCharacter: { auto: [], burst: [talentLevels], skill: [talentLevels] } }
      },
      weapon: { data: {}, expCurve: {} }
    }

    try {
      createGameDataSnapshot({ databasePath, document, manifest })
      using repository = new GameDataRepository(databasePath)
      const character = createCombatAuthoringAuditReport(repository).characters[0]

      expect(character).toMatchObject({
        readiness: "missing_talent_parameters",
        selectedTalentParameterOwnerId: "TestCharacter",
        staticCharacterId: "TestCharacter"
      })
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it("requires an explicit binding when an exact talent owner and a variant owner both exist", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-authoring-audit-"))
    const databasePath = join(directory, "game-data.sqlite")
    const talentLevels = Array.from({ length: 15 }, (_, index) => index + 1)
    const completeTalentGroups = { auto: [talentLevels], burst: [talentLevels], skill: [talentLevels] }
    const manifest: GameDataSourceManifest = {
      dataSha256: "fixture-sha256",
      dataUrl: "https://example.test/allStat_gen.json",
      gameVersion: "6.7",
      schemaVersion: 2,
      upstreamCommit: "fixture-commit",
      upstreamCommittedAt: "2026-07-21T00:00:00Z",
      upstreamLicense: "MIT",
      upstreamRepository: "https://example.test/upstream"
    }
    const document: GiStatsDocument = {
      art: { data: {}, main: {}, sub: {}, subRoll: {}, subRollCorrection: {} },
      char: {
        data: { Traveler: { ele: "anemo", rarity: 5, weaponType: "sword" } },
        expCurve: {},
        skillParam: {
          Traveler: completeTalentGroups,
          TravelerAnemoF: completeTalentGroups
        }
      },
      weapon: { data: {}, expCurve: {} }
    }

    try {
      createGameDataSnapshot({ databasePath, document, manifest })
      using repository = new GameDataRepository(databasePath)
      const character = createCombatAuthoringAuditReport(repository).characters[0]

      expect(character).toMatchObject({
        readiness: "requires_explicit_variant_binding",
        selectedTalentParameterOwnerId: null,
        staticCharacterId: "Traveler"
      })
      expect(character?.candidateTalentParameterOwners.map((owner) => owner.talentParameterOwnerId)).toEqual([
        "Traveler",
        "TravelerAnemoF"
      ])
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })
})
