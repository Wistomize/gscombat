import {
  analyzeScenario,
  createCombatAuthoringAuditReport,
  createCombatCoverageReport,
  evaluateCombatMetric,
  evaluateScenario,
  type CombatMetricEvaluation,
  type CombatMetricFormula,
  raidenNationalBuiltinScenario
} from "@gscombat/analyzer"
import {
  evaluateExpectedDamage,
  type RotationEventResult,
  type RotationTraceEntry
} from "@gscombat/calculator"
import {
  createRaidenNationalFoundationInput,
  getCombatActionDefinition,
  getCombatMetricDefinition,
  listActiveScenarioEffectOptionsForAction,
  normalizeProjectedMetricLabel,
  type CombatActionMetadata,
  type CombatDamagePart,
  type CombatElementOverrideEffect,
  type CombatMetricDefinition,
  type MultiScalingCombatDamagePart,
  supportedArtifactSets,
  supportedBuffPresets,
  supportedCharacters,
  supportedWeapons
} from "@gscombat/content"
import {
  AnalysisRequestSchema,
  AnalysisResponseSchema,
  ApiErrorResponseSchema,
  CatalogResponseSchema,
  CombatAuthoringAuditReportSchema,
  CombatCoverageReportSchema,
  EvaluationRequestSchema,
  EvaluationResponseSchema,
  GameDataStatusResponseSchema,
  HealthResponseSchema,
  InviteLoginRequestSchema,
  LoggedOutResponseSchema,
  PresetsResponseSchema,
  ShowcaseImportRequestSchema,
  ShowcaseImportResponseSchema,
  SessionResponseSchema,
  SessionLabelUpdateRequestSchema,
  SupportMetricEvaluationRequestSchema,
  SupportMetricEvaluationResponseSchema,
  WorkspaceResponseSchema,
  WorkspaceUpdateRequestSchema,
  type AnalysisRequest,
  type AnalysisResponse,
  type ApiErrorResponse,
  type CatalogResponse,
  type CombatAuthoringAuditReport,
  type CombatCoverageReport,
  type EvaluationRequest,
  type EvaluationResponse,
  type GameDataStatusResponse,
  type HealthResponse,
  type InviteLoginRequest,
  type LoggedOutResponse,
  type PresetsResponse,
  type ShowcaseImportRequest,
  type ShowcaseImportResponse,
  type SessionResponse,
  type SessionLabelUpdateRequest,
  type SupportMetricEvaluationRequest,
  type SupportMetricEvaluationResponse,
  type SupportMetricFormula,
  type SupportMetricResult,
  type WorkspaceResponse,
  type WorkspaceUpdateRequest
} from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify"

import { EnkaShowcaseClient, type ShowcaseImporter } from "./showcase.js"
import {
  createWorkspaceSessionToken,
  readWorkspaceSession,
  serializeWorkspaceSessionCookie,
  serializeWorkspaceSessionLogoutCookie
} from "./workspace-session.js"
import { WorkspaceStore, type WorkspaceInviteSession } from "./workspace-store.js"

export interface BuildAppOptions {
  readonly gameDataPath?: string
  readonly inviteTokenSecret?: string
  readonly secureSessionCookie?: boolean
  readonly sessionLifetimeSeconds?: number
  readonly showcaseImporter?: ShowcaseImporter
  readonly trustProxy?: boolean
  readonly workspaceDataPath?: string
}

interface LoginAttemptWindow {
  readonly count: number
  readonly resetsAt: number
}

const DEVELOPMENT_TOKEN_SECRET = "gscombat-development-token-secret-only"
const LOGIN_ATTEMPT_LIMIT = 10
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000

function resolveTokenSecret(options: BuildAppOptions): string {
  const secret = options.inviteTokenSecret ?? process.env.INVITE_TOKEN_SECRET ?? DEVELOPMENT_TOKEN_SECRET
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("INVITE_TOKEN_SECRET must contain at least 32 characters in production")
  }
  return secret
}

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

function hasMultipleScalingTerms(part: CombatDamagePart): part is MultiScalingCombatDamagePart {
  return part.scalingTerms !== undefined
}

