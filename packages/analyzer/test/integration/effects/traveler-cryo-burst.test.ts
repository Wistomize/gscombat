import { afterAll, describe, expect, it } from "vitest"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

describe("Cryo Traveler burst parameter binding", () => {
  it.each(["male", "female"] as const)("uses five spear hits, not energy cost, for %s Traveler", (gender) => {
    for (const [constellation, spear, stack] of [[0, 0.661572, 0.033079], [3, 0.781022, 0.039051]] as const) {
      const scenario: EvaluationScenario = {
        ...raidenNationalBuiltinScenario,
        primary: {
          ...raidenNationalBuiltinScenario.primary,
          characterId: "Traveler",
          variant: { kind: "traveler", element: "cryo", gender },
          constellation,
          talents: { normal: 10, skill: 10, burst: 10 },
          weapon: { weaponId: "ExaiphanesBlade", level: 90, ascension: 6, refinement: 3 }
        },
        teammates: [],
        targetActionId: "traveler.cryo.burst.ice_forged_edge.full_cold_radiance.stellar_superconduct",
        conditions: { activeEffectIds: [], enemyCount: 1 }
      }
      const result = evaluateScenario(scenario, db)
      const trace = result.rotation.events[0]!.trace.find((entry) => "stage" in entry && entry.stage === "base_damage")!
      if (!("formula" in trace)) throw new Error("Missing damage formula")
      expect(trace.formula.kind).toBe("special_reaction_base_damage")
      if (trace.formula.kind !== "special_reaction_base_damage") throw new Error("Missing special reaction base")
      const terms = trace.formula.terms
      if (!terms) throw new Error("Missing scaling terms")
      expect(terms.map((term) => term.coefficient)).toEqual([
        spear * 3, spear * 2, stack * 3 * 8, stack * 2 * 8
      ])
      expect(trace.after / terms[0]!.value).toBeCloseTo((spear + stack * 8) * 5, 8)
    }
  })
})
