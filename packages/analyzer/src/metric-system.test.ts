import {
  getCombatActionDefinition,
  listCombatMetrics,
  raidenNationalBuiltinBuild,
  type CombatMetricDefinition,
  type CombatMetricTalentParameter
} from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveTalentParameterOwnerId } from "./build-variant.js"
import {
  evaluateCombatMetric,
  type CombatMetricFormulaNode,
  type CombatMetricFormulaTerm
} from "./metric.js"
import { raidenNationalBuiltinScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function createSystemMetricBuild(metric: CombatMetricDefinition): CharacterBuild {
  const characterId = metric.characterId
  const character = gameData.getCharacter(characterId)
  if (!character) throw new Error(`Missing ${characterId} from the pinned game-data snapshot`)
  const sourceAction = getCombatActionDefinition(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Missing source action ${metric.sourceActionId} for ${metric.id}`)
  const weapon = gameData
    .listWeapons()
    .find(
      (candidate) =>
        candidate.weaponType === character.weaponType &&
        gameData.getWeaponStat(candidate.id, "atk", 90, 6) !== undefined
    )
  if (!weapon) throw new Error(`Missing a level-90 compatible weapon for ${characterId}`)

  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.system.metric.${characterId}`,
    characterId,
    constellation: 0,
    label: `${characterId} system metric fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    ...(characterId === "Traveler"
      ? {
          variant: {
            element: sourceAction.travelerElement ?? "anemo",
            gender: "female",
            kind: "traveler"
          }
        }
      : {}),
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: weapon.id }
  }
}

function createSystemMetricScenario(build: CharacterBuild): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
    externalBuffs: [],
    primary: build,
    teammates: []
  }
}

function getMetricTalentParameters(
  metric: Exclude<CombatMetricDefinition, { readonly kind: "damage" }>
): readonly CombatMetricTalentParameter[] {
  if (metric.kind === "healing") return [metric.percentageParameter, metric.flatParameter]
  if (metric.kind === "stat_buff") return [metric.ratioParameter]
  return [metric.ratioParameter, metric.flatParameter, metric.maximumValueParameter].filter(
    (parameter): parameter is CombatMetricTalentParameter => parameter !== undefined
  )
}

function findTalentParameterTerm(
  formula: CombatMetricFormulaNode,
  parameterId: string
): CombatMetricFormulaTerm | undefined {
  if (formula.kind === "term") {
    return formula.role === "source_talent_parameter" && formula.parameterId === parameterId ? formula : undefined
  }
  if (formula.kind === "condition") return findTalentParameterTerm(formula.operand, parameterId)
  return formula.operands.map((operand) => findTalentParameterTerm(operand, parameterId)).find(Boolean)
}

describe("registered combat metrics", () => {
  it("evaluates every verified metric through the public registry without leaking another action's manual input", () => {
    const metrics = listCombatMetrics().filter((metric) => metric.status === "verified")

    expect(metrics.length).toBeGreaterThan(0)
    for (const metric of metrics) {
      const build = createSystemMetricBuild(metric)
      const result = evaluateCombatMetric({
        build,
        context: {
          recipient: {
            buildId: build.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: true,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 0.5 },
          teammates: []
        },
        gameData,
        metricId: metric.id,
        ...(metric.kind === "damage" ? { scenario: createSystemMetricScenario(build) } : {})
      })

      expect(result.id).toBe(metric.id)
      expect(result.kind).toBe(metric.kind)
      expect(Number.isFinite(result.value)).toBe(true)
      if (metric.kind === "scalar" && result.kind === "scalar") expect(result.semantic).toBe(metric.semantic)
    }
  }, 20_000)

  it("normalizes every declared metric talent parameter without changing its raw snapshot checks", () => {
    const metrics = listCombatMetrics().filter(
      (metric): metric is Exclude<CombatMetricDefinition, { readonly kind: "damage" }> => metric.kind !== "damage"
    )
    let normalizedParameterCount = 0

    for (const metric of metrics) {
      for (const parameter of getMetricTalentParameters(metric)) {
        const valueMultiplier = parameter.valueMultiplier
        if (valueMultiplier === undefined) continue
        normalizedParameterCount += 1
        const build = createSystemMetricBuild(metric)
        const result = evaluateCombatMetric({
          build,
          context: {
            recipient: {
              buildId: build.buildId,
              currentHpFraction: 0.5,
              incomingHealingBonus: 0,
              isMoonsign: true,
              isWithinSourceArea: true,
              missingHp: 999_999
            },
            source: { currentHpFraction: 0.5 },
            teammates: []
          },
          gameData,
          metricId: metric.id
        })
        if (result.kind === "damage" || result.formula.kind === "rotation_events") {
          throw new Error(`Expected non-damage metric ${metric.id}`)
        }
        const term = findTalentParameterTerm(result.formula, parameter.reference.id)
        if (!term || term.talentLevel === undefined) {
          throw new Error(`Metric ${metric.id} did not expose its normalized talent parameter in the formula`)
        }
        const action = getCombatActionDefinition(metric.sourceActionId)
        if (!action) throw new Error(`Metric ${metric.id} references missing action ${metric.sourceActionId}`)
        const rawValue = gameData.getCharacterSkillParameter(
          resolveTalentParameterOwnerId(action, build),
          parameter.reference.groupId,
          parameter.reference.parameterIndex,
          term.talentLevel
        )
        if (rawValue === undefined) throw new Error(`Missing raw metric parameter for ${metric.id}`)

        expect(term.label).toContain(`× ${valueMultiplier}`)
        expect(term.value).toBeCloseTo(rawValue * valueMultiplier)
        if (parameter.reference.talentSlot === "passive") expect(term.talentLevel).toBe(1)
      }
    }

    expect(normalizedParameterCount).toBeGreaterThan(0)
  })

  it("resolves every scalar action snapshot from its own source action only", () => {
    const metrics = listCombatMetrics().filter(
      (metric): metric is Extract<CombatMetricDefinition, { readonly kind: "scalar" }> =>
        metric.kind === "scalar" && metric.ratioScenarioParameter !== undefined
    )

    expect(metrics.length).toBeGreaterThan(0)
    for (const metric of metrics) {
      const build = createSystemMetricBuild(metric)
      const action = getCombatActionDefinition(metric.sourceActionId)
      const parameter = action?.scenarioParameters?.find(
        (candidate) => candidate.id === metric.ratioScenarioParameter?.parameterId
      )
      if (!action || !parameter) throw new Error(`Missing action snapshot declaration for ${metric.id}`)
      const result = evaluateCombatMetric({
        build,
        context: {
          actionParameters: { [parameter.id]: parameter.minimumValue },
          recipient: {
            buildId: build.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: true,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 0.5 },
          teammates: []
        },
        gameData,
        metricId: metric.id
      })
      if (result.kind !== "scalar") throw new Error(`Expected scalar metric ${metric.id}`)
      if (result.formula.kind === "rotation_events") throw new Error(`Expected support formula for ${metric.id}`)
      expect(result.formula).toEqual(
        expect.objectContaining({ value: result.value })
      )
      expect(findActionSnapshotTerm(result.formula, parameter.id)).toEqual(
        expect.objectContaining({ role: "source_action_snapshot", value: parameter.minimumValue })
      )
    }
  })

  it("resolves every scalar talent-derived cap at the source talent level", () => {
    const metrics = listCombatMetrics().filter(
      (metric): metric is Extract<CombatMetricDefinition, { readonly kind: "scalar" }> =>
        metric.kind === "scalar" && metric.maximumValueParameter !== undefined
    )

    expect(metrics.length).toBeGreaterThan(0)
    for (const metric of metrics) {
      const maximumValueParameter = metric.maximumValueParameter
      if (!maximumValueParameter) throw new Error(`Missing declared talent-derived cap for ${metric.id}`)
      const build = createSystemMetricBuild(metric)
      const result = evaluateCombatMetric({
        build,
        context: {
          recipient: {
            buildId: build.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: true,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 0.5 },
          teammates: []
        },
        gameData,
        metricId: metric.id
      })
      if (result.kind !== "scalar") throw new Error(`Expected scalar metric ${metric.id}`)
      if (result.formula.kind === "rotation_events") throw new Error(`Expected support formula for ${metric.id}`)
      const term = findTalentParameterTerm(result.formula, maximumValueParameter.reference.id)
      if (!term) throw new Error(`Metric ${metric.id} did not expose its talent-derived cap`)
      expect(result.maximumValue).toBeCloseTo(term.value)
    }
  })
})

function findActionSnapshotTerm(
  formula: CombatMetricFormulaNode,
  parameterId: string
): CombatMetricFormulaTerm | undefined {
  if (formula.kind === "term") {
    return formula.role === "source_action_snapshot" && formula.parameterId === parameterId ? formula : undefined
  }
  if (formula.kind === "condition") return findActionSnapshotTerm(formula.operand, parameterId)
  return formula.operands.map((operand) => findActionSnapshotTerm(operand, parameterId)).find(Boolean)
}
