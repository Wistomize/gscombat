import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"
import { EnvHttpProxyAgent, fetch } from "undici"

import { createGameDataSnapshot } from "../src/snapshot.js"
import { hash, loadInputs, readJson, REPOSITORY, type Mappings, type SourceLock } from "./genshin-db/input.js"
import { normalize } from "./genshin-db/normalize.js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const baselinePath = join(root, "snapshots/7.0/game-data.sqlite")
const destination = join(root, "snapshots/7.1")
const characters = ["Vodyanitsa", "Vesna"]
const refinementNames: Record<string, string[]> = {
  NewBough: ["atk_", "eleMas", "stellarAtk_", "stellar_dmg_"],
  Silverlight: ["eleMas"],
  BeyondTheChrysalis: ["critDMG_", "stellarSwirl_dmg_", "energy", "energyLimit"],
  WintersHeavyHeart: ["cryoEleMas", "electroAtk_", "stellarEleMas", "stellar_dmg_"],
  HymnOfTheMaelstrom: ["heal_", "hp_", "atkPer1000Hp_", "maxAtk_"],
  BreezeborneRefrain: ["enerRech_", "stellar_dmg_"]
}
const weapons = Object.keys(refinementNames)
const fullLock = readJson(join(root, "sources/genshin-db-evaluation.lock.json")) as SourceLock
const fullMappings = readJson(join(root, "sources/genshin-db-evaluation.mappings.json")) as Mappings
const mappings: Mappings = {
  commit: fullMappings.commit,
  characters: fullMappings.characters.filter(row => characters.includes(row.id)),
  weapons: fullMappings.weapons.filter(row => weapons.includes(row.id)),
  artifacts: [],
  talentOwners: fullMappings.talentOwners.filter(row => characters.includes(row.id)),
  talents: fullMappings.talents.filter(row => characters.includes(row.owner)),
  refinements: fullMappings.weapons.filter(row => weapons.includes(row.id)).map(row => ({
    ...row,
    parameters: refinementNames[row.id]!.map((name, index) => ({ name, index }))
  }))
}
if (mappings.characters.length !== 2 || mappings.weapons.length !== 6 || mappings.talents.length !== 6) {
  throw new Error("Incomplete 7.1 additions mapping")
}
const paths = new Set([
  "stats/characters", "stats/weapons", "stats/talents", "curve/characters", "curve/weapons",
  "version/characters", "version/weapons", "version/artifacts",
  ...mappings.characters.flatMap(row => [
    `ChineseSimplified/characters/${row.key}`, `ChineseSimplified/talents/${row.key}`,
    `ChineseSimplified/constellations/${row.key}`
  ]),
  ...mappings.weapons.map(row => `ChineseSimplified/weapons/${row.key}`)
].map(path => `src/data/${path}.json`))
const lock = { ...fullLock, files: Object.fromEntries(Object.entries(fullLock.files).filter(([path]) => paths.has(path))) }
if (Object.keys(lock.files).length !== paths.size) throw new Error("Missing locked input")
if (hash(readFileSync(baselinePath)) !== lock.baselineSha256) throw new Error("7.0 baseline checksum mismatch")
const offline = process.argv.includes("--offline")
const inputs = await loadInputs(lock, join(root, "../../.cache/genshin-db-input"), offline)
using baseline = new DatabaseSync(baselinePath, { readOnly: true })
const { document: normalized } = normalize(inputs, mappings, baseline)
const rawFile = join(root, "../../.cache/ProudSkillExcelConfigData-7.1.json")
const rawSha256 = "381b70963eb3ede60de040b8da6f167c77c5065a613adeaf99121f1358294fe5"
if (!existsSync(rawFile)) {
  if (offline) throw new Error("Missing offline ProudSkillExcelConfigData-7.1.json")
  const dispatcher = new EnvHttpProxyAgent()
  try {
    const response = await fetch("https://raw.githubusercontent.com/DimbreathBot/AnimeGameData/9587d1afbd9ab0419cdd00dc05ecd114b9e3fe99/ExcelBinOutput/ProudSkillExcelConfigData.json", {
      dispatcher, signal: AbortSignal.timeout(60_000)
    })
    if (!response.ok) throw new Error(`Raw passive HTTP ${response.status}`)
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (hash(bytes) !== rawSha256) throw new Error("Downloaded passive checksum mismatch")
    mkdirSync(dirname(rawFile), { recursive: true })
    writeFileSync(rawFile, bytes, { flag: "wx" })
  } finally { await dispatcher.close() }
}
if (hash(readFileSync(rawFile)) !== rawSha256) throw new Error("Raw 7.1 passive checksum mismatch")
const rawPassives = readJson(rawFile) as { proudSkillId: number; paramList: number[] }[]
const passiveIds = { Vesna: [1432101, 1432201, 1432301, 1432501], Vodyanitsa: [1402101, 1402201, 1402301, 1402501] }
const skillParam = { ...normalized.char.skillParam }
for (const [owner, ids] of Object.entries(passiveIds)) {
  skillParam[owner] = { ...skillParam[owner], ...Object.fromEntries(ids.map((id, index) => {
    const row = rawPassives.find(row => row.proudSkillId === id)
    if (!row) throw new Error(`Missing raw passive ${id}`)
    return [`passive${index + 1}`, row.paramList.map(value => [value])]
  })) }
}
const document = { ...normalized, char: { ...normalized.char, skillParam } }
const provenance = {
  gameVersion: "7.1", policy: "Append new entities; retain existing 7.0 rows without relabelling their source.",
  baseline: { path: "../7.0/game-data.sqlite", sha256: lock.baselineSha256,
    source: JSON.parse(String(baseline.prepare("SELECT value FROM metadata WHERE key='source_manifest'").get()!.value)) },
  additions: { repository: REPOSITORY, commit: lock.commit, committedAt: lock.committedAt, license: "MIT",
    files: lock.files, mappings, characters, weapons, artifactSets: [] },
  passiveSupplement: {
    repository: "https://github.com/DimbreathBot/AnimeGameData",
    commit: "9587d1afbd9ab0419cdd00dc05ecd114b9e3fe99",
    path: "ExcelBinOutput/ProudSkillExcelConfigData.json", sha256: rawSha256, passiveIds,
    linkedDescription: { path: "TextMap/TextMapCHS.json",
      sha256: "358e586f097d4081b804744375be128fa932406aa2de7cb2410d1de46998bbb8", leadVocalHash: "2726019721" }
  }
}
const manifest = {
  schemaVersion: 2, gameVersion: "7.1", dataSha256: hash(JSON.stringify(provenance)),
  dataUrl: "https://github.com/Wistomize/gscombat/blob/main/packages/game-data/snapshots/7.1/provenance.json",
  upstreamCommit: lock.commit, upstreamCommittedAt: lock.committedAt,
  upstreamRepository: REPOSITORY, upstreamLicense: "MIT"
}
mkdirSync(destination, { recursive: true })
const deltaPath = join(destination, "increment.tmp.sqlite")
const pendingPath = join(destination, "game-data.pending.sqlite")
try {
  createGameDataSnapshot({ databasePath: deltaPath, document, manifest })
  copyFileSync(baselinePath, pendingPath)
  const database = new DatabaseSync(pendingPath)
  try {
    database.prepare("ATTACH DATABASE ? AS increment").run(deltaPath)
    database.exec("BEGIN IMMEDIATE")
    const entityTables = ["characters", "character_stat_curves", "character_ascension_bonuses",
      "character_skill_parameters", "character_skill_parameter_groups", "weapons", "weapon_stat_curves",
      "weapon_ascension_bonuses", "weapon_refinement_parameters"]
    for (const table of entityTables) database.exec(`INSERT INTO main.${table} SELECT * FROM increment.${table}`)
    for (const table of ["character_level_curves", "weapon_level_curves"]) {
      const conflict = database.prepare(`SELECT a.curve_id FROM main.${table} a JOIN increment.${table} b
        USING(curve_id,level) WHERE a.multiplier != b.multiplier LIMIT 1`).get()
      if (conflict) throw new Error(`Existing curve changed: ${table}/${conflict.curve_id}`)
      database.exec(`INSERT OR IGNORE INTO main.${table} SELECT * FROM increment.${table}`)
    }
    database.prepare("UPDATE metadata SET value=? WHERE key='source_manifest'").run(JSON.stringify(manifest))
    database.prepare("INSERT INTO metadata VALUES ('version_provenance', ?)").run(JSON.stringify(provenance))
    // Preserve the original descriptions alongside the new entities, including passive/constellation text.
    for (const [path, value] of inputs) if (path.includes("ChineseSimplified/")) {
      database.prepare("INSERT INTO metadata VALUES (?, ?)").run(`source:7.1:${path}`, JSON.stringify(value))
    }
    database.exec("COMMIT")
    if (database.prepare("PRAGMA integrity_check").get()?.integrity_check !== "ok") throw new Error("SQLite integrity failure")
    if (database.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Foreign key failure")
  } finally { database.close() }
  renameSync(pendingPath, join(destination, "game-data.sqlite"))
  writeFileSync(join(destination, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n")
  writeFileSync(join(destination, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n")
  console.log("7.1 snapshot: added 2 characters and 6 weapons; all existing 7.0 rows retained.")
} finally {
  rmSync(deltaPath, { force: true })
  rmSync(pendingPath, { force: true })
}
