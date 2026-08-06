import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

import ts from "typescript"

interface EntityExport {
  readonly exportName: string
  readonly kind: "artifact" | "character" | "weapon"
  readonly modulePath: string
  readonly slug: string
}

interface GeneratedFile {
  readonly content: string
  readonly path: string
}

interface OrderedEntityExport extends EntityExport {
  readonly order: number
}

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = join(packageRoot, "src")
const registryRoot = join(sourceRoot, "registry")
const checkOnly = process.argv.includes("--check")

function listEntitySlugs(kind: "artifacts" | "characters" | "weapons"): readonly string[] {
  return readdirSync(join(sourceRoot, kind), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

function listExportedConstants(filePath: string): readonly string[] {
  const sourceText = readFileSync(filePath, "utf8")
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  return sourceFile.statements.flatMap((statement) => {
    if (!ts.isVariableStatement(statement)) return []
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) return []
    return statement.declarationList.declarations.flatMap((declaration) =>
      ts.isIdentifier(declaration.name) ? [declaration.name.text] : []
    )
  })
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isParenthesizedExpression(current)) {
    current = current.expression
  }
  return current
}

function readExportedObjectNumber(filePath: string, exportName: string, propertyName: string): number {
  const sourceText = readFileSync(filePath, "utf8")
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== exportName || !declaration.initializer) continue
      const initializer = unwrapExpression(declaration.initializer)
      if (!ts.isObjectLiteralExpression(initializer)) break
      const property = initializer.properties.find(
        (candidate) => ts.isPropertyAssignment(candidate) && candidate.name.getText(sourceFile) === propertyName
      )
      if (!property || !ts.isPropertyAssignment(property)) break
      const value = unwrapExpression(property.initializer)
      if (ts.isNumericLiteral(value)) return Number(value.text)
    }
  }
  throw new Error(`${relative(packageRoot, filePath)} must declare numeric ${propertyName} on ${exportName}`)
}

function requireSingleExport(filePath: string, suffix: string): string {
  const candidates = listExportedConstants(filePath).filter((name) => name.endsWith(suffix))
  if (candidates.length !== 1) {
    throw new Error(
      `${relative(packageRoot, filePath)} must export exactly one *${suffix} constant; found ${candidates.join(", ") || "none"}`
    )
  }
  return candidates[0] ?? ""
}

function listCharacterCombatExports(): readonly EntityExport[] {
  return listEntitySlugs("characters").map((slug) => {
    const filePath = join(sourceRoot, "characters", slug, "combat.ts")
    return {
      exportName: requireSingleExport(filePath, "CombatCoverage"),
      kind: "character",
      modulePath: `../characters/${slug}/combat.js`,
      slug
    }
  })
}

function listCharacterDefinitionExports(): readonly OrderedEntityExport[] {
  const entities = listEntitySlugs("characters").map((slug) => {
    const filePath = join(sourceRoot, "characters", slug, "definition.ts")
    const exportName = requireSingleExport(filePath, "Definition")
    return {
      exportName,
      kind: "character" as const,
      modulePath: `../characters/${slug}/definition.js`,
      order: readExportedObjectNumber(filePath, exportName, "catalogOrder"),
      slug
    }
  })
  const orders = new Set(entities.map((entity) => entity.order))
  if (orders.size !== entities.length) throw new Error("Character catalogOrder values must be unique")
  return entities.sort((left, right) => left.order - right.order)
}

function listEquipmentActionEffectExports(): readonly EntityExport[] {
  const entities: EntityExport[] = []
  for (const [directory, kind] of [
    ["artifacts", "artifact"],
    ["weapons", "weapon"]
  ] as const) {
    for (const slug of listEntitySlugs(directory)) {
      const filePath = join(sourceRoot, directory, slug, "effects.ts")
      entities.push({
        exportName: requireSingleExport(filePath, "CombatActionEffects"),
        kind,
        modulePath: `../${directory}/${slug}/effects.js`,
        slug
      })
    }
  }
  return entities
}

function listEquipmentCoverageExports(): readonly EntityExport[] {
  const entities: EntityExport[] = []
  for (const [directory, kind] of [
    ["artifacts", "artifact"],
    ["weapons", "weapon"]
  ] as const) {
    for (const slug of listEntitySlugs(directory)) {
      const filePath = join(sourceRoot, directory, slug, "coverage.ts")
      const candidates = listExportedConstants(filePath).filter((name) => name === "equipmentCoverage")
      if (candidates.length !== 1) {
        throw new Error(`${relative(packageRoot, filePath)} must export exactly one equipmentCoverage constant`)
      }
      entities.push({ exportName: "equipmentCoverage", kind, modulePath: `../${directory}/${slug}/coverage.js`, slug })
    }
  }
  return entities
}

function listReviewedEvidenceExports(): readonly EntityExport[] {
  return listEntitySlugs("characters").flatMap((slug) => {
    const filePath = join(sourceRoot, "characters", slug, "evidence.ts")
    if (!existsSync(filePath)) return []
    const candidates = listExportedConstants(filePath).filter((name) => name === "reviewedMultiScalingEvidence")
    if (candidates.length !== 1) {
      throw new Error(`${relative(packageRoot, filePath)} must export exactly one reviewedMultiScalingEvidence constant`)
    }
    return [{ exportName: "reviewedMultiScalingEvidence", kind: "character" as const, modulePath: `../characters/${slug}/evidence.js`, slug }]
  })
}

function toIdentifier(value: string): string {
  return value.replace(/(^|[-_]+)([a-zA-Z0-9])/g, (_match, _separator, character: string) => character.toUpperCase())
}

