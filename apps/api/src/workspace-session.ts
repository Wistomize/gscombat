import { createHmac, timingSafeEqual } from "node:crypto"

export const WORKSPACE_SESSION_COOKIE = "project_b_session"

export interface WorkspaceSessionClaims {
  readonly expiresAt: number
  readonly inviteId: string
  readonly workspaceId: string
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

function findCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=")
    if (separator < 0) continue
    if (pair.slice(0, separator).trim() === name) return pair.slice(separator + 1).trim()
  }
  return undefined
}

/** Creates one signed, expiring workspace session token. */
export function createWorkspaceSessionToken(
  inviteId: string,
  workspaceId: string,
  secret: string,
  lifetimeSeconds: number
): string {
  const claims: WorkspaceSessionClaims = {
    expiresAt: Math.floor(Date.now() / 1000) + lifetimeSeconds,
    inviteId,
    workspaceId
  }
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url")
  return `${payload}.${sign(payload, secret)}`
}

/** Verifies and decodes the workspace session stored in a Cookie header. */
export function readWorkspaceSession(
  cookieHeader: string | undefined,
  secret: string
): WorkspaceSessionClaims | undefined {
  const token = findCookie(cookieHeader, WORKSPACE_SESSION_COOKIE)
  if (!token) return undefined
  const [payload, signature, extra] = token.split(".")
  if (!payload || !signature || extra) return undefined

  const actual = Buffer.from(signature)
  const expected = Buffer.from(sign(payload, secret))
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return undefined

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<WorkspaceSessionClaims>
    if (
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.inviteId !== "string" ||
      typeof parsed.workspaceId !== "string" ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) return undefined
    return { expiresAt: parsed.expiresAt, inviteId: parsed.inviteId, workspaceId: parsed.workspaceId }
  } catch {
    return undefined
  }
}

/** Serializes a secure HTTP-only workspace session cookie. */
export function serializeWorkspaceSessionCookie(token: string, lifetimeSeconds: number, secure: boolean): string {
  const secureAttribute = secure ? "; Secure" : ""
  return `${WORKSPACE_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${lifetimeSeconds}${secureAttribute}`
}

/** Expires the current workspace session cookie immediately. */
export function serializeWorkspaceSessionLogoutCookie(secure: boolean): string {
  const secureAttribute = secure ? "; Secure" : ""
  return `${WORKSPACE_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute}`
}
