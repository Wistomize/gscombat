import {
  analyzeScenario,
  evaluateCombatMetric,
  evaluateScenario
} from "@gscombat/analyzer"
import { getCombatMetricDefinition } from "@gscombat/content"
import {
  AnalysisRequestSchema,
  AnalysisResponseSchema,
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
      const evaluation = evaluateScenario(request.body, gameData)
      const analysis = analyzeScenario(request.body, gameData, {
        ...(request.body.weaponComparisonRefinements === undefined
          ? {}
          : { weaponComparisonRefinements: request.body.weaponComparisonRefinements })
      })
      return serializeAnalysisResponse(evaluation, analysis)
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
