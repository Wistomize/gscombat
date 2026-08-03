import { createHash } from "node:crypto"
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { setTimeout } from "node:timers/promises"

import { type Dispatcher, EnvHttpProxyAgent, fetch, type Response as UndiciResponse } from "undici"

import type { GameDataSourceManifest, GiStatsDocument } from "./types.js"

/** One explicitly mapped, checksum-locked upstream localization asset. */
export interface SemanticLocalizationAssetSource {
  readonly assetId: string
  readonly relativePath: string
  readonly sha256: string
  readonly talentParameterOwnerId: string
}

/** A standalone, reviewable source lock for an optional localization preview sidecar. */
export interface SemanticLocalizationPreviewSourceManifest {
  readonly assets: readonly SemanticLocalizationAssetSource[]
  readonly assetsAggregateSha256: string
  readonly formatVersion: 3
  readonly gameVersion: string
  readonly locale: string
  readonly upstreamCommit: string
  readonly upstreamRepository: string
}

/** A single localized display name for an upstream parameter group. */
export interface CharacterSkillLocalizationGroup {
  readonly characterId: string
  readonly displayName: string
  readonly groupId: string
  readonly locale: string
}

/** A localized semantic label that remains explicitly aligned to a numeric parameter index. */
export interface CharacterSkillParameterLabel {
  readonly characterId: string
  readonly groupId: string
  readonly label: string
  readonly locale: string
  readonly parameterIndex: number
}

export type SemanticLocalizationDiagnosticCode =
  | "invalid_label_parameter_index"
  | "label_without_numeric_parameter"
  | "localization_group_without_numeric_parameters"
  | "missing_talent_parameter_owner"
  | "numeric_parameter_without_label"

/** One author-facing discrepancy found while aligning a label asset with the numeric source. */
export interface SemanticLocalizationDiagnostic {
  readonly characterId: string
  readonly code: SemanticLocalizationDiagnosticCode
  readonly groupId: string
  readonly message: string
  readonly parameterIndex: number | null
}

/** The deterministic sidecar emitted only after source and index alignment have been reviewed. */
export interface SemanticLocalizationPreview {
  readonly diagnostics: readonly SemanticLocalizationDiagnostic[]
  readonly formatVersion: 3
  readonly gameVersion: string
  readonly groups: readonly CharacterSkillLocalizationGroup[]
  readonly labels: readonly CharacterSkillParameterLabel[]
  readonly locale: string
  readonly source: SemanticLocalizationPreviewSourceManifest
}

/** A downloaded source asset paired with its explicit talent-parameter owner mapping. */
export interface SemanticLocalizationDocumentInput {
  readonly document: unknown
  readonly source: SemanticLocalizationAssetSource
}

/** Input for creating an optional localization sidecar from a pinned numeric source and reviewed assets. */
export interface CreateSemanticLocalizationPreviewInput {
  readonly documents: readonly SemanticLocalizationDocumentInput[]
  readonly manifest: SemanticLocalizationPreviewSourceManifest
  readonly numericDocument: GiStatsDocument
  readonly numericManifest: GameDataSourceManifest
}

/** Input for atomically creating a localization sidecar without modifying the numeric snapshot. */
export interface CreateAndWriteSemanticLocalizationPreviewInput extends CreateSemanticLocalizationPreviewInput {
  readonly outputPath: string
}

interface ParsedLocalizationGroup {
  readonly displayName?: string
  readonly groupId: string
  readonly labels: readonly CharacterSkillParameterLabel[]
}

interface ParsedLocalizationDocument {
  readonly diagnostics: readonly SemanticLocalizationDiagnostic[]
  readonly groups: readonly ParsedLocalizationGroup[]
}

interface RecordValue {
  readonly [key: string]: unknown
}

/** Calculates the deterministic aggregate checksum for a reviewed localization asset list. */
export function calculateSemanticLocalizationAggregateSha256(
  assets: readonly SemanticLocalizationAssetSource[]
): string {
  const payload = [...assets]
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath))
    .map((asset) => `${asset.relativePath}\0${asset.sha256}\n`)
    .join("")
  return createHash("sha256").update(payload).digest("hex")
}

