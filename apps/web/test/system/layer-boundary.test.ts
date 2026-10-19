import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"

import { describe, expect, it } from "vitest"
import ts from "typescript"

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

/** Reads runtime edges, including re-exports and literal dynamic imports; whole type-only statements are erased. */
function runtimeImports(source: ts.SourceFile): string[] {
  const specifiers = new Set<string>()
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteralLike(node.moduleSpecifier)) {
      specifiers.add(node.moduleSpecifier.text)
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
      specifiers.add(node.moduleSpecifier.text)
    }
    if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly && ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression && ts.isStringLiteralLike(node.moduleReference.expression)) {
      specifiers.add(node.moduleReference.expression.text)
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const argument = node.arguments[0]
      if (argument && ts.isStringLiteralLike(argument)) specifiers.add(argument.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return [...specifiers]
}

function clientViolations(graph: ReadonlyMap<string, readonly string[]>, clients: readonly string[]): string[] {
  const violations: string[] = [], visited = new Set<string>()
  const visit = (file: string, path: readonly string[]): void => {
    if (visited.has(file)) return
    visited.add(file)
    for (const dependency of graph.get(file) ?? []) {
      if (/^@gscombat\/(?:content(?:$|\/catalog(?:$|\/))|analyzer(?:$|\/)|game-data(?:$|\/))/.test(dependency) ||
        /\/packages\/(?:content|analyzer|game-data)\//.test(dependency)) {
        violations.push([...path, file, dependency].map(entry => relative(packageRoot, entry).startsWith("..") ? entry
          : relative(packageRoot, entry)).join(" -> "))
      } else if (graph.has(dependency)) visit(dependency, [...path, file])
    }
  }
  for (const client of clients) visit(client, [])
  return violations
}

describe("Web architecture boundaries", () => {
  it("keeps server catalog construction and combat content outside transitive client imports", () => {
    const files = listProductionFiles()
    const modules = files.map(file => ({ file,
      source: ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true) }))
    const graph = new Map(modules.map(({ file, source }) => [file,
      runtimeImports(source).map(specifier => resolveLocalImport(file, specifier) ?? specifier)]))
    const clients = modules.filter(({ source }) => source.statements.some(statement => ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) && statement.expression.text === "use client")).map(({ file }) => file)
    expect(clients.length).toBeGreaterThan(0)
    expect(clientViolations(graph, clients)).toEqual([])
  })

  it("detects indirect catalog edges without mistaking erased types or server modules for clients", () => {
    const parse = (source: string) => runtimeImports(ts.createSourceFile("test.ts", source, ts.ScriptTarget.Latest, true))
    const graph = new Map([
      ["client", ["bridge"]], ["bridge", parse('export { createCatalogResponse } from "@gscombat/content/catalog"')],
      ["server", parse('import { createCatalogResponse } from "@gscombat/content/catalog"')],
      ["types", parse('import type { CatalogResponse } from "@gscombat/contracts"; export type { X } from "@gscombat/content";')]
    ])
    expect(clientViolations(graph, ["client"])).toEqual(["client -> bridge -> @gscombat/content/catalog"])
    expect(clientViolations(graph, ["types"])).toEqual([])
    // verbatimModuleSyntax keeps this as import {}, which still evaluates the module.
    expect(parse('import { type X } from "@gscombat/content"')).toEqual(["@gscombat/content"])
    expect(parse('import "@gscombat/content"; import("@gscombat/analyzer"); require("@gscombat/game-data")'))
      .toEqual(["@gscombat/content", "@gscombat/analyzer", "@gscombat/game-data"])
    expect(clientViolations(new Map([["client", ["@gscombat/contracts", "@gscombat/calculator", "@gscombat/content/weapon-names"]]]), ["client"]))
      .toEqual([])
  })

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
