import { describe, expect, it } from "vitest"

import {
  characterCatalogPresentation,
  characterCatalogPresentationVersion
} from "./catalog-presentation.js"
import { normalizeProjectedMetricLabel, supportedCharacters, supportedWeapons } from "./catalog.js"
import { listCharacterCombatCoverage, listCombatActions, listCombatMetrics } from "./combat-registry.js"
import type { CombatDamageMetricDefinition, CombatMetricDefinition } from "./combat/types.js"
import { requireOfficialWeaponName } from "./weapon-names.js"

function sortedIds(ids: readonly string[]): string[] {
  return [...ids].sort()
}

function findDuplicateIds(ids: readonly string[]): string[] {
  const seenIds = new Set<string>()
  const duplicateIds = new Set<string>()
  for (const id of ids) {
    if (seenIds.has(id)) duplicateIds.add(id)
    seenIds.add(id)
  }
  return sortedIds([...duplicateIds])
}

function findMissingIds(ids: readonly string[], expectedIds: ReadonlySet<string>): string[] {
  return sortedIds([...new Set(ids)].filter((id) => !expectedIds.has(id)))
}

describe("supported character catalog", () => {
  it("keeps presentation character IDs exactly aligned with every combat coverage declaration", () => {
    const presentationIds = characterCatalogPresentation.map((presentation) => presentation.characterId)
    const coverageIds = listCharacterCombatCoverage().map((coverage) => coverage.characterId)
    const presentationIdSet = new Set(presentationIds)
    const coverageIdSet = new Set(coverageIds)

    expect(findDuplicateIds(presentationIds)).toEqual([])
    expect(findDuplicateIds(coverageIds)).toEqual([])
    expect(findMissingIds(presentationIds, coverageIdSet)).toEqual([])
    expect(findMissingIds(coverageIds, presentationIdSet)).toEqual([])
  })

  it("projects every maintainer-selected verified indicator while keeping damage actions and support metrics separate", () => {
    const selectedDamageMetrics = listCombatMetrics().filter(
      (metric): metric is CombatDamageMetricDefinition => metric.kind === "damage" && metric.status === "verified"
    )
    const selectedSupportMetrics = listCombatMetrics().filter(
      (metric): metric is Exclude<CombatMetricDefinition, CombatDamageMetricDefinition> =>
        metric.kind !== "damage" && metric.status === "verified"
    )
    const actionById = new Map(listCombatActions().map((action) => [action.id, action]))
    const expectedActionIds = [...new Set(selectedDamageMetrics.map((metric) => metric.actionId))]
    const expectedCharacterIds = [
      ...new Set([...selectedDamageMetrics, ...selectedSupportMetrics].map((metric) => metric.characterId))
    ]
    const projectedActionIds = supportedCharacters.flatMap((character) => character.primaryActionIds)
    const projectedSupportMetricIds = supportedCharacters.flatMap((character) => character.supportMetrics.map((metric) => metric.id))

    expect(sortedIds(projectedActionIds)).toEqual(sortedIds(expectedActionIds))
    expect(sortedIds(projectedSupportMetricIds)).toEqual(sortedIds(selectedSupportMetrics.map((metric) => metric.id)))
    expect(sortedIds(supportedCharacters.map((character) => character.characterId))).toEqual(sortedIds(expectedCharacterIds))
    expect(new Set(projectedActionIds)).toHaveLength(projectedActionIds.length)

    for (const character of supportedCharacters) {
      expect(character.primaryActionIds).toEqual(character.primaryActions.map((action) => action.id))
      for (const action of character.primaryActions) {
        const sourceAction = actionById.get(action.id)

        expect(action.label.trim()).not.toHaveLength(0)
        expect(action.scenarioParameters).toEqual(sourceAction?.scenarioParameters)
        expect(
          selectedDamageMetrics.some(
            (metric) => metric.characterId === character.characterId && metric.actionId === action.id
          )
        ).toBe(true)
      }
      for (const metric of character.supportMetrics) {
        const sourceAction = actionById.get(metric.sourceActionId)

        expect(metric.label.trim()).not.toHaveLength(0)
        expect(metric.scenarioParameters).toEqual(sourceAction?.scenarioParameters)
        expect(
          selectedSupportMetrics.some(
            (candidate) => candidate.characterId === character.characterId && candidate.id === metric.id
          )
        ).toBe(true)
      }
    }
  })

  it("keeps the versioned Chinese presentation aligned with every selectable target indicator", () => {
    const presentationByCharacterId = new Map(
      characterCatalogPresentation.map((character) => [character.characterId, character])
    )

    expect(characterCatalogPresentationVersion).toBe("6.7.1")
    expect(new Set(characterCatalogPresentation.map((character) => character.characterId))).toHaveLength(
      characterCatalogPresentation.length
    )
    for (const character of supportedCharacters) {
      const presentation = presentationByCharacterId.get(character.characterId)

      expect(presentation?.label).toBe(character.label)
      expect(presentation?.weaponType).toBe(character.weaponType)
    }
  })

  it("publishes Yaoyao as a support-only selectable character without exposing her raw burst action", () => {
    const yaoyaoBurstActionId = "yaoyao.burst.moonjade_descent.initial_aoe"
    const yaoyaoMetrics = listCombatMetrics().filter((metric) => metric.characterId === "Yaoyao")

    expect(listCombatActions().some((action) => action.id === yaoyaoBurstActionId)).toBe(true)
    expect(yaoyaoMetrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "healing", status: "verified" })])
    )
    expect(yaoyaoMetrics.some((metric) => metric.kind === "damage" && metric.status === "verified")).toBe(false)
    const yaoyao = supportedCharacters.find((character) => character.characterId === "Yaoyao")

    expect(yaoyao?.primaryActions).toEqual([])
    expect(yaoyao?.supportMetrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "healing" })])
    )
  })

  it("publishes Bennett's two verified support indicators with their explicit recipient requirements", () => {
    const bennett = supportedCharacters.find((character) => character.characterId === "Bennett")

    expect(bennett?.supportMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bennett.burst.field.heal_tick",
          kind: "healing",
          recipientRequirements: expect.arrayContaining([
            expect.objectContaining({ kind: "recipient_in_source_area" }),
            expect.objectContaining({ kind: "recipient_hp_fraction" })
          ])
        }),
        expect.objectContaining({
          id: "bennett.burst.field.attack_buff",
          kind: "stat_buff",
          recipientRequirements: expect.arrayContaining([
            expect.objectContaining({ kind: "recipient_in_source_area" }),
            expect.objectContaining({ kind: "recipient_hp_fraction" })
          ])
        })
      ])
    )
  })

  it("preserves constellation-gated recipient requirements without imposing them before their constellation", () => {
    const kokomi = supportedCharacters.find((character) => character.characterId === "SangonomiyaKokomi")
    const healTick = kokomi?.supportMetrics.find(
      (metric) => metric.id === "sangonomiya_kokomi.skill.kurages_oath.bake_kurage.heal_tick"
    )

    expect(healTick?.conditionalRecipientRequirements).toEqual([
      expect.objectContaining({
        minimumSourceConstellation: 2,
        requirement: expect.objectContaining({
          comparison: "at_most",
          kind: "recipient_hp_fraction",
          threshold: 0.5
        })
      })
    ])
  })

  it("removes C0 baseline wording from projected labels without removing higher-constellation behavior", () => {
    const nefer = supportedCharacters.find((character) => character.characterId === "Nefer")
    const ganyu = supportedCharacters.find((character) => character.characterId === "Ganyu")
    const furina = supportedCharacters.find((character) => character.characterId === "Furina")
    const neferCoverage = listCharacterCombatCoverage().find((coverage) => coverage.characterId === "Nefer")
    const projectedMetricLabels = supportedCharacters.flatMap((character) => [
      ...character.primaryActions.map((action) => action.label),
      ...character.supportMetrics.map((metric) => metric.label)
    ])

    expect(nefer?.primaryActions).toContainEqual(
      expect.objectContaining({
        id: "nefer.skill.senet_strategy.phantom_performance.second_hit"
      })
    )
    expect(ganyu?.primaryActions).toContainEqual(
      expect.objectContaining({
        id: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom"
      })
    )
    expect(furina?.supportMetrics).toContainEqual(
      expect.objectContaining({
        id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
        label: "万众狂欢 / 气氛值全伤害加成"
      })
    )
    expect(
      furina?.supportMetrics
        .find((metric) => metric.id === "furina.burst.let_the_people_rejoice.fanfare.damage_bonus")
        ?.scenarioParameters
        ?.find((parameter) => parameter.id === "fanfare-points")
    ).toEqual(
      expect.objectContaining({
        defaultValue: 300,
        maximumValue: 300,
        minimumValue: 0,
        rangeBySourceConstellation: [
          {
            defaultValue: 400,
            maximumValue: 400,
            minimumSourceConstellation: 1,
            minimumValue: 150
          }
        ]
      })
    )
    expect(projectedMetricLabels).not.toContainEqual(expect.stringMatching(/C0|0命|零命/))
    expect(neferCoverage?.talentLevelConstellationBonuses).toContainEqual({
      minimumSourceConstellation: 3,
      talentSlot: "skill",
      value: 3
    })
  })

  it("normalizes every supported zero-constellation spelling at the projection boundary", () => {
    expect(normalizeProjectedMetricLabel("示例 / C0 单次命中（无反应）")).toBe("示例 / 单次命中（无反应）")
    expect(normalizeProjectedMetricLabel("示例 / 单次命中（0命、无反应）")).toBe("示例 / 单次命中（无反应）")
    expect(normalizeProjectedMetricLabel("示例 / 单次命中（零命，无反应）")).toBe("示例 / 单次命中（无反应）")
  })
})