/** Validates that a localization preview lock refers to the exact numeric source that it is allowed to annotate. */
export function assertSemanticLocalizationPreviewManifest(
  manifest: SemanticLocalizationPreviewSourceManifest,
  numericManifest: GameDataSourceManifest
): void {
  assertSemanticLocalizationSourceManifest(manifest)
  if (manifest.gameVersion !== numericManifest.gameVersion) {
    throw new Error(
      `semantic localization game version ${manifest.gameVersion} does not match numeric source ${numericManifest.gameVersion}`
    )
  }
  if (manifest.upstreamCommit !== numericManifest.upstreamCommit) {
    throw new Error("semantic localization upstream commit does not match the numeric source")
  }
  if (manifest.upstreamRepository !== numericManifest.upstreamRepository) {
    throw new Error("semantic localization upstream repository does not match the numeric source")
  }
}

function assertSemanticLocalizationSourceManifest(manifest: SemanticLocalizationPreviewSourceManifest): void {
  if (manifest.formatVersion !== 3) {
    throw new Error(`Unsupported semantic localization preview format ${manifest.formatVersion}`)
  }
  if (!isNonEmptyString(manifest.locale)) throw new Error("semantic localization locale must not be empty")
  if (manifest.assets.length === 0) throw new Error("semantic localization preview requires at least one asset")

  const assetIds = new Set<string>()
  const ownerIds = new Set<string>()
  const paths = new Set<string>()
  for (const asset of manifest.assets) {
    if (!isNonEmptyString(asset.assetId)) throw new Error("semantic localization asset ID must not be empty")
    if (!isNonEmptyString(asset.talentParameterOwnerId)) {
      throw new Error("semantic localization talent parameter owner ID must not be empty")
    }
    if (!isSafeLocalizationPath(asset.relativePath, manifest.locale)) {
      throw new Error(`semantic localization asset path is not allowed: ${asset.relativePath}`)
    }
    if (!isSha256(asset.sha256)) throw new Error(`semantic localization asset checksum is invalid: ${asset.assetId}`)
    if (assetIds.has(asset.assetId)) throw new Error(`semantic localization asset ID is duplicated: ${asset.assetId}`)
    if (ownerIds.has(asset.talentParameterOwnerId)) {
      throw new Error(`semantic localization talent parameter owner is duplicated: ${asset.talentParameterOwnerId}`)
    }
    if (paths.has(asset.relativePath)) throw new Error(`semantic localization asset path is duplicated: ${asset.relativePath}`)
    assetIds.add(asset.assetId)
    ownerIds.add(asset.talentParameterOwnerId)
    paths.add(asset.relativePath)
  }

  const actualAggregate = calculateSemanticLocalizationAggregateSha256(manifest.assets)
  if (actualAggregate !== manifest.assetsAggregateSha256) {
    throw new Error(
      `semantic localization aggregate checksum mismatch: expected ${manifest.assetsAggregateSha256}, received ${actualAggregate}`
    )
  }
}

