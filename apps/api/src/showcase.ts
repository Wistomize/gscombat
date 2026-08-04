import type {
  ArtifactPiece,
  ArtifactSlot,
  ArtifactStat,
  CharacterBuild,
  ShowcaseImportResponse,
  ShowcaseSkippedBuildReason
} from "@gscombat/contracts"

import {
  getShowcaseArtifactMetadata,
  getShowcaseCharacterMetadata,
  getShowcaseWeaponMetadata
} from "./showcase-metadata.js"

interface EnkaStat {
  readonly appendPropId?: string
  readonly appendPropID?: string
  readonly mainPropId?: string
  readonly propValue?: number
  readonly statValue?: number
}

interface EnkaEquip {
  readonly flat?: {
    readonly equipType?: string
    readonly itemType?: string
    readonly rankLevel?: number
    readonly reliquaryMainstat?: EnkaStat
    readonly reliquarySubstats?: readonly EnkaStat[]
  }
  readonly itemId?: number
  readonly reliquary?: {
    readonly level?: number
  }
  readonly weapon?: {
    readonly affixMap?: Readonly<Record<string, number>>
    readonly level?: number
    readonly promoteLevel?: number
  }
}

interface EnkaAvatar {
  readonly avatarId?: number
  readonly equipList?: readonly EnkaEquip[]
  readonly propMap?: Readonly<Record<string, { readonly val?: string }>>
  readonly skillDepotId?: number
  readonly skillLevelMap?: Readonly<Record<string, number>>
  readonly talentIdList?: readonly number[]
}

interface EnkaResponse {
  readonly avatarInfoList?: readonly EnkaAvatar[]
  readonly playerInfo?: { readonly nickname?: string }
  readonly ttl?: number
}

interface CachedShowcase {
  readonly expiresAt: number
  readonly response: ShowcaseImportResponse
}

class ShowcaseAvatarNormalizationError extends Error {
  public readonly reason: ShowcaseSkippedBuildReason

  public constructor(reason: ShowcaseSkippedBuildReason, message: string) {
    super(message)
    this.name = "ShowcaseAvatarNormalizationError"
    this.reason = reason
  }
}

export interface ShowcaseImporter {
  /** Imports all supported complete builds currently visible for a UID. */
  importBuilds(uid: string, gameDataVersion: string): Promise<ShowcaseImportResponse>
}

const slotMappings: Readonly<Record<string, ArtifactSlot>> = {
  EQUIP_BRACER: "flower",
  EQUIP_DRESS: "circlet",
  EQUIP_NECKLACE: "plume",
  EQUIP_RING: "goblet",
  EQUIP_SHOES: "sands"
}

const statMappings: Readonly<Record<string, ArtifactStat>> = {
  FIGHT_PROP_ATTACK: "atk",
  FIGHT_PROP_ATTACK_PERCENT: "atk_percent",
  FIGHT_PROP_CHARGE_EFFICIENCY: "energy_recharge",
  FIGHT_PROP_CRITICAL: "crit_rate",
  FIGHT_PROP_CRITICAL_HURT: "crit_damage",
  FIGHT_PROP_DEFENSE: "def",
  FIGHT_PROP_DEFENSE_PERCENT: "def_percent",
  FIGHT_PROP_ELEMENT_MASTERY: "elemental_mastery",
  FIGHT_PROP_ELEC_ADD_HURT: "electro_damage_bonus",
  FIGHT_PROP_FIRE_ADD_HURT: "pyro_damage_bonus",
  FIGHT_PROP_GRASS_ADD_HURT: "dendro_damage_bonus",
  FIGHT_PROP_HEAL_ADD: "healing_bonus",
  FIGHT_PROP_HP: "hp",
  FIGHT_PROP_HP_PERCENT: "hp_percent",
  FIGHT_PROP_ICE_ADD_HURT: "cryo_damage_bonus",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "physical_damage_bonus",
  FIGHT_PROP_ROCK_ADD_HURT: "geo_damage_bonus",
  FIGHT_PROP_WATER_ADD_HURT: "hydro_damage_bonus",
  FIGHT_PROP_WIND_ADD_HURT: "anemo_damage_bonus"
}

const percentageStats = new Set<ArtifactStat>([
  "anemo_damage_bonus",
  "atk_percent",
  "crit_damage",
  "crit_rate",
  "cryo_damage_bonus",
  "def_percent",
  "dendro_damage_bonus",
  "electro_damage_bonus",
  "energy_recharge",
  "geo_damage_bonus",
  "healing_bonus",
  "hp_percent",
  "hydro_damage_bonus",
  "physical_damage_bonus",
  "pyro_damage_bonus"
])