describe("supported weapon catalog", () => {
  it("includes the pinned four-star catalyst with its official Simplified Chinese name", () => {
    expect(supportedWeapons).toContainEqual({
      label: "西风秘典",
      rarity: 4,
      weaponId: "FavoniusCodex",
      weaponType: "catalyst"
    })
  })

  it("uses official Simplified Chinese labels instead of internal weapon IDs", () => {
    const officialThreeStarLabels: Readonly<Record<string, string>> = {
      BlackTassel: "黑缨枪",
      BloodtaintedGreatsword: "沐浴龙血的剑",
      CoolSteel: "冷刃",
      DarkIronSword: "暗铁剑",
      DebateClub: "以理服人",
      EmeraldOrb: "翡玉法球",
      FerrousShadow: "铁影阔剑",
      FilletBlade: "吃虎鱼刀",
      Halberd: "钺矛",
      HarbingerOfDawn: "黎明神剑",
      MagicGuide: "魔导绪论",
      OtherworldlyStory: "异世界行记",
      RavenBow: "鸦羽弓",
      RecurveBow: "反曲弓",
      SharpshootersOath: "神射手之誓",
      SkyriderGreatsword: "飞天大御剑",
      SkyriderSword: "飞天御剑",
      Slingshot: "弹弓",
      ThrillingTalesOfDragonSlayers: "讨龙英杰谭",
      TravelersHandySword: "旅行剑",
      TwinNephrite: "甲级宝珏",
      WhiteIronGreatsword: "白铁大剑",
      WhiteTassel: "白缨枪"
    }
    const officialLabels: Readonly<Record<string, string>> = {
      ...officialThreeStarLabels,
      AquilaFavonia: "风鹰剑",
      AquaSimulacra: "若水",
      Akuoumaru: "恶王丸",
      AlleyHunter: "暗巷猎手",
      AmenomaKageuchi: "天目影打刀",
      ATeaspoonOfTranscendence: "超越之匙",
      AThousandBlazingSuns: "焚曜千阳",
      AThousandFloatingDreams: "千夜浮梦",
      Absolution: "赦罪",
      AthameArtis: "黑蚀",
      Azurelight: "苍耀",
      AshGravenDrinkingHorn: "苍纹角杯",
      AmosBow: "阿莫斯之弓",
      AngelosHeptades: "尘光七谕",
      AstralVulturesCrimsonPlumage: "星鹫赤羽",
      BalladOfTheBoundlessBlue: "无垠蔚蓝之歌",
      BalladOfTheFjords: "峡湾长歌",
      BeaconOfTheReedSea: "苇海信标",
      BlackcliffAgate: "黑岩绯玉",
      BlackcliffLongsword: "黑岩长剑",
      BlackcliffPole: "黑岩刺枪",
      BlackcliffSlasher: "黑岩斩刀",
      BlackcliffWarbow: "黑岩战弓",
      BlackmarrowLantern: "乌髓孑灯",
      BloodsoakedRuins: "血染荒城",
      CalamityOfEshu: "厄水之祸",
      CalamityQueller: "息灾",
      CashflowSupervision: "金流监督",
      ChainBreaker: "碎链",
      Cloudforged: "筑云",
      CompoundBow: "钢轮弓",
      CranesEchoingCall: "鹤鸣余音",
      CrescentPike: "流月针",
      CrimsonMoonsSemblance: "赤月之形",
      Deathmatch: "决斗之枪",
      DisasterAndRemorse: "灾悔",
      DialoguesOfTheDesertSages: "沙中伟贤的对答",
      DawningFrost: "霜辰",
      DodocoTales: "嘟嘟可故事集",
      DragonsBane: "匣里灭辰",
      DragonspineSpear: "龙脊长枪",
      EarthShaker: "撼地者",
      ElegyForTheEnd: "终末嗟叹之诗",
      EngulfingLightning: "薙草之稻光",
      EndOfTheLine: "竭泽",
      EyeOfPerception: "昭心",
      EverlastingMoonglow: "不灭月华",
      EtherlightSpindlelute: "天光的纺琴",
      FavoniusCodex: "西风秘典",
      FavoniusGreatsword: "西风大剑",
      FavoniusLance: "西风长枪",
      FavoniusSword: "西风剑",
      FavoniusWarbow: "西风猎弓",
      FesteringDesire: "腐殖之剑",
      FlameForgedInsight: "拾慧铸熔",
      FadingTwilight: "落霞",
      FangOfTheMountainKing: "山王长牙",
      FleuveCendreFerryman: "灰河渡手",
      FlowingPurity: "纯水流华",
      FluteOfEzpitzal: "息燧之笛",
      FootprintOfTheRainbow: "虹的行迹",
      FlowerWreathedFeathers: "缀花之翎",
      ForestRegalia: "森林王器",
      Frostbearer: "忍冬之果",
      FruitfulHook: "硕果钩",
      FruitOfFulfillment: "盈满之实",
      FreedomSworn: "苍古自由之誓",
      FracturedHalo: "支离轮光",
      GestOfTheMightyWolf: "狼的武功歌",
      GoldenFrostboundOath: "霜结的誓金枝",
      Hamayumi: "破魔之弓",
      HakushinRing: "白辰之环",
      HaranGeppakuFutsu: "波乱月白经津",
      HuntersPath: "猎人之径",
      IbisPiercer: "鹮穿之喙",
      IronSting: "铁蜂刺",
      JadefallsSplendor: "碧落之珑",
      KagotsurubeIsshin: "笼钓瓶一心",
      KagurasVerity: "神乐之真意",
      KatsuragikiriNagamasa: "桂木斩长正",
      KeyOfKhajNisut: "圣显之钥",
      KingsSquire: "王下近侍",
      KitainCrossSpear: "喜多院十文字",
      LuxuriousSeaLord: "衔珠海皇",
      LionsRoar: "匣里龙吟",
      LithicBlade: "千岩古剑",
      LithicSpear: "千岩长枪",
      LightOfFoliarIncision: "裁叶萃光",
      LightbearingMoonshard: "朏魄含光",
      LostPrayerToTheSacredWinds: "四风原典",
      LumidouceElegy: "柔灯挽歌",
      MailedFlower: "饰铁之花",
      MakhairaAquamarine: "玛海菈的水色",
      MappaMare: "万国诸海图谱",
      MasterKey: "万能钥匙",
      MemoryOfDust: "尘世之锁",
      Messenger: "信使",
      MissiveWindspear: "风信之锋",
      MitternachtsWaltz: "幽夜华尔兹",
      MistsplitterReforged: "雾切之回光",
      MountainBracingBolt: "镇山之钉",
      MoonweaversDawn: "织月者的曙色",
      Moonpiercer: "贯月矢",
      MouunsMoon: "曚云之月",
      NightweaversLookingGlass: "纺夜天镜",
      NocturnesCurtainCall: "帷间夜曲",
      OathswornEye: "证誓之明瞳",
      PrototypeArchaic: "试作古华",
      PrototypeRancour: "试作斩岩",
      PrototypeCrescent: "试作澹月",
      PrototypeStarglitter: "试作星镰",
      PeakPatrolSong: "岩峰巡歌",
      PolarStar: "冬极白星",
      PortablePowerSaw: "便携动力锯",
      Predator: "掠食者",
      PrimordialJadeCutter: "磐岩结绿",
      PrimordialJadeWingedSpear: "和璞鸢",
      PrototypeAmber: "试作金珀",
      ProspectorsDrill: "勘探钻机",
      ProspectorsShovel: "掘金之锹",
      Rainslasher: "雨裁",
      RingOfYaxche: "木棉之环",
      RainbowSerpentsRainBow: "虹蛇的雨弦",
      RangeGauge: "测距规",
      RedhornStonethresher: "赤角石溃杵",
      ReliquaryOfTruth: "真语秘匣",
      RightfulReward: "公义的酬报",
      RoyalBow: "宗室长弓",
      RoyalGreatsword: "宗室大剑",
      RoyalGrimoire: "宗室秘法录",
      RoyalLongsword: "宗室长剑",
      RoyalSpear: "宗室猎枪",
      Rust: "弓藏",
      SacrificialBow: "祭礼弓",
      SacrificialFragments: "祭礼残章",
      SacrificialGreatsword: "祭礼大剑",
      SacrificialSword: "祭礼剑",
      SacrificialJade: "遗祀玉珑",
      SacrificersStaff: "圣祭者的辉杖",
      SapwoodBlade: "原木刀",
      ScionOfTheBlazingSun: "烈阳之嗣",
      SequenceOfSolitude: "冷寂迸音",
      SerenitysCall: "谧音吹哨",
      SerpentSpine: "螭骨剑",
      SkywardAtlas: "天空之卷",
      SkywardBlade: "天空之刃",
      SkywardHarp: "天空之翼",
      SkywardPride: "天空之傲",
      SkywardSpine: "天空之脊",
      SilvershowerHeartstrings: "白雨心弦",
      SnareHook: "罗网勾针",
      SnowTombedStarsilver: "雪葬的星银",
      SplendorOfTranquilWaters: "静水流涌之辉",
      StaffOfHoma: "护摩之杖",
      StaffOfTheScarletSands: "赤沙之杖",
      StarcallersWatch: "祭星者之望",
      SturdyBone: "弥坚骨",
      SummitShaper: "斫峰之刃",
      SurfsUp: "冲浪时光",
      SwordOfDescension: "降临之剑",
      SwordOfNarzissenkreuz: "水仙十字之剑",
      SunnyMorningSleepIn: "寝正月初晴",
      SolarPearl: "匣里日月",
      SongOfBrokenPines: "松籁响起之时",
      SongOfStillness: "静谧之曲",
      SymphonistOfScents: "香韵奏者",
      TamayurateiNoOhanashi: "且住亭御咄",
      TheCatch: "「渔获」",
      TheDaybreakChronicles: "黎明破晓之史",
      TheDockhandsAssistant: "船坞长剑",
      TheFirstGreatMagic: "最初的大魔术",
      TheFlute: "笛剑",
      TheWidsith: "流浪乐章",
      TheUnforged: "无工之剑",
      TheAlleyFlash: "暗巷闪光",
      TheBell: "钟剑",
      TheBlackSword: "黑剑",
      TheStringless: "绝弦",
      TheViridescentHunt: "苍翠猎弓",
      ThunderingPulse: "飞雷之弦振",
      TidalShadow: "浪影阔剑",
      TomeOfTheEternalFlow: "万世流涌大典",
      ToukabouShigure: "东花坊时雨",
      TalkingStick: "聊聊棒",
      TulaytullahsRemembrance: "图莱杜拉的回忆",
      UltimateOverlordsMegaMagicSword: "「究极霸王超级魔剑」",
      UrakuMisugiri: "有乐御簾切",
      Verdict: "裁断",
      VividNotions: "溢彩心念",
      VortexVanquisher: "贯虹之槊",
      WanderingEvenstar: "流浪的晚星",
      WavebreakersFin: "断浪长鳍",
      WaveridingWhirl: "乘浪的回旋",
      Whiteblind: "白影剑",
      WindblumeOde: "风花之颂",
      WineAndSong: "暗巷的酒与诗",
      WolfFang: "狼牙",
      WolfsGravestone: "狼的末路",
      XiphosMoonlight: "西福斯的月光"
    }

    expect(supportedWeapons.map((weapon) => weapon.weaponId).sort()).toEqual(Object.keys(officialLabels).sort())

    for (const [weaponId, officialLabel] of Object.entries(officialLabels)) {
      expect(supportedWeapons.find((weapon) => weapon.weaponId === weaponId)?.label).toBe(officialLabel)
    }

    for (const weapon of supportedWeapons) {
      expect(weapon.label).toMatch(/[\u3400-\u9fff]/u)
      expect(weapon.label).not.toBe(weapon.weaponId)
      expect(weapon.label).toBe(requireOfficialWeaponName(weapon.weaponId))
    }
  })
})