function importAlias(entity: EntityExport): string {
  const suffix = entity.exportName.endsWith("CombatCoverage")
    ? "Coverage"
    : entity.exportName.endsWith("CombatActionEffects")
      ? "Effects"
      : "Coverage"
  return `${entity.kind}${toIdentifier(entity.slug)}${suffix}`
}

function renderCharacterCombatRegistry(): GeneratedFile {
  const entities = listCharacterCombatExports()
  const imports = entities.map(
    (entity) => `import { ${entity.exportName} as ${importAlias(entity)} } from "${entity.modulePath}"`
  )
  const entries = entities.map((entity) => `  ${importAlias(entity)}`)
  return {
    content: [
      "// Generated by tools/generate-registries.ts; do not edit by hand.",
      'import type { CharacterCombatCoverage } from "../combat/types.js"',
      "",
      ...imports,
      "",
      "export const characterCombatCoverageRegistry: readonly CharacterCombatCoverage[] = [",
      entries.join(",\n"),
      "]",
      ""
    ].join("\n"),
    path: join(registryRoot, "character-combat.generated.ts")
  }
}

function renderCharacterCatalogRegistry(): GeneratedFile {
  const entities = listCharacterDefinitionExports()
  const imports = entities.map(
    (entity) =>
      `import { ${entity.exportName} as character${toIdentifier(entity.slug)}Definition } from "${entity.modulePath}"`
  )
  const entries = entities.map((entity) => `  character${toIdentifier(entity.slug)}Definition.catalog`)
  return {
    content: [
      "// Generated by tools/generate-registries.ts; do not edit by hand.",
      'import type { CharacterCatalogPresentation } from "../catalog/types.js"',
      "",
      ...imports,
      "",
      "export const characterCatalogPresentation: readonly CharacterCatalogPresentation[] = [",
      entries.join(",\n"),
      "]",
      ""
    ].join("\n"),
    path: join(registryRoot, "character-catalog.generated.ts")
  }
}

function renderEquipmentActionEffectRegistry(): GeneratedFile {
  const entities = listEquipmentActionEffectExports()
  const imports = entities.map(
    (entity) => `import { ${entity.exportName} as ${importAlias(entity)} } from "${entity.modulePath}"`
  )
  const entries = entities.map((entity) => `  ...${importAlias(entity)}`)
  return {
    content: [
      "// Generated by tools/generate-registries.ts; do not edit by hand.",
      'import type { CombatActionEffect } from "../combat/types.js"',
      "",
      ...imports,
      "",
      "export const equipmentCombatActionEffects: readonly CombatActionEffect[] = [",
      entries.join(",\n"),
      "]",
      ""
    ].join("\n"),
    path: join(registryRoot, "equipment-action-effects.generated.ts")
  }
}

function renderEquipmentCoverageRegistry(): GeneratedFile {
  const entities = listEquipmentCoverageExports()
  const imports = entities.map(
    (entity) => `import { ${entity.exportName} as ${importAlias(entity)} } from "${entity.modulePath}"`
  )
  const entries = entities.map((entity) => `  ${importAlias(entity)}`)
  return {
    content: [
      "// Generated by tools/generate-registries.ts; do not edit by hand.",
      'import type { EquipmentCoverageEntry } from "../equipment-coverage.js"',
      "",
      ...imports,
      "",
      "export const reviewedEquipmentCoverageRegistry: readonly EquipmentCoverageEntry[] = [",
      entries.join(",\n"),
      "]",
      ""
    ].join("\n"),
    path: join(registryRoot, "equipment-coverage.generated.ts")
  }
}

function renderReviewedEvidenceRegistry(): GeneratedFile {
  const entities = listReviewedEvidenceExports()
  const imports = entities.map(
    (entity) =>
      `import { ${entity.exportName} as character${toIdentifier(entity.slug)}Evidence } from "${entity.modulePath}"`
  )
  const entries = entities.map((entity) => `  ...character${toIdentifier(entity.slug)}Evidence`)
  return {
    content: [
      "// Generated by tools/generate-registries.ts; do not edit by hand.",
      'import type { ReviewedMultiScalingEvidenceRecord } from "../characters/evidence.js"',
      "",
      ...imports,
      "",
      "export const reviewedMultiScalingEvidenceRecords: readonly ReviewedMultiScalingEvidenceRecord[] = [",
      entries.join(",\n"),
      "]",
      ""
    ].join("\n"),
    path: join(registryRoot, "reviewed-multi-scaling-evidence.generated.ts")
  }
}

function writeOrCheck(files: readonly GeneratedFile[]): void {
  const staleFiles: string[] = []
  for (const file of files) {
    if (checkOnly) {
      if (!existsSync(file.path) || readFileSync(file.path, "utf8") !== file.content) {
        staleFiles.push(relative(packageRoot, file.path))
      }
      continue
    }
    mkdirSync(dirname(file.path), { recursive: true })
    if (!existsSync(file.path) || readFileSync(file.path, "utf8") !== file.content) {
      writeFileSync(file.path, file.content)
    }
  }
  if (staleFiles.length > 0) {
    throw new Error(`Generated Content registries are stale: ${staleFiles.join(", ")}. Run pnpm registries:generate.`)
  }
}

const generatedFiles = [
  renderCharacterCatalogRegistry(),
  renderCharacterCombatRegistry(),
  renderEquipmentActionEffectRegistry(),
  renderEquipmentCoverageRegistry(),
  renderReviewedEvidenceRegistry()
]
writeOrCheck(generatedFiles)
console.log(
  checkOnly
    ? `Verified ${generatedFiles.length} generated Content registries.`
    : `Generated ${generatedFiles.length} Content registries.`
)
