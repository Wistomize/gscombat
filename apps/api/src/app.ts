import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import Fastify, { type FastifyInstance } from "fastify"

import { registerAnalysisRoutes } from "./routes/analysis.js"
import { registerCatalogAuditRoutes } from "./routes/catalog-audit.js"
import { registerSessionWorkspaceRoutes } from "./routes/session-workspace.js"
import { registerShowcaseRoutes } from "./routes/showcase.js"
import { EnkaShowcaseClient, type ShowcaseImporter } from "./services/showcase/client.js"
import { WorkspaceStore } from "./services/workspace/store.js"

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

const DEVELOPMENT_TOKEN_SECRET = "gscombat-development-token-secret-only"

function resolveTokenSecret(options: BuildAppOptions): string {
  const secret = options.inviteTokenSecret ?? process.env.INVITE_TOKEN_SECRET ?? DEVELOPMENT_TOKEN_SECRET
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("INVITE_TOKEN_SECRET must contain at least 32 characters in production")
  }
  return secret
}

/** Builds the API composition root without opening a socket so callers can test or deploy it. */
export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: false,
    trustProxy: options.trustProxy ?? process.env.TRUST_PROXY === "true"
  })
  const gameData = new GameDataRepository(options.gameDataPath ?? process.env.GAME_DATA_PATH ?? DEFAULT_GAME_DATA_PATH)
  const tokenSecret = resolveTokenSecret(options)
  const workspaceStore = new WorkspaceStore(
    options.workspaceDataPath ?? process.env.WORKSPACE_DATA_PATH ?? ":memory:",
    tokenSecret
  )
  const showcaseImporter = options.showcaseImporter ?? new EnkaShowcaseClient()
  const secureSessionCookie = options.secureSessionCookie ?? (
    process.env.SESSION_COOKIE_SECURE === undefined
      ? process.env.NODE_ENV === "production"
      : process.env.SESSION_COOKIE_SECURE === "true"
  )
  const sessionLifetimeSeconds = options.sessionLifetimeSeconds ?? 30 * 24 * 60 * 60

  app.addHook("onClose", async () => {
    workspaceStore.close()
    gameData.close()
  })

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
}
