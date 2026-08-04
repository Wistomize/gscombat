import { execFile } from "node:child_process"
import { access, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { promisify } from "node:util"
import { fileURLToPath } from "node:url"

import { supportedCharacters, supportedWeapons } from "@gscombat/content"

const execFileAsync = promisify(execFile)
const upstreamCommit = "21c98eb60355160274a8c4cecfc5671e2151a073"
const upstreamRepository = "https://github.com/frzyc/genshin-optimizer"
const rawBaseUrl = `https://raw.githubusercontent.com/frzyc/genshin-optimizer/${upstreamCommit}`
const treeUrl = `https://api.github.com/repos/frzyc/genshin-optimizer/git/trees/${upstreamCommit}?recursive=1`
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const repositoryRoot = resolve(packageRoot, "../..")
const publicRoot = join(packageRoot, "public", "icons")
const generatedPath = join(packageRoot, "lib", "visual-assets.generated.json")
const gameDataPath = join(repositoryRoot, "packages", "game-data", "snapshots", "6.7", "game-data.sqlite")

type ArtifactSlot = "circlet" | "flower" | "goblet" | "plume" | "sands"
type Element = "anemo" | "cryo" | "dendro" | "electro" | "geo" | "hydro" | "pyro" | "traveler"

interface TreeEntry {
  readonly path: string
  readonly type: string
}

interface TreeResponse {
  readonly tree: readonly TreeEntry[]
  readonly truncated: boolean
}

interface CharacterElementRow {
  readonly element: string | null
  readonly id: string
}

interface ArtifactSetRow {
  readonly id: string
}

const artifactSuffixes: Readonly<Record<ArtifactSlot, string>> = {
  circlet: "3",
  flower: "4",
  goblet: "1",
  plume: "2",
  sands: "5"
}

const elementNames = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const

async function requireJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { "User-Agent": "gscombat-visual-assets" } })
  if (!response.ok) throw new Error(`Asset metadata request failed: ${response.status} ${url}`)
  return await response.json() as T
}

async function requireText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "User-Agent": "gscombat-visual-assets" } })
  if (!response.ok) throw new Error(`Asset source request failed: ${response.status} ${url}`)
  return await response.text()
}

async function downloadThumbnail(
  sourcePath: string,
  outputPath: string,
  size: number,
  temporaryRoot: string,
  resume: boolean
): Promise<void> {
  if (resume) {
    try {
      await access(outputPath)
      return
    } catch {
      // Continue with the missing thumbnail when resuming an interrupted sync.
    }
  }
  const sourceFile = join(temporaryRoot, `${crypto.randomUUID()}.png`)
  const response = await fetch(`${rawBaseUrl}/${sourcePath}`, { headers: { "User-Agent": "gscombat-visual-assets" } })
  if (!response.ok) throw new Error(`Asset download failed: ${response.status} ${sourcePath}`)
  await writeFile(sourceFile, new Uint8Array(await response.arrayBuffer()))
  await mkdir(dirname(outputPath), { recursive: true })
  await execFileAsync("cwebp", ["-quiet", "-q", "82", "-resize", String(size), String(size), sourceFile, "-o", outputPath])
}

async function runWithConcurrency(tasks: readonly (() => Promise<void>)[], limit: number): Promise<void> {
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex]
      nextIndex += 1
      if (task) await task()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
}

function requireMatchingPath(paths: readonly string[], pattern: RegExp, description: string): string {
  const matches = paths.filter((path) => pattern.test(path))
  if (matches.length !== 1) throw new Error(`Expected one ${description} asset, found ${matches.length}`)
  return matches[0]!
}

function readCharacterElements(): ReadonlyMap<string, Element> {
  const database = new DatabaseSync(gameDataPath, { readOnly: true })
  try {
    const rows = database.prepare("SELECT id, element FROM characters").all() as unknown as CharacterElementRow[]
    return new Map(rows.map((row) => [row.id, row.id === "Traveler" ? "traveler" : row.element as Element]))
  } finally {
    database.close()
  }
}

function readArtifactSetIds(): readonly string[] {
  const database = new DatabaseSync(gameDataPath, { readOnly: true })
  try {
    const rows = database.prepare("SELECT id FROM artifact_sets ORDER BY id").all() as unknown as ArtifactSetRow[]
    return rows.map((row) => row.id)
  } finally {
    database.close()
  }
}

