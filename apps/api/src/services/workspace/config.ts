interface WorkspaceConfigurationOptions {
  readonly inviteTokenSecret?: string
  readonly workspaceDataPath?: string
}

const DEVELOPMENT_TOKEN_SECRET = "gscombat-development-token-secret-only"
const EXAMPLE_TOKEN_SECRET = "replace-with-at-least-32-random-characters"

/** Resolves workspace credentials before any resources are opened; management always requires explicit values. */
export function resolveWorkspaceConfiguration(
  options: WorkspaceConfigurationOptions = {},
  environment: NodeJS.ProcessEnv = process.env,
  requirePersistent = environment.NODE_ENV === "production"
): { readonly databasePath: string; readonly tokenSecret: string } {
  const tokenSecret = options.inviteTokenSecret ?? environment.INVITE_TOKEN_SECRET
  const databasePath = options.workspaceDataPath ?? environment.WORKSPACE_DATA_PATH

  if (requirePersistent) {
    if (!tokenSecret?.trim() || tokenSecret.length < 32) {
      throw new Error("INVITE_TOKEN_SECRET must be explicitly configured with at least 32 characters")
    }
    if ([DEVELOPMENT_TOKEN_SECRET, EXAMPLE_TOKEN_SECRET].includes(tokenSecret.trim())) {
      throw new Error("INVITE_TOKEN_SECRET must not use the public development or example value")
    }
    if (!databasePath?.trim() || databasePath.trim() === ":memory:" || /^file:/i.test(databasePath.trim())) {
      throw new Error("WORKSPACE_DATA_PATH must be explicitly configured as a persistent SQLite file path")
    }
  }

  return {
    databasePath: databasePath ?? ":memory:",
    tokenSecret: tokenSecret ?? DEVELOPMENT_TOKEN_SECRET
  }
}
