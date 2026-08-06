import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateDeclaredDirectScenarioAction,
  type DeclaredDirectScenarioEvaluation
} from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createWeaponBuild(
  characterId: CharacterBuild["characterId"],
  weaponId: CharacterBuild["weapon"]["weaponId"],
  refinement: number
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.same-hit.${characterId}.${weaponId}.r${refinement}`,
    characterId,
    constellation: 0,
    label: `${characterId} ${weaponId} R${refinement} same-hit fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId }
  }
}

function createArtifactSetBuild(characterId: CharacterBuild["characterId"], setId: string): CharacterBuild {
  const build = createWeaponBuild(characterId, "FavoniusWarbow", 1)
  return {
    ...build,
    artifacts: build.artifacts.map((artifact) => ({ ...artifact, setId })),
    buildId: `test.same-hit.${characterId}.${setId}`
  }
}

function requireScalingTerms(evaluation: DeclaredDirectScenarioEvaluation) {
  const scalingTerms = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")
  if (!scalingTerms || scalingTerms.kind !== "scaling_terms") {
    throw new Error("Expected the target hit to expose scaling terms")
  }
  return scalingTerms
}

function requireSameHitTerm(evaluation: DeclaredDirectScenarioEvaluation, label: string) {
  const scalingTerms = requireScalingTerms(evaluation)
  const term = scalingTerms.terms.find((candidate) => candidate.label === label)
  if (!term) throw new Error(`Expected same-hit term: ${label}`)
  return { scalingTerms, term }
}

function expectNoSameHitTerm(evaluation: DeclaredDirectScenarioEvaluation, label: string): void {
  const scalingTerms = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")
  const hasTerm =
    scalingTerms?.kind === "scaling_terms" && scalingTerms.terms.some((term) => term.label === label)

  expect(hasTerm).toBe(false)
}