/** Creates a deterministic authoring sidecar without inferring combat mechanics from its labels. */
export function createSemanticLocalizationPreview(input: CreateSemanticLocalizationPreviewInput): SemanticLocalizationPreview {
  assertSemanticLocalizationPreviewManifest(input.manifest, input.numericManifest)
  const documentsByAssetId = new Map(input.documents.map((document) => [document.source.assetId, document]))
  if (documentsByAssetId.size !== input.documents.length) {
    throw new Error("semantic localization preview documents contain duplicate asset IDs")
  }
  if (documentsByAssetId.size !== input.manifest.assets.length) {
    throw new Error("semantic localization preview documents do not match the locked asset list")
  }

  const groups: CharacterSkillLocalizationGroup[] = []
  const labels: CharacterSkillParameterLabel[] = []
  const diagnostics: SemanticLocalizationDiagnostic[] = []

  for (const asset of input.manifest.assets) {
    const downloaded = documentsByAssetId.get(asset.assetId)
    if (!downloaded || !isSameAssetSource(downloaded.source, asset)) {
      throw new Error(`semantic localization preview is missing locked asset ${asset.assetId}`)
    }
    const numericSkills = input.numericDocument.char.skillParam[asset.talentParameterOwnerId]
    if (!numericSkills) {
      diagnostics.push({
        characterId: asset.talentParameterOwnerId,
        code: "missing_talent_parameter_owner",
        groupId: "",
        message: `Localization asset ${asset.assetId} has no matching numeric talent parameter owner`,
        parameterIndex: null
      })
      continue
    }

    const parsed = parseLocalizationDocument(downloaded.document, asset.talentParameterOwnerId, input.manifest.locale)
    diagnostics.push(...parsed.diagnostics)
    for (const group of parsed.groups) {
      const numericParameterCount = getNumericParameterCount(numericSkills[group.groupId])
      if (numericParameterCount === undefined) {
        diagnostics.push({
          characterId: asset.talentParameterOwnerId,
          code: "localization_group_without_numeric_parameters",
          groupId: group.groupId,
          message: `Localization group ${group.groupId} does not have a normalized numeric parameter group`,
          parameterIndex: null
        })
        continue
      }
      if (group.displayName) {
        groups.push({
          characterId: asset.talentParameterOwnerId,
          displayName: group.displayName,
          groupId: group.groupId,
          locale: input.manifest.locale
        })
      }

      const labeledIndexes = new Set<number>()
      for (const label of group.labels) {
        if (label.parameterIndex >= numericParameterCount) {
          diagnostics.push({
            characterId: label.characterId,
            code: "label_without_numeric_parameter",
            groupId: label.groupId,
            message: `Localized label ${label.parameterIndex} has no matching numeric parameter`,
            parameterIndex: label.parameterIndex
          })
          continue
        }
        labeledIndexes.add(label.parameterIndex)
        labels.push(label)
      }
      for (let parameterIndex = 0; parameterIndex < numericParameterCount; parameterIndex += 1) {
        if (labeledIndexes.has(parameterIndex)) continue
        diagnostics.push({
          characterId: asset.talentParameterOwnerId,
          code: "numeric_parameter_without_label",
          groupId: group.groupId,
          message: `Numeric parameter ${parameterIndex} has no non-empty localized label`,
          parameterIndex
        })
      }
    }
  }

  return {
    diagnostics: sortDiagnostics(diagnostics),
    formatVersion: 3,
    gameVersion: input.manifest.gameVersion,
    groups: sortGroups(groups),
    labels: sortLabels(labels),
    locale: input.manifest.locale,
    source: input.manifest
  }
}

/** Builds and atomically replaces only the requested localization sidecar after every validation succeeds. */
export function createAndWriteSemanticLocalizationPreview(
  input: CreateAndWriteSemanticLocalizationPreviewInput
): SemanticLocalizationPreview {
  const preview = createSemanticLocalizationPreview(input)
  const temporaryPath = `${input.outputPath}.tmp`
  mkdirSync(dirname(input.outputPath), { recursive: true })
  rmSync(temporaryPath, { force: true })
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(preview, null, 2)}\n`)
    renameSync(temporaryPath, input.outputPath)
    return preview
  } catch (error) {
    rmSync(temporaryPath, { force: true })
    throw error
  }
}

/** Downloads each checksum-locked localization asset from the manifest's pinned GitHub commit. */
export async function downloadSemanticLocalizationDocuments(
  manifest: SemanticLocalizationPreviewSourceManifest
): Promise<readonly SemanticLocalizationDocumentInput[]> {
  assertSemanticLocalizationSourceManifest(manifest)
  const dispatcher = new EnvHttpProxyAgent()
  try {
    const documents: SemanticLocalizationDocumentInput[] = []
    for (const asset of manifest.assets) {
      const url = getRawGitHubAssetUrl(manifest.upstreamRepository, manifest.upstreamCommit, asset.relativePath)
      const response = await fetchWithRetry(url, dispatcher)
      if (!response.ok) {
        throw new Error(`Unable to download semantic localization asset ${asset.assetId}: HTTP ${response.status}`)
      }
      const data = new Uint8Array(await response.arrayBuffer())
      const actualSha256 = calculateSha256(data)
      if (actualSha256 !== asset.sha256) {
        throw new Error(
          `semantic localization checksum mismatch for ${asset.assetId}: expected ${asset.sha256}, received ${actualSha256}`
        )
      }
      documents.push({ document: JSON.parse(new TextDecoder().decode(data)) as unknown, source: asset })
    }
    return documents
  } finally {
    await dispatcher.close()
  }
}

function parseLocalizationDocument(document: unknown, characterId: string, locale: string): ParsedLocalizationDocument {
  if (!isRecord(document)) throw new Error(`Localization asset for ${characterId} must contain a JSON object`)

  const groups: ParsedLocalizationGroup[] = []
  const diagnostics: SemanticLocalizationDiagnostic[] = []
  for (const [groupId, value] of Object.entries(document)) {
    if (!isRecord(value)) continue
    const displayName = toNonEmptyString(value.name)
    const skillParams = value.skillParams
    if (!isRecord(skillParams) && !displayName) continue

    const labels: CharacterSkillParameterLabel[] = []
    for (const [rawIndex, rawLabel] of Object.entries(isRecord(skillParams) ? skillParams : {})) {
      const label = toNonEmptyString(rawLabel)
      if (!label) continue
      const parameterIndex = parseParameterIndex(rawIndex)
      if (parameterIndex === undefined) {
        diagnostics.push({
          characterId,
          code: "invalid_label_parameter_index",
          groupId,
          message: `Localized label index ${rawIndex} is not a canonical non-negative integer`,
          parameterIndex: null
        })
        continue
      }
      labels.push({ characterId, groupId, label, locale, parameterIndex })
    }
    groups.push({ ...(displayName ? { displayName } : {}), groupId, labels: sortLabels(labels) })
  }
  return { diagnostics, groups }
}

async function fetchWithRetry(url: string, dispatcher: Dispatcher): Promise<UndiciResponse> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetch(url, { dispatcher, signal: AbortSignal.timeout(30_000) })
    } catch (error) {
      lastError = error
      if (attempt < 3) await setTimeout(attempt * 500)
    }
  }
  throw new Error("Unable to connect to the pinned semantic localization source after 3 attempts", { cause: lastError })
}

function getRawGitHubAssetUrl(upstreamRepository: string, commit: string, relativePath: string): string {
  const repositoryUrl = new URL(upstreamRepository)
  if (repositoryUrl.protocol !== "https:" || repositoryUrl.hostname !== "github.com") {
    throw new Error(`semantic localization upstream repository must be an HTTPS GitHub URL: ${upstreamRepository}`)
  }
  const repositoryPath = repositoryUrl.pathname.replace(/^\/+|\/+$/g, "")
  if (repositoryPath.split("/").length !== 2) {
    throw new Error(`semantic localization upstream repository is not an owner/repository URL: ${upstreamRepository}`)
  }
  return `https://raw.githubusercontent.com/${repositoryPath}/${commit}/${relativePath}`
}

