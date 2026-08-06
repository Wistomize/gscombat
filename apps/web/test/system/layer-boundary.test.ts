import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"

import { describe, expect, it } from "vitest"

const packageRoot = resolve(import.meta.dirname, "../..")
const productionRoots = ["app", "components", "features", "lib"]

function listFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

function listProductionFiles(): string[] {
  return productionRoots.flatMap((directory) => listFiles(join(packageRoot, directory)))
    .filter((file) => [".ts", ".tsx"].includes(extname(file)))
}

function resolveLocalImport(sourceFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith(".")) return undefined
  const candidate = resolve(dirname(sourceFile), specifier)
  const paths = [candidate, `${candidate}.ts`, `${candidate}.tsx`, join(candidate, "index.ts"), join(candidate, "index.tsx")]
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

describe("Web architecture boundaries", () => {
  it("keeps tests under the package-level test directory and routes thin", () => {
    const productionFiles = listProductionFiles()
    const colocatedTests = productionFiles.filter((file) => file.includes(".test.") || file.includes(".spec."))
    const routeModules = listFiles(join(packageRoot, "app"))
      .filter((file) => [".ts", ".tsx"].includes(extname(file)))
      .map((file) => relative(join(packageRoot, "app"), file))

    expect(colocatedTests).toEqual([])
    expect(routeModules.every((file) => ["layout.tsx", "page.tsx", "calculate/page.tsx"].includes(file))).toBe(true)
  })

  it("keeps low-level modules independent from routes and features", () => {
    const violations: string[] = []
    for (const file of listProductionFiles()) {
      const sourcePath = relative(packageRoot, file)
      for (const dependency of getLocalDependencies(file)) {
        const targetPath = relative(packageRoot, dependency)
        if (sourcePath.startsWith("lib/") && (targetPath.startsWith("app/") || targetPath.startsWith("features/"))) {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
        if (sourcePath.startsWith("components/") && (targetPath.startsWith("app/") || targetPath.startsWith("features/"))) {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
        if (sourcePath.startsWith("features/") && targetPath.startsWith("app/")) {
          violations.push(`${sourcePath} -> ${targetPath}`)
        }
      }
    }
    expect(violations).toEqual([])
  })

  it("keeps the production dependency graph acyclic", () => {
    const files = listProductionFiles()
    const production = new Set(files)
    const graph = new Map(files.map((file) => [file, getLocalDependencies(file).filter((target) => production.has(target))]))
    const visiting = new Set<string>()
    const visited = new Set<string>()
    const cycles: string[] = []

    const visit = (file: string, path: readonly string[]) => {
      if (visiting.has(file)) {
        const start = path.indexOf(file)
        cycles.push([...path.slice(start), file].map((entry) => relative(packageRoot, entry)).join(" -> "))
        return
      }
      if (visited.has(file)) return
      visiting.add(file)
      for (const dependency of graph.get(file) ?? []) visit(dependency, [...path, file])
      visiting.delete(file)
      visited.add(file)
    }

    for (const file of files) visit(file, [])
    expect(cycles).toEqual([])
  })

  it("prevents a new giant feature component from silently accumulating", () => {
    const oversized = listProductionFiles()
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => ({ file: relative(packageRoot, file), lines: readFileSync(file, "utf8").split("\n").length }))
      .filter(({ lines }) => lines > 500)

    expect(oversized).toEqual([])
  })
})
