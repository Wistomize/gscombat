import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata,
  type CombatActionTimeline
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const redhornTermLabel = "赤角石溃杵 · 普通攻击与重击防御力同一命中加算"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function withOriginalEventMultiplier(
  damageEvents: CombatActionTimeline["damageEvents"],
  parameterId: string
): CombatActionTimeline["damageEvents"] {
  const [firstEvent, ...remainingEvents] = damageEvents
  const withMultiplier = (event: CombatActionTimeline["damageEvents"][number]) => ({
    ...event,
    coefficientMultiplier: {
      kind: "scenario_parameter_lookup" as const,
      parameterId,
      values: [
        { multiplier: 1, parameterValue: 0 },
        { multiplier: 2, parameterValue: 1 }
      ]
    }
  })
  return [withMultiplier(firstEvent), ...remainingEvents.map(withMultiplier)]
}

describe("same-hit multi-event regressions", () => {
  it("keeps Redhorn's defense term on every Noelle combo hit outside each original event multiplier", () => {
    const baseAction = requireAction("noelle.burst.sweeping_time.normal_attack_combo")
    const timeline = baseAction.timeline
    if (!timeline) throw new Error("Expected Noelle's combo to declare four damage events")
    const damageEvents = timeline.damageEvents

    const multiplierParameterId = "test.noelle.original-event-coefficient-multiplier"
    const action = {
      ...baseAction,
      id: "test.noelle.same-hit.sweeping-time.normal-attack-combo",
      scenarioParameters: [
        {
          defaultValue: 0,
          id: multiplierParameterId,
          label: "测试原始事件倍率",
          maximumValue: 1,
          minimumValue: 0
        }
      ],
      timeline: {
        ...timeline,
        damageEvents: withOriginalEventMultiplier(damageEvents, multiplierParameterId)
      }
    } satisfies CombatActionMetadata
    const build: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.noelle.redhorn.multi-hit.r1",
      characterId: "Noelle",
      constellation: 0,
      label: "诺艾尔赤角多段命中测试配置",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RedhornStonethresher" }
    }
    const baseline = evaluateDeclaredDirectScenarioAction({
      action: baseAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const boosted = evaluateDeclaredDirectScenarioAction({
      action,
      actionParameters: { [multiplierParameterId]: 1 },
      build,
      buffs: [],
      enemy,
      gameData
    })

    expect(baseline.rotation.events).toHaveLength(4)
    expect(boosted.rotation.events).toHaveLength(4)
    expect(boosted.rotation.events.map((event) => event.id)).toEqual(
      damageEvents.map((event) => `${action.id}.${event.id}`)
    )
    expect(boosted.rotation.events.some((event) => event.id.includes("redhorn"))).toBe(false)

    for (const [index, boostedEvent] of boosted.rotation.events.entries()) {
      const baselineEvent = baseline.rotation.events[index]
      if (!baselineEvent) throw new Error(`Missing baseline event ${index}`)
      const baselineScaling = baselineEvent.trace.find((entry) => entry.kind === "scaling_terms")
      const boostedScaling = boostedEvent.trace.find((entry) => entry.kind === "scaling_terms")
      if (!baselineScaling || baselineScaling.kind !== "scaling_terms") {
        throw new Error(`Missing baseline scaling terms for event ${index}`)
      }
      if (!boostedScaling || boostedScaling.kind !== "scaling_terms") {
        throw new Error(`Missing boosted scaling terms for event ${index}`)
      }

      const baselineAttackTerm = baselineScaling.terms.find((term) => term.stat === "attack")
      const baselineNoelleDefenseTerm = baselineScaling.terms.find(
        (term) => term.stat === "defense" && term.label === undefined
      )
      const boostedAttackTerm = boostedScaling.terms.find((term) => term.stat === "attack")
      const boostedNoelleDefenseTerm = boostedScaling.terms.find(
        (term) => term.stat === "defense" && term.label === undefined
      )
      const redhornTerms = boostedScaling.terms.filter((term) => term.label === redhornTermLabel)
      if (!baselineAttackTerm || !baselineNoelleDefenseTerm || !boostedAttackTerm || !boostedNoelleDefenseTerm) {
        throw new Error(`Expected Noelle's original attack and defense terms for event ${index}`)
      }

      expect(redhornTerms).toHaveLength(1)
      expect(redhornTerms[0]).toMatchObject({ coefficient: 0.4, stat: "defense" })
      expect(boostedAttackTerm.coefficient).toBeCloseTo(baselineAttackTerm.coefficient * 2)
      expect(boostedNoelleDefenseTerm.coefficient).toBeCloseTo(baselineNoelleDefenseTerm.coefficient * 2)
    }
  })
})
