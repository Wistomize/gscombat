import { buildApp } from "./app.js"

let app: ReturnType<typeof buildApp> | undefined
const port = Number.parseInt(process.env.PORT ?? "3001", 10)

try {
  app = buildApp()
  await app.listen({ host: "0.0.0.0", port })
} catch (error) {
  process.exitCode = 1
  const message = error instanceof Error ? error.message : "Unknown startup error"
  const secret = process.env.INVITE_TOKEN_SECRET
  process.stderr.write(`API startup failed: ${secret ? message.replaceAll(secret, "[redacted]") : message}\n`)
  try {
    await app?.close()
  } catch {
    process.stderr.write("API resource cleanup failed after startup failure\n")
  }
}
