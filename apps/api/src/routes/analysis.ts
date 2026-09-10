import {
  analyzeWeaponComparison,
  evaluateCombatMetric,
  evaluateScenarioAnalysis
} from "@gscombat/analyzer"
import { getCombatMetricDefinition } from "@gscombat/content"
import {
  AnalysisRequestSchema,
  AnalysisResponseSchema,
  WeaponComparisonRequestSchema,
  WeaponComparisonResponseSchema,
  type WeaponComparisonRequest,
  type WeaponComparisonResponse,
  SupportMetricEvaluationRequestSchema,
  SupportMetricEvaluationResponseSchema,
  type AnalysisRequest,
  type AnalysisResponse,
  type SupportMetricEvaluationRequest,
  type SupportMetricEvaluationResponse
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import type { FastifyInstance } from "fastify"

import {
  serializeAnalysisResponse,
  serializeSupportMetricResult
} from "../serializers/analysis.js"

/** Registers authoritative damage-analysis and non-damage support-metric routes. */
export function registerAnalysisRoutes(app: FastifyInstance, gameData: GameDataRepository): void {
  app.post<{ Body: AnalysisRequest; Reply: AnalysisResponse }>(
    "/v1/analysis",
    {
      schema: {
        body: AnalysisRequestSchema,
        response: { 200: AnalysisResponseSchema }
      }
    },
    async (request) => {
      assertMetricConstellation(request.body.targetActionId, request.body.primary.constellation)
      const { evaluation, analysis } = evaluateScenarioAnalysis(request.body, gameData, {
        ...(request.body.weaponComparisonRefinements === undefined
          ? {}
          : { weaponComparisonRefinements: request.body.weaponComparisonRefinements })
      })
      return serializeAnalysisResponse(evaluation, analysis)
    }
  )

  app.post<{ Body: WeaponComparisonRequest; Reply: WeaponComparisonResponse }>(
    "/v1/analysis/weapon-comparison",
    { schema: { body: WeaponComparisonRequestSchema, response: { 200: WeaponComparisonResponseSchema } } },
    async ({ body }) => {
      assertMetricConstellation(body.scenario.targetActionId, body.scenario.primary.constellation)
      return analyzeWeaponComparison(body.scenario, gameData, body.weaponId, body.refinement)
    }
  )

  app.post<{ Body: SupportMetricEvaluationRequest; Reply: SupportMetricEvaluationResponse }>(
    "/v1/support-metrics/evaluate",
    {
      schema: {
        body: SupportMetricEvaluationRequestSchema,
        response: { 200: SupportMetricEvaluationResponseSchema }
      }
    },
    async (request) => {
      const definition = getCombatMetricDefinition(request.body.metricId)
      if (!definition) throw new Error(`Combat metric ${request.body.metricId} is not registered`)
      if (definition.kind === "damage") {
        throw new Error(`Support metric endpoint does not accept damage metric ${request.body.metricId}`)
      }
      assertMetricConstellation(request.body.metricId, request.body.build.constellation)
      const evaluated = evaluateCombatMetric({
        build: request.body.build,
        ...(request.body.context ? { context: request.body.context } : {}),
        gameData,
        metricId: request.body.metricId
      })
      if (evaluated.kind === "damage") {
        throw new Error(`Support metric endpoint received damage metric ${request.body.metricId}`)
      }
      return { engineVersion: "support-metric-1", metric: serializeSupportMetricResult(evaluated) }
    }
  )
}

/** Rejects an unowned public metric before analysis; engine failures remain server errors. */
function assertMetricConstellation(metricId: string | undefined, constellation: number): void {
  if (!metricId) return
  const metric = getCombatMetricDefinition(metricId)
  if (metric?.minimumSourceConstellation === undefined || constellation >= metric.minimumSourceConstellation) return
  throw Object.assign(new Error(
    `Combat metric ${metric.id} requires source constellation ${metric.minimumSourceConstellation}, but build has constellation ${constellation}`
  ), { statusCode: 400 })
}
