import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"

import type { WorkspaceDocument } from "@gscombat/contracts"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import { GameDataRepository } from "@gscombat/game-data"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { buildApp, type BuildAppOptions } from "../../src/app.js"
import { WorkspaceStore } from "../../src/services/workspace/store.js"

const directory = mkdtempSync(join(tmpdir(), "gscombat-startup-"))
const apiRoot = resolve(import.meta.dirname, "../..")
const tokenSecret = "  startup-integration-secret-preserve-original-value  "

function cliEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production", ...overrides }
  for (const key of ["INVITE_TOKEN_SECRET", "WORKSPACE_DATA_PATH", "GAME_DATA_PATH", "PORT"]) {
    if (!(key in overrides)) delete environment[key]
  }
  return environment
}

function runNode(arguments_: string[], environment: NodeJS.ProcessEnv) {
  return spawnSync(process.execPath, ["--import", "tsx", ...arguments_], {
    cwd: apiRoot,
    encoding: "utf8",
    env: cliEnvironment(environment),
    timeout: 20_000
  })
}

async function expectStartupFailure(options: BuildAppOptions, message: RegExp): Promise<void> {
  let app: ReturnType<typeof buildApp> | undefined
  try {
    expect(() => { app = buildApp(options) }).toThrow(message)
  } finally {
    await app?.close()
  }
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production")
  vi.stubEnv("INVITE_TOKEN_SECRET", undefined)
  vi.stubEnv("WORKSPACE_DATA_PATH", undefined)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

afterAll(() => {
  rmSync(directory, { force: true, recursive: true })
})

describe("production startup and resource ownership", () => {
  it("rejects invalid secrets before opening any database without exposing their values", async () => {
    const workspaceDataPath = join(directory, "must-not-exist.sqlite")
    const close = vi.spyOn(DatabaseSync.prototype, "close")
    for (const secret of [undefined, "", " ".repeat(40), "short-secret", "gscombat-development-token-secret-only",
      "replace-with-at-least-32-random-characters"]) {
      await expectStartupFailure({
        gameDataPath: join(directory, "missing-game-data.sqlite"),
        ...(secret === undefined ? {} : { inviteTokenSecret: secret }),
        workspaceDataPath
      }, /INVITE_TOKEN_SECRET/)
    }
    expect(existsSync(workspaceDataPath)).toBe(false)
    expect(close).not.toHaveBeenCalled()
  })

  it("rejects missing, temporary, and memory workspace paths without falling back to environment values", async () => {
    for (const path of [undefined, "", "   ", ":memory:", "file::memory:", "file:workspace?mode=memory"]) {
      await expectStartupFailure({
        inviteTokenSecret: tokenSecret,
        ...(path === undefined ? {} : { workspaceDataPath: path })
      }, /WORKSPACE_DATA_PATH/)
    }
    vi.stubEnv("INVITE_TOKEN_SECRET", tokenSecret)
    vi.stubEnv("WORKSPACE_DATA_PATH", join(directory, "environment.sqlite"))
    await expectStartupFailure({ inviteTokenSecret: "", workspaceDataPath: ":memory:" }, /INVITE_TOKEN_SECRET/)
    await expectStartupFailure({ workspaceDataPath: "" }, /WORKSPACE_DATA_PATH/)
    expect(existsSync(join(directory, "environment.sqlite"))).toBe(false)
  })

  it("preserves local development defaults and explicit memory workspaces", async () => {
    vi.stubEnv("NODE_ENV", "development")
    for (const options of [{}, { workspaceDataPath: ":memory:" }]) {
      const app = buildApp(options)
      try {
        expect((await app.inject({ method: "GET", url: "/health" })).statusCode).toBe(200)
      } finally {
        await app.close()
      }
    }
  })

  it("preserves original invite, cookie, document and revision across a production restart", async () => {
    const workspaceDataPath = join(directory, "persistent.sqlite")
    const store = new WorkspaceStore(workspaceDataPath, tokenSecret)
    const invite = store.createInvite("原有用户")
    const build = raidenNationalBuiltinScenario.primary
    const document: WorkspaceDocument = {
      builds: [build], party: { memberBuildIds: [build.buildId] }, schemaVersion: 1
    }
    store.updateWorkspace(invite.workspaceId, 0, document)
    store.close()

    vi.stubEnv("INVITE_TOKEN_SECRET", "invalid-environment-value")
    vi.stubEnv("WORKSPACE_DATA_PATH", ":memory:")
    const options = { inviteTokenSecret: tokenSecret, workspaceDataPath }
    const first = buildApp(options)
    let cookie = ""
    try {
      const login = await first.inject({ method: "POST", url: "/v1/session/invite", payload: { code: invite.code } })
      expect(login.statusCode).toBe(200)
      expect(login.headers["set-cookie"]).toContain("Secure")
      cookie = String(login.headers["set-cookie"]).split(";", 1)[0]!
    } finally {
      await first.close()
    }

    vi.stubEnv("INVITE_TOKEN_SECRET", tokenSecret)
    vi.stubEnv("WORKSPACE_DATA_PATH", workspaceDataPath)
    const second = buildApp()
    try {
      const response = await second.inject({ method: "GET", url: "/v1/workspace", headers: { cookie } })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ document, revision: 1 })
      const login = await second.inject({ method: "POST", url: "/v1/session/invite", payload: { code: invite.code } })
      expect(login.statusCode).toBe(200)
    } finally {
      await second.close()
    }
  })

  it("closes acquired resources when workspace opening or schema initialization fails", async () => {
    const gameDataClose = vi.spyOn(GameDataRepository.prototype, "close")
    await expectStartupFailure({
      inviteTokenSecret: tokenSecret,
      workspaceDataPath: join(directory, "nonexistent-parent", "workspace.sqlite")
    }, /unable to open database/)
    expect(gameDataClose).toHaveBeenCalledTimes(1)

    const malformedPath = join(directory, "incompatible-schema.sqlite")
    const database = new DatabaseSync(malformedPath)
    database.exec("CREATE TABLE invite_codes (id TEXT)")
    database.close()
    const databaseClose = vi.spyOn(DatabaseSync.prototype, "close")
    await expectStartupFailure({ inviteTokenSecret: tokenSecret, workspaceDataPath: malformedPath }, /workspace_id/)
    expect(gameDataClose).toHaveBeenCalledTimes(2)
    expect(databaseClose).toHaveBeenCalledTimes(2)
  })

  it("releases both databases after a later initialization error, preserving the original cause", async () => {
    const gameDataClose = vi.spyOn(GameDataRepository.prototype, "close")
    const originalClose = WorkspaceStore.prototype.close
    const workspaceClose = vi.spyOn(WorkspaceStore.prototype, "close").mockImplementationOnce(function (this: WorkspaceStore) {
      originalClose.call(this)
      throw new Error("secondary cleanup failure")
    })
    const cause = new Error("startup option initialization failed")
    const options: BuildAppOptions = {
      inviteTokenSecret: tokenSecret,
      workspaceDataPath: join(directory, "late-failure.sqlite"),
      get showcaseImporter(): never { throw cause }
    }
    expect(() => buildApp(options)).toThrow(cause)
    expect(gameDataClose).toHaveBeenCalledTimes(1)
    expect(workspaceClose).toHaveBeenCalledTimes(1)
  })

  it("keeps strict invite management in development and accepts only explicit persistent configuration", () => {
    const missing = runNode(["src/manage-invites.ts", "create", "local"], { NODE_ENV: "development" })
    expect(missing.status).not.toBe(0)
    expect(missing.stdout).toBe("")
    expect(missing.stderr).toMatch(/INVITE_TOKEN_SECRET|WORKSPACE_DATA_PATH/)
    for (const environment of [
      { INVITE_TOKEN_SECRET: tokenSecret, WORKSPACE_DATA_PATH: ":memory:" },
      { INVITE_TOKEN_SECRET: "replace-with-at-least-32-random-characters", WORKSPACE_DATA_PATH: join(directory, "bad-cli.sqlite") }
    ]) {
      const result = runNode(["src/manage-invites.ts", "create", "local"], { NODE_ENV: "development", ...environment })
      expect(result.status).not.toBe(0)
      expect(result.stdout).toBe("")
    }
    expect(existsSync(join(directory, "bad-cli.sqlite"))).toBe(false)

    const workspaceDataPath = join(directory, "cli.sqlite")
    const result = runNode(["src/manage-invites.ts", "create", "local"], {
      INVITE_TOKEN_SECRET: tokenSecret, WORKSPACE_DATA_PATH: workspaceDataPath
    })
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/label=local\ninvite_id=.+\ncode=YSIN-.+\n/)
    const code = result.stdout.match(/code=(.+)/)![1]!
    const store = new WorkspaceStore(workspaceDataPath, tokenSecret)
    try {
      expect(store.authenticateInvite(code)?.label).toBe("local")
    } finally {
      store.close()
    }
  })

  it("reports configuration errors on stderr and exits nonzero without printing secrets", () => {
    const result = runNode(["src/server.ts"], { INVITE_TOKEN_SECRET: "private-invalid-secret" })
    expect(result.status).not.toBe(0)
    expect(result.error).toBeUndefined()
    expect(result.stderr).toContain("INVITE_TOKEN_SECRET")
    expect(result.stderr).not.toContain("private-invalid-secret")
  })

  it("closes both databases and exits nonzero when the listening port is occupied", async () => {
    const occupied = createServer()
    await new Promise<void>((resolve, reject) => {
      occupied.once("error", reject)
      // Match the production bind address: macOS can allow loopback and wildcard listeners to coexist.
      occupied.listen(0, "0.0.0.0", resolve)
    })
    try {
      const address = occupied.address()
      if (!address || typeof address === "string") throw new Error("Expected a TCP address")
      const script = `
        import { DatabaseSync } from 'node:sqlite';
        const close = DatabaseSync.prototype.close;
        let closed = 0;
        DatabaseSync.prototype.close = function () { closed++; return close.call(this); };
        process.once('beforeExit', () => process.stderr.write('closed-databases=' + closed + '\\n'));
        await import('./src/server.ts');
      `
      const result = runNode(["--input-type=module", "--eval", script], {
        INVITE_TOKEN_SECRET: tokenSecret,
        PORT: String(address.port),
        WORKSPACE_DATA_PATH: join(directory, "port-failure.sqlite")
      })
      expect(result.status).toBe(1)
      expect(result.error).toBeUndefined()
      expect(result.stderr).toMatch(/EADDRINUSE|address already in use/)
      expect(result.stderr).toContain("closed-databases=2")
      expect(result.stderr).not.toContain(tokenSecret)
    } finally {
      await new Promise<void>((resolve, reject) => occupied.close(error => error ? reject(error) : resolve()))
    }
  })
})
