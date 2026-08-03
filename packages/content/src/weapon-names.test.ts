import { describe, expect, it } from "vitest"

import {
  getOfficialWeaponName,
  officialWeaponNames,
  pinnedWeaponNameSource,
  requireOfficialWeaponName
} from "./weapon-names.js"
import { weaponInventory } from "./equipment-inventory.js"

// Generated offline from the player-facing canonical equipment inventory with
// `SELECT id FROM weapons WHERE rarity IN (4, 5) ORDER BY id`, excluding known non-release fixtures.
const pinnedSnapshotComparisonWeaponIds = [
  "ATeaspoonOfTranscendence",
  "AThousandBlazingSuns",
  "AThousandFloatingDreams",
  "Absolution",
  "Akuoumaru",
  "AlleyHunter",
  "AmenomaKageuchi",
  "AmosBow",
  "AngelosHeptades",
  "AquaSimulacra",
  "AquilaFavonia",
  "AshGravenDrinkingHorn",
  "AstralVulturesCrimsonPlumage",
  "AthameArtis",
  "Azurelight",
  "BalladOfTheBoundlessBlue",
  "BalladOfTheFjords",
  "BeaconOfTheReedSea",
  "BlackcliffAgate",
  "BlackcliffLongsword",
  "BlackcliffPole",
  "BlackcliffSlasher",
  "BlackcliffWarbow",
  "BlackmarrowLantern",
  "BloodsoakedRuins",
  "CalamityOfEshu",
  "CalamityQueller",
  "CashflowSupervision",
  "ChainBreaker",
  "CinnabarSpindle",
  "Cloudforged",
  "CompoundBow",
  "CranesEchoingCall",
  "CrescentPike",
  "CrimsonMoonsSemblance",
  "DawningFrost",
  "Deathmatch",
  "DialoguesOfTheDesertSages",
  "DisasterAndRemorse",
  "DodocoTales",
  "DragonsBane",
  "DragonspineSpear",
  "EarthShaker",
  "ElegyForTheEnd",
  "EndOfTheLine",
  "EngulfingLightning",
  "EtherlightSpindlelute",
  "EverlastingMoonglow",
  "EyeOfPerception",
  "FadingTwilight",
  "FangOfTheMountainKing",
  "FavoniusCodex",
  "FavoniusGreatsword",
  "FavoniusLance",
  "FavoniusSword",
  "FavoniusWarbow",
  "FesteringDesire",
  "FinaleOfTheDeep",
  "FlameForgedInsight",
  "FleuveCendreFerryman",
  "FlowerWreathedFeathers",
  "FlowingPurity",
  "FluteOfEzpitzal",
  "FootprintOfTheRainbow",
  "ForestRegalia",
  "FracturedHalo",
  "FreedomSworn",
  "Frostbearer",
  "FruitOfFulfillment",
  "FruitfulHook",
  "GestOfTheMightyWolf",
  "GoldenFrostboundOath",
  "HakushinRing",
  "Hamayumi",
  "HaranGeppakuFutsu",
  "HuntersPath",
  "IbisPiercer",
  "IronSting",
  "JadefallsSplendor",
  "KagotsurubeIsshin",
  "KagurasVerity",
  "KatsuragikiriNagamasa",
  "KeyOfKhajNisut",
  "KingsSquire",
  "KitainCrossSpear",
  "LightOfFoliarIncision",
  "LightbearingMoonshard",
  "LionsRoar",
  "LithicBlade",
  "LithicSpear",
  "LostPrayerToTheSacredWinds",
  "LumidouceElegy",
  "LuxuriousSeaLord",
  "MailedFlower",
  "MakhairaAquamarine",
  "MappaMare",
  "MasterKey",
  "MemoryOfDust",
  "MissiveWindspear",
  "MistsplitterReforged",
  "MitternachtsWaltz",
  "Moonpiercer",
  "MoonweaversDawn",
  "MountainBracingBolt",
  "MouunsMoon",
  "NightweaversLookingGlass",
  "NocturnesCurtainCall",
  "OathswornEye",
  "PeakPatrolSong",
  "PolarStar",
  "PortablePowerSaw",
  "Predator",
  "PrimordialJadeCutter",
  "PrimordialJadeWingedSpear",
  "ProspectorsDrill",
  "ProspectorsShovel",
  "PrototypeAmber",
  "PrototypeArchaic",
  "PrototypeCrescent",
  "PrototypeRancour",
  "PrototypeStarglitter",
  "RainbowSerpentsRainBow",
  "Rainslasher",
  "RangeGauge",
  "RedhornStonethresher",
  "ReliquaryOfTruth",
  "RightfulReward",
  "RingOfYaxche",
  "RoyalBow",
  "RoyalGreatsword",
  "RoyalGrimoire",
  "RoyalLongsword",
  "RoyalSpear",
  "Rust",
  "SacrificersStaff",
  "SacrificialBow",
  "SacrificialFragments",
  "SacrificialGreatsword",
  "SacrificialJade",
  "SacrificialSword",
  "SapwoodBlade",
  "ScionOfTheBlazingSun",
  "SequenceOfSolitude",
  "SerenitysCall",
  "SerpentSpine",
  "SilvershowerHeartstrings",
  "SkywardAtlas",
  "SkywardBlade",
  "SkywardHarp",
  "SkywardPride",
  "SkywardSpine",
  "SnareHook",
  "SnowTombedStarsilver",
  "SolarPearl",
  "SongOfBrokenPines",
  "SongOfStillness",
  "SplendorOfTranquilWaters",
  "StaffOfHoma",
  "StaffOfTheScarletSands",
  "StarcallersWatch",
  "SturdyBone",
  "SummitShaper",
  "SunnyMorningSleepIn",
  "SurfsUp",
  "SwordOfDescension",
  "SwordOfNarzissenkreuz",
  "SymphonistOfScents",
  "TalkingStick",
  "TamayurateiNoOhanashi",
  "TheAlleyFlash",
  "TheBell",
  "TheBlackSword",
  "TheCatch",
  "TheDaybreakChronicles",
  "TheDockhandsAssistant",
  "TheFirstGreatMagic",
  "TheFlute",
  "TheStringless",
  "TheUnforged",
  "TheViridescentHunt",
  "TheWidsith",
  "ThunderingPulse",
  "TidalShadow",
  "TomeOfTheEternalFlow",
  "ToukabouShigure",
  "TulaytullahsRemembrance",
  "UltimateOverlordsMegaMagicSword",
  "UrakuMisugiri",
  "Verdict",
  "VividNotions",
  "VortexVanquisher",
  "WanderingEvenstar",
  "WavebreakersFin",
  "WaveridingWhirl",
  "Whiteblind",
  "WindblumeOde",
  "WineAndSong",
  "WolfFang",
  "WolfsGravestone",
  "XiphosMoonlight"
] as const

