import { createHash } from "node:crypto"
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { dirname, join, resolve, sep } from "node:path"
import { EnvHttpProxyAgent, fetch } from "undici"

export const COMMIT = "49a6544a6c6ae36089cb42fa591fc46f01de8bcf"
export const REPOSITORY = "https://github.com/theBowja/genshin-db"
export interface SourceLock {
  commit: string
  committedAt: string
  version: string
  baselineSha256: string
  files: Record<string, string>
}
export interface EntityMapping { id: string; key: string }
export interface ParameterMapping {
  owner: string
  key: string
  group: string
  sourceGroup: string
  parameters: { index: number; key: string; labels: string[] }[]
  status: "reviewed" | "vector-verified" | "source-only" | "blocked-source-mismatch"
  evidence: string
}
export interface Mappings {
  commit: string
  characters: EntityMapping[]
  weapons: EntityMapping[]
  artifacts: EntityMapping[]
  talentOwners: EntityMapping[]
  talents: ParameterMapping[]
  refinements: { id: string; key: string; parameters: { name: string; index: number; evidence?: string }[] }[]
}
export type JsonObject = Record<string, unknown>
export function object(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected JSON object")
  return value as JsonObject
}
export function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Expected finite number: ${value}`)
  return value
}
export function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected string")
  return value
}
export function hash(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex")
}
export function readJson(path: string): unknown { return JSON.parse(readFileSync(path, "utf8")) }

/** Resolves a path while rejecting symlink traversal, including already existing parents. */
export function safePath(path: string): string {
  const absolute = resolve(path)
  let current = absolute
  while (true) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error(`Symlink forbidden: ${current}`)
    if (dirname(current) === current) break
    current = dirname(current)
  }
  return absolute
}

/** Loads only checksummed, pinned JSON files; never trusts an unverified cache. */
export async function loadInputs(lock: SourceLock, root: string, offline = false): Promise<Map<string, unknown>> {
  if (lock.commit !== COMMIT || !/^[a-f0-9]{64}$/.test(lock.baselineSha256)) throw new Error("Invalid source lock")
  safePath(root)
  mkdirSync(root, { recursive: true })
  const base = realpathSync(root)
  const entries = Object.entries(lock.files)
  const results = new Map<string, unknown>()
  const agent = new EnvHttpProxyAgent()
  let cursor = 0
  try {
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (cursor < entries.length) {
        const [path, sha] = entries[cursor++]!
        if (!/^src\/data\/[a-zA-Z0-9/_-]+\.json$/.test(path) || !/^[a-f0-9]{64}$/.test(sha)) {
          throw new Error(`Invalid locked path/hash: ${path}`)
        }
        const target = safePath(join(base, path))
        if (!target.startsWith(base + sep)) throw new Error("Source path escapes cache")
        let bytes: Uint8Array
        if (existsSync(target)) bytes = readFileSync(target)
        else {
          if (offline) throw new Error(`Missing offline input: ${path}`)
          const response = await fetch(`https://raw.githubusercontent.com/theBowja/genshin-db/${COMMIT}/${path}`, {
            dispatcher: agent, signal: AbortSignal.timeout(30_000)
          })
          if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${path}`)
          bytes = new Uint8Array(await response.arrayBuffer())
        }
        if (hash(bytes) !== sha) throw new Error(`Checksum mismatch: ${path}`)
        const parsed: unknown = JSON.parse(Buffer.from(bytes).toString("utf8"))
        if (!existsSync(target)) {
          mkdirSync(dirname(target), { recursive: true })
          writeFileSync(target, bytes, { flag: "wx" })
        }
        results.set(path, parsed)
      }
    }))
  } finally { await agent.close() }
  return results
}

export function data(inputs: Map<string, unknown>, path: string): JsonObject {
  return object(inputs.get(`src/data/${path}.json`))
}

/** Converts only numeric refinement literals; descriptions are never parsed as mechanics. */
export function refinementNumber(value: unknown): number {
  const literal = text(value)
  if (!/^\d+(?:\.\d+)?%?$/.test(literal)) throw new Error(`Unsupported refinement literal: ${literal}`)
  return Number(literal.replace(/%$/, "")) / (literal.endsWith("%") ? 100 : 1)
}
