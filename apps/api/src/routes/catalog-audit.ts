import {
  createCombatAuthoringAuditReport,
  createCombatCoverageReport,
  raidenNationalBuiltinScenario
} from "@gscombat/analyzer"
import {
  ActionEffectOptionsRequestSchema,
  ActionEffectOptionsResponseSchema,
  ApiErrorResponseSchema,
  CatalogResponseSchema,
  CombatAuthoringAuditReportSchema,
  CombatCoverageReportSchema,
  GameDataStatusResponseSchema,
  HealthResponseSchema,
  PresetsResponseSchema,
  type ActionEffectOptionsRequest,
  type ActionEffectOptionsResponse,
  type ApiErrorResponse,
  type CatalogResponse,
  type CombatAuthoringAuditReport,
  type CombatCoverageReport,
  type GameDataStatusResponse,
  type HealthResponse,
  type PresetsResponse
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import type { FastifyInstance } from "fastify"

import { serializeCatalogResponse } from "../serializers/catalog.js"
import {
  serializeCombatAuthoringAuditReport,
  serializeCombatCoverageReport
} from "../serializers/combat-coverage.js"
import { resolveActionEffectOptions } from "../services/action-effects/options.js"

/** Registers health, game-data, catalog, coverage, audit, effect-option and preset routes. */
export function registerCatalogAuditRoutes(app: FastifyInstance, gameData: GameDataRepository): void {
  app.get<{ Reply: HealthResponse }>(
    "/health",
    {
      schema: {
        response: { 200: HealthResponseSchema }
      }
    },
    async () => ({ status: "ok" })
  )

  app.get<{ Reply: GameDataStatusResponse }>(
    "/v1/game-data/status",
    {
      schema: {
        response: { 200: GameDataStatusResponseSchema }
      }
    },
    async () => {
      const manifest = gameData.getManifest()
      return {
        counts: gameData.getCounts(),
        gameVersion: manifest.gameVersion,
        schemaVersion: manifest.schemaVersion,
        upstreamCommit: manifest.upstreamCommit
      }
    }
  )

  app.get<{ Reply: CatalogResponse }>(
    "/v1/catalog",
    {
      schema: {
        response: { 200: CatalogResponseSchema }
      }
    },
    async () => serializeCatalogResponse()
  )

  app.post<{
    Body: ActionEffectOptionsRequest
    Reply: ActionEffectOptionsResponse | ApiErrorResponse
  }>(
    "/v1/action-effect-options",
    {
      schema: {
        body: ActionEffectOptionsRequestSchema,
        response: {
          200: ActionEffectOptionsResponseSchema,
          404: ApiErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      const result = resolveActionEffectOptions(request.body)
      if (!result) {
        return reply.code(404).send({ code: "action_not_found", message: "目标动作不存在或不属于当前角色" })
      }
      return result
    }
  )

  app.get<{ Reply: CombatCoverageReport }>(
    "/v1/combat-coverage",
    {
      schema: {
        response: { 200: CombatCoverageReportSchema }
      }
    },
    async () => serializeCombatCoverageReport(createCombatCoverageReport(gameData))
  )

  app.get<{ Reply: CombatAuthoringAuditReport }>(
    "/v1/combat-authoring/audit",
    {
      schema: {
        response: { 200: CombatAuthoringAuditReportSchema }
      }
    },
    async () => serializeCombatAuthoringAuditReport(createCombatAuthoringAuditReport(gameData))
  )

  app.get<{ Reply: PresetsResponse }>(
    "/v1/presets",
    {
      schema: {
        response: { 200: PresetsResponseSchema }
      }
    },
    async () => ({
      presets: [
        {
          description: "雷神 C2 薙草，班尼特宗室、香菱与行秋；满愿力、雷眼和班尼特领域均开启。",
          id: "raiden-national.initial-slash",
          label: "雷神国家队 · 梦想一刀",
          scenario: raidenNationalBuiltinScenario
        }
      ]
    })
  )
}