async function readElementPaths(): Promise<Record<(typeof elementNames)[number], string>> {
  const entries = await Promise.all(elementNames.map(async (element) => {
    const componentName = `${element[0]!.toUpperCase()}${element.slice(1)}Icon`
    const source = await requireText(
      `${rawBaseUrl}/libs/gi/svgicons/src/icons/Element/${componentName}.tsx`
    )
    const path = source.match(/<path d="([^"]+)"/)?.[1]
    if (!path) throw new Error(`Missing SVG path for ${element}`)
    return [element, path] as const
  }))
  return Object.fromEntries(entries) as Record<(typeof elementNames)[number], string>
}

async function main(): Promise<void> {
  const resume = process.argv.includes("--resume")
  const tree = await requireJson<TreeResponse>(treeUrl)
  if (tree.truncated) throw new Error("Upstream asset tree is truncated")
  const paths = tree.tree.filter((entry) => entry.type === "blob").map((entry) => entry.path)
  const characterElements = readCharacterElements()
  const artifactSetIds = readArtifactSetIds()
  const temporaryRoot = await mkdtemp(join(tmpdir(), "gscombat-icons-"))
  const characters: Record<string, { element: Element; icon: string }> = {}
  const weapons: Record<string, string> = {}
  const artifacts: Record<string, Partial<Record<ArtifactSlot, string>>> = {}
  const tasks: (() => Promise<void>)[] = []

  try {
    for (const character of supportedCharacters) {
      const sourceDirectory = character.characterId === "Traveler" ? "TravelerM" : character.characterId
      const sourcePath = requireMatchingPath(
        paths,
        new RegExp(`^libs/gi/assets/src/gen/chars/${sourceDirectory}/UI_AvatarIcon_(?!Side_)[^/]+\\.png$`),
        `character ${character.characterId}`
      )
      const icon = `/icons/characters/${character.characterId}.webp`
      const element = characterElements.get(character.characterId)
      if (!element) throw new Error(`Missing element for ${character.characterId}`)
      characters[character.characterId] = { element, icon }
      tasks.push(() => downloadThumbnail(sourcePath, join(packageRoot, "public", icon), 144, temporaryRoot, resume))
    }

    for (const weapon of supportedWeapons) {
      const sourcePath = requireMatchingPath(
        paths,
        new RegExp(`^libs/gi/assets/src/gen/weapons/${weapon.weaponId}/(?!.*_Awaken\\.png$)[^/]+\\.png$`),
        `weapon ${weapon.weaponId}`
      )
      const icon = `/icons/weapons/${weapon.weaponId}.webp`
      weapons[weapon.weaponId] = icon
      tasks.push(() => downloadThumbnail(sourcePath, join(packageRoot, "public", icon), 96, temporaryRoot, resume))
    }

    for (const artifactSetId of artifactSetIds) {
      const slotIcons: Partial<Record<ArtifactSlot, string>> = {}
      for (const [slot, suffix] of Object.entries(artifactSuffixes) as [ArtifactSlot, string][]) {
        const sourcePath = paths.find((path) =>
          new RegExp(
            `^libs/gi/assets/src/gen/artifacts/${artifactSetId}/UI_RelicIcon_[^/]+_${suffix}\\.png$`
          ).test(path)
        )
        if (!sourcePath) continue
        const icon = `/icons/artifacts/${artifactSetId}/${slot}.webp`
        slotIcons[slot] = icon
        tasks.push(() => downloadThumbnail(sourcePath, join(packageRoot, "public", icon), 80, temporaryRoot, resume))
      }
      if (Object.keys(slotIcons).length === 0) {
        throw new Error(`Missing artifact icon source for ${artifactSetId}`)
      }
      artifacts[artifactSetId] = slotIcons
    }

    await runWithConcurrency(tasks, 24)
    const elementPaths = await readElementPaths()
    const generated = {
      artifacts,
      characters,
      elementPaths,
      source: { upstreamCommit, upstreamRepository },
      weapons
    }
    await writeFile(generatedPath, `${JSON.stringify(generated, null, 2)}\n`)
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true })
  }
}

await main()
