import {
  bennettNationalBuiltinBuild,
  type CombatScaledHealingMetricDefinition
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateHealingMetric } from "../../src/metrics/healing.js"
import { resolveFriendlyRecipient } from "../../src/metrics/runtime.js"
import type { CombatMetricFormulaNode } from "../../src/metrics/types.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

const metric: CombatScaledHealingMetricDefinition = {
  additionalScalingTerms: [
    {
      label: "C6 capped additional healing",
      maximumValue: 200,
      minimumSourceConstellation: 6,
      ratio: 0.02,
      scalingStat: "hp"
    }
  ],
  characterId: "Bennett",
  id: "test.bennett.constellation-healing",
  includeHealingBonus: false,
  kind: "healing",
  label: "Constellation healing system fixture",
  ratio: 0.1,
  recipientIncomingHealingBonuses: [
    {
      label: "C6 recipient incoming-healing bonus",
      minimumSourceConstellation: 6,
      recipientRequirement: {
        comparison: "at_most",
        kind: "recipient_hp_fraction",
        label: "Recipient HP at most 50%",
        threshold: 0.5
      },
      value: 0.3
    }
  ],
  recipientRequirements: [],
  scalingStat: "hp",
  sourceActionId: "bennett.burst.field",
  status: "verified",
  target: "friendly_recipient"
}

function evaluateAtConstellation(constellation: number, currentHpFraction?: number) {
  const build: CharacterBuild = {
    ...bennettNationalBuiltinBuild,
    buildId: `test.bennett.c${constellation}.healing`,
    constellation
  }
  const context = {
    recipient: {
      buildId: build.buildId,
      ...(currentHpFraction === undefined ? {} : { currentHpFraction })
    },
    teammates: []
  }
  const recipient = resolveFriendlyRecipient(metric, { build, context, gameData, metricId: metric.id })
  return evaluateHealingMetric(metric, build, recipient, undefined, [], gameData)
}

function findFormula(
  formula: CombatMetricFormulaNode,
  predicate: (candidate: CombatMetricFormulaNode) => boolean
): CombatMetricFormulaNode | undefined {
  if (predicate(formula)) return formula
  if (formula.kind === "term") return undefined
  if (formula.kind === "condition") return findFormula(formula.operand, predicate)
  return formula.operands.map((operand) => findFormula(operand, predicate)).find(Boolean)
}

describe("constellation-aware healing composition", () => {
  it("keeps fixed-ratio healing compatible while gating, capping, and routing source-kit recipient bonuses", () => {
    const c5 = evaluateAtConstellation(5)
    const c6 = evaluateAtConstellation(6, 0.4)
    const cappedContribution = Math.min(c6.scalingValue * 0.02, 200)
    if (c6.formula.kind === "rotation_events") throw new Error("Expected a support-metric formula")

    expect(c5.talentLevel).toBeUndefined()
    expect(c5.value).toBeCloseTo(c5.scalingValue * 0.1)
    expect(c5.conditions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "source_constellation", minimumConstellation: 6, satisfied: false })
      ])
    )
    expect(c6.value).toBeCloseTo((c6.scalingValue * 0.1 + cappedContribution) * 1.3)
    expect(c6.incomingHealingBonus).toBeCloseTo(0.3)
    expect(c6.conditions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "source_constellation", minimumConstellation: 6, satisfied: true }),
        expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, threshold: 0.5 })
      ])
    )
    expect(
      findFormula(
        c6.formula,
        (candidate) => candidate.kind === "minimum" && candidate.label.includes("单项上限")
      )
    ).toEqual(expect.objectContaining({ kind: "minimum", value: cappedContribution }))
    expect(
      findFormula(
        c6.formula,
        (candidate) => candidate.kind === "add" && candidate.label === "受益角色受疗加成"
      )
    ).toEqual(expect.objectContaining({ value: 1.3 }))
  })
})
