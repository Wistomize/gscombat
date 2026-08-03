import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { WorkspaceDocument, WorkspaceResponse } from "@gscombat/contracts"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"
import { WorkspaceStore, type CreatedWorkspaceInvite } from "./workspace-store.js"

const tokenSecret = "workspace-sync-test-token-secret-with-sufficient-length"
const temporaryDirectory = mkdtempSync(join(tmpdir(), "project-b-workspace-sync-"))
const databasePath = join(temporaryDirectory, "workspaces.sqlite")

let firstInvite: CreatedWorkspaceInvite
let secondInvite: CreatedWorkspaceInvite

const setupStore = new WorkspaceStore(databasePath, tokenSecret)
try {
  firstInvite = setupStore.createInvite("朋友一号")
  secondInvite = setupStore.createInvite("朋友二号")
} finally {
  setupStore.close()
}

const app = buildApp({
  inviteTokenSecret: tokenSecret,
  secureSessionCookie: false,
  workspaceDataPath: databasePath
})

function sessionCookie(setCookieHeader: string | string[] | undefined): string {
  const header = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
  if (!header) throw new Error("Login response did not set a session cookie")
  return header.split(";", 1)[0] ?? ""
}

async function login(code: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    payload: { code },
    url: "/v1/session/invite"
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({ authenticated: true, label: code === firstInvite.code ? "朋友一号" : "朋友二号" })
  expect(response.headers["set-cookie"]).toContain("HttpOnly")
  expect(response.headers["set-cookie"]).toContain("SameSite=Lax")
  return sessionCookie(response.headers["set-cookie"])
}

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
  rmSync(temporaryDirectory, { force: true, recursive: true })
})

describe("invite-scoped workspace sync", () => {
  it("isolates workspaces, synchronizes one invite across devices, and rejects stale revisions", async () => {
    const anonymous = await app.inject({ method: "GET", url: "/v1/workspace" })
    expect(anonymous.statusCode).toBe(401)
    expect(anonymous.json()).toMatchObject({ code: "session_required" })

    const invalid = await app.inject({
      method: "POST",
      payload: { code: "YSIN-invalid-invitation-code" },
      url: "/v1/session/invite"
    })
    expect(invalid.statusCode).toBe(401)
    expect(invalid.json()).toMatchObject({ code: "invalid_invite" })

    const firstDeviceCookie = await login(firstInvite.code)
    const initial = await app.inject({
      headers: { cookie: firstDeviceCookie },
      method: "GET",
      url: "/v1/workspace"
    })
    expect(initial.statusCode).toBe(200)
    expect(initial.json()).toEqual({
      document: { builds: [], party: { memberBuildIds: [] }, schemaVersion: 1 },
      revision: 0
    })

    const document: WorkspaceDocument = {
      builds: [raidenNationalBuiltinScenario.primary, ...raidenNationalBuiltinScenario.teammates],
      party: {
        memberBuildIds: [
          raidenNationalBuiltinScenario.primary.buildId,
          raidenNationalBuiltinScenario.teammates[0]!.buildId
        ]
      },
      schemaVersion: 1
    }
    const saved = await app.inject({
      headers: { cookie: firstDeviceCookie },
      method: "PUT",
      payload: { document, expectedRevision: 0 },
      url: "/v1/workspace"
    })
    expect(saved.statusCode).toBe(200)
    expect((saved.json() as WorkspaceResponse).revision).toBe(1)

    const stale = await app.inject({
      headers: { cookie: firstDeviceCookie },
      method: "PUT",
      payload: { document, expectedRevision: 0 },
      url: "/v1/workspace"
    })
    expect(stale.statusCode).toBe(409)
    expect(stale.json()).toMatchObject({ code: "workspace_revision_conflict" })

    const secondDeviceCookie = await login(firstInvite.code)
    const synchronized = await app.inject({
      headers: { cookie: secondDeviceCookie },
      method: "GET",
      url: "/v1/workspace"
    })
    expect(synchronized.statusCode).toBe(200)
    expect(synchronized.json()).toEqual({ document, revision: 1 })

    const isolatedCookie = await login(secondInvite.code)
    const isolated = await app.inject({
      headers: { cookie: isolatedCookie },
      method: "GET",
      url: "/v1/workspace"
    })
    expect(isolated.statusCode).toBe(200)
    expect(isolated.json()).toEqual({
      document: { builds: [], party: { memberBuildIds: [] }, schemaVersion: 1 },
      revision: 0
    })
  })

  it("invalidates an existing signed session after its invitation is revoked", async () => {
    const cookie = await login(secondInvite.code)
    const administrationStore = new WorkspaceStore(databasePath, tokenSecret)
    try {
      expect(administrationStore.revokeInvite(secondInvite.inviteId)).toBe(true)
    } finally {
      administrationStore.close()
    }

    const response = await app.inject({ headers: { cookie }, method: "GET", url: "/v1/workspace" })
    expect(response.statusCode).toBe(401)
  })
})
