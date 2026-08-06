import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const packageRoot = resolve(import.meta.dirname, "../..")
const sourceRoot = join(packageRoot, "src")

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

function listProductionFiles(): string[] {
  return listFiles(sourceRoot).filter((file) => extname(file) === ".ts" && !file.endsWith(".d.ts"))
}

function resolveLocalImport(sourceFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith(".")) return undefined
  const normalizedSpecifier = specifier.endsWith(".js") ? specifier.slice(0, -3) : specifier
  const candidate = resolve(dirname(sourceFile), normalizedSpecifier)
  const paths = [candidate, `${candidate}.ts`, join(candidate, "index.ts")]
  return paths.find((path) => existsSync(path) && statSync(path).isFile())
}

function getLocalDependencies(sourceFile: string): string[] {
  const source = readFileSync(sourceFile, "utf8")
  const specifiers = [...source.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)].map((match) => match[1]!)
  return specifiers.flatMap((specifier) => {
    const target = resolveLocalImport(sourceFile, specifier)
    return target ? [target] : []
  })
}

describe("API architecture boundaries", () => {
  it("keeps the composition root thin and production tests outside src", () => {
    const rootFiles = readdirSync(sourceRoot)
      .filter((entry) => statSync(join(sourceRoot, entry)).isFile() && extname(entry) === ".ts")
      .sort()
    const appSource = readFileSync(join(sourceRoot, "app.ts"), "utf8")

    expect(rootFiles).toEqual(["app.ts", "manage-invites.ts", "server.ts"])
    expect(listProductionFiles().filter((file) => file.includes(".test.") || file.includes(".spec."))).toEqual([])
    expect(appSource.split("\n").length).toBeLessThanOrEqual(120)
    expect(appSource).not.toMatch(/app\.(?:delete|get|patch|post|put)\s*</)
  })

  it("registers every existing public route through the composed application", async () => {
    const app = buildApp()
    await app.ready()
    const routes = [
      ["GET", "/health"],
      ["GET", "/v1/catalog"],
      ["GET", "/v1/combat-authoring/audit"],
      ["GET", "/v1/combat-coverage"],
      ["GET", "/v1/game-data/status"],
      ["GET", "/v1/presets"],
      ["GET", "/v1/session"],
      ["GET", "/v1/workspace"],
      ["PATCH", "/v1/session/label"],
      ["POST", "/v1/action-effect-options"],
      ["POST", "/v1/analysis"],
      ["POST", "/v1/session/invite"],
      ["POST", "/v1/session/logout"],
      ["POST", "/v1/showcase/import"],
      ["POST", "/v1/support-metrics/evaluate"],
      ["PUT", "/v1/workspace"]
    ] as const

    for (const [method, url] of routes) expect(app.hasRoute({ method, url })).toBe(true)
    await app.close()
  })

  it("keeps serializers and services independent from routes and the composition root", () => {
    const violations: string[] = []
    for (const file of listProductionFiles()) {
      const sourcePath = relative(sourceRoot, file)
      for (const dependency of getLocalDependencies(file)) {
        const targetPath = relative(sourceRoot, dependency)
        if (sourcePath.startsWith("serializers/") && (targetPath.startsWith("routes/") || targetPath === "app.ts")) {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
        if (sourcePath.startsWith("services/") && (
          targetPath.startsWith("routes/") ||
          targetPath.startsWith("serializers/") ||
          targetPath === "app.ts"
        )) {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
        if (sourcePath.startsWith("routes/") && targetPath === "app.ts") {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
      }
    }
    expect(violations).toEqual([])
  })

  it("keeps production imports acyclic and away from other workspace source trees", () => {
    const files = listProductionFiles()
    const production = new Set(files)
    const graph = new Map(files.map((file) => [file, getLocalDependencies(file).filter((target) => production.has(target))]))
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const cycles: string[] = []

    const visit = (file: string, path: readonly string[]) => {
      if (visiting.has(file)) {
        const start = path.indexOf(file)
        cycles.push([...path.slice(start), file].map((entry) => relative(sourceRoot, entry)).join(" -> "))
        return
      }
      if (visited.has(file)) return
      visiting.add(file)
      for (const dependency of graph.get(file) ?? []) visit(dependency, [...path, file])
      visiting.delete(file)
      visited.add(file)
    }

    for (const file of files) visit(file, [])

    const sourceImportViolations = [sourceRoot, join(packageRoot, "tools")]
      .flatMap(listFiles)
      .filter((file) => extname(file) === ".ts")
      .filter((file) => /(?:packages\/[^/]+\/src|@gscombat\/[^"']+\/src)/.test(readFileSync(file, "utf8")))
      .map((file) => relative(packageRoot, file))

    expect(cycles).toEqual([])
    expect(sourceImportViolations).toEqual([])
  })
})
