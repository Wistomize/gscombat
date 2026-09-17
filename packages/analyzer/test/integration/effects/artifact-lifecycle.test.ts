import { getCombatActionDefinition, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it } from "vitest"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveCombatActionEffects, resolveCombatEffectLifecycle } from "../../../src/effects/action-effects.js"
import { findCapabilityProviders } from "../../../src/scenario/capabilities.js"
import { resolveSourceFinalAttackByBuildId, resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId } from "../../../src/evaluators/source-stats.js"
import { resolveBaseCombatStats } from "../../../src/core/base-stats.js"
import { resolvePrimaryDifferentElementTeammateCount, resolvePrimarySameElementTeammateCount } from "../../../src/core/build-variant.js"
import { resolveActiveRecipientEquipmentEffects } from "../../../src/metrics/runtime.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const build = (characterId: string, weaponId: string, setId?: string): CharacterBuild => ({
  ...structuredClone(raidenNationalBuiltinBuild), characterId, buildId: `lifecycle.${characterId}`, constellation: 0,
  artifacts: setId ? raidenNationalBuiltinBuild.artifacts.map((piece) => ({ ...piece, setId })) : [],
  weapon: { weaponId, level: 90, ascension: 6, refinement: 1 }
})
const owner = build("Fischl", "FavoniusWarbow")

it("counts cast opportunities separately from separated skill hits and re-derives weapon resets", () => {
  const sum = (wearer: CharacterBuild, target: string, foreground: string | null = wearer.buildId) =>
    effects(wearer, foreground, [], [], "nascent_gleam", { element: "pyro" })
      .filter((row) => row.id.includes(".4pc") && row.target === target).reduce((n, row) => n + row.value, 0)
  const diluc = build("Diluc", "FavoniusGreatsword", "CrimsonWitchOfFlames")
  expect(sum(diluc, "damageBonus")).toBeCloseTo(0.225)
  const xingqiu = build("Xingqiu", "FavoniusSword", "CrimsonWitchOfFlames")
  expect(sum(xingqiu, "damageBonus")).toBeCloseTo(0.075)
  expect(sum({ ...xingqiu, weapon: { ...xingqiu.weapon, weaponId: "SacrificialSword" } }, "damageBonus")).toBeCloseTo(0.15)
  const raiden = build("RaidenShogun", "FavoniusLance", "CrimsonWitchOfFlames")
  // A ten-second cooldown reaches the boundary, not a second retained stack; coordinated hits are not casts.
  expect(sum(raiden, "damageBonus")).toBeCloseTo(0.075)
  const flins = { ...build("Flins", "FavoniusLance", "CrimsonWitchOfFlames"), constellation: 0 }
  expect(sum(flins, "damageBonus")).toBeCloseTo(0.225)
  expect(sum(flins, "damageBonus", null)).toBeCloseTo(0.225)
  const lanyan = build("LanYan", "FavoniusCodex", "CrimsonWitchOfFlames")
  expect(sum({ ...lanyan, constellation: 0 }, "damageBonus")).toBeCloseTo(0.075)
  expect(sum({ ...lanyan, constellation: 6 }, "damageBonus")).toBeCloseTo(0.15)
  const fischl = build("Fischl", "FavoniusWarbow", "PaleFlame")
  expect(sum(fischl, "attackPercent")).toBeCloseTo(0.18)
  expect(sum(fischl, "attackPercent", null)).toBe(0)
  const single = build("Chongyun", "FavoniusGreatsword", "PaleFlame")
  expect(sum(single, "attackPercent")).toBeCloseTo(0.09)
  expect(sum({ ...single, weapon: { ...single.weapon, weaponId: "SacrificialGreatsword" } }, "attackPercent")).toBeCloseTo(0.18)
  const noSkillHit = build("Yoimiya", "SacrificialBow", "CrimsonWitchOfFlames")
  expect(sum(noSkillHit, "damageBonus")).toBeCloseTo(0.075)
})