function serializeRotationTraceEntry(trace: RotationTraceEntry) {
  if (trace.kind !== "scaling_terms") return { ...trace }
  return { ...trace, terms: trace.terms.map((term) => ({ ...term })) }
}

/** Projects an internal rotation event into a JSON-safe analysis response with its event-level formula trace. */
export function serializeRotationEvent(event: RotationEventResult) {
  const { appliedEffectIds, elementalApplication, elementOverride, trace, ...baseEvent } = event
  return {
    ...baseEvent,
    appliedEffectIds: [...appliedEffectIds],
    ...(elementalApplication ? { elementalApplication: { ...elementalApplication } } : {}),
    ...(elementOverride ? { elementOverride: { ...elementOverride } } : {}),
    trace: trace.map(serializeRotationTraceEntry)
  }
}

/** Copies one non-damage metric formula tree into a mutable, JSON-safe response value. */
function serializeSupportMetricFormula(formula: CombatMetricFormula): SupportMetricFormula {
  if (formula.kind === "rotation_events") {
    throw new Error("Support metric responses cannot contain a damage rotation formula")
  }
  if (formula.kind === "term") return { ...formula }
  if (formula.kind === "condition") {
    return {
      ...formula,
      condition: { ...formula.condition },
      operand: serializeSupportMetricFormula(formula.operand)
    }
  }
  if (formula.kind === "maximum" || formula.kind === "minimum") {
    return {
      ...formula,
      operands: [serializeSupportMetricFormula(formula.operands[0]), serializeSupportMetricFormula(formula.operands[1])]
    }
  }
  return { ...formula, operands: formula.operands.map(serializeSupportMetricFormula) }
}

/** Copies a verified non-damage metric evaluation into its stable public response representation. */
function serializeSupportMetricResult(metric: Exclude<CombatMetricEvaluation, { readonly kind: "damage" }>): SupportMetricResult {
  const conditions = metric.conditions.map((condition) => ({ ...condition }))
  const formula = serializeSupportMetricFormula(metric.formula)
  if (metric.kind === "healing") {
    const {
      actualRestoredFormula,
      actualRestoredValue,
      conditions: _conditions,
      formula: _formula,
      missingHp,
      recipient,
      ...baseMetric
    } = metric
    return {
      ...baseMetric,
      ...(actualRestoredFormula === undefined ? {} : { actualRestoredFormula: serializeSupportMetricFormula(actualRestoredFormula) }),
      ...(actualRestoredValue === undefined ? {} : { actualRestoredValue }),
      ...(missingHp === undefined ? {} : { missingHp }),
      conditions,
      formula,
      recipient: { ...recipient }
    }
  }
  if (metric.kind === "stat_buff") {
    const { conditions: _conditions, formula: _formula, recipient, ...baseMetric } = metric
    return { ...baseMetric, conditions, formula, recipient: { ...recipient } }
  }
  const {
    affectedElement,
    appliesTo,
    conditions: _conditions,
    formula: _formula,
    maximumValue,
    scalingStat,
    scalingValue,
    target,
    ...baseMetric
  } = metric
  return {
    ...baseMetric,
    ...(affectedElement === undefined ? {} : { affectedElement }),
    ...(appliesTo === undefined ? {} : { appliesTo: [...appliesTo] }),
    ...(maximumValue === undefined ? {} : { maximumValue }),
    ...(scalingStat === undefined ? {} : { scalingStat }),
    ...(scalingValue === undefined ? {} : { scalingValue }),
    conditions,
    formula,
    target: { ...target }
  }
}

