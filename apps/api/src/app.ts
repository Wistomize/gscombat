import { evaluateExpectedDamage } from "@project-b/calculator"
import { createRaidenNationalFoundationInput } from "@project-b/content"
import {
  EvaluationRequestSchema,
  EvaluationResponseSchema,
  HealthResponseSchema,
  type EvaluationRequest,
  type EvaluationResponse,
  type HealthResponse
} from "@project-b/contracts"
import Fastify, { type FastifyInstance } from "fastify"

/** Build an API instance without opening a socket so callers can test or deploy it. */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false })

  app.get<{ Reply: HealthResponse }>(
    "/health",
    {
      schema: {
        response: { 200: HealthResponseSchema }
      }
    },
    async () => ({ status: "ok" })
  )

  app.post<{ Body: EvaluationRequest; Reply: EvaluationResponse }>(
    "/v1/evaluations",
    {
      schema: {
        body: EvaluationRequestSchema,
        response: { 200: EvaluationResponseSchema }
      }
    },
    async (request) => {
      const options =
        request.body.additionalAttackPercent === undefined
          ? {}
          : { additionalAttackPercent: request.body.additionalAttackPercent }
      const fixture = createRaidenNationalFoundationInput(options)
      const result = evaluateExpectedDamage(fixture.input)

      return {
        contentVersion: fixture.metadata.version,
        engineVersion: "foundation-1",
        presetVersion: fixture.metadata.version,
        result: {
          ...result,
          trace: [...result.trace]
        }
      }
    }
  )

  return app
}