it("distinguishes legal plunge access, shared shields and ordinary crystal shields from Moon cages", () => {
  const primary = build("Fischl", "FavoniusWarbow", "LongNightsOath")
  const xianyun = build("Xianyun", "FavoniusCodex")
  const sum = (rows: ReturnType<typeof effects>) => rows.filter((row) => row.target === "damageBonus").reduce((n, row) => n + row.value, 0)
  expect(sum(effects(primary, primary.buildId, [], [], "nascent_gleam", { attackKind: "plunge" }))).toBeCloseTo(0.25)
  expect(sum(effects(primary, primary.buildId, [xianyun], [], "nascent_gleam", { attackKind: "plunge" }))).toBeCloseTo(1)
  expect(sum(effects(primary, xianyun.buildId, [xianyun], [], "nascent_gleam", { attackKind: "plunge" }))).toBeCloseTo(0.25)
  const bolide = { ...primary, artifacts: build("Fischl", "FavoniusWarbow", "RetracingBolide").artifacts }
  const shield = build("Zhongli", "FavoniusLance")
  expect(sum(effects(bolide, bolide.buildId, [shield], [], "nascent_gleam", { attackKind: "normal" }))).toBeCloseTo(0.4)
  expect(sum(effects(bolide, shield.buildId, [shield], [], "nascent_gleam", { attackKind: "normal" }))).toBe(0)
  const hydro = build("Xingqiu", "FavoniusSword", "RetracingBolide")
  const geo = build("Zibai", "FavoniusSword")
  expect(sum(effects(hydro, hydro.buildId, [geo], [], "nascent_gleam", { attackKind: "normal" }))).toBe(0)
  const electro = build("Fischl", "FavoniusWarbow")
  expect(sum(effects(hydro, hydro.buildId, [geo, electro], [], "nascent_gleam", { attackKind: "normal" }))).toBeCloseTo(0.4)
  const night = { ...hydro, artifacts: build("Xingqiu", "FavoniusSword", "NighttimeWhispersInTheEchoingWoods").artifacts }
  expect(sum(effects(night, night.buildId, [geo], [], "nascent_gleam", { element: "geo" }))).toBeCloseTo(0.5)
  expect(sum(effects(night, geo.buildId, [geo], [], "nascent_gleam", { element: "geo" }))).toBe(0)
})

it("separates team stellar eligibility from the wearer's own trigger or damage path", () => {
  const odette = build("Odette", "FavoniusSword")
  const mizuki = build("YumemizukiMizuki", "FavoniusCodex")
  const primary = build("Bennett", "FavoniusSword", "ScarletProof")
  const crit = (teammates: CharacterBuild[], front: string | null) => effects(primary, front, teammates)
    .filter((row) => row.target === "critRate").reduce((n, row) => n + row.value, 0)
  expect(crit([odette, mizuki], primary.buildId)).toBeCloseTo(0.16)
  expect(crit([odette], primary.buildId)).toBe(0)
  expect(crit([odette, mizuki], mizuki.buildId)).toBe(0)
  const furnace = { ...primary, artifacts: build("Bennett", "FavoniusSword", "HeartOfTheFurnace").artifacts }
  expect(effects(furnace, furnace.buildId, [odette, mizuki]).some((row) => row.id.includes("furnace.4pc"))).toBe(false)
  const damageWearer = { ...odette, artifacts: furnace.artifacts }
  const resolve = (teammates: CharacterBuild[]) => effects(mizuki, mizuki.buildId, teammates)
    .find((row) => row.id === "artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus")
  // The helper's ordinary action does not accept special-reaction damage bonuses; query the special event explicitly.
  const stellar = resolveCombatActionEffects({
    action: { ...action, specialReaction: { kind: "stellar_swirl" } }, primary: mizuki, teammates: [damageWearer],
    candidateSpecialReactionKinds: ["stellar_swirl"], gameData: db, baseEnergyRecharge: 1, enemyCount: 1, activeEffectIds: [],
    fieldContext: { actionOwnerBuildId: mizuki.buildId, onFieldBuildId: mizuki.buildId }
  })
  expect(stellar.specialReactionDamageBonus).toBeCloseTo(0.5)
  expect(resolve([damageWearer])).toBeUndefined()
})

it("derives Husk, Whimsy and hit-category sets from kit capabilities without metric-name or old-stack overrides", () => {
  const husk = build("Fischl", "FavoniusWarbow", "HuskOfOpulentDreams")
  const geo = build("Noelle", "FavoniusGreatsword", "HuskOfOpulentDreams")
  const sum = (rows: ReturnType<typeof effects>, target: string) => rows.filter((row) => row.target === target).reduce((n, row) => n + row.value, 0)
  expect(sum(effects(husk, husk.buildId), "defensePercent")).toBeCloseTo(0.3)
  expect(sum(effects(husk, null), "defensePercent")).toBeCloseTo(0.54)
  expect(sum(effects(geo, geo.buildId), "defensePercent")).toBeCloseTo(0.54)
  const whimsy = build("Arlecchino", "FavoniusLance", "FragmentOfHarmonicWhimsy")
  const manual = "artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.0-stack.damage-bonus"
  expect(sum(effects(whimsy, whimsy.buildId), "damageBonus")).toBeCloseTo(0.54)
  expect(sum(effects(whimsy, whimsy.buildId, [], [manual]), "damageBonus")).toBe(0)
  expect(sum(effects(whimsy, null), "damageBonus")).toBe(0)
  expect(sum(effects({ ...husk, artifacts: whimsy.artifacts }, husk.buildId, [whimsy]), "damageBonus")).toBe(0)
  const nymph = build("Tartaglia", "FavoniusWarbow", "NymphsDream")
  expect(sum(effects(nymph, nymph.buildId), "attackPercent")).toBeCloseTo(0.25)
  expect(sum(effects(nymph, null), "attackPercent")).toBe(0)
  const desert = build("Wanderer", "FavoniusCodex", "DesertPavilionChronicle")
  expect(sum(effects(desert, desert.buildId, [], [], "nascent_gleam", { attackKind: "charged", element: "anemo" }), "damageBonus")).toBeCloseTo(0.55)
  expect(sum(effects(desert, null, [], [], "nascent_gleam", { attackKind: "charged", element: "anemo" }), "damageBonus")).toBeCloseTo(0.15)
})

