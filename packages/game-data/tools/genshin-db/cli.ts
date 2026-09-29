import { parseArgs } from "node:util"
import { join } from "node:path"
import { evaluate, PROJECT_ROOT } from "./evaluate.js"

try {
  const { values } = parseArgs({ options: { run: { type: "string" }, source: { type: "string" }, offline: { type: "boolean", default: false } } })
  if (!values.run) throw new Error("Usage: genshin-db:evaluate --run NAME [--source CHECKOUT_OR_CACHE] [--offline]")
  const { destination, report } = await evaluate({ run: values.run,
    source: values.source ?? join(PROJECT_ROOT, ".cache/genshin-db-input"), offline: values.offline })
  console.log(JSON.stringify({ destination, summary: report.summary, digest: report.digest, productionReady: report.productionReady }))
  process.exitCode = report.productionReady ? 0 : 2
} catch (error) {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
}
