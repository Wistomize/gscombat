import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { EnvHttpProxyAgent, fetch } from "undici"

import { characterCatalogPresentation } from "../../../packages/content/src/catalog-presentation.js"
import { artifactSetInventory, weaponInventory } from "../../../packages/content/src/equipment-inventory.js"

interface EnkaAvatarMetadata {
  readonly NameTextMapHash?: number
  readonly SkillOrder?: readonly number[]
}

interface EnkaWeaponMetadata {
  readonly NameTextMapHash?: number
}

interface EnkaArtifactSetMetadata {
  readonly Name?: number | string
}

interface EnkaArtifactItemMetadata {
  readonly SetId?: number
}

interface DownloadedJson<T> {
  readonly bytes: Uint8Array
  readonly value: T
}

type TravelerElement = "anemo" | "dendro" | "electro" | "geo" | "hydro" | "pyro"

const enkaApiDocsCommit = "7339dc982937c40b48ef48c569bf6d0a1aa5c851"
const enkaApiDocsRepository = "https://github.com/EnkaNetwork/API-docs"
const enkaStoreRoot =
  `https://raw.githubusercontent.com/EnkaNetwork/API-docs/${enkaApiDocsCommit}` + "/store/gi"

const travelerElementBySkillDepotSuffix: Readonly<Record<string, TravelerElement>> = {
  "2": "geo",
  "3": "electro",
  "4": "anemo",
  "6": "dendro",
  "7": "hydro",
  "8": "pyro"
}

function calculateSha256(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex")
}