it("keeps Moon states disjoint and counts each eligible Moongleam type once across real source presence", () => {
  const primary = build("Flins", "FavoniusLance", "NightOfTheSkysUnveiling")
  const silken = build("Columbina", "FavoniusCodex", "SilkenMoonsSerenade")
  const duplicate = build("Ineffa", "FavoniusLance", "SilkenMoonsSerenade")
  const resolve = (front: string | null, teammates: CharacterBuild[], moonsignLevel: "nascent_gleam" | "ascendant_gleam") =>
    resolveCombatActionEffects({
      action: { ...action, characterId: primary.characterId, specialReaction: { kind: "lunar_charged" } },
      primary, teammates, moonsignLevel, gameData: db, baseEnergyRecharge: 1, enemyCount: 1,
      candidateSpecialReactionKinds: ["lunar_charged"], activeEffectIds: [],
      fieldContext: { actionOwnerBuildId: primary.buildId, onFieldBuildId: front }
    })
  expect(resolve(primary.buildId, [silken, duplicate], "ascendant_gleam").critRate).toBeCloseTo(0.3)
  expect(resolve(primary.buildId, [silken, duplicate], "ascendant_gleam").elementalMastery).toBe(200)
  expect(resolve(primary.buildId, [silken, duplicate], "ascendant_gleam").specialReactionDamageBonus).toBeCloseTo(0.2)
  expect(resolve(silken.buildId, [silken, duplicate], "ascendant_gleam").specialReactionDamageBonus).toBeCloseTo(0.1)
  expect(resolve(silken.buildId, [silken, duplicate], "ascendant_gleam").critRate).toBe(0)
  expect(resolve(primary.buildId, [], "nascent_gleam").critRate).toBe(0)
  const hydro = build("Xingqiu", "FavoniusSword")
  expect(resolve(primary.buildId, [hydro], "nascent_gleam").critRate).toBeCloseTo(0.15)
})

it("requires wearer-owned homework and reaction preparation, preserving real foreground elements and strongest Scroll", () => {
  const primary = build("Bennett", "FavoniusSword")
  const fischl = build("Fischl", "FavoniusWarbow", "CelestialGift")
  const mona = build("Mona", "FavoniusCodex")
  const kachina = build("Kachina", "FavoniusLance", "ScrollOfTheHeroOfCinderCity")
  const kazuha = build("KaedeharaKazuha", "FavoniusSword", "ScrollOfTheHeroOfCinderCity")
  const sum = (rows: ReturnType<typeof effects>) => rows.filter((row) => row.target === "damageBonus").reduce((n, row) => n + row.value, 0)
  expect(sum(effects(primary, primary.buildId, [fischl], [], "nascent_gleam", { element: "pyro" }))).toBe(0)
  expect(sum(effects(primary, primary.buildId, [fischl], [], "nascent_gleam", { element: "electro" }))).toBeCloseTo(0.2)
  expect(sum(effects(primary, primary.buildId, [fischl, mona], [], "nascent_gleam", { element: "pyro" }))).toBeCloseTo(0.4)
  expect(sum(effects(primary, mona.buildId, [fischl, mona], [], "nascent_gleam", { element: "pyro" }))).toBe(0)
  expect(sum(effects(primary, primary.buildId, [kachina, kazuha], [], "nascent_gleam", { element: "pyro" }))).toBeCloseTo(0.4)
  expect(sum(effects(primary, primary.buildId, [kachina, kazuha], [], "nascent_gleam", { element: "hydro" }))).toBe(0)
  const rising = build("Fischl", "FavoniusWarbow", "ADayCarvedFromRisingWinds")
  expect(effects(rising, null).find((row) => row.target === "critRate")?.value).toBeCloseTo(0.2)
  expect(effects({ ...primary, artifacts: rising.artifacts }, null).some((row) => row.target === "critRate")).toBe(false)
})

