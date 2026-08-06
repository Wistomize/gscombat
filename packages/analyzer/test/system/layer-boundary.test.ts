import { readdirSync, readFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { supportedCharacters } from "@gscombat/content"
import { describe, expect, it } from "vitest"

const analyzerSourceDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../src")
const allowedCharacterIdsByFile: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["core/build-variant.ts", new Set(["Traveler"])],
  ["audit/registry-integrity.ts", new Set(["Traveler"])],
  ["audit/talent-validation.ts", new Set(["Traveler"])]
])

function listProductionTypeScriptFiles(directory: string): readonly string[] {
  return listTypeScriptFiles(directory).filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".d.ts"))
}

function listTypeScriptFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listTypeScriptFiles(path)
    if (extname(entry.name) !== ".ts") return []
    return [path]
  })
}

function listInternalDependencies(path: string): readonly string[] {
  const source = readFileSync(path, "utf8")
  return [...source.matchAll(/from\s+["'](\.\.?\/[^"']+)\.js["']/g)].map((match) =>
    resolve(dirname(path), `${match[1]}.ts`)
  )
}

describe("analyzer layer boundary", () => {
  it("keeps the source root as a public facade over named subsystems", () => {
    const rootEntries = readdirSync(analyzerSourceDirectory, { withFileTypes: true })
    const rootFiles = rootEntries.filter((entry) => entry.isFile()).map((entry) => entry.name)
    const sourceTests = listTypeScriptFiles(analyzerSourceDirectory).filter((path) => path.endsWith(".test.ts"))

    expect(rootFiles).toEqual(["index.ts"])
    expect(sourceTests).toEqual([])
  })

  it("keeps production dependency direction free of test and audit back edges", () => {
    const violations = listProductionTypeScriptFiles(analyzerSourceDirectory).flatMap((path) => {
      const source = readFileSync(path, "utf8")
      const relativePath = relative(analyzerSourceDirectory, path)
      const importsTest = /from\s+["'][^"']*\/test\//.test(source)
      const runtimeImportsAudit =
        relativePath !== "index.ts" &&
        !relativePath.startsWith("audit/") &&
        /from\s+["'][^"']*\/audit\//.test(source)
      const coreImportsHigherLayer =
        relativePath.startsWith("core/") && /from\s+["'][^"']*\/(effects|scenario|evaluators|metrics|analysis|audit)\//.test(source)
      const evaluatorImportsScenarioOrchestrator =
        relativePath.startsWith("evaluators/") && /from\s+["'][^"']*\/scenario\/evaluate\.js["']/.test(source)
      return importsTest || runtimeImportsAudit || coreImportsHigherLayer || evaluatorImportsScenarioOrchestrator
        ? [relativePath]
        : []
    })

    expect(violations).toEqual([])
  })

  it("keeps production subsystem dependencies acyclic", () => {
    const files = listProductionTypeScriptFiles(analyzerSourceDirectory)
    const knownFiles = new Set(files)
    const dependencies = new Map(
      files.map((path) => [path, listInternalDependencies(path).filter((dependency) => knownFiles.has(dependency))])
    )
    const visited = new Set<string>()
    const active = new Set<string>()
    const cycles: string[] = []

    const visit = (path: string, stack: readonly string[]) => {
      if (active.has(path)) {
        const cycleStart = stack.indexOf(path)
        cycles.push([...stack.slice(cycleStart), path].map((entry) => relative(analyzerSourceDirectory, entry)).join(" -> "))
        return
      }
      if (visited.has(path)) return
      active.add(path)
      for (const dependency of dependencies.get(path) ?? []) visit(dependency, [...stack, path])
      active.delete(path)
      visited.add(path)
    }

    for (const path of files) visit(path, [])
    expect(cycles).toEqual([])
  })

  it("keeps concrete character IDs out of the generic production layer", () => {
    const characterIds = supportedCharacters.map((character) => character.characterId)
    const violations = listProductionTypeScriptFiles(analyzerSourceDirectory).flatMap((path) => {
      const source = readFileSync(path, "utf8")
      const relativePath = relative(analyzerSourceDirectory, path)
      const allowedCharacterIds = allowedCharacterIdsByFile.get(relativePath) ?? new Set()
      return characterIds.flatMap((characterId) => {
        if (allowedCharacterIds.has(characterId)) return []
        const hasLiteral = [`"${characterId}"`, `'${characterId}'`, `\`${characterId}\``].some((literal) =>
          source.includes(literal)
        )
        return hasLiteral ? [`${relativePath}: ${characterId}`] : []
      })
    })

    expect(violations).toEqual([])
  })
})
