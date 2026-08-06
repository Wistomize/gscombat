import {
  ApiErrorResponseSchema,
  InviteLoginRequestSchema,
  LoggedOutResponseSchema,
  SessionLabelUpdateRequestSchema,
  SessionResponseSchema,
  WorkspaceResponseSchema,
  WorkspaceUpdateRequestSchema,
  type ApiErrorResponse,
  type InviteLoginRequest,
  type LoggedOutResponse,
  type SessionLabelUpdateRequest,
  type SessionResponse,
  type WorkspaceResponse,
  type WorkspaceUpdateRequest
} from "@gscombat/contracts"
import type { FastifyInstance, FastifyRequest } from "fastify"

import {
  createWorkspaceSessionToken,
  readWorkspaceSession,
  serializeWorkspaceSessionCookie,
  serializeWorkspaceSessionLogoutCookie
} from "../services/workspace/session.js"
import { WorkspaceStore, type WorkspaceInviteSession } from "../services/workspace/store.js"

interface LoginAttemptWindow {
  readonly count: number
  readonly resetsAt: number
}

export interface SessionWorkspaceRouteOptions {
  readonly secureSessionCookie: boolean
  readonly sessionLifetimeSeconds: number
  readonly tokenSecret: string
  readonly workspaceStore: WorkspaceStore
}

const LOGIN_ATTEMPT_LIMIT = 10
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000

function createInviteLoginLimiter() {
  const attempts = new Map<string, LoginAttemptWindow>()
  return {
    clear(key: string): void {
      attempts.delete(key)
    },
    recordFailure(key: string): void {
      const now = Date.now()
      const current = attempts.get(key)
      if (!current || current.resetsAt <= now) {
        attempts.set(key, { count: 1, resetsAt: now + LOGIN_ATTEMPT_WINDOW_MS })
        return
      }
      attempts.set(key, { count: current.count + 1, resetsAt: current.resetsAt })
    },
    shouldAllow(key: string): boolean {
      const current = attempts.get(key)
      if (!current) return true
      if (current.resetsAt <= Date.now()) {
        attempts.delete(key)
        return true
      }
      return current.count < LOGIN_ATTEMPT_LIMIT
    }
  }
}

/** Registers invite-session and revisioned workspace routes. */
export function registerSessionWorkspaceRoutes(
  app: FastifyInstance,
  options: SessionWorkspaceRouteOptions
): void {
  const loginLimiter = createInviteLoginLimiter()
  const getWorkspaceSession = (request: FastifyRequest): WorkspaceInviteSession | undefined => {
    const claims = readWorkspaceSession(request.headers.cookie, options.tokenSecret)
    return claims
      ? options.workspaceStore.getActiveInvite(claims.inviteId, claims.workspaceId)
      : undefined
  }

  app.post<{ Body: InviteLoginRequest; Reply: ApiErrorResponse | SessionResponse }>(
    "/v1/session/invite",
    {
      schema: {
        body: InviteLoginRequestSchema,
        response: {
          200: SessionResponseSchema,
          401: ApiErrorResponseSchema,
          429: ApiErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      if (!loginLimiter.shouldAllow(request.ip)) {
        return reply.code(429).send({ code: "invite_rate_limited", message: "邀请码尝试过多，请稍后再试" })
      }

      const invite = options.workspaceStore.authenticateInvite(request.body.code)
      if (!invite) {
        loginLimiter.recordFailure(request.ip)
        return reply.code(401).send({ code: "invalid_invite", message: "邀请码无效或已停用" })
      }

      loginLimiter.clear(request.ip)
      const token = createWorkspaceSessionToken(
        invite.inviteId,
        invite.workspaceId,
        options.tokenSecret,
        options.sessionLifetimeSeconds
      )
      reply.header(
        "Set-Cookie",
        serializeWorkspaceSessionCookie(token, options.sessionLifetimeSeconds, options.secureSessionCookie)
      )
      return { authenticated: true, label: invite.label }
    }
  )

  app.get<{ Reply: ApiErrorResponse | SessionResponse }>(
    "/v1/session",
    {
      schema: {
        response: { 200: SessionResponseSchema, 401: ApiErrorResponseSchema }
      }
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      const session = getWorkspaceSession(request)
      if (!session) return reply.code(401).send({ code: "session_required", message: "请先输入邀请码" })
      return { authenticated: true, label: session.label }
    }
  )

  app.patch<{ Body: SessionLabelUpdateRequest; Reply: ApiErrorResponse | SessionResponse }>(
    "/v1/session/label",
    {
      schema: {
        body: SessionLabelUpdateRequestSchema,
        response: {
          200: SessionResponseSchema,
          400: ApiErrorResponseSchema,
          401: ApiErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      const session = getWorkspaceSession(request)
      if (!session) return reply.code(401).send({ code: "session_required", message: "邀请码会话已失效" })

      const label = request.body.label.trim()
      if (!label) return reply.code(400).send({ code: "nickname_invalid", message: "昵称不能为空" })

      const updated = options.workspaceStore.updateInviteLabel(session.inviteId, session.workspaceId, label)
      if (!updated) return reply.code(401).send({ code: "session_required", message: "邀请码会话已失效" })
      return { authenticated: true, label: updated.label }
    }
  )

  app.post<{ Reply: LoggedOutResponse }>(
    "/v1/session/logout",
    {
      schema: {
        response: { 200: LoggedOutResponseSchema }
      }
    },
    async (_request, reply) => {
      reply.header("Cache-Control", "no-store")
      reply.header("Set-Cookie", serializeWorkspaceSessionLogoutCookie(options.secureSessionCookie))
      return { authenticated: false }
    }
  )

  app.get<{ Reply: ApiErrorResponse | WorkspaceResponse }>(
    "/v1/workspace",
    {
      schema: {
        response: { 200: WorkspaceResponseSchema, 401: ApiErrorResponseSchema }
      }
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      const session = getWorkspaceSession(request)
      if (!session) return reply.code(401).send({ code: "session_required", message: "邀请码会话已失效" })
      const workspace = options.workspaceStore.getWorkspace(session.workspaceId)
      if (!workspace) return reply.code(401).send({ code: "workspace_missing", message: "工作空间不存在" })
      return workspace
    }
  )

  app.put<{ Body: WorkspaceUpdateRequest; Reply: ApiErrorResponse | WorkspaceResponse }>(
    "/v1/workspace",
    {
      bodyLimit: 2 * 1024 * 1024,
      schema: {
        body: WorkspaceUpdateRequestSchema,
        response: {
          200: WorkspaceResponseSchema,
          401: ApiErrorResponseSchema,
          409: ApiErrorResponseSchema
        }
      }
    },
    async (request, reply) => {
      reply.header("Cache-Control", "no-store")
      const session = getWorkspaceSession(request)
      if (!session) return reply.code(401).send({ code: "session_required", message: "邀请码会话已失效" })
      const updated = options.workspaceStore.updateWorkspace(
        session.workspaceId,
        request.body.expectedRevision,
        request.body.document
      )
      if (!updated) {
        return reply.code(409).send({
          code: "workspace_revision_conflict",
          message: "云端配置已被其他设备更新，请重新载入"
        })
      }
      return updated
    }
  )
}
