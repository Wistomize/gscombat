import { AnalysisInputError } from "@gscombat/analyzer"
import { ApiErrorResponseSchema } from "@gscombat/contracts"
import { errorCodes, type FastifyInstance } from "fastify"
import { writeDiagnostic } from "./diagnostics.js"

const serviceErrors = {
  computation_conflict: [409, "场景或计算版本已变化，请重新计算"],
  comparison_busy: [429, "比较任务繁忙，请稍后重试"],
  comparison_timeout: [503, "比较计算超时，请重试"],
  comparison_unavailable: [503, "服务正在关闭，请稍后重试"],
  comparison_cancelled: [499, "计算已取消"],
  showcase_not_found: [404, "未找到该 UID 的展示柜"],
  showcase_unavailable: [503, "展示柜上游暂不可用，请稍后重试"],
  showcase_timeout: [504, "展示柜上游请求超时，请稍后重试"],
  showcase_upstream_error: [502, "展示柜上游响应异常，请稍后重试"]
} as const

/** API-local service failures are finite and never expose arbitrary exception messages. */
export class ApiServiceError extends Error {
  readonly statusCode: number
  constructor(readonly code: keyof typeof serviceErrors) {
    super(serviceErrors[code][1])
    this.name = "ApiServiceError"
    this.statusCode = serviceErrors[code][0]
  }
}

const errorResponseSchemas = Object.fromEntries(
  [400, 404, 409, 413, 415, 429, 499, 500, 502, 503, 504].map(status => [status, ApiErrorResponseSchema])
)

/** Registers public failure contracts and one mapping without changing explicit route business replies. */
export function registerHttpErrors(app: FastifyInstance): void {
  app.addHook("onRequest", async (request, reply) => { reply.header("X-Request-Id", request.id) })
  app.addHook("onRoute", route => {
    const response = route.schema?.response
    route.schema = { ...route.schema, response: { ...errorResponseSchemas,
      ...(response !== null && typeof response === "object" ? response : {}) } }
  })
  app.setSchemaErrorFormatter(() => new errorCodes.FST_ERR_VALIDATION("请求格式不正确"))
  app.setNotFoundHandler(async (_request, reply) => reply.code(404).send({ code: "not_found", message: "接口不存在" }))
  app.setErrorHandler((error, request, reply) => {
    if (request.raw.aborted || reply.raw.destroyed) { reply.hijack(); return }
    if (error instanceof AnalysisInputError) {
      return reply.code(error.code === "game_data_version_mismatch" ? 409 : 400).send({ code: error.code, message: error.message })
    }
    if (error instanceof ApiServiceError) {
      if (error.statusCode >= 500) writeDiagnostic(error.code.startsWith("showcase_") ? "upstream_error" : "internal_error",
        error.code, error.statusCode, { requestId: request.id }, error)
      return reply.code(error.statusCode).send({ code: error.code, message: error.message })
    }
    if (error instanceof errorCodes.FST_ERR_VALIDATION || error instanceof errorCodes.FST_ERR_CTP_INVALID_JSON_BODY ||
      error instanceof errorCodes.FST_ERR_CTP_EMPTY_JSON_BODY || error instanceof errorCodes.FST_ERR_CTP_INVALID_CONTENT_LENGTH) {
      return reply.code(400).send({ code: "invalid_request", message: "请求格式不正确，请检查输入" })
    }
    if (error instanceof errorCodes.FST_ERR_CTP_BODY_TOO_LARGE || error instanceof errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE) {
      return reply.code(error.statusCode ?? 400).send({ code: "invalid_request", message: "请求大小或内容类型不受支持" })
    }
    writeDiagnostic("internal_error", "internal_error", 500, { requestId: request.id }, error)
    return reply.code(500).send({ code: "internal_error", message: `计算服务内部错误，请稍后重试（请求编号：${request.id}）` })
  })
}
