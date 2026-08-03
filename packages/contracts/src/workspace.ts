import Type from "typebox"

import { CharacterBuildSchema } from "./builds.js"

export const WorkspacePartySchema = Type.Object({
  memberBuildIds: Type.Array(Type.String({ maxLength: 100, minLength: 1 }), { maxItems: 4 })
})

export type WorkspaceParty = Type.Static<typeof WorkspacePartySchema>

export const WorkspaceDocumentSchema = Type.Object({
  builds: Type.Array(CharacterBuildSchema, { maxItems: 500 }),
  party: WorkspacePartySchema,
  schemaVersion: Type.Literal(1)
})

export type WorkspaceDocument = Type.Static<typeof WorkspaceDocumentSchema>

export const InviteLoginRequestSchema = Type.Object({
  code: Type.String({ maxLength: 128, minLength: 16 })
})

export type InviteLoginRequest = Type.Static<typeof InviteLoginRequestSchema>

export const SessionResponseSchema = Type.Object({
  authenticated: Type.Literal(true),
  label: Type.String({ maxLength: 80, minLength: 1 })
})

export type SessionResponse = Type.Static<typeof SessionResponseSchema>

export const LoggedOutResponseSchema = Type.Object({
  authenticated: Type.Literal(false)
})

export type LoggedOutResponse = Type.Static<typeof LoggedOutResponseSchema>

export const WorkspaceResponseSchema = Type.Object({
  document: WorkspaceDocumentSchema,
  revision: Type.Integer({ minimum: 0 })
})

export type WorkspaceResponse = Type.Static<typeof WorkspaceResponseSchema>

export const WorkspaceUpdateRequestSchema = Type.Object({
  document: WorkspaceDocumentSchema,
  expectedRevision: Type.Integer({ minimum: 0 })
})

export type WorkspaceUpdateRequest = Type.Static<typeof WorkspaceUpdateRequestSchema>

export const ApiErrorResponseSchema = Type.Object({
  code: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 })
})

export type ApiErrorResponse = Type.Static<typeof ApiErrorResponseSchema>
