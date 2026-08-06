import {
  ShowcaseImportRequestSchema,
  ShowcaseImportResponseSchema,
  type ShowcaseImportRequest,
  type ShowcaseImportResponse
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import type { FastifyInstance } from "fastify"

import type { ShowcaseImporter } from "../services/showcase/client.js"

/** Registers the public UID showcase-import route. */
export function registerShowcaseRoutes(
  app: FastifyInstance,
  gameData: GameDataRepository,
  showcaseImporter: ShowcaseImporter
): void {
  app.post<{ Body: ShowcaseImportRequest; Reply: ShowcaseImportResponse }>(
    "/v1/showcase/import",
    {
      schema: {
        body: ShowcaseImportRequestSchema,
        response: { 200: ShowcaseImportResponseSchema }
      }
    },
    async (request) => showcaseImporter.importBuilds(request.body.uid, gameData.getManifest().gameVersion)
  )
}