/** Projects immutable combat content into mutable JSON-safe coverage response data. */
export function serializeCombatAction(
  action: CombatActionMetadata
): CombatCoverageReport["characters"][number]["actions"][number] {
  const {
    damageParts,
    intrinsicEffects,
    parameterReferences,
    scenarioParameters,
    timeline,
    ...baseAction
  } = action
  return {
    ...baseAction,
    ...(damageParts
      ? {
          damageParts: damageParts.map((part) => {
            if (hasMultipleScalingTerms(part)) {
              return {
                id: part.id,
                scalingTerms: part.scalingTerms.map(({ snapshotChecks: _snapshotChecks, ...term }) => ({ ...term }))
              }
            }
            const { snapshotChecks: _snapshotChecks, ...serializedPart } = part
            return { ...serializedPart }
          })
        }
      : {}),
    ...(intrinsicEffects ? { intrinsicEffects: intrinsicEffects.map(serializeCombatIntrinsicEffect) } : {}),
    ...(timeline
      ? {
          timeline: {
            damageEvents: timeline.damageEvents.map(({ coefficientMultiplier, elementalApplication, ...event }) => ({
              ...event,
              ...(coefficientMultiplier
                ? {
                    coefficientMultiplier:
                      coefficientMultiplier.kind === "scenario_parameter_lookup"
                        ? {
                            ...coefficientMultiplier,
                            values: coefficientMultiplier.values.map((value) => ({ ...value }))
                          }
                        : {
                            base: coefficientMultiplier.base,
                            kind: coefficientMultiplier.kind,
                            parameterId: coefficientMultiplier.parameterId,
                            perParameterTalentCoefficientId: coefficientMultiplier.perParameterTalentCoefficientId
                          }
                  }
                : {}),
              ...(elementalApplication
                ? {
                    elementalApplication: {
                      ...elementalApplication,
                      icd: { ...elementalApplication.icd }
                    }
                  }
                : {})
            })),
            duration: timeline.duration
          }
        }
      : {}),
    ...(parameterReferences
      ? {
          parameterReferences: parameterReferences.map((reference) =>
            reference.source === "raw" ? { ...reference, path: [...reference.path] } : { ...reference }
          )
        }
      : {}),
    ...(scenarioParameters
      ? {
          scenarioParameters: scenarioParameters.map(({
            allowedValues,
            maximumValueByParameter,
            rangeBySourceConstellation,
            ...parameter
          }) => ({
            ...parameter,
            ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
            ...(maximumValueByParameter
              ? {
                  maximumValueByParameter: {
                    ...maximumValueByParameter,
                    values: maximumValueByParameter.values.map((value) => ({ ...value }))
                  }
                }
              : {}),
            ...(rangeBySourceConstellation
              ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
              : {})
          }))
        }
      : {})
  }
}