it("qualifies retained Deepwood hits and sustained or explicitly selected Tenacity through both consumers", () => {
  const source = build("Bennett", "FavoniusSword", "DeepwoodMemories")
  const deepwood = effects(owner, owner.buildId, [source], [], "nascent_gleam", { element: "dendro" })
  expect(deepwood.find((effect) => effect.id.includes("4pc"))?.value).toBe(0.3)
  const noSkillHit = build("Clorinde", "FavoniusSword", "TenacityOfTheMillelith")
  const singleHit = { ...source, artifacts: noSkillHit.artifacts }
  const sustained = build("Fischl", "FavoniusWarbow", "TenacityOfTheMillelith")
  const recipient = build("Xiao", "FavoniusLance")
  const attackId = "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent"
  const shieldId = "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength"
  for (const [holder, selected, expected] of [
    [sustained, false, true], [singleHit, false, false], [singleHit, true, true], [noSkillHit, true, false]
  ] as const) {
    const attack = effects(recipient, recipient.buildId, [holder], selected ? [attackId] : [])
    expect(attack.some((effect) => effect.id === attackId)).toBe(expected)
    const shield = resolveActiveRecipientEquipmentEffects([recipient, holder], selected ? [shieldId] : [], undefined, {
      recipient, gameData: db, fieldContext: { actionOwnerBuildId: recipient.buildId, onFieldBuildId: recipient.buildId }
    })
    expect(shield.some((effect) => effect.id === shieldId)).toBe(expected)
  }
  const frontOnly = build("YumemizukiMizuki", "FavoniusCodex", "TenacityOfTheMillelith")
  expect(effects(recipient, recipient.buildId, [frontOnly]).some((effect) => effect.id === attackId)).toBe(false)
  expect(effects(recipient, frontOnly.buildId, [frontOnly]).some((effect) => effect.id === attackId)).toBe(true)
})

it("uses resource declarations for Shimenawa and Finale while keeping Emblem conversions field independent", () => {
  const ordinary = build("Fischl", "FavoniusWarbow", "ShimenawasReminiscence")
  const special = build("Skirk", "FavoniusSword", "ShimenawasReminiscence")
  const four = (rows: ReturnType<typeof effects>) => rows.filter((effect) => effect.id.includes(".4pc."))
  expect(four(effects(ordinary, ordinary.buildId, [], [], "nascent_gleam", { attackKind: "normal" }))[0]?.value).toBe(0.5)
  expect(four(effects(ordinary, null, [], [], "nascent_gleam", { attackKind: "normal" }))).toHaveLength(0)
  expect(four(effects(special, special.buildId, [], [], "nascent_gleam", { attackKind: "normal" }))).toHaveLength(0)
  const finale = build("Skirk", "FavoniusSword", "FinaleOfTheDeepGalleries")
  expect(four(effects(finale, null, [], [], "nascent_gleam", { attackKind: "normal" }))[0]?.value).toBe(0.6)
  expect(four(effects({ ...ordinary, artifacts: finale.artifacts }, ordinary.buildId, [], [], "nascent_gleam", { attackKind: "normal" }))).toHaveLength(0)
  const emblem = build("Fischl", "FavoniusWarbow", "EmblemOfSeveredFate")
  for (const er of [2, 3, 4]) {
    const result = resolveCombatActionEffects({
      action: { ...action, characterId: emblem.characterId, talentSlot: "burst" },
      primary: emblem, teammates: [], activeEffectIds: [], baseEnergyRecharge: er, enemyCount: 1, gameData: db,
      fieldContext: { actionOwnerBuildId: emblem.buildId, onFieldBuildId: null }
    })
    expect(result.appliedEffects.find((effect) => effect.id.includes("emblem-of-severed-fate.4pc"))?.value)
      .toBeCloseTo(Math.min((er + 0.2) * 0.25, 0.75))
  }
})

it("keeps reviewed passive two-piece stats while excluded resource, resistance and cumulative clauses add no damage", () => {
  for (const [setId, expected] of [
    ["Gambler", 0.2], ["TheExile", 0.2], ["Scholar", 0.2], ["DefendersWill", 0.3],
    ["TinyMiracle", 0], ["PrayersForDestiny", 0], ["PrayersForIllumination", 0],
    ["PrayersForWisdom", 0], ["PrayersToSpringtime", 0], ["OceanHuedClam", 0], ["SongOfDaysPast", 0]
  ] as const) {
    const wearer = build("Fischl", "FavoniusWarbow", setId)
    const originalPieces = structuredClone(wearer.artifacts)
    for (const front of [wearer.buildId, null]) {
      const rows = effects(wearer, front)
      expect(rows.reduce((sum, row) => sum + row.value, 0), setId).toBeCloseTo(expected)
      expect(rows.some((row) => row.id.includes(".4pc.")), setId).toBe(false)
    }
    expect(wearer.artifacts).toEqual(originalPieces)
  }
})

