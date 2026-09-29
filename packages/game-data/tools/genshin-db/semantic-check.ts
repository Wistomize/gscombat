import { parseArgs } from "node:util"
import { join, resolve } from "node:path"
import { readFileSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { PACKAGE_ROOT, PROJECT_ROOT } from "./evaluate.js"
import { hash, loadInputs, readJson, type Mappings, type SourceLock } from "./input.js"
import { assertPinnedSemanticInventory, buildSemanticInventory } from "./semantic-inventory.js"
import { checkSemanticMappings, parseSemanticMappings } from "./semantic-mapping.js"

try {
  const { values } = parseArgs({ options: { batch: { type: "string" }, source: { type: "string" },
    "allow-incomplete": { type: "boolean", default: false }, list: { type: "boolean", default: false } } })
  const lock = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.lock.json")) as SourceLock
  const baselinePath = join(PACKAGE_ROOT, "snapshots/7.0/game-data.sqlite")
  if (hash(readFileSync(baselinePath)) !== lock.baselineSha256) throw new Error("Baseline checksum mismatch")
  const mappings = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.mappings.json")) as Mappings
  using baseline = new DatabaseSync(baselinePath, { readOnly: true })
  const inventory = buildSemanticInventory(baseline, mappings)
  assertPinnedSemanticInventory(inventory)
  if (values.list) console.log(JSON.stringify({ counts: inventory.counts, batches: inventory.batches }, null, 2))
  else {
    const source = resolve(values.source ?? join(PROJECT_ROOT, ".cache/genshin-db-input"))
    const inputs = await loadInputs(lock, source, true)
    const reviewed = parseSemanticMappings(readJson(join(PACKAGE_ROOT,
      "sources/genshin-db-evaluation.semantic-mappings.json")))
    const check = checkSemanticMappings(inventory, reviewed, inputs, lock, values.batch ?? null)
    console.log(JSON.stringify({ batch: check.batch, expected: check.expected, reviewed: check.reviewed,
      missing: check.missing.length, firstMissing: check.missing.slice(0, 20) }))
    if (check.missing.length && !values["allow-incomplete"]) process.exitCode = 2
  }
} catch (error) {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
}
