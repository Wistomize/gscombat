import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { createCombatAuthoringAuditReport } from "./combat-authoring-audit.js"
import { createCombatCoverageReport } from "./coverage.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

describe("combat coverage report", () => {
  it("keeps the full game-data, action, metric, and readiness views mutually consistent", () => {
    const report = createCombatCoverageReport(gameData)
    const staticCharacters = gameData.listCharacters()
    const variantBoundCharacterIds = new Set(
      createCombatAuthoringAuditReport(gameData).characters
        .filter((character) => character.readiness === "requires_explicit_variant_binding")
        .map((character) => character.staticCharacterId)
    )

    expect(report.totalCharacters).toBe(staticCharacters.length)
    expect(report.characters.map((character) => character.characterId)).toEqual(
      staticCharacters.map((character) => character.id)
    )
    expect(Object.values(report.characterStatusCounts).reduce((total, count) => total + count, 0)).toBe(
      report.totalCharacters
    )
    expect([...variantBoundCharacterIds]).toEqual(["Traveler"])
    expect(report.characters.filter((character) => character.status === "unsupported")).toEqual([])
    expect(report.characters.filter((character) => character.verifiedMetricCount === 0)).toEqual([])

    const listedVerifiedActionCount = report.characters.reduce(
      (total, character) => total + character.actions.filter((action) => action.status === "verified").length,
      0
    )
    const listedVerifiedMetricCount = report.characters.reduce(
      (total, character) => total + character.metrics.filter((metric) => metric.status === "verified").length,
      0
    )
    expect(report.verifiedActionCount).toBe(listedVerifiedActionCount)
    expect(report.verifiedMetricCount).toBe(listedVerifiedMetricCount)

    for (const character of report.characters) {
      const parameterGroups = gameData.listCharacterSkillParameterGroupIds(character.characterId)
      const actionIds = new Set(character.actions.map((action) => action.id))

      expect(character.staticDataAvailable).toBe(true)
      expect(character.detail.trim()).not.toHaveLength(0)
      expect(character.status).toBe(character.maintainedStatus)
      expect(character.hasCoreTalentParameters).toBe(
        ["auto", "skill", "burst"].every((groupId) => parameterGroups.includes(groupId))
      )
      expect(actionIds.size).toBe(character.actions.length)
      expect(character.verifiedActionCount).toBe(
        character.actions.filter((action) => action.status === "verified").length
      )
      expect(character.verifiedMetricCount).toBe(
        character.metrics.filter((metric) => metric.status === "verified").length
      )
      expect(character.canCalculateDamage).toBe(
        character.actions.some((action) => action.kind === "damage" && action.status === "verified")
      )

      for (const action of character.actions) expect(action.characterId).toBe(character.characterId)
      for (const metric of character.metrics) {
        expect(metric.characterId).toBe(character.characterId)
        expect(actionIds.has(metric.sourceActionId)).toBe(true)
      }
    }
  })
})