it("shares the explicit frozen scenario state without letting old Blizzard selections bypass foreground or Cryo composition", () => {
  const primary = build("Fischl", "FavoniusWarbow", "BlizzardStrayer")
  const cryo = build("Diona", "FavoniusWarbow")
  const resolve = (onFieldBuildId: string | null, targetFrozen: boolean, teammates: CharacterBuild[]) =>
    resolveCombatActionEffects({
      action, primary, teammates, targetFrozen, activeEffectIds: ["artifact.blizzard-strayer.4pc.frozen.crit-rate"],
      baseEnergyRecharge: 1, enemyCount: 1, gameData: db,
      fieldContext: { actionOwnerBuildId: primary.buildId, onFieldBuildId }
    })
  expect(resolve(primary.buildId, false, [cryo]).critRate).toBeCloseTo(0.2)
  expect(resolve(primary.buildId, true, [cryo]).critRate).toBeCloseTo(0.4)
  expect(resolve(null, true, [cryo]).critRate).toBe(0)
  expect(resolve(primary.buildId, true, []).critRate).toBe(0)
})

it("requires the equipment holder to prepare a legal reaction instead of borrowing another member's trigger", () => {
  const instructor = build("Bennett", "FavoniusSword", "Instructor")
  const anemo = build("KaedeharaKazuha", "FavoniusSword")
  const instructorId = "artifact.instructor.4pc.after-reaction.party-elemental-mastery"
  // Anemo can Swirl Pyro; the Pyro applicator cannot claim to be the Swirl trigger.
  expect(effects(anemo, anemo.buildId, [instructor]).some((effect) => effect.id === instructorId)).toBe(false)
  const anemoWearer = { ...anemo, artifacts: instructor.artifacts }
  const pyroRecipient = build("Bennett", "FavoniusSword")
  expect(effects(pyroRecipient, pyroRecipient.buildId, [anemoWearer]).find((effect) => effect.id === instructorId)?.value).toBe(120)
  const gilded = build("Fischl", "FavoniusWarbow", "GildedDreams")
  const same = build("Beidou", "FavoniusGreatsword")
  const different = build("Xingqiu", "FavoniusSword")
  const mono = effects(gilded, gilded.buildId, [same])
  expect(mono.filter((effect) => effect.id.includes(".4pc."))).toHaveLength(0)
  const mixed = effects(gilded, null, [same, different])
  expect(mixed.filter((effect) => effect.target === "elementalMastery").reduce((sum, effect) => sum + effect.value, 0)).toBe(130)
  expect(mixed.find((effect) => effect.target === "attackPercent")?.value).toBeCloseTo(0.14)
  expect(effects(gilded, null, [different, same])).toEqual(mixed)
})

it("keeps Paradise base bonuses without trigger evidence and separates Viridescent ordinary and stellar formulas", () => {
  const nefer = build("Nefer", "FavoniusCodex", "FlowerOfParadiseLost")
  const hydro = build("Xingqiu", "FavoniusSword")
  const lunarAction = { ...action, damageKind: "special_reaction" as const, specialReaction: { kind: "lunar_bloom" as const } }
  const lunar = (teammates: CharacterBuild[], ids: string[] = []) => resolveCombatActionEffects({
    action: lunarAction, primary: nefer, teammates, activeEffectIds: ids,
    candidateSpecialReactionKinds: ["lunar_bloom"], baseEnergyRecharge: 1, enemyCount: 1, gameData: db,
    fieldContext: { actionOwnerBuildId: nefer.buildId, onFieldBuildId: null }
  })
  expect(lunar([]).specialReactionDamageBonus).toBeCloseTo(0.1)
  expect(lunar([], ["artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.lunar-bloom-reaction-damage-bonus"]).specialReactionDamageBonus).toBeCloseTo(0.1)
  expect(lunar([hydro]).specialReactionDamageBonus).toBeCloseTo(0.2)
  const wearer = build("KaedeharaKazuha", "FavoniusSword", "ViridescentVenerer")
  const pyro = build("Bennett", "FavoniusSword")
  const resistance = (primary: CharacterBuild, element: "pyro" | "hydro") => effects(primary, primary.buildId, [wearer], [], "nascent_gleam", { element })
    .filter((effect) => effect.target === "enemyResistanceReduction").reduce((sum, effect) => sum + effect.value, 0)
  expect(resistance(pyro, "pyro")).toBeCloseTo(0.4)
  expect(resistance(pyro, "hydro")).toBe(0)
  for (const front of [wearer.buildId, null]) {
    const stellar = resolveCombatActionEffects({
      action: { ...action, specialReaction: { kind: "stellar_swirl" } }, primary: wearer, teammates: [pyro],
      activeEffectIds: [], candidateSpecialReactionKinds: ["stellar_swirl"], baseEnergyRecharge: 1, enemyCount: 1, gameData: db,
      fieldContext: { actionOwnerBuildId: wearer.buildId, onFieldBuildId: front }
    })
    expect(stellar.specialReactionDamageBonus).toBeCloseTo(0.2)
    expect(stellar.reactionDamageBonus).toBe(0)
  }
})
const action = getCombatActionDefinition(raidenNationalBuiltinScenario.targetActionId)!
const effects = (primary: CharacterBuild, onFieldBuildId: string | null, teammates: CharacterBuild[] = [],
  activeEffectIds: string[] = [], moonsignLevel: "nascent_gleam" | "ascendant_gleam" = "nascent_gleam",
  actionOverrides: Partial<CombatActionMetadata> = {}) =>
  resolveCombatActionEffects({
    action: { ...action, characterId: primary.characterId, talentSlot: "skill", element: "electro", ...actionOverrides },
    primary, teammates, activeEffectIds, gameData: db, baseEnergyRecharge: 1, enemyCount: 1, moonsignLevel,
    primaryDifferentElementTeammateCount: resolvePrimaryDifferentElementTeammateCount(primary, teammates, db) ?? 0,
    primarySameElementTeammateCount: resolvePrimarySameElementTeammateCount(primary, teammates, db) ?? 0,
    fieldContext: { actionOwnerBuildId: primary.buildId, onFieldBuildId }
  }).appliedEffects.filter((effect) => effect.id.startsWith("artifact."))