describe("same-hit weapon additive terms", () => {
  it("keeps Echoes of an Offering's selected Valley Rite on its triggering normal hit", () => {
    const termId = "artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"
    const termLabel = "来歆余响 · 四件套（本次普通攻击触发幽谷祝祀）"
    const normalAction = requireAction("tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit")
    const skillAction = requireAction("tartaglia.skill.foul_legacy_raging_tide.stance_activation")
    const build = createArtifactSetBuild("Tartaglia", "EchoesOfAnOffering")
    const inactive = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      build,
      buffs: [],
      enemy,
      gameData
    })
    const active = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [termId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const wrongAction = evaluateDeclaredDirectScenarioAction({
      action: skillAction,
      activeEffectIds: [termId],
      build,
      buffs: [],
      enemy,
      gameData
    })
    const activeTerm = requireSameHitTerm(active, termLabel)

    expectNoSameHitTerm(inactive, termLabel)
    expectNoSameHitTerm(wrongAction, termLabel)
    expect(active.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: termId,
          scalingStat: "attack",
          target: "matchedActionAdditiveDamageTerm",
          value: 0.7
        })
      ])
    )
    expect(activeTerm.term).toMatchObject({ coefficient: 0.7, stat: "attack" })
    expect(active.rotation.events).toHaveLength(1)
    expect(active.rotation.events.some((event) => event.id.includes("echoes-of-an-offering"))).toBe(false)
    expect(active.rotation.dpr).toBeGreaterThan(inactive.rotation.dpr)
  })

  it("activates Hunter's Path only for a charged hit, scales with refinement, and precedes Tighnari's Spread", () => {
    const termId = "weapon.hunters-path.tireless-hunt.charged-em-additive-damage"
    const termLabel = "猎人之径 · 无休止的狩猎重击元素精通同一命中加算"
    const chargedAction = requireAction("tighnari.normal.wreath_arrow.single_hit.spread")
    const skillAction = requireAction("tighnari.skill.vijnana_phala_mine.initial_hit")
    const r1Build = createWeaponBuild("Tighnari", "HuntersPath", 1)
    const r5Build = createWeaponBuild("Tighnari", "HuntersPath", 5)
    const inactive = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const r1 = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      activeEffectIds: [termId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const r5 = evaluateDeclaredDirectScenarioAction({
      action: chargedAction,
      activeEffectIds: [termId],
      build: r5Build,
      buffs: [],
      enemy,
      gameData
    })
    const wrongAction = evaluateDeclaredDirectScenarioAction({
      action: skillAction,
      activeEffectIds: [termId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const r1Term = requireSameHitTerm(r1, termLabel)
    const r5Term = requireSameHitTerm(r5, termLabel)
    const spreadIndex = r1.rotation.events[0]?.trace.findIndex((entry) => entry.kind === "additive_reaction")
    const scalingIndex = r1.rotation.events[0]?.trace.findIndex((entry) => entry.kind === "scaling_terms")

    expectNoSameHitTerm(inactive, termLabel)
    expectNoSameHitTerm(wrongAction, termLabel)
    expect(r1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: termId, scalingStat: "elementalMastery", target: "matchedActionAdditiveDamageTerm", value: 1.6 })
      ])
    )
    expect(r1Term.term).toMatchObject({ coefficient: 1.6, stat: "elementalMastery" })
    expect(r5Term.term).toMatchObject({ coefficient: 3.2, stat: "elementalMastery" })
    expect(r5Term.term.contribution).toBeCloseTo(r1Term.term.contribution * 2)
    expect(r1.rotation.events).toHaveLength(1)
    expect(r5.rotation.events).toHaveLength(1)
    expect(r1.rotation.events[0]?.id).toBe(inactive.rotation.events[0]?.id)
    expect(r1.rotation.events.some((event) => event.id.includes("hunters-path"))).toBe(false)
    expect(scalingIndex).toBeGreaterThanOrEqual(0)
    expect(spreadIndex).toBeGreaterThan(scalingIndex ?? -1)
    expect(r5.rotation.dpr).toBeGreaterThan(r1.rotation.dpr)
  })

  it("keeps Light of Foliar Incision's normal and skill activations separate while keeping each term on its hit", () => {
    const normalTermId = "weapon.light-of-foliar-incision.foliar-incisiveness.normal-em-additive-damage"
    const normalTermLabel = "裁叶萃光 · 白月枝芒普通攻击元素精通同一命中加算"
    const skillTermId = "weapon.light-of-foliar-incision.foliar-incisiveness.skill-em-additive-damage"
    const skillTermLabel = "裁叶萃光 · 白月枝芒元素战技元素精通同一命中加算"
    const normalAction = requireAction("alhaitham.normal.auto.first_hit")
    const skillAction = requireAction(
      "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread"
    )
    const r1Build = createWeaponBuild("Alhaitham", "LightOfFoliarIncision", 1)
    const r5Build = createWeaponBuild("Alhaitham", "LightOfFoliarIncision", 5)
    const normalR1 = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [normalTermId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const normalR5 = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [normalTermId],
      build: r5Build,
      buffs: [],
      enemy,
      gameData
    })
    const normalWrongActivation = evaluateDeclaredDirectScenarioAction({
      action: normalAction,
      activeEffectIds: [skillTermId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const skillR1 = evaluateDeclaredDirectScenarioAction({
      action: skillAction,
      activeEffectIds: [skillTermId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const skillWrongActivation = evaluateDeclaredDirectScenarioAction({
      action: skillAction,
      activeEffectIds: [normalTermId],
      build: r1Build,
      buffs: [],
      enemy,
      gameData
    })
    const normalR1Term = requireSameHitTerm(normalR1, normalTermLabel)
    const normalR5Term = requireSameHitTerm(normalR5, normalTermLabel)
    const skillR1Term = requireSameHitTerm(skillR1, skillTermLabel)
    const skillSpreadIndex = skillR1.rotation.events[0]?.trace.findIndex((entry) => entry.kind === "additive_reaction")
    const skillScalingIndex = skillR1.rotation.events[0]?.trace.findIndex((entry) => entry.kind === "scaling_terms")

    expectNoSameHitTerm(normalWrongActivation, normalTermLabel)
    expectNoSameHitTerm(skillWrongActivation, skillTermLabel)
    expect(normalR1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: normalTermId,
          scalingStat: "elementalMastery",
          target: "matchedActionAdditiveDamageTerm",
          value: 1.2
        })
      ])
    )
    expect(skillR1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: skillTermId,
          scalingStat: "elementalMastery",
          target: "matchedActionAdditiveDamageTerm",
          value: 1.2
        })
      ])
    )
    expect(normalR1Term.term).toMatchObject({ coefficient: 1.2, stat: "elementalMastery" })
    expect(normalR5Term.term).toMatchObject({ coefficient: 2.4, stat: "elementalMastery" })
    expect(skillR1Term.term).toMatchObject({ coefficient: 1.2, stat: "elementalMastery" })
    expect(normalR5Term.term.contribution).toBeCloseTo(normalR1Term.term.contribution * 2)
    expect(normalR1.rotation.events).toHaveLength(1)
    expect(skillR1.rotation.events).toHaveLength(1)
    expect(normalR1.rotation.events.some((event) => event.id.includes("light-of-foliar-incision"))).toBe(false)
    expect(skillR1.rotation.events.some((event) => event.id.includes("light-of-foliar-incision"))).toBe(false)
    expect(skillScalingIndex).toBeGreaterThanOrEqual(0)
    expect(skillSpreadIndex).toBeGreaterThan(skillScalingIndex ?? -1)
  })

  it("adds Everlasting Moonglow's refinement-indexed HP term to Kokomi's normal hit without a separate event", () => {
    const termId = "weapon.everlasting-moonglow.normal-hp-additive-damage"
    const termLabel = "不灭月华 · 普通攻击生命值同一命中加算"
    const action = requireAction("sangonomiya_kokomi.normal.auto.first_hit")
    const r1Build = createWeaponBuild("SangonomiyaKokomi", "EverlastingMoonglow", 1)
    const r5Build = createWeaponBuild("SangonomiyaKokomi", "EverlastingMoonglow", 5)
    const r1 = evaluateDeclaredDirectScenarioAction({ action, build: r1Build, buffs: [], enemy, gameData })
    const r5 = evaluateDeclaredDirectScenarioAction({ action, build: r5Build, buffs: [], enemy, gameData })
    const r1Term = requireSameHitTerm(r1, termLabel)
    const r5Term = requireSameHitTerm(r5, termLabel)

    expect(r1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: termId, scalingStat: "hp", target: "matchedActionAdditiveDamageTerm", value: 0.01 })
      ])
    )
    expect(r1Term.term).toMatchObject({ coefficient: 0.01, stat: "hp" })
    expect(r5Term.term).toMatchObject({ coefficient: 0.03, stat: "hp" })
    expect(r5Term.term.contribution).toBeCloseTo(r1Term.term.contribution * 3)
    expect(r1.rotation.events).toHaveLength(1)
    expect(r5.rotation.events).toHaveLength(1)
    expect(r1.rotation.events.some((event) => event.id.includes("everlasting-moonglow"))).toBe(false)
    expect(r5.rotation.dpr).toBeGreaterThan(r1.rotation.dpr)
  })
})