async function downloadJson<T>(relativePath: string, dispatcher: EnvHttpProxyAgent): Promise<DownloadedJson<T>> {
  const url = `${enkaStoreRoot}/${relativePath}`
  const response = await fetch(url, { dispatcher, signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`Unable to download ${url}: HTTP ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  return { bytes, value: JSON.parse(new TextDecoder().decode(bytes)) as T }
}

function requireLabel(localizations: Readonly<Record<string, string>>, hash: number | string | undefined): string {
  const label = hash === undefined ? undefined : localizations[String(hash)]
  if (!label) throw new Error(`Missing Simplified Chinese localization for Enka hash ${hash ?? "missing"}`)
  return label
}

function requireSkillOrder(skillOrder: readonly number[] | undefined, lookupId: string): readonly [number, number, number] {
  if (skillOrder?.length !== 3 || skillOrder.some((skillId) => !Number.isInteger(skillId))) {
    throw new Error(`Enka avatar ${lookupId} does not declare exactly three ordered combat talents`)
  }
  return [skillOrder[0]!, skillOrder[1]!, skillOrder[2]!]
}

function indexByLabel<T extends { readonly label: string }>(entries: readonly T[], kind: string): ReadonlyMap<string, T> {
  const result = new Map<string, T>()
  for (const entry of entries) {
    if (result.has(entry.label)) throw new Error(`Duplicate ${kind} Simplified Chinese label: ${entry.label}`)
    result.set(entry.label, entry)
  }
  return result
}

function assertExactCoverage(expectedIds: readonly string[], actualIds: readonly string[], kind: string): void {
  const expected = new Set(expectedIds)
  const actual = new Set(actualIds)
  const missing = expectedIds.filter((id) => !actual.has(id))
  const extra = actualIds.filter((id) => !expected.has(id))
  if (missing.length > 0 || extra.length > 0 || actual.size !== actualIds.length) {
    throw new Error(
      `${kind} showcase metadata differs from the local catalog: ` +
        `missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}; ` +
        `duplicateCount=${actualIds.length - actual.size}`
    )
  }
}

const dispatcher = new EnvHttpProxyAgent()
const [avatarsDownload, weaponsDownload, relicsDownload, localizationsDownload] = await (async () => {
  try {
    return await Promise.all([
      downloadJson<Readonly<Record<string, EnkaAvatarMetadata>>>("avatars.json", dispatcher),
      downloadJson<Readonly<Record<string, EnkaWeaponMetadata>>>("weapons.json", dispatcher),
      downloadJson<{
        readonly Items: Readonly<Record<string, EnkaArtifactItemMetadata>>
        readonly Sets: Readonly<Record<string, EnkaArtifactSetMetadata>>
      }>("relics.json", dispatcher),
      downloadJson<Readonly<Record<string, Readonly<Record<string, string>>>>>("locs.json", dispatcher)
    ])
  } finally {
    await dispatcher.close()
  }
})()

const localizations = localizationsDownload.value["zh-cn"]
if (!localizations) throw new Error("Enka localization snapshot does not contain zh-cn")

const characterByLabel = indexByLabel(characterCatalogPresentation, "character")
const weaponByLabel = indexByLabel(weaponInventory, "weapon")
const artifactSetByLabel = indexByLabel(artifactSetInventory, "artifact set")

const characterMetadata = Object.entries(avatarsDownload.value)
  .flatMap(([lookupId, avatar]) => {
    const label = requireLabel(localizations, avatar.NameTextMapHash)
    const localCharacter = characterByLabel.get(label)
    if (!localCharacter) return []
    const [avatarIdText, skillDepotIdText] = lookupId.split("-")
    const avatarId = Number(avatarIdText)
    if (!Number.isInteger(avatarId)) throw new Error(`Invalid Enka avatar lookup ID: ${lookupId}`)

    if (localCharacter.characterId === "Traveler") {
      if (!skillDepotIdText) return []
      const skillDepotId = Number(skillDepotIdText)
      const element = travelerElementBySkillDepotSuffix[skillDepotIdText.at(-1) ?? ""]
      if (!Number.isInteger(skillDepotId) || !element) return []
      return [
        {
          avatarId,
          characterId: localCharacter.characterId,
          label,
          lookupId,
          skillDepotId,
          skillIds: requireSkillOrder(avatar.SkillOrder, lookupId),
          variant: {
            element,
            gender: avatarId === 10000005 ? "male" : "female",
            kind: "traveler"
          },
          weaponType: localCharacter.weaponType
        }
      ]
    }

    if (skillDepotIdText) return []
    return [
      {
        avatarId,
        characterId: localCharacter.characterId,
        label,
        lookupId,
        skillIds: requireSkillOrder(avatar.SkillOrder, lookupId),
        weaponType: localCharacter.weaponType
      }
    ]
  })
  .sort((left, right) => left.avatarId - right.avatarId || left.lookupId.localeCompare(right.lookupId))

const nonTravelerMetadata = characterMetadata.filter((entry) => entry.characterId !== "Traveler")
assertExactCoverage(
  characterCatalogPresentation.filter((entry) => entry.characterId !== "Traveler").map((entry) => entry.characterId),
  nonTravelerMetadata.map((entry) => entry.characterId),
  "Character"
)

const travelerVariants = characterMetadata.filter((entry) => entry.characterId === "Traveler")
const expectedTravelerVariants = ["male", "female"].flatMap((gender) =>
  Object.values(travelerElementBySkillDepotSuffix).map((element) => `${gender}.${element}`)
)
assertExactCoverage(
  expectedTravelerVariants,
  travelerVariants.map((entry) => `${entry.variant?.gender}.${entry.variant?.element}`),
  "Traveler variant"
)

const weaponMetadata = Object.entries(weaponsDownload.value)
  .flatMap(([itemIdText, weapon]) => {
    const hash = weapon.NameTextMapHash
    const label = hash === undefined ? undefined : localizations[String(hash)]
    const localWeapon = label ? weaponByLabel.get(label) : undefined
    if (!localWeapon) return []
    const itemId = Number(itemIdText)
    if (!Number.isInteger(itemId)) throw new Error(`Invalid Enka weapon item ID: ${itemIdText}`)
    return [{ itemId, label, weaponId: localWeapon.id, weaponType: localWeapon.weaponType }]
  })
  .sort((left, right) => left.itemId - right.itemId)

assertExactCoverage(
  weaponInventory.map((entry) => entry.id),
  weaponMetadata.map((entry) => entry.weaponId),
  "Weapon"
)

const artifactSetIdByEnkaSetId = new Map(
  Object.entries(relicsDownload.value.Sets).flatMap(([enkaSetId, artifactSet]) => {
    const label = localizations[String(artifactSet.Name ?? "")]
    const localArtifactSet = label ? artifactSetByLabel.get(label) : undefined
    return localArtifactSet ? [[enkaSetId, localArtifactSet.id] as const] : []
  })
)

const artifactMetadata = Object.entries(relicsDownload.value.Items)
  .flatMap(([itemIdText, artifact]) => {
    const localArtifactSet = artifact.SetId === undefined ? undefined : artifactSetIdByEnkaSetId.get(String(artifact.SetId))
    if (!localArtifactSet) return []
    const itemId = Number(itemIdText)
    if (!Number.isInteger(itemId)) throw new Error(`Invalid Enka artifact item ID: ${itemIdText}`)
    return [{ itemId, setId: localArtifactSet }]
  })
  .sort((left, right) => left.itemId - right.itemId)

assertExactCoverage(
  artifactSetInventory.map((entry) => entry.id),
  [...new Set(artifactMetadata.map((entry) => entry.setId))],
  "Artifact set"
)

const source = {
  artifactItemCount: artifactMetadata.length,
  artifactSetCount: new Set(artifactMetadata.map((entry) => entry.setId)).size,
  avatarMetadataPath: "store/gi/avatars.json",
  avatarMetadataSha256: calculateSha256(avatarsDownload.bytes),
  characterCount: nonTravelerMetadata.length + 1,
  commit: enkaApiDocsCommit,
  localizationPath: "store/gi/locs.json",
  localizationSha256: calculateSha256(localizationsDownload.bytes),
  relicMetadataPath: "store/gi/relics.json",
  relicMetadataSha256: calculateSha256(relicsDownload.bytes),
  repository: enkaApiDocsRepository,
  travelerVariantCount: travelerVariants.length,
  weaponCount: weaponMetadata.length,
  weaponMetadataPath: "store/gi/weapons.json",
  weaponMetadataSha256: calculateSha256(weaponsDownload.bytes)
}

const generatedSource = [
  "// Generated by tools/generate-showcase-metadata.ts; do not edit by hand.",
  `export const showcaseMetadataSource = ${JSON.stringify(source, null, 2)} as const`,
  "",
  `export const showcaseCharacterMetadataGenerated = ${JSON.stringify(characterMetadata, null, 2)} as const`,
  "",
  `export const showcaseWeaponMetadataGenerated = ${JSON.stringify(weaponMetadata, null, 2)} as const`,
  "",
  `export const showcaseArtifactSetIdByItemIdGenerated = ${JSON.stringify(
    Object.fromEntries(artifactMetadata.map((entry) => [entry.itemId, entry.setId])),
    null,
    2
  )} as const`,
  ""
].join("\n")

const outputPath = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "showcase-metadata.generated.ts")
writeFileSync(outputPath, generatedSource)
console.log(
  `Generated ${characterMetadata.length} character variants, ${weaponMetadata.length} weapons, and ` +
    `${artifactMetadata.length} artifact items at ${outputPath}`
)