function requireNumber(value: number | undefined, description: string): number {
  if (value === undefined || !Number.isFinite(value)) {
    throw new ShowcaseAvatarNormalizationError("invalid_avatar_data", `Invalid Enka payload: ${description}`)
  }
  return value
}

function normalizeStat(stat: EnkaStat): { readonly stat: ArtifactStat; readonly value: number } {
  const propertyId = stat.mainPropId ?? stat.appendPropId ?? stat.appendPropID
  const mappedStat = propertyId ? statMappings[propertyId] : undefined
  if (!mappedStat) {
    throw new ShowcaseAvatarNormalizationError(
      "unsupported_equipment",
      `Unsupported Enka artifact stat: ${propertyId ?? "missing"}`
    )
  }
  const rawValue = requireNumber(stat.statValue ?? stat.propValue, `${propertyId} value`)
  return { stat: mappedStat, value: percentageStats.has(mappedStat) ? rawValue / 100 : rawValue }
}

function normalizeArtifact(equip: EnkaEquip, uid: string, avatarId: number): ArtifactPiece | undefined {
  if (equip.flat?.itemType !== "ITEM_RELIQUARY") return undefined
  const slot = equip.flat.equipType ? slotMappings[equip.flat.equipType] : undefined
  if (!slot) {
    throw new ShowcaseAvatarNormalizationError(
      "unsupported_equipment",
      `Unsupported Enka artifact slot: ${equip.flat.equipType ?? "missing"}`
    )
  }
  const itemId = equip.itemId
  if (itemId === undefined) {
    throw new ShowcaseAvatarNormalizationError(
      "invalid_avatar_data",
      `Enka artifact in slot ${slot} does not declare an item ID`
    )
  }
  const artifactMetadata = getShowcaseArtifactMetadata(itemId)
  if (!artifactMetadata) {
    throw new ShowcaseAvatarNormalizationError("unsupported_equipment", `Unsupported Enka artifact item ID: ${itemId}`)
  }
  return {
    id: `showcase-${uid}-${avatarId}-${slot}`,
    level: Math.max(requireNumber(equip.reliquary?.level, `${slot} level`) - 1, 0),
    mainStat: normalizeStat(equip.flat.reliquaryMainstat ?? {}),
    rarity: requireNumber(equip.flat.rankLevel, `${slot} rarity`),
    setId: artifactMetadata.setId,
    slot,
    substats: (equip.flat.reliquarySubstats ?? []).map(normalizeStat)
  }
}

function getRefinement(affixMap: Readonly<Record<string, number>> | undefined): number {
  const zeroBasedRefinement = Object.values(affixMap ?? {})[0] ?? 0
  return Math.min(Math.max(zeroBasedRefinement + 1, 1), 5)
}

