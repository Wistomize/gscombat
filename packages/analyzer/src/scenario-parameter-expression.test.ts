import { bennettNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

const snapshotScaledAction = {
  characterId: "Bennett",
  damageKind: "direct",
  damageParts: [
    {
      id: "snapshot-scaled-hit",
      scalingTerms: [
        { coefficientParameterId: "attack-ratio", stat: "attack" },
        {
          coefficientMultiplierScenarioParameterId: "stored-stacks",
          coefficientParameterId: "hp-ratio-per-stack",
          stat: "hp"
        }
      ]
    }
  ],
  element: "pyro",
  evaluator: "declared_direct",
  id: "system.scenario_parameter_expression.scaled_direct_hit",
  kind: "damage",
  parameterReferences: [
    {
      groupId: "burst",
      id: "attack-ratio",
      parameterIndex: 0,
      source: "talent",
      talentSlot: "burst"
    },
    {
      groupId: "burst",
      id: "hp-ratio-per-stack",
      parameterIndex: 0,
      source: "talent",
      talentSlot: "burst"
    },
    {
      groupId: "burst",
      id: "event-ratio-per-stack",
      parameterIndex: 0,
      source: "talent",
      talentSlot: "burst"
    }
  ],
  scenarioParameters: [
    {
      allowedValues: [0, 2, 4],
      defaultValue: 4,
      id: "stored-stacks",
      label: "当前层数",
      maximumValue: 4,
      minimumValue: 0
    }
  ],
  status: "verified",
  talentSlot: "burst",
  timeline: {
    damageEvents: [
      {
        at: 0,
        coefficientMultiplier: {
          base: 1,
          kind: "scenario_parameter_talent_linear",
          parameterId: "stored-stacks",
          perParameterTalentCoefficientId: "event-ratio-per-stack"
        },
        damagePartId: "snapshot-scaled-hit",
        hitCount: 3,
        id: "snapshot-scaled-hit",
        snapshot: "cast"
      }
    ],
    duration: 1
  }
} satisfies CombatActionMetadata

const snapshotScaledActionWithoutEventMultiplier = {
  ...snapshotScaledAction,
  id: "system.scenario_parameter_expression.scaled_direct_hit_without_event_multiplier",
  timeline: {
    damageEvents: [
      {
        at: 0,
        damagePartId: "snapshot-scaled-hit",
        hitCount: 3,
        id: "snapshot-scaled-hit",
        snapshot: "cast"
      }
    ],
    duration: 1
  }
} satisfies CombatActionMetadata

afterAll(() => gameData.close())

describe("manual scenario-parameter expressions", () => {
  it("evaluates bounded snapshot inputs, talent-linear event multipliers, and repeated hits together", () => {
    const noStacks = evaluateDeclaredDirectScenarioAction({
      action: snapshotScaledAction,
      actionParameters: { "stored-stacks": 0 },
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const fullStacks = evaluateDeclaredDirectScenarioAction({
      action: snapshotScaledAction,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const fullStacksWithoutEventMultiplier = evaluateDeclaredDirectScenarioAction({
      action: snapshotScaledActionWithoutEventMultiplier,
      build: bennettNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const noStackTerms = noStacks.parts[0]?.terms
    const fullStackTerms = fullStacks.parts[0]?.terms
    if (!noStackTerms || !fullStackTerms) throw new Error("Expected the synthetic action to resolve mixed scaling terms")

    expect(noStacks.stats.actionParameters).toEqual({ "stored-stacks": 0 })
    expect(fullStacks.stats.actionParameters).toEqual({ "stored-stacks": 4 })
    expect(noStackTerms[1]?.coefficient).toBe(0)
    expect(fullStackTerms[1]?.coefficient).toBeGreaterThan(0)
    expect(fullStacks.rotation.events).toMatchObject([{ hitCount: 3 }])
    expect(fullStacks.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ hitCount: 3, kind: "hit_count" })])
    )
    expect(fullStacks.rotation.dpr).toBeGreaterThan(noStacks.rotation.dpr)

    const perStackTalentCoefficient = fullStackTerms[0]?.coefficient
    if (perStackTalentCoefficient === undefined) throw new Error("Expected an Attack scaling coefficient")
    expect(fullStacks.rotation.dpr / fullStacksWithoutEventMultiplier.rotation.dpr).toBeCloseTo(
      1 + 4 * perStackTalentCoefficient
    )
  })
})