it("applies source presence to both ordinary and special-reaction equipment without promoting unknown teammates", () => {
  const golden = build("Fischl", "FavoniusWarbow", "GoldenTroupe")
  const sum = (rows: ReturnType<typeof effects>) => rows.reduce((total, effect) => total + effect.value, 0)
  expect(sum(effects(golden, golden.buildId))).toBeCloseTo(0.45)
  expect(sum(effects(golden, null))).toBeCloseTo(0.70)
  const aubade = build("Fischl", "FavoniusWarbow", "AubadeOfMorningstarAndMoon")
  const resolve = (onFieldBuildId: string | null, moonsignLevel: "nascent_gleam" | "ascendant_gleam") =>
    resolveCombatActionEffects({
      action: { ...action, talentSlot: "skill", specialReaction: { kind: "lunar_charged" } },
      candidateSpecialReactionKinds: ["lunar_charged"], primary: aubade, teammates: [], activeEffectIds: [],
      baseEnergyRecharge: 1, enemyCount: 1, gameData: db, moonsignLevel,
      fieldContext: { actionOwnerBuildId: aubade.buildId, onFieldBuildId }
    })
  expect(resolve(aubade.buildId, "ascendant_gleam").specialReactionDamageBonus).toBe(0)
  expect(resolve(null, "nascent_gleam").specialReactionDamageBonus).toBeCloseTo(0.2)
  expect(resolve(null, "ascendant_gleam").specialReactionDamageBonus).toBeCloseTo(0.6)
  expect(resolve(null, "ascendant_gleam").elementalMastery).toBe(80)
  const black = build("Mualani", "FavoniusCodex", "ObsidianCodex")
  expect(sum(effects(black, black.buildId))).toBeCloseTo(0.55)
  expect(effects(black, null)).toHaveLength(0)
  expect(effects({ ...golden, artifacts: black.artifacts }, golden.buildId)).toHaveLength(0)
})

it("derives Vermillion from an applicable HP-loss provider, not any self-draining teammate or healing ability", () => {
  const wearer = build("Fischl", "FavoniusWarbow", "VermillionHereafter")
  const xiao = build("Xiao", "FavoniusLance")
  const furina = build("Furina", "FavoniusSword")
  const sum = (teammates: CharacterBuild[], foreground: string | null = wearer.buildId, ids: string[] = []) =>
    effects(wearer, foreground, teammates, ids).reduce((total, effect) => total + effect.value, 0)
  expect(sum([])).toBeCloseTo(0.26)
  expect(sum([xiao])).toBeCloseTo(0.26)
  expect(sum([build("Barbara", "FavoniusCodex")])).toBeCloseTo(0.26)
  expect(sum([furina])).toBeCloseTo(0.66)
  expect(sum([furina], furina.buildId)).toBeCloseTo(0.18)
  expect(sum([], wearer.buildId, ["artifact.vermillion-hereafter.4pc.after-burst.4-stack.attack-percent"]))
    .toBeCloseTo(0.26)
  const own = { ...xiao, artifacts: wearer.artifacts }
  expect(effects(own, own.buildId).reduce((total, effect) => total + effect.value, 0)).toBeCloseTo(0.66)
  const providers = findCapabilityProviders({
    builds: [wearer, xiao, furina], activeEffectIds: [],
    fieldContext: { actionOwnerBuildId: wearer.buildId, onFieldBuildId: wearer.buildId },
    sourceBuildId: wearer.buildId, recipientBuildId: wearer.buildId,
    requirement: { kind: "hp_loss", recipient: "source" }
  })
  expect(providers.map((provider) => provider.sourceBuildId)).toEqual([furina.buildId])
})

