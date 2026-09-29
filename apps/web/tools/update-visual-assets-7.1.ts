import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const commit = "49a6544a6c6ae36089cb42fa591fc46f01de8bcf"
export const additionalCharacters = { Vesna: "anemo", Vodyanitsa: "hydro" } as const
export const additionalWeapons = ["NewBough", "Silverlight", "BeyondTheChrysalis", "WintersHeavyHeart",
  "HymnOfTheMaelstrom", "BreezeborneRefrain"] as const

/** Appends only new-version thumbnails, preserving baseline assets and their source attribution. */
export function updateAdditionalVisualAssets(): void {
  const temporary = mkdtempSync(join(tmpdir(), "gscombat-7-1-icons-"))
  const manifestPath = join(root, "lib/visual-assets.generated.json")
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  const sources: Record<string, { url: string; sha256: string }> = {}
  try {
    for (const [kind, ids] of [["characters", Object.keys(additionalCharacters)], ["weapons", additionalWeapons]] as const) {
      const metadataPath = join(temporary, `${kind}.json`)
      const url = `https://raw.githubusercontent.com/theBowja/genshin-db/${commit}/src/data/image/${kind}.json`
      execFileSync("curl", ["-fsSL", "--max-time", "30", url, "-o", metadataPath])
      const metadataBytes = readFileSync(metadataPath)
      sources[kind] = { url, sha256: createHash("sha256").update(metadataBytes).digest("hex") }
      const metadata = JSON.parse(metadataBytes.toString("utf8"))
      for (const id of ids) {
        const iconName = metadata[id.toLowerCase()]?.filename_icon
        if (typeof iconName !== "string" || !/^UI_[A-Za-z0-9_]+$/.test(iconName)) {
          throw new Error(`Missing official icon: ${id}`)
        }
        const imageUrl = `https://enka.network/ui/${iconName}.png`
        const input = join(temporary, `${id}.png`)
        execFileSync("curl", ["-fsSL", "--max-time", "30", imageUrl, "-o", input])
        sources[id] = { url: imageUrl, sha256: createHash("sha256").update(readFileSync(input)).digest("hex") }
        const icon = `/icons/${kind}/${id}.webp`
        const output = join(root, "public", icon)
        mkdirSync(dirname(output), { recursive: true })
        const size = kind === "characters" ? "144" : "96"
        execFileSync("cwebp", ["-quiet", "-q", "82", "-resize", size, size, input, "-o", output])
        manifest[kind][id] = kind === "characters"
          ? { element: additionalCharacters[id as keyof typeof additionalCharacters], icon } : icon
      }
    }
    manifest.additionalSources = { ...manifest.additionalSources, "7.1": { commit,
      repository: "https://github.com/theBowja/genshin-db", imageOwner: "HoYoverse", files: sources } }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
  } finally { rmSync(temporary, { recursive: true, force: true }) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) updateAdditionalVisualAssets()
