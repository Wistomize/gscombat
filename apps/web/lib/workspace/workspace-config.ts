import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"

// Preserve pre-GSCombat browser workspaces across the repository rename.
export const BUILD_LIBRARY_STORAGE_KEY = "project-b.build-library.v1"
export const PARTY_STORAGE_KEY = "project-b.party.v1"

const LEGACY_BUILD_LIBRARY_STORAGE_KEY = "project-b.character-builds.v1"

export interface BuildLibraryState {
  readonly builds: readonly CharacterBuild[]
  readonly schemaVersion: 1
}

export interface PartyState {
  readonly memberBuildIds: readonly string[]
}

export interface BuildWorkspaceExport {
  readonly builds: readonly CharacterBuild[]
  readonly exportedAt: string
  readonly schemaVersion: 1
}

export type BrowserWorkspaceStorageMode = "local" | "memory" | "session"

export interface BrowserWorkspaceStorage {
  readonly mode: BrowserWorkspaceStorageMode
  readonly storage: Storage
}

class VolatileWorkspaceStorage implements Storage {
  readonly #values = new Map<string, string>()

  get length(): number {
    return this.#values.size
  }

  clear(): void {
    this.#values.clear()
  }

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.#values.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.#values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value)
  }
}

const volatileWorkspaceStorage = new VolatileWorkspaceStorage()

/** Returns the process-local workspace store used when browser persistence is unavailable. */
export function getVolatileWorkspaceStorage(): BrowserWorkspaceStorage {
  return { mode: "memory", storage: volatileWorkspaceStorage }
}

function canWriteStorage(storage: Storage): boolean {
  const probeKey = `project-b.storage-probe.${Date.now()}`
  try {
    storage.setItem(probeKey, "1")
    storage.removeItem(probeKey)
    return true
  } catch {
    return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isCharacterBuild(value: unknown): value is CharacterBuild {
  return (
    isRecord(value) &&
    typeof value.buildId === "string" &&
    typeof value.characterId === "string" &&
    Array.isArray(value.artifacts) &&
    isRecord(value.weapon)
  )
}

function isEvaluationScenario(value: unknown): value is EvaluationScenario {
  return isRecord(value) && isCharacterBuild(value.primary) && Array.isArray(value.teammates) && isRecord(value.enemy)
}

/** Merges builds by buildId while preserving unrelated configurations. */
export function mergeBuilds(
  current: readonly CharacterBuild[],
  incoming: readonly CharacterBuild[]
): CharacterBuild[] {
  const merged = new Map(current.map((build) => [build.buildId, build]))
  for (const build of incoming) merged.set(build.buildId, build)
  return [...merged.values()]
}

/** Parses a single build, a legacy scenario, or a versioned build-workspace JSON document. */
export function parseBuildWorkspaceJson(source: string): CharacterBuild[] {
  const parsed: unknown = JSON.parse(source)
  if (isCharacterBuild(parsed)) return [parsed]
  if (isEvaluationScenario(parsed)) {
    const teammates = parsed.teammates.filter(isCharacterBuild)
    return mergeBuilds([], [parsed.primary, ...teammates])
  }
  if (isRecord(parsed) && parsed.schemaVersion === 1 && Array.isArray(parsed.builds)) {
    if (!parsed.builds.every(isCharacterBuild)) throw new Error("工作空间包含无法识别的角色配置")
    return mergeBuilds([], parsed.builds)
  }
  throw new Error("无法识别配置：需要角色配置、旧场景或工作空间 JSON")
}

/** Creates the portable export that contains only the configured character builds. */
export function createBuildWorkspaceExport(builds: readonly CharacterBuild[]): BuildWorkspaceExport {
  return { builds, exportedAt: new Date().toISOString(), schemaVersion: 1 }
}

/** Chooses durable browser storage first, then a same-tab session fallback, or memory-only mode. */
export function resolveBrowserWorkspaceStorage(browser: Window): BrowserWorkspaceStorage {
  try {
    if (canWriteStorage(browser.localStorage)) return { mode: "local", storage: browser.localStorage }
  } catch {
    // Accessing localStorage itself may throw when browser storage is blocked.
  }
  try {
    if (canWriteStorage(browser.sessionStorage)) return { mode: "session", storage: browser.sessionStorage }
  } catch {
    // The caller can still keep an in-memory workspace and offer JSON import/export.
  }
  return getVolatileWorkspaceStorage()
}

/** Reports whether this browser contains user-persisted build data rather than only application fallbacks. */
export function hasStoredBuildLibrary(storage: Pick<Storage, "getItem">): boolean {
  return Boolean(storage.getItem(BUILD_LIBRARY_STORAGE_KEY) || storage.getItem(LEGACY_BUILD_LIBRARY_STORAGE_KEY))
}

/** Loads the versioned build library and migrates the legacy local-build array when present. */
export function loadBuildLibrary(
  storage: Pick<Storage, "getItem">,
  fallbackBuilds: readonly CharacterBuild[]
): BuildLibraryState {
  const current = storage.getItem(BUILD_LIBRARY_STORAGE_KEY)
  if (current) {
    const parsed: unknown = JSON.parse(current)
    if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.builds)) {
      throw new Error("本地角色配置库格式无效")
    }
    if (!parsed.builds.every(isCharacterBuild)) throw new Error("本地角色配置库包含无效配置")
    return { builds: mergeBuilds([], parsed.builds), schemaVersion: 1 }
  }

  const legacy = storage.getItem(LEGACY_BUILD_LIBRARY_STORAGE_KEY)
  if (legacy) {
    const parsed: unknown = JSON.parse(legacy)
    if (!Array.isArray(parsed) || !parsed.every(isCharacterBuild)) throw new Error("旧版角色配置格式无效")
    return { builds: mergeBuilds(fallbackBuilds, parsed), schemaVersion: 1 }
  }
  return { builds: mergeBuilds([], fallbackBuilds), schemaVersion: 1 }
}

/** Loads a locally persisted party and removes dangling, duplicate, or over-capacity members. */
export function loadParty(storage: Pick<Storage, "getItem">, builds: readonly CharacterBuild[]): PartyState {
  const source = storage.getItem(PARTY_STORAGE_KEY)
  if (!source) return { memberBuildIds: [] }
  const parsed: unknown = JSON.parse(source)
  if (!isRecord(parsed) || !Array.isArray(parsed.memberBuildIds)) throw new Error("本地队伍格式无效")

  const buildsById = new Map(builds.map((build) => [build.buildId, build]))
  const characterIds = new Set<string>()
  const memberBuildIds: string[] = []
  for (const value of parsed.memberBuildIds) {
    if (typeof value !== "string") continue
    const build = buildsById.get(value)
    if (!build || characterIds.has(build.characterId) || memberBuildIds.length >= 4) continue
    characterIds.add(build.characterId)
    memberBuildIds.push(build.buildId)
  }
  return { memberBuildIds }
}

/** Persists the complete build library independently from transient party and calculation state. */
export function saveBuildLibrary(storage: Pick<Storage, "setItem">, builds: readonly CharacterBuild[]): void {
  const state: BuildLibraryState = { builds, schemaVersion: 1 }
  storage.setItem(BUILD_LIBRARY_STORAGE_KEY, JSON.stringify(state))
}

/** Persists the current unordered party independently from exported character configurations. */
export function saveParty(storage: Pick<Storage, "setItem">, party: PartyState): void {
  storage.setItem(PARTY_STORAGE_KEY, JSON.stringify(party))
}