it("keeps preparation retention separate from current foreground and rejects contradictory legacy declarations", () => {
  const source = build("Xiao", "FavoniusLance")
  const common = {
    source, recipient: owner, builds: [owner, source], activeEffectIds: [], selected: false,
    fieldContext: { actionOwnerBuildId: owner.buildId, onFieldBuildId: owner.buildId }
  }
  const lifecycle = {
    kind: "conditional" as const, preparation: "qualified" as const, retention: "retain_on_exit" as const,
    trigger: { event: "burst_cast" as const, sourceFieldPresence: "on_field" as const },
    explanation: "已前台施放爆发，退场保留"
  }
  expect(resolveCombatEffectLifecycle({ ...common, lifecycle }).eligible).toBe(true)
  expect(resolveCombatEffectLifecycle({ ...common, lifecycle: { ...lifecycle, retention: "clear_on_exit" } }).eligible).toBe(false)
  expect(() => resolveCombatEffectLifecycle({ ...common, requiresSourceOnField: true,
    lifecycle: { ...lifecycle, applicability: { sourceFieldPresence: "off_field" } } })).toThrow(/冲突/)
})

it("uses the same qualified artifact stats through a real scenario and source-stat snapshots", () => {
  const primary = build("Xiao", "FavoniusLance", "VermillionHereafter")
  const scenario: EvaluationScenario = {
    ...raidenNationalBuiltinScenario, primary, teammates: [], externalBuffs: [],
    targetActionId: "xiao.burst.bane_of_all_evil.high_plunge",
    conditions: { enemyCount: 1, activeEffectIds: [], equipmentEffectMode: "maximum_reachable" }
  }
  const result = evaluateScenario(scenario, db)
  const artifactEffects = result.appliedEffects.filter((effect) => effect.id.startsWith("artifact.vermillion"))
  expect(artifactEffects.reduce((sum, effect) => sum + effect.value, 0)).toBeCloseTo(0.66)
  expect(result.actionExpectedDamage).toBeGreaterThan(0)
})

it("shares current-presence gating across post-skill buffs, averages and actual weapon categories", () => {
  const rows = [
    ["HeartOfDepth", "FavoniusWarbow", "charged", 0.3],
    ["MartialArtist", "FavoniusWarbow", "charged", 0.25],
    ["BraveHeart", "FavoniusWarbow", "normal", 0.15],
    ["GladiatorsFinale", "FavoniusLance", "normal", 0.35],
    ["GladiatorsFinale", "FavoniusWarbow", "normal", 0],
    ["WanderersTroupe", "FavoniusWarbow", "charged", 0.35],
    ["WanderersTroupe", "FavoniusLance", "charged", 0],
    ["ResolutionOfSojourner", "FavoniusWarbow", "charged", 0.3],
    ["ResolutionOfSojourner", "FavoniusWarbow", "normal", 0],
    ["EchoesOfAnOffering", "FavoniusWarbow", "normal", 0.7 / 1.99188736]
  ] as const
  for (const [setId, weaponId, attackKind, expected] of rows) {
    const wearer = build("Fischl", weaponId, setId)
    const sum = (foreground: string | null) => effects(wearer, foreground, [], [], "nascent_gleam",
      { attackKind, talentSlot: "normal" }).filter((effect) => effect.id.includes(".4pc"))
      .reduce((total, effect) => total + effect.value, 0)
    expect(sum(wearer.buildId), setId).toBeCloseTo(expected)
    expect(sum(null), `${setId} off field`).toBe(0)
  }
})

it("treats composition preparation as local eligibility and ignores retired manual states", () => {
  const pyro = build("Bennett", "FavoniusSword")
  const dendro = build("Nahida", "FavoniusCodex")
  const wearer = build("Fischl", "FavoniusWarbow", "UnfinishedReverie")
  const damage = (teammates: CharacterBuild[], foreground: string | null = wearer.buildId) =>
    effects(wearer, foreground, teammates).filter((effect) => effect.target === "damageBonus")
      .reduce((total, effect) => total + effect.value, 0)
  expect(damage([pyro, dendro])).toBe(0.5)
  expect(damage([pyro, dendro], null)).toBe(0.5)
  expect(damage([pyro])).toBe(0)
  for (const [setId, teammates] of [["Thundersoother", []], ["Lavawalker", [pyro]]] as const) {
    const equipped = { ...wearer, artifacts: build("Fischl", "FavoniusWarbow", setId).artifacts }
    expect(effects(equipped, equipped.buildId, [...teammates]).at(0)?.value).toBe(0.35)
    expect(effects(equipped, null, [...teammates])).toHaveLength(0)
  }
  const bloodstained = build("Fischl", "FavoniusWarbow", "BloodstainedChivalry")
  expect(effects(bloodstained, bloodstained.buildId, [],
    ["artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus"], "nascent_gleam",
    { attackKind: "charged", element: "physical" }).map((effect) => effect.value)).toEqual([0.25])
})

