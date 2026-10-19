import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import Fastify, { type FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"

import { registerAnalysisRoutes } from "./routes/analysis.js"
import { registerCatalogAuditRoutes } from "./routes/catalog-audit.js"
import { registerSessionWorkspaceRoutes } from "./routes/session-workspace.js"
import { registerShowcaseRoutes } from "./routes/showcase.js"
import { EnkaShowcaseClient, type ShowcaseImporter } from "./services/showcase/client.js"
import { resolveWorkspaceConfiguration } from "./services/workspace/config.js"
import { WorkspaceStore } from "./services/workspace/store.js"
import { registerHttpErrors } from "./services/http-errors.js"

export { serializeRotationEvent } from "./serializers/analysis.js"
export {
  serializeCombatAction,
  serializeCombatElementOverrideEffect,
  serializeCombatMetric
} from "./serializers/combat-coverage.js"

export interface BuildAppOptions {
  readonly gameDataPath?: string
  readonly inviteTokenSecret?: string
  readonly secureSessionCookie?: boolean
  readonly sessionLifetimeSeconds?: number
  readonly showcaseImporter?: ShowcaseImporter
  readonly trustProxy?: boolean
  readonly workspaceDataPath?: string
}

/** Builds the API composition root without opening a socket so callers can test or deploy it. */
export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const { databasePath, tokenSecret } = resolveWorkspaceConfiguration(options)
  const app = Fastify({
    logger: false,
    genReqId: () => randomUUID(),
    requestIdHeader: false,
    trustProxy: options.trustProxy ?? process.env.TRUST_PROXY === "true"
  })
  const gameData = new GameDataRepository(options.gameDataPath ?? process.env.GAME_DATA_PATH ?? DEFAULT_GAME_DATA_PATH)
  let workspaceStore: WorkspaceStore | undefined
  const closeResources = (): void => {
    try {
      workspaceStore?.close()
    } finally {
      gameData.close()
    }
  }

  try {
    registerHttpErrors(app)
    workspaceStore = new WorkspaceStore(databasePath, tokenSecret)
    const showcaseImporter = options.showcaseImporter ?? new EnkaShowcaseClient()
    const secureSessionCookie = options.secureSessionCookie ?? (
      process.env.SESSION_COOKIE_SECURE === undefined
        ? process.env.NODE_ENV === "production"
        : process.env.SESSION_COOKIE_SECURE === "true"
    )
    const sessionLifetimeSeconds = options.sessionLifetimeSeconds ?? 30 * 24 * 60 * 60

    app.addHook("onClose", async () => { closeResources() })
    registerSessionWorkspaceRoutes(app, {
      secureSessionCookie,
      sessionLifetimeSeconds,
      tokenSecret,
      workspaceStore
    })
    registerCatalogAuditRoutes(app, gameData)
    registerAnalysisRoutes(app, gameData)
    registerShowcaseRoutes(app, gameData, showcaseImporter)

    return app
  } catch (error) {
    try { closeResources() } catch { /* Preserve the original initialization error. */ }
    throw error
  }
}