/** Copies one action-owned intrinsic effect into the mutable JSON coverage response. */
function serializeCombatIntrinsicEffect(
  effect: NonNullable<CombatActionMetadata["intrinsicEffects"]>[number]
) {
  if (effect.kind === "flat") {
    const { scenarioParameterMultiplier, snapshotChecks, ...baseEffect } = effect
    return {
      ...baseEffect,
      ...(snapshotChecks ? { snapshotChecks: snapshotChecks.map((check) => ({ ...check })) } : {}),
      ...(scenarioParameterMultiplier
        ? { scenarioParameterMultiplier: serializeCombatIntrinsicEffectScenarioMultiplier(scenarioParameterMultiplier) }
        : {})
    }
  }
  const {
    maximumValueSnapshotChecks,
    scenarioParameterMultiplier,
    snapshotChecks,
    sourceStatMaximumSnapshotChecks,
    sourceStatOffsetSnapshotChecks,
    ...baseEffect
  } = effect
  return {
    ...baseEffect,
    ...(snapshotChecks ? { snapshotChecks: snapshotChecks.map((check) => ({ ...check })) } : {}),
    ...(maximumValueSnapshotChecks
      ? { maximumValueSnapshotChecks: maximumValueSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(sourceStatMaximumSnapshotChecks
      ? { sourceStatMaximumSnapshotChecks: sourceStatMaximumSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(sourceStatOffsetSnapshotChecks
      ? { sourceStatOffsetSnapshotChecks: sourceStatOffsetSnapshotChecks.map((check) => ({ ...check })) }
      : {}),
    ...(scenarioParameterMultiplier
      ? { scenarioParameterMultiplier: serializeCombatIntrinsicEffectScenarioMultiplier(scenarioParameterMultiplier) }
      : {})
  }
}

/** Copies one action-owned scenario multiplier into the mutable JSON coverage response. */
function serializeCombatIntrinsicEffectScenarioMultiplier(
  multiplier: NonNullable<NonNullable<CombatActionMetadata["intrinsicEffects"]>[number]["scenarioParameterMultiplier"]>
) {
  if (!("values" in multiplier)) return { ...multiplier }
  return { ...multiplier, values: multiplier.values.map((value) => ({ ...value })) }
}

/** Copies one content-owned elemental override effect into the mutable JSON API response. */
export function serializeCombatElementOverrideEffect(effect: CombatElementOverrideEffect) {
  return {
    ...effect,
    durationChecks: effect.durationChecks.map((check) => ({ ...check })),
    durationParameter: { ...effect.durationParameter },
    eligibleWeaponTypes: [...effect.eligibleWeaponTypes]
  }
}

/** Projects a content-owned metric declaration into the stable public selection catalog. */
export function serializeCombatMetric(
  metric: CombatMetricDefinition
): CombatCoverageReport["characters"][number]["metrics"][number] {
  return {
    id: metric.id,
    kind: metric.kind,
    label: normalizeProjectedMetricLabel(metric.label),
    sourceActionId: metric.sourceActionId,
    status: metric.status,
    target: metric.target
  }
}

/** Build an API instance without opening a socket so callers can test or deploy it. */
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
  const loginLimiter = createInviteLoginLimiter()

  const getWorkspaceSession = (request: FastifyRequest): WorkspaceInviteSession | undefined => {
    const claims = readWorkspaceSession(request.headers.cookie, tokenSecret)
    return claims ? workspaceStore.getActiveInvite(claims.inviteId, claims.workspaceId) : undefined
  }

  app.addHook("onClose", async () => {
    workspaceStore.close()
    gameData.close()
  })

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

      const invite = workspaceStore.authenticateInvite(request.body.code)
      if (!invite) {
        loginLimiter.recordFailure(request.ip)
        return reply.code(401).send({ code: "invalid_invite", message: "邀请码无效或已停用" })
      }

      loginLimiter.clear(request.ip)
      const token = createWorkspaceSessionToken(
        invite.inviteId,
        invite.workspaceId,
        tokenSecret,
        sessionLifetimeSeconds
      )
      reply.header(
        "Set-Cookie",
        serializeWorkspaceSessionCookie(token, sessionLifetimeSeconds, secureSessionCookie)
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

      const updated = workspaceStore.updateInviteLabel(session.inviteId, session.workspaceId, label)
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
      reply.header("Set-Cookie", serializeWorkspaceSessionLogoutCookie(secureSessionCookie))
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
      const workspace = workspaceStore.getWorkspace(session.workspaceId)
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
      const updated = workspaceStore.updateWorkspace(
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

  app.get<{ Reply: HealthResponse }>(
    "/health",
    {
      schema: {
        response: { 200: HealthResponseSchema }
      }
    },
    async () => ({ status: "ok" })
  )

  app.get<{ Reply: GameDataStatusResponse }>(
    "/v1/game-data/status",
    {
      schema: {
        response: { 200: GameDataStatusResponseSchema }
      }
    },
    async () => {
      const manifest = gameData.getManifest()
      return {
        counts: gameData.getCounts(),
        gameVersion: manifest.gameVersion,
        schemaVersion: manifest.schemaVersion,
        upstreamCommit: manifest.upstreamCommit
      }
    }
  )

  app.get<{ Reply: CatalogResponse }>(
    "/v1/catalog",
    {
      schema: {
        response: { 200: CatalogResponseSchema }
      }
    },
    async () => ({
      artifactSets: [...supportedArtifactSets],
      buffPresets: supportedBuffPresets.map((preset) => ({ ...preset, buffs: [...preset.buffs] })),
      characters: supportedCharacters.map((character) => ({
        ...character,
        primaryActions: character.primaryActions.map(({ scenarioParameters, ...action }) => {
          const combatAction = getCombatActionDefinition(action.id)
          const scenarioEffects = combatAction
            ? listActiveScenarioEffectOptionsForAction(combatAction, character.weaponType)
            : []
          return {
            ...action,
            ...(scenarioEffects.length > 0 ? { scenarioEffects: [...scenarioEffects] } : {}),
            ...(scenarioParameters
              ? {
                  scenarioParameters: scenarioParameters.map(({
                    allowedValues,
                    maximumValueByParameter,
                    rangeBySourceConstellation,
                    ...parameter
                  }) => ({
                    ...parameter,
                    ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
                    ...(maximumValueByParameter
                      ? {
                          maximumValueByParameter: {
                            parameterId: maximumValueByParameter.parameterId,
                            values: maximumValueByParameter.values.map((value) => ({ ...value }))
                          }
                        }
                      : {}),
                    ...(rangeBySourceConstellation
                      ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
                      : {})
                  }))
                }
              : {})
          }
        }),
        primaryActionIds: [...character.primaryActionIds],
        supportMetrics: character.supportMetrics.map(
          ({ conditionalRecipientRequirements, recipientRequirements, scenarioParameters, sourceHpRequirements, ...metric }) => ({
            ...metric,
            ...(conditionalRecipientRequirements
              ? {
                  conditionalRecipientRequirements: conditionalRecipientRequirements.map((condition) => ({
                    ...condition,
                    requirement: { ...condition.requirement }
                  }))
                }
              : {}),
            ...(recipientRequirements ? { recipientRequirements: recipientRequirements.map((requirement) => ({ ...requirement })) } : {}),
            ...(scenarioParameters
              ? {
                  scenarioParameters: scenarioParameters.map(({
                    allowedValues,
                    maximumValueByParameter,
                    rangeBySourceConstellation,
                    ...parameter
                  }) => ({
                    ...parameter,
                    ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
                    ...(maximumValueByParameter
                      ? {
                          maximumValueByParameter: {
                            parameterId: maximumValueByParameter.parameterId,
                            values: maximumValueByParameter.values.map((value) => ({ ...value }))
                          }
                        }
                      : {}),
                    ...(rangeBySourceConstellation
                      ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
                      : {})
                  }))
                }
              : {}),
            ...(sourceHpRequirements ? { sourceHpRequirements: sourceHpRequirements.map((requirement) => ({ ...requirement })) } : {})
          })
        )
      })),
      weapons: [...supportedWeapons]
    })
  )

  app.get<{ Reply: CombatCoverageReport }>(
    "/v1/combat-coverage",
    {
      schema: {
        response: { 200: CombatCoverageReportSchema }
      }
    },
    async () => {
      const report = createCombatCoverageReport(gameData)
      return {
        characterStatusCounts: { ...report.characterStatusCounts },
        characters: report.characters.map((character) => ({
          ...character,
          actions: character.actions.map(serializeCombatAction),
          effects: character.effects.map(serializeCombatElementOverrideEffect),
          metrics: character.metrics.map(serializeCombatMetric),
          parameterGroups: [...character.parameterGroups]
        })),
        totalCharacters: report.totalCharacters,
        verifiedActionCount: report.verifiedActionCount,
        verifiedMetricCount: report.verifiedMetricCount
      }
    }
  )

  app.get<{ Reply: CombatAuthoringAuditReport }>(
    "/v1/combat-authoring/audit",
    {
      schema: {
        response: { 200: CombatAuthoringAuditReportSchema }
      }
    },
    async () => {
      const report = createCombatAuthoringAuditReport(gameData)
      return {
        characters: report.characters.map((character) => ({
          ...character,
          candidateTalentParameterOwners: character.candidateTalentParameterOwners.map((owner) => ({
            ...owner,
            coreTalentGroups: { ...owner.coreTalentGroups }
          })),
          declaredActionIds: [...character.declaredActionIds],
          inherentBaseStats: { ...character.inherentBaseStats }
        })),
        readinessCounts: { ...report.readinessCounts },
        totalStaticCharacters: report.totalStaticCharacters,
        unboundTalentParameterOwnerIds: [...report.unboundTalentParameterOwnerIds]
      }
    }
  )

  app.post<{ Body: EvaluationRequest; Reply: EvaluationResponse }>(
    "/v1/evaluations",
    {
      schema: {
        body: EvaluationRequestSchema,
        response: { 200: EvaluationResponseSchema }
      }
    },
    async (request) => {
      const options =
        request.body.additionalAttackPercent === undefined
          ? {}
          : { additionalAttackPercent: request.body.additionalAttackPercent }
      const fixture = createRaidenNationalFoundationInput(options)
      const result = evaluateExpectedDamage(fixture.input)

      return {
        contentVersion: fixture.metadata.version,
        engineVersion: "foundation-1",
        presetVersion: fixture.metadata.version,
        result: {
          ...result,
          trace: [...result.trace]
        }
      }
    }
  )

  app.get<{ Reply: PresetsResponse }>(
    "/v1/presets",
    {
      schema: {
        response: { 200: PresetsResponseSchema }
      }
    },
    async () => ({
      presets: [
        {
          description: "雷神 C2 薙草，班尼特宗室、香菱与行秋；满愿力、雷眼和班尼特领域均开启。",
          id: "raiden-national.initial-slash",
          label: "雷神国家队 · 梦想一刀",
          scenario: raidenNationalBuiltinScenario
        }
      ]
    })
  )

  app.post<{ Body: AnalysisRequest; Reply: AnalysisResponse }>(
    "/v1/analysis",
    {
      schema: {
        body: AnalysisRequestSchema,
        response: { 200: AnalysisResponseSchema }
      }
    },
    async (request) => {
      const evaluation = evaluateScenario(request.body, gameData)
      const analysis = analyzeScenario(request.body, gameData, {
        ...(request.body.weaponComparisonRefinements === undefined
          ? {}
          : { weaponComparisonRefinements: request.body.weaponComparisonRefinements })
      })
      const { scalingTerms, statContributions, ...resolvedStats } = evaluation.stats
      return {
        analysis: {
          ...analysis,
          effectiveArtifacts: [...analysis.effectiveArtifacts],
          marginalSubstats: [...analysis.marginalSubstats],
          progressionGains: [...analysis.progressionGains],
          weapons: [...analysis.weapons]
        },
        engineVersion: "scenario-1",
        evaluation: {
          appliedEffects: [...evaluation.appliedEffects],
          appliedBuffs: [...evaluation.appliedBuffs],
          formulaAuthority: "rotation_events",
          result: { ...evaluation.result, trace: [...evaluation.result.trace] },
          rotation: {
            dpr: evaluation.rotation.dpr,
            dps: evaluation.rotation.dps,
            duration: evaluation.rotation.duration,
            events: evaluation.rotation.events.map(serializeRotationEvent)
          },
          teamState: {
            activeResonanceIds: [...evaluation.teamState.activeResonanceIds],
            hexereiSecretRite: evaluation.teamState.hexereiSecretRite,
            moonsign: {
              characterBuildIds: [...evaluation.teamState.moonsign.characterBuildIds],
              characterCount: evaluation.teamState.moonsign.characterCount,
              level: evaluation.teamState.moonsign.level
            },
            nightsoulBurst: {
              characterBuildIds: [...evaluation.teamState.nightsoulBurst.characterBuildIds],
              characterCount: evaluation.teamState.nightsoulBurst.characterCount,
              cooldownSeconds: evaluation.teamState.nightsoulBurst.cooldownSeconds,
              hasXilonenIndependentTrigger: evaluation.teamState.nightsoulBurst.hasXilonenIndependentTrigger
            }
          },
          stats: {
            ...resolvedStats,
            statContributions: [...statContributions],
            ...(scalingTerms ? { scalingTerms: [...scalingTerms] } : {})
          }
        }
      }
    }
  )

  app.post<{ Body: SupportMetricEvaluationRequest; Reply: SupportMetricEvaluationResponse }>(
    "/v1/support-metrics/evaluate",
    {
      schema: {
        body: SupportMetricEvaluationRequestSchema,
        response: { 200: SupportMetricEvaluationResponseSchema }
      }
    },
    async (request) => {
      const definition = getCombatMetricDefinition(request.body.metricId)
      if (!definition) throw new Error(`Combat metric ${request.body.metricId} is not registered`)
      if (definition.kind === "damage") {
        throw new Error(`Support metric endpoint does not accept damage metric ${request.body.metricId}`)
      }
      const evaluated = evaluateCombatMetric({
        build: request.body.build,
        ...(request.body.context ? { context: request.body.context } : {}),
        gameData,
        metricId: request.body.metricId
      })
      if (evaluated.kind === "damage") {
        throw new Error(`Support metric endpoint received damage metric ${request.body.metricId}`)
      }
      return { engineVersion: "support-metric-1", metric: serializeSupportMetricResult(evaluated) }
    }
  )

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

  return app
}
