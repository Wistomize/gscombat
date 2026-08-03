import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  assertSemanticLocalizationPreviewManifest,
  createAndWriteSemanticLocalizationPreview,
  downloadSemanticLocalizationDocuments,
  downloadGameDataSource,
  type GameDataSourceManifest,
  type SemanticLocalizationPreviewSourceManifest
} from "../src/index.js"

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const semanticSourcePath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : join(packageRoot, "sources/semantic-localization-preview.v3.json")
const numericSourcePath = process.argv[3]
  ? resolve(process.cwd(), process.argv[3])
  : join(packageRoot, "sources/current.json")
const semanticManifest = JSON.parse(readFileSync(semanticSourcePath, "utf8")) as SemanticLocalizationPreviewSourceManifest
const numericManifest = JSON.parse(readFileSync(numericSourcePath, "utf8")) as GameDataSourceManifest
const outputPath = process.argv[4]
  ? resolve(process.cwd(), process.argv[4])
  : join(packageRoot, "snapshots", numericManifest.gameVersion, "semantic-localization-preview.v3.json")

assertSemanticLocalizationPreviewManifest(semanticManifest, numericManifest)
console.log(`Downloading numeric source at ${numericManifest.upstreamCommit}`)
const numericSource = await downloadGameDataSource(numericManifest)
console.log(`Downloading ${semanticManifest.assets.length} locked ${semanticManifest.locale} localization asset(s)`)
const documents = await downloadSemanticLocalizationDocuments(semanticManifest)
const preview = createAndWriteSemanticLocalizationPreview({
  documents,
  manifest: semanticManifest,
  numericDocument: numericSource.document,
  numericManifest: numericSource.manifest,
  outputPath
})

console.log(`Created ${outputPath} with ${preview.labels.length} labels and ${preview.diagnostics.length} diagnostics`)
