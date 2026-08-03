import type { CharacterBuild, TravelerElement } from "@gscombat/contracts"

interface BurstEnergyCostGroup {
  readonly characterIds: readonly string[]
  readonly energyCost: number
}

/**
 * Generated from the pinned 6.7 SQLite snapshot's `burst` parameter groups.
 * Every regular character has exactly one constant scalar in the standard Energy-cost set 40/50/60/70/80/90.
 */
const burstEnergyCostGroups: readonly BurstEnergyCostGroup[] = [
  {
    energyCost: 40,
    characterIds: [
      "Albedo",
      "Aloy",
      "Amber",
      "Chongyun",
      "Diluc",
      "Keqing",
      "Layla",
      "Ningguang",
      "ShikanoinHeizou",
      "Tighnari",
      "Zhongli"
    ]
  },
  { energyCost: 50, characterIds: ["Aino", "Chiori", "Emilie", "Nahida"] },
  {
    energyCost: 60,
    characterIds: [
      "Arlecchino",
      "Bennett",
      "Candace",
      "Chasca",
      "Chevreuse",
      "Citlali",
      "Clorinde",
      "Collei",
      "Columbina",
      "Dahlia",
      "Escoffier",
      "Fischl",
      "Freminet",
      "Furina",
      "Gaming",
      "Ganyu",
      "HuTao",
      "Ifa",
      "Illuga",
      "Ineffa",
      "KaedeharaKazuha",
      "Kaeya",
      "Kirara",
      "Klee",
      "KukiShinobu",
      "LanYan",
      "Lauma",
      "Linnea",
      "Lohen",
      "Lyney",
      "Mona",
      "Mualani",
      "Navia",
      "Nefer",
      "Nicole",
      "Noelle",
      "Ororon",
      "Rosaria",
      "Sandrone",
      "Sethos",
      "Tartaglia",
      "Varka",
      "Venti",
      "Wanderer",
      "Wriothesley",
      "Xilonen",
      "Xinyan",
      "Yoimiya",
      "YumemizukiMizuki",
      "YunJin",
      "Zibai"
    ]
  },
  {
    energyCost: 70,
    characterIds: [
      "Alhaitham",
      "AratakiItto",
      "Dehya",
      "Durin",
      "Iansan",
      "Jahoda",
      "Kachina",
      "Kinich",
      "Lynette",
      "Mika",
      "Neuvillette",
      "Nilou",
      "Prune",
      "SangonomiyaKokomi",
      "Sigewinne",
      "Varesa",
      "Xianyun",
      "Xiao",
      "Yelan"
    ]
  },
  {
    energyCost: 80,
    characterIds: [
      "Baizhu",
      "Barbara",
      "Beidou",
      "Charlotte",
      "Cyno",
      "Diona",
      "Dori",
      "Eula",
      "Faruzan",
      "Flins",
      "Gorou",
      "Jean",
      "KamisatoAyaka",
      "KamisatoAyato",
      "Kaveh",
      "KujouSara",
      "Lisa",
      "Qiqi",
      "Razor",
      "Sayu",
      "Shenhe",
      "Sucrose",
      "Thoma",
      "Xiangling",
      "Xingqiu",
      "Yanfei",
      "Yaoyao"
    ]
  },
  { energyCost: 90, characterIds: ["RaidenShogun", "YaeMiko"] }
]

const burstEnergyCosts = new Map<string, number>(
  burstEnergyCostGroups.flatMap(({ characterIds, energyCost }) =>
    characterIds.map((characterId) => [characterId, energyCost] as const)
  )
)

const travelerBurstEnergyCosts: Readonly<Record<TravelerElement, number>> = {
  anemo: 60,
  dendro: 80,
  electro: 80,
  geo: 60,
  hydro: 80,
  pyro: 70
}

const nonElementalEnergyBurstCosts: ReadonlyMap<string, number> = new Map([
  ["Mavuika", 0],
  ["Skirk", 0]
])

/** The build fields needed to resolve a character's maximum elemental Energy. */
export type BurstEnergyCostCharacter = Pick<CharacterBuild, "characterId" | "variant">

/** Records whether a catalog character contributes a maintained maximum Elemental Energy capacity. */
export type CharacterBurstEnergyCostCoverage =
  | {
      readonly characterId: string
      readonly energyCost: number
      readonly status: "maintained"
    }
  | {
      readonly characterId: "Mavuika" | "Skirk"
      readonly energyCost: 0
      readonly reason: string
      readonly status: "no_elemental_energy"
    }
  | {
      readonly characterId: "Traveler"
      readonly status: "variant_required"
      readonly variants: Readonly<Record<TravelerElement, number>>
    }

const characterBurstEnergyCostCoverage: readonly CharacterBurstEnergyCostCoverage[] = [
  ...burstEnergyCostGroups.flatMap(({ characterIds, energyCost }) =>
    characterIds.map((characterId) => ({ characterId, energyCost, status: "maintained" as const }))
  ),
  {
    characterId: "Mavuika",
    energyCost: 0,
    reason: "Mavuika's Burst consumes Fighting Spirit, not Elemental Energy.",
    status: "no_elemental_energy"
  },
  {
    characterId: "Skirk",
    energyCost: 0,
    reason: "Skirk uses Serpent's Subtlety rather than a maximum Elemental Energy capacity.",
    status: "no_elemental_energy"
  },
  { characterId: "Traveler", status: "variant_required", variants: travelerBurstEnergyCosts }
]

/** Lists the explicit party Energy-capacity status for every current catalog character. */
export function listCharacterBurstEnergyCostCoverage(): readonly CharacterBurstEnergyCostCoverage[] {
  return characterBurstEnergyCostCoverage
}

/** Returns the maintained Burst energy cost for a supported character. */
export function getCharacterBurstEnergyCost(characterId: string): number | undefined
/** Returns the maintained Burst energy cost for a build, including Traveler's active element. */
export function getCharacterBurstEnergyCost(character: BurstEnergyCostCharacter): number | undefined
export function getCharacterBurstEnergyCost(character: string | BurstEnergyCostCharacter): number | undefined {
  if (typeof character === "string") {
    if (character === "Traveler") {
      throw new Error("Traveler Burst energy cost requires an element variant")
    }
    return burstEnergyCosts.get(character) ?? nonElementalEnergyBurstCosts.get(character)
  }
  if (character.characterId !== "Traveler") {
    return burstEnergyCosts.get(character.characterId) ?? nonElementalEnergyBurstCosts.get(character.characterId)
  }

  const variant = character.variant
  if (!variant || variant.kind !== "traveler") {
    throw new Error("Traveler Burst energy cost requires an element variant")
  }
  const energyCost = travelerBurstEnergyCosts[variant.element]
  if (energyCost === undefined) {
    throw new Error(`Unsupported Traveler element for Burst energy cost: ${variant.element}`)
  }
  return energyCost
}
