import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { createGameDataSnapshot } from "../src/snapshot.js"
import { downloadGameDataSource } from "../src/source.js"
import type { GameDataSourceManifest } from "../src/types.js"

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const sourcePath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(packageRoot, "sources/current.json")
const manifest = JSON.parse(readFileSync(sourcePath, "utf8")) as GameDataSourceManifest
const snapshotDirectory = join(packageRoot, "snapshots", manifest.gameVersion)
const databasePath = join(snapshotDirectory, "game-data.sqlite")

console.log(`Downloading gi-stats at ${manifest.upstreamCommit}`)
const source = await downloadGameDataSource(manifest)
console.log(`Verified gi-stats SHA-256 ${manifest.dataSha256}`)
console.log(`Building game-data snapshot for ${manifest.gameVersion}`)
createGameDataSnapshot({ databasePath, document: source.document, manifest: source.manifest })
writeFileSync(join(snapshotDirectory, "manifest.json"), `${JSON.stringify(source.manifest, null, 2)}\n`)

console.log(`Created ${databasePath}`)
