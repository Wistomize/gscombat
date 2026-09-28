import { AnalysisRequestSchema, CoreAnalysisResponseSchema, DeferredComparisonRequestSchema,
  DeferredWeaponResponseSchema, ArtifactComparisonRequestSchema, ArtifactCandidateComparisonRequestSchema, ArtifactComparisonResponseSchema,
  type AnalysisRequest, type ArtifactComparisonRequest, type DeferredComparisonRequest } from "@gscombat/contracts"
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import type { EquipmentComparisonService } from "../services/equipment-comparison.js"
import { serializeAnalysisResponse } from "../serializers/analysis.js"

/** Cancels only this caller's waiter when the response socket goes away. */
export async function withComparisonSignal<T>(request: FastifyRequest, reply: FastifyReply,
  run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController()
  const abort = () => { if (!reply.raw.writableEnded) controller.abort() }
  request.raw.on("aborted", abort)
  reply.raw.on("close", abort)
  try { return await run(controller.signal) }
  finally { request.raw.off("aborted", abort); reply.raw.off("close", abort) }
}

/** Compatible new endpoints leave the legacy report schema and default behavior unchanged. */
export function registerEquipmentComparisonRoutes(app: FastifyInstance, service: EquipmentComparisonService): void {
  app.post<{ Body: AnalysisRequest }>("/v1/analysis/core", {
    schema: { body: AnalysisRequestSchema, response: { 200: CoreAnalysisResponseSchema } }
  }, async request => {
    const { evaluation, analysis, computationId, artifactPreparations } = service.core(request.body)
    return { ...serializeAnalysisResponse(evaluation, analysis), computationId, artifactPreparations }
  })
  app.post<{ Body: DeferredComparisonRequest }>("/v1/analysis/weapons", {
    schema: { body: DeferredComparisonRequestSchema, response: { 200: DeferredWeaponResponseSchema } }
  }, (request, reply) => withComparisonSignal(request, reply, signal => service.weapons(request.body, signal)))
  for (const path of ["/v1/analysis/artifact-loadouts", "/v1/analysis/artifact-loadouts/candidate"]) {
    app.post<{ Body: ArtifactComparisonRequest }>(path, {
      schema: { body: path.endsWith("/candidate") ? ArtifactCandidateComparisonRequestSchema : ArtifactComparisonRequestSchema,
        response: { 200: ArtifactComparisonResponseSchema } }
    }, (request, reply) => withComparisonSignal(request, reply, signal => service.artifacts(request.body, signal)))
  }
}