it("deduplicates default party preparation independently of team order and preserves it after the source exits", () => {
  const first = build("Bennett", "FavoniusSword", "NoblesseOblige")
  const second = build("Diona", "FavoniusWarbow", "NoblesseOblige")
  const forward = effects(owner, owner.buildId, [first, second])
  const reverse = effects(owner, owner.buildId, [second, first])
  expect(forward).toEqual(reverse)
  expect(forward).toHaveLength(1)
  expect(forward[0]?.value).toBe(0.2)
  const teammates = [first, second]
  const fieldContext = { actionOwnerBuildId: owner.buildId, onFieldBuildId: owner.buildId }
  const selfEquipment = resolveSourceSelfMaximumReachableEquipmentEffectsByBuildId(
    owner, teammates, action, db, 1, [], {}, fieldContext)
  const attacks = resolveSourceFinalAttackByBuildId(
    owner, teammates, action, db, [], undefined, 1, [], undefined, selfEquipment, fieldContext)
  for (const member of [owner, ...teammates]) {
    const base = resolveBaseCombatStats(member, db, action.element)
    expect(attacks.get(member.buildId), member.characterId).toBeCloseTo(base.attack + base.baseAttack * 0.2)
  }
})

it("keeps user-selected stack states distinct from capability-driven defaults", () => {
  const hunter = build("Fischl", "FavoniusWarbow", "MarechausseeHunter")
  const furina = build("Furina", "FavoniusSword")
  const crit = (members: CharacterBuild[], ids: string[] = [], foreground: string | null = hunter.buildId) =>
    effects(hunter, foreground, members, ids).filter((effect) => effect.target === "critRate")
      .reduce((sum, effect) => sum + effect.value, 0)
  expect(crit([])).toBe(0)
  expect(crit([furina])).toBeCloseTo(0.36)
  expect(crit([furina], ["artifact.marechaussee-hunter.4pc.hp-change.0-stack.crit-rate"])).toBe(0)
  expect(crit([], ["artifact.marechaussee-hunter.4pc.hp-change.2-stack.crit-rate"])).toBeCloseTo(0.24)
  expect(crit([furina], ["artifact.marechaussee-hunter.4pc.hp-change.3-stack.crit-rate"], null)).toBe(0)
  const dehya = build("Dehya", "FavoniusGreatsword", "VourukashasGlow")
  const bonus = (wearer: CharacterBuild, ids: string[] = [], teammates: CharacterBuild[] = []) =>
    effects(wearer, null, teammates, ids).filter((effect) => effect.target === "damageBonus")
      .reduce((sum, effect) => sum + effect.value, 0)
  expect(bonus(dehya)).toBeCloseTo(0.5)
  expect(bonus(dehya, ["artifact.vourukashas-glow.4pc.taking-damage.0-stack.skill-burst-damage-bonus"]))
    .toBeCloseTo(0.1)
  const other = { ...hunter, artifacts: dehya.artifacts }
  expect(bonus(other, [], [dehya, furina])).toBeCloseTo(0.1)
  expect(bonus(other, ["artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"]))
    .toBeCloseTo(0.5)
})

it("gates conventional and special reaction bonuses without changing their distinct targets", () => {
  const wearer = build("Fischl", "FavoniusWarbow", "ThunderingFury")
  const resolve = (onFieldBuildId: string | null) => resolveCombatActionEffects({
    action: { ...action, specialReaction: { kind: "lunar_charged" } },
    candidateReactionKinds: ["electro_charged"], candidateSpecialReactionKinds: ["lunar_charged"],
    primary: wearer, teammates: [], activeEffectIds: [], baseEnergyRecharge: 1, enemyCount: 1,
    fieldContext: { actionOwnerBuildId: wearer.buildId, onFieldBuildId }
  })
  expect(resolve(wearer.buildId).reactionDamageBonus).toBeCloseTo(0.4)
  expect(resolve(wearer.buildId).specialReactionDamageBonus).toBeCloseTo(0.2)
  expect(resolve(null).reactionDamageBonus).toBe(0)
  expect(resolve(null).specialReactionDamageBonus).toBe(0)
  expect(resolve(null).damageBonus).toBeCloseTo(0.15)
})
