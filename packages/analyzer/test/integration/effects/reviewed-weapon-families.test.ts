import { afterAll, expect, it } from "vitest"
import { getCombatActionDefinition, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { resolveCombatActionEffects } from "../../../src/effects/action-effects.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveFieldContext } from "../../../src/core/field-presence.js"
import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"
import { findCapabilityProviders } from "../../../src/scenario/capabilities.js"
import { describeWeaponChoices } from "../../../src/effects/weapon-state.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const build = (characterId: string, weaponId: string): CharacterBuild => ({
  ...structuredClone(raidenNationalBuiltinBuild), characterId, buildId: `review.${characterId}`,
  constellation: 0, artifacts: [], weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
})
const action: CombatActionMetadata = { id: "review.skill", characterId: "Diluc", element: "pyro",
  kind: "damage", talentSlot: "skill", status: "verified" }
const resolve = (primary: CharacterBuild, teammates: CharacterBuild[] = [],
  choices: Record<string, Record<string, string>> = {}, foreground = primary.buildId,
  metadata: CombatActionMetadata = action) => resolveCombatActionEffects({
  action: metadata, primary, teammates, activeEffectIds: [], baseEnergyRecharge: 1, gameData: db, enemyCount: 1,
  fieldContext: { actionOwnerBuildId: "shared-action-owner", onFieldBuildId: foreground, weaponEffectChoices: choices }
})

it("counts Mistsplitter's independent sources with native-element and burst snapshot boundaries", () => {
  const bonus = (character: string, actionId: string, full = false, teammates: CharacterBuild[] = []) => {
    const owner = build(character, "MistsplitterReforged")
    const metadata = getCombatActionDefinition(actionId)!
    return resolveCombatActionEffects({ action: metadata, primary: owner, teammates,
      primaryElement: metadata.element, gameData: db, baseEnergyRecharge: 1, enemyCount: 1,
      activeEffectIds: [], fieldContext: { actionOwnerBuildId: owner.buildId, onFieldBuildId: owner.buildId,
        weaponEffectChoices: { [owner.buildId]: { "mistsplitter-full-energy": full ? "on" : "off" } } }
    }).appliedEffects.filter((effect) => effect.id.startsWith("weapon.mistsplitter-reforged.prepared."))
      .reduce((sum, effect) => sum + effect.value, 0)
  }
  expect(bonus("Bennett", "bennett.burst.initial_hit")).toBeCloseTo(0.08)
  expect(bonus("Bennett", "bennett.skill.passion_overload.press")).toBeCloseTo(0.16)
  expect(bonus("Bennett", "bennett.skill.passion_overload.press", true)).toBeCloseTo(0.08)
  expect(bonus("Bennett", "bennett.burst.initial_hit", false, [build("Chongyun", "FavoniusGreatsword")])).toBeCloseTo(0.16)
  expect(bonus("Albedo", "albedo.burst.rite_of_progeniture_tectonic_tide.initial_hit")).toBeCloseTo(0.08)
  expect(bonus("Keqing", "keqing.burst.starward_sword.initial_hit")).toBeCloseTo(0.28)
  expect(bonus("Skirk", "skirk.burst.havoc_ruin.slash")).toBeCloseTo(0.16)
})

it("counts Silvershower's three independent sources without treating received healing as performed healing", () => {
  const sigewinne = build("Sigewinne", "SilvershowerHeartstrings")
  const diona = build("Diona", "SilvershowerHeartstrings")
  const fischl = build("Fischl", "SilvershowerHeartstrings")
  const burst = { ...action, talentSlot: "burst" as const, element: "hydro" as const }
  expect(resolve(sigewinne, [], {}, sigewinne.buildId, burst)).toMatchObject({ hpPercent: 0.4, critRate: 0.28 })
  expect(resolve(diona)).toMatchObject({ hpPercent: 0.24, critRate: 0 })
  expect(resolve(fischl, [build("Barbara", "FavoniusCodex")])).toMatchObject({ hpPercent: 0.12, critRate: 0 })
})