function sorted(values: readonly string[]): string[] {
  return [...values].sort()
}

describe("official weapon-name registry", () => {
  it("covers every four- and five-star candidate from the fixed 6.7 snapshot offline", () => {
    const registeredWeaponIds = Object.keys(officialWeaponNames)

    expect(pinnedWeaponNameSource).toEqual({
      gameVersion: "6.7",
      localizationAggregatePath: "libs/gi/dm-localization/assets/locales/chs/weaponNames_gen.json",
      localizationPathTemplate: "libs/gi/dm-localization/assets/locales/chs/weapon_<weaponId>_gen.json",
      upstreamCommit: "21c98eb60355160274a8c4cecfc5671e2151a073",
      upstreamRepository: "https://github.com/frzyc/genshin-optimizer"
    })
    expect(pinnedSnapshotComparisonWeaponIds).toHaveLength(200)
    expect(new Set(pinnedSnapshotComparisonWeaponIds).size).toBe(pinnedSnapshotComparisonWeaponIds.length)
    expect(sorted(registeredWeaponIds)).toEqual(sorted(pinnedSnapshotComparisonWeaponIds))
    expect(registeredWeaponIds).toHaveLength(200)

    for (const weaponId of pinnedSnapshotComparisonWeaponIds) {
      const name = getOfficialWeaponName(weaponId)
      expect(name).toMatch(/[\u3400-\u9fff]/u)
      expect(requireOfficialWeaponName(weaponId)).toBe(name)
    }
  })

  it("returns official labels and never falls back to raw IDs", () => {
    expect(getOfficialWeaponName("SkywardAtlas")).toBe("天空之卷")
    expect(getOfficialWeaponName("FavoniusCodex")).toBe("西风秘典")
    expect(getOfficialWeaponName("TheCatch")).toBe("「渔获」")
    expect(getOfficialWeaponName("QuantumCatalyst")).toBeUndefined()
    expect(getOfficialWeaponName("UnknownWeapon")).toBeUndefined()
    expect(() => requireOfficialWeaponName("QuantumCatalyst")).toThrow("Missing official Simplified Chinese weapon name")
    expect(() => requireOfficialWeaponName("UnknownWeapon")).toThrow("Missing official Simplified Chinese weapon name")
  })

  it("covers every three-star weapon with the pinned official Simplified Chinese label", () => {
    const threeStarWeapons = weaponInventory.filter((weapon) => weapon.rarity === 3)

    expect(threeStarWeapons).toHaveLength(24)
    for (const weapon of threeStarWeapons) {
      expect(getOfficialWeaponName(weapon.id)).toBe(weapon.label)
      expect(requireOfficialWeaponName(weapon.id)).toBe(weapon.label)
    }
  })
})