function normalizeAvatar(
  avatar: EnkaAvatar,
  uid: string,
  gameDataVersion: string,
  importedAt: string
): CharacterBuild {
  const avatarId = avatar.avatarId
  if (avatarId === undefined) {
    throw new ShowcaseAvatarNormalizationError("invalid_avatar_data", "Enka avatar does not declare an avatar ID")
  }
  const mapping = getShowcaseCharacterMetadata(avatarId, avatar.skillDepotId)
  if (!mapping) {
    throw new ShowcaseAvatarNormalizationError(
      "unsupported_character",
      `Unsupported Enka avatar metadata: avatarId=${avatarId}, skillDepotId=${avatar.skillDepotId ?? "missing"}`
    )
  }
  const weaponEquip = avatar.equipList?.find((equip) => equip.flat?.itemType === "ITEM_WEAPON")
  if (!weaponEquip?.weapon || weaponEquip.itemId === undefined) {
    throw new ShowcaseAvatarNormalizationError(
      "incomplete_equipment",
      `Enka avatar ${avatarId} does not declare a complete equipped weapon`
    )
  }
  const weaponMetadata = getShowcaseWeaponMetadata(weaponEquip.itemId)
  if (!weaponMetadata) {
    throw new ShowcaseAvatarNormalizationError(
      "unsupported_equipment",
      `Unsupported Enka weapon item ID: ${weaponEquip.itemId}`
    )
  }
  if (weaponMetadata.weaponType !== mapping.weaponType) {
    throw new ShowcaseAvatarNormalizationError(
      "unsupported_equipment",
      `Enka avatar ${avatarId} cannot equip ${weaponMetadata.weaponId}: expected ${mapping.weaponType}, got ${weaponMetadata.weaponType}`
    )
  }
  const artifacts = (avatar.equipList ?? [])
    .map((equip) => normalizeArtifact(equip, uid, avatarId))
    .filter((artifact): artifact is ArtifactPiece => artifact !== undefined)
  if (artifacts.length !== 5) {
    throw new ShowcaseAvatarNormalizationError(
      "incomplete_equipment",
      `Enka avatar ${avatarId} has ${artifacts.length} equipped artifacts; exactly five are required`
    )
  }
  const [normalId, skillId, burstId] = mapping.skillIds
  const skillLevelMap = avatar.skillLevelMap ?? {}
  return {
    artifacts,
    ascension: Number(avatar.propMap?.["1002"]?.val ?? 0),
    buildId: `showcase.${uid}.${mapping.characterId}`,
    characterId: mapping.characterId,
    constellation: avatar.talentIdList?.length ?? 0,
    gameDataVersion,
    label: `${mapping.label} · UID ${uid}`,
    level: Number(avatar.propMap?.["4001"]?.val ?? 1),
    source: { importedAt, kind: "showcase", uid },
    talents: {
      burst: skillLevelMap[String(burstId)] ?? 1,
      normal: skillLevelMap[String(normalId)] ?? 1,
      skill: skillLevelMap[String(skillId)] ?? 1
    },
    ...(mapping.variant ? { variant: mapping.variant } : {}),
    weapon: {
      ascension: weaponEquip.weapon.promoteLevel ?? 0,
      level: weaponEquip.weapon.level ?? 1,
      refinement: getRefinement(weaponEquip.weapon.affixMap),
      weaponId: weaponMetadata.weaponId
    }
  }
}

/** Converts a raw Enka showcase payload into the application's immutable build model. */
export function normalizeEnkaShowcase(
  payload: EnkaResponse,
  uid: string,
  gameDataVersion: string,
  importedAt = new Date().toISOString()
): ShowcaseImportResponse {
  const builds: CharacterBuild[] = []
  const skippedCounts = new Map<ShowcaseSkippedBuildReason, number>()
  for (const avatar of payload.avatarInfoList ?? []) {
    try {
      builds.push(normalizeAvatar(avatar, uid, gameDataVersion, importedAt))
    } catch (error) {
      if (!(error instanceof ShowcaseAvatarNormalizationError)) throw error
      skippedCounts.set(error.reason, (skippedCounts.get(error.reason) ?? 0) + 1)
    }
  }

  return {
    builds,
    ...(payload.playerInfo?.nickname ? { nickname: payload.playerInfo.nickname } : {}),
    skipped: [...skippedCounts].map(([reason, count]) => ({ count, reason })),
    ttl: Math.max(payload.ttl ?? 0, 0),
    uid
  }
}

/** Fetches showcases from Enka with its requested TTL caching and custom User-Agent. */
export class EnkaShowcaseClient implements ShowcaseImporter {
  readonly #baseUrl: string
  readonly #cache = new Map<string, CachedShowcase>()
  readonly #fetch: typeof fetch

  public constructor(options: { readonly baseUrl?: string; readonly fetch?: typeof fetch } = {}) {
    this.#baseUrl = options.baseUrl ?? process.env.ENKA_API_BASE_URL ?? "https://enka.network/api/uid"
    this.#fetch = options.fetch ?? fetch
  }

  public async importBuilds(uid: string, gameDataVersion: string): Promise<ShowcaseImportResponse> {
    const cached = this.#cache.get(uid)
    if (cached && cached.expiresAt > Date.now()) return cached.response
    const response = await this.#fetch(`${this.#baseUrl.replace(/\/$/, "")}/${uid}/`, {
      headers: { "User-Agent": "gscombat/0.1 showcase-import" },
      signal: AbortSignal.timeout(12_000)
    })
    if (!response.ok) throw new Error(`Enka showcase request failed with HTTP ${response.status}`)
    const normalized = normalizeEnkaShowcase((await response.json()) as EnkaResponse, uid, gameDataVersion)
    this.#cache.set(uid, { expiresAt: Date.now() + normalized.ttl * 1000, response: normalized })
    return normalized
  }
}