it("keeps particle-pickup self healing source-qualified and foreground-only", () => {
  const holder = build("Lisa", "OtherworldlyStory")
  const another = build("Bennett", "FavoniusSword")
  const healing = (source: CharacterBuild, party: CharacterBuild[], foreground: string) => findCapabilityProviders({
    builds: [source, ...party], fieldContext: { actionOwnerBuildId: source.buildId, onFieldBuildId: foreground },
    activeEffectIds: [], gameData: db, sourceBuildId: source.buildId, recipientBuildId: source.buildId,
    requirement: { kind: "healing", provider: "source", recipient: "source" }
  }).filter((provider) => provider.capability.requiresParticlePickup)
  expect(healing(holder, [], holder.buildId)).toHaveLength(1)
  expect(healing(holder, [another], another.buildId)).toHaveLength(0)
  const barbara = build("Barbara", "OtherworldlyStory")
  expect(healing(barbara, [], barbara.buildId)).toHaveLength(0)
  expect(healing(barbara, [another], barbara.buildId)).toHaveLength(1)
  expect(healing(build("Keqing", "TravelersHandySword"), [], "review.Keqing")).toHaveLength(1)
})

it("labels Ferrous Shadow's actual refinement threshold without changing its default", () => {
  const primary = build("AratakiItto", "FerrousShadow")
  const scenario = { ...raidenNationalBuiltinScenario, primary, teammates: [],
    targetActionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final" }
  expect(describeWeaponChoices(scenario, db).choiceGroups.find((group) => group.id === "ferrous-shadow-low-hp"))
    .toMatchObject({ label: "生命值低于70%", defaultVariant: "off" })
  expect(describeWeaponChoices({ ...scenario, primary: { ...primary, weapon: { ...primary.weapon, refinement: 5 } } }, db)
    .choiceGroups.find((group) => group.id === "ferrous-shadow-low-hp"))
    .toMatchObject({ label: "生命值低于90%", defaultVariant: "off" })
})

it("qualifies Foliar only through elemental normal hits, including applicable teammate infusion", () => {
  const kaeya = build("Kaeya", "LightOfFoliarIncision")
  const foliar = (teammates: CharacterBuild[]) => resolve(kaeya, teammates).matchedActionAdditiveDamageTerms
  expect(foliar([])).toHaveLength(0)
  expect(foliar([build("Chongyun", "FavoniusGreatsword")])).toHaveLength(1)
  expect(foliar([build("Bennett", "FavoniusSword")])).toHaveLength(0)
  expect(foliar([{ ...build("Bennett", "FavoniusSword"), constellation: 6 }])).toHaveLength(1)
})

it("keeps one Thrilling Tales recipient while contributors change and rejects self benefit", () => {
  const holder = build("Barbara", "ThrillingTalesOfDragonSlayers")
  const a = build("Diluc", "FavoniusGreatsword")
  const b = build("Bennett", "FavoniusSword")
  const choices = { [holder.buildId]: { "thrilling-tales-recipient": a.buildId } }
  expect(resolve(a, [holder, b], choices).attackPercent).toBeCloseTo(0.24)
  expect(resolve(b, [holder, a], choices).attackPercent).toBe(0)
  expect(resolve(holder, [a, b], choices).attackPercent).toBe(0)
  expect(resolve(a, [holder, b]).attackPercent).toBe(0)
})

it("allows both Talking Stick preparations but does not infer self auras from party elements", () => {
  const holder = build("Diluc", "TalkingStick")
  const bonuses = (teammates: CharacterBuild[]) => resolve(holder, teammates).appliedEffects
    .filter((effect) => effect.id.startsWith("weapon.talking-stick.")).map((effect) => effect.value)
  // Furina contributes her own team bonus; only the weapon's aura-dependent contributions are under test.
  expect(bonuses([build("Xiangling", "FavoniusLance"), build("Furina", "FavoniusSword")])).toEqual([0, 0])
  expect(bonuses([build("Bennett", "FavoniusSword"), build("Barbara", "FavoniusCodex")])).toEqual([0.16, 0.12])
})

it("applies Bell defaults only to the foreground wearer and does not borrow another member's self shield", () => {
  const holder = build("Diluc", "TheBell")
  const diona = build("Diona", "FavoniusWarbow")
  expect(resolve(holder).damageBonus).toBe(0)
  expect(resolve(holder, [diona]).damageBonus).toBeCloseTo(0.12)
  expect(resolve(holder, [diona], {}, diona.buildId).damageBonus).toBe(0)
  expect(resolve(build("Dehya", "TheBell")).damageBonus).toBeCloseTo(0.12)
})

it("counts Cloudforged payments from the wearer's real cooldown and equipped four-piece, not teammate bursts", () => {
  const diona = build("Diona", "Cloudforged")
  expect(resolve(diona).elementalMastery).toBe(40)
  expect(resolve(diona, [build("Fischl", "FavoniusWarbow")]).elementalMastery).toBe(40)
  expect(resolve(build("Fischl", "Cloudforged")).elementalMastery).toBe(80)
  const shimenawa = { ...diona, artifacts: raidenNationalBuiltinBuild.artifacts.slice(0, 4)
    .map((artifact) => ({ ...artifact, setId: "ShimenawasReminiscence" })) }
  expect(resolve(shimenawa).elementalMastery).toBe(80)
})

it("uses Calamity's capture presence without promoting its owner to the actual foreground", () => {
  const holder = build("Xiangling", "CalamityQueller")
  const active = build("Tartaglia", "FavoniusWarbow")
  const metadata = { ...getCombatActionDefinition("xiangling.burst.pyronado.reverse_vaporize")!, fieldPresence: "off_field" as const }
  const fieldContext = resolveFieldContext(metadata, holder, [active], active.buildId)
  const result = resolveCombatActionEffects({ action: metadata, primary: holder, teammates: [active],
    fieldContext, activeEffectIds: [], baseEnergyRecharge: 1, gameData: db, enemyCount: 1 })
  expect(result.appliedEffects.filter((effect) => effect.id.includes("calamity-queller.consumption")))
    .toEqual([expect.objectContaining({ value: 0.192 })])
  expect(fieldContext.onFieldBuildId).toBe(active.buildId)
})

it("shares weak-point crit across weapons but never extends arrow-only effects to Ganyu's Bloom", () => {
  const holder = build("Ganyu", "SharpshootersOath")
  const input = { ...raidenNationalBuiltinScenario, primary: holder, teammates: [], externalBuffs: [],
    targetActionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
    conditions: { activeEffectIds: [], enemyCount: 1, arrowHitsWeakPoint: false } }
  const normal = evaluateScenario(input, db)
  const weak = evaluateScenario({ ...input, conditions: { ...input.conditions, arrowHitsWeakPoint: true } }, db)
  expect(weak.rotation.events[0]!.expectedDamage).toBeGreaterThan(normal.rotation.events[0]!.expectedDamage)
  expect(weak.rotation.events[1]!.expectedDamage).toBe(normal.rotation.events[1]!.expectedDamage)
  const favonius = { ...input, primary: build("Ganyu", "FavoniusWarbow") }
  expect(evaluateScenario({ ...favonius, conditions: { ...input.conditions, arrowHitsWeakPoint: true } }, db).rotation.events[0]!.expectedDamage)
    .toBeGreaterThan(evaluateScenario(favonius, db).rotation.events[0]!.expectedDamage)
  const slingshot = { ...input, primary: build("Ganyu", "Slingshot") }
  const late = { ...slingshot, conditions: { ...input.conditions, weaponEffectChoices: {
    [slingshot.primary.buildId]: { "slingshot-flight-time": "after-0.3-seconds" }
  } } }
  const earlyResult = evaluateScenario(slingshot, db)
  const lateResult = evaluateScenario(late, db)
  expect(earlyResult.rotation.events[0]!.expectedDamage).toBeGreaterThan(lateResult.rotation.events[0]!.expectedDamage)
  expect(earlyResult.rotation.events[1]!.expectedDamage).toBe(lateResult.rotation.events[1]!.expectedDamage)
})

it("ranks non-stacking stat conversions by actual value, not refinement", () => {
  const holder = build("Xilonen", "PeakPatrolSong")
  const other = { ...build("Albedo", "PeakPatrolSong"), weapon: { ...holder.weapon, refinement: 5 } }
  const primary = build("Diluc", "FavoniusGreatsword")
  const effects = resolveCombatActionEffects({ action, primary, teammates: [holder, other], gameData: db,
    activeEffectIds: [], baseEnergyRecharge: 1, enemyCount: 1,
    sourceFinalDefenseByBuildId: new Map([[holder.buildId, 3200], [other.buildId, 500]]) })
  expect(effects.appliedEffects.filter((effect) => effect.id.includes("source-final-defense-to-party")))
    .toEqual([expect.objectContaining({ sourceId: holder.buildId, value: 0.256 })])
})

it("consumes Cinnabar after the first skill hit and reapplies only after its authored cooldown", () => {
  const primary = build("Kaeya", "CinnabarSpindle")
  const original = getCombatActionDefinition("kaeya.skill.frostgnaw")!
  const part = original.damageParts![0]!
  const metadata: CombatActionMetadata = { ...original, timeline: { duration: 2, damageEvents: [
    { id: "cooldown-0", at: 0, damagePartId: part.id, snapshot: "hit" },
    { id: "cooldown-1", at: 0.2, damagePartId: part.id, snapshot: "hit" },
    { id: "cooldown-2", at: 1.6, damagePartId: part.id, snapshot: "hit" }
  ] } }
  const result = evaluateDeclaredDirectScenarioAction({ action: metadata, build: primary, gameData: db, buffs: [],
    enemy: { name: "测试木桩", defenseReduction: 0, level: 100, resistance: 0.1 } })
  const [first, consumed, refreshed] = result.rotation.events
  expect(first!.expectedDamage).toBeGreaterThan(consumed!.expectedDamage)
  expect(refreshed!.expectedDamage).toBeCloseTo(first!.expectedDamage)
  const grouped = evaluateDeclaredDirectScenarioAction({ action: { ...metadata, timeline: { duration: 1, damageEvents: [
    { id: "grouped", at: 0, damagePartId: part.id, snapshot: "hit", hitCount: 3 }
  ] } }, build: primary, gameData: db, buffs: [],
    enemy: { name: "测试木桩", defenseReduction: 0, level: 100, resistance: 0.1 } })
  expect(grouped.rotation.events).toHaveLength(2)
  expect(grouped.rotation.dpr).toBeCloseTo(first!.expectedDamage + consumed!.expectedDamage * 2)
  expect(grouped.result.nonCritDamage).toBeCloseTo(grouped.rotation.events.reduce((total, event) => total + event.nonCritDamage, 0))
  expect(grouped.result.critDamage).toBeCloseTo(grouped.rotation.events.reduce((total, event) => total + event.critDamage, 0))
  const mixed = evaluateDeclaredDirectScenarioAction({ action: { ...metadata, timeline: { duration: 2, damageEvents: [
    { id: "special-before", at: 0, damagePartId: part.id, snapshot: "hit",
      specialReaction: { kind: "lunar_crystallize" } },
    { id: "ordinary-after", at: 0.2, damagePartId: part.id, snapshot: "hit" },
    { id: "ordinary-consumed", at: 0.4, damagePartId: part.id, snapshot: "hit" }
  ] } }, build: primary, gameData: db, buffs: [],
    enemy: { name: "测试木桩", defenseReduction: 0, level: 100, resistance: 0.1 } })
  expect(mixed.rotation.events[1]!.expectedDamage).toBeCloseTo(first!.expectedDamage)
  expect(mixed.rotation.events[2]!.expectedDamage).toBeCloseTo(consumed!.expectedDamage)
  const zeroSkipped = evaluateDeclaredDirectScenarioAction({ action: { ...metadata, timeline: { duration: 1, damageEvents: [
    { id: "zero", at: 0, damagePartId: part.id, snapshot: "hit", hitCount: 0 },
    { id: "actual", at: 0.2, damagePartId: part.id, snapshot: "hit" }
  ] } }, build: primary, gameData: db, buffs: [],
    enemy: { name: "测试木桩", defenseReduction: 0, level: 100, resistance: 0.1 } })
  expect(zeroSkipped.rotation.events).toHaveLength(1)
  expect(zeroSkipped.rotation.dpr).toBeCloseTo(first!.expectedDamage)
})
