import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"
import { createGameDataSnapshot } from "../../src/snapshot.js"
import { auditContent } from "./content-audit.js"
import { auditBaselineGroups, buildGapInventory, gapMarkdown } from "./gaps.js"
import { hash, loadInputs, readJson, REPOSITORY, safePath, type Mappings, type SourceLock } from "./input.js"
import { normalize } from "./normalize.js"
import { assertPinnedSemanticInventory, buildSemanticInventory } from "./semantic-inventory.js"
import { withReviewedSemanticGroups } from "./semantic-import.js"
import { checkSemanticMappings, parseSemanticMappings } from "./semantic-mapping.js"
import { buildSemanticDecisionReport, type PendingSemanticDecision } from "./semantic-decisions.js"
import { contentSemanticCoverage } from "./content-semantic-coverage.js"
import { compareDatabases, mappingSuggestions, markdownReport, sourceParameterInventory, sourceRefinementInventory,
  summarize } from "./report.js"

export const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")
export const PACKAGE_ROOT = join(PROJECT_ROOT, "packages/game-data")

/** Limits all generated reports to new directories beneath a dedicated ignored evaluation root. */
export function outputPath(root: string, run: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(run)) throw new Error("Invalid run name")
  const directory = safePath(join(root, ".cache/genshin-db-evaluation", run))
  if (existsSync(directory) || existsSync(`${directory}.pending`)) throw new Error("Evaluation output already exists")
  return directory
}

/** Evaluates a pinned source without modifying the production lock or snapshot. */
export async function evaluate(options: { run: string; source: string; offline: boolean }) {
  const destination = outputPath(PROJECT_ROOT, options.run)
  const lock = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.lock.json")) as SourceLock
  const mappingsPath = join(PACKAGE_ROOT, "sources/genshin-db-evaluation.mappings.json")
  const mappings = readJson(mappingsPath) as Mappings
  const baselinePath = join(PACKAGE_ROOT, "snapshots/7.0/game-data.sqlite")
  if (hash(readFileSync(baselinePath)) !== lock.baselineSha256) throw new Error("Baseline checksum mismatch")
  const inputs = await loadInputs(lock, resolve(options.source), options.offline)
  using baseline = new DatabaseSync(baselinePath, { readOnly: true })
  const normalized = normalize(inputs, mappings, baseline)
  const semanticInventory = buildSemanticInventory(baseline, mappings)
  assertPinnedSemanticInventory(semanticInventory)
  const semanticMappingsPath = join(PACKAGE_ROOT, "sources/genshin-db-evaluation.semantic-mappings.json")
  const semanticMappings = parseSemanticMappings(readJson(semanticMappingsPath))
  const semanticCheck = checkSemanticMappings(semanticInventory, semanticMappings, inputs, lock)
  const candidateDocument = withReviewedSemanticGroups(normalized.document, semanticInventory, semanticCheck)
  const pending = `${destination}.pending`
  mkdirSync(dirname(pending), { recursive: true })
  // Exclusive reservation also rejects two concurrent invocations with the same run name.
  mkdirSync(pending)
  const candidatePath = join(pending, "candidate.sqlite")
  const manifest = { schemaVersion: 2, gameVersion: `${lock.version}-evaluation`, dataSha256: hash(JSON.stringify(lock.files)),
    dataUrl: `${REPOSITORY}/tree/${lock.commit}`, upstreamCommit: lock.commit,
    upstreamCommittedAt: lock.committedAt, upstreamRepository: REPOSITORY, upstreamLicense: "MIT" }
  createGameDataSnapshot({ databasePath: candidatePath, document: candidateDocument, manifest })
  const candidate = new DatabaseSync(candidatePath, { readOnly: true })
  let differences
  try { differences = compareDatabases(baseline, candidate, mappings) } finally { candidate.close() }
  const inventory = sourceParameterInventory(inputs, mappings)
  const refinementInventory = sourceRefinementInventory(inputs, mappings)
  const content = await auditContent(PROJECT_ROOT, baselinePath, candidatePath)
  const semanticDecisionsPath = join(PACKAGE_ROOT, "sources/genshin-db-evaluation.semantic-decisions.json")
  const pendingDecisions = readJson(semanticDecisionsPath) as PendingSemanticDecision[]
  const semanticDecisions = buildSemanticDecisionReport(semanticInventory, semanticCheck, pendingDecisions,
    content.references, inputs, lock)
  const gaps = buildGapInventory(baseline, inputs, mappings, normalized.issues, differences, content)
  const baselineGroups = auditBaselineGroups(baseline, inputs, mappings)
  const semanticContentReferences = contentSemanticCoverage(content.references, semanticInventory, baselineGroups)
  const provenance = { source: lock, mappingSha256: hash(readFileSync(mappingsPath)),
    semanticMappingSha256: hash(readFileSync(semanticMappingsPath)),
    semanticDecisionsSha256: hash(readFileSync(semanticDecisionsPath)),
    candidateSha256: hash(readFileSync(candidatePath)),
    inherited: { tables: ["artifact_main_stats", "artifact_substat_rolls", "artifact_roll_metadata"],
      baselineSha256: lock.baselineSha256, source: JSON.parse(String(baseline.prepare("SELECT value FROM metadata WHERE key='source_manifest'").get()!.value)) } }
  const payload = { evaluationComplete: true, productionReady: false, provenance,
    semanticMapping: { expected: semanticCheck.expected, reviewed: semanticCheck.reviewed,
      missing: semanticCheck.missing.length, missingTargets: semanticCheck.missing },
    semanticDecisions,
    semanticContentReferences,
    summary: summarize(differences), differences, sourceParameterCount: inventory.length,
    reviewedParameterCount: inventory.filter(r => r.status === "reviewed").length,
    sourceMappedParameterCount: inventory.filter(r => r.status !== "unreviewed").length,
    gapSummary: Object.fromEntries([...new Set(gaps.map(gap => gap.category))]
      .map(category => [category, gaps.filter(gap => gap.category === category).length])),
    baselineGroupSummary: Object.fromEntries([...new Set(baselineGroups.map(row => row.status))]
      .map(status => [status, baselineGroups.filter(row => row.status === status).length])),
    baselineGroups,
    sourceParameters: inventory, mappingSuggestions: mappingSuggestions(baseline, inputs, mappings),
    sourceRefinementParameterCount: refinementInventory.length, sourceRefinementParameters: refinementInventory,
    normalizedRefinementLiterals: normalized.refinements,
    unitPolicy: "百分数字符串除以 100；不解析描述作为效果语义；仅导入显式映射且向量验证或来源直属的参数；冲突组不导入",
    issues: normalized.issues, content, integration: content.integration }
  const report = { ...payload, digest: hash(JSON.stringify(payload)) }
  writeFileSync(join(pending, "report.json"), JSON.stringify(report, null, 2) + "\n", { flag: "wx" })
  writeFileSync(join(pending, "report.md"), markdownReport(report), { flag: "wx" })
  writeFileSync(join(pending, "gaps.json"), JSON.stringify(gaps, null, 2) + "\n", { flag: "wx" })
  writeFileSync(join(pending, "gaps.md"), gapMarkdown(gaps), { flag: "wx" })
  writeFileSync(join(pending, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n", { flag: "wx" })
  writeFileSync(join(pending, "COMPLETE"), "evaluation complete; not approved for production\n", { flag: "wx" })
  renameSync(pending, destination)
  return { destination, report }
}