function getNumericParameterCount(value: unknown): number | undefined {
  if (!Array.isArray(value) || !value.every(isNumberArray)) return undefined
  return value.length
}

function isNumberArray(value: unknown): value is readonly number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item))
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0
}

function isSafeLocalizationPath(relativePath: string, locale: string): boolean {
  const prefix = `libs/gi/dm-localization/assets/locales/${locale}/`
  return (
    relativePath.startsWith(prefix) &&
    relativePath.endsWith(".json") &&
    !relativePath.split("/").some((segment) => segment === "" || segment === "." || segment === "..")
  )
}

function isSameAssetSource(left: SemanticLocalizationAssetSource, right: SemanticLocalizationAssetSource): boolean {
  return (
    left.assetId === right.assetId &&
    left.relativePath === right.relativePath &&
    left.sha256 === right.sha256 &&
    left.talentParameterOwnerId === right.talentParameterOwnerId
  )
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value)
}

function calculateSha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex")
}

function parseParameterIndex(value: string): number | undefined {
  if (!/^(0|[1-9]\d*)$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) ? parsed : undefined
}

function sortDiagnostics(diagnostics: readonly SemanticLocalizationDiagnostic[]): SemanticLocalizationDiagnostic[] {
  return [...diagnostics].sort((left, right) => {
    const character = left.characterId.localeCompare(right.characterId)
    if (character !== 0) return character
    const group = left.groupId.localeCompare(right.groupId)
    if (group !== 0) return group
    const index = (left.parameterIndex ?? -1) - (right.parameterIndex ?? -1)
    if (index !== 0) return index
    return left.code.localeCompare(right.code)
  })
}

function sortGroups(groups: readonly CharacterSkillLocalizationGroup[]): CharacterSkillLocalizationGroup[] {
  return [...groups].sort(
    (left, right) =>
      left.characterId.localeCompare(right.characterId) ||
      left.groupId.localeCompare(right.groupId) ||
      left.locale.localeCompare(right.locale)
  )
}

function sortLabels(labels: readonly CharacterSkillParameterLabel[]): CharacterSkillParameterLabel[] {
  return [...labels].sort(
    (left, right) =>
      left.characterId.localeCompare(right.characterId) ||
      left.groupId.localeCompare(right.groupId) ||
      left.parameterIndex - right.parameterIndex ||
      left.locale.localeCompare(right.locale)
  )
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}
