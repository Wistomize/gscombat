import { getCombatActionDefinition, raidenNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const sturdyBoneEffectId = "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage"
const sturdyBoneTermLabel = "弥坚骨 · 冲刺后的18次普通攻击（7秒内）攻击力同一命中加算"
const chongyunFieldEffectId = "chongyun.skill.chonghuas_frost_field"
const alhaithamNormalActionId = "alhaitham.normal.auto.first_hit"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createSturdyBoneBuild(refinement: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.alhaitham.sturdy-bone.r${refinement}`,
    characterId: "Alhaitham",
    constellation: 0,
    label: `艾尔海森弥坚骨 R${refinement} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId: "SturdyBone" }
  }
}

function createChongyunBuild(): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: "test.chongyun.sturdy-bone-field",
    characterId: "Chongyun",
    constellation: 0,
    label: "重云冰附魔测试配置",
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
  }
}

function evaluateSturdyBoneScenario(
  targetActionId: string,
  build: CharacterBuild,
  activeEffectIds: readonly string[],
  withPyroAura = false
) {
  const scenario: EvaluationScenario = {
    conditions: {
      activeEffectIds: [...activeEffectIds],
      enemyCount: 1,
      ...(withPyroAura
        ? { targetAuraWindows: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }] }
        : {})
    },
    enemy,
    externalBuffs: [
      { label: "测试攻击力", sourceId: "test.attack-percent", stat: "attack_percent", value: 0.2 },
      { label: "测试增伤", sourceId: "test.damage-bonus", stat: "damage_bonus", value: 0.25 },
      { label: "测试暴击率", sourceId: "test.crit-rate", stat: "crit_rate", value: 0.4 },
      { label: "测试暴击伤害", sourceId: "test.crit-damage", stat: "crit_damage", value: 0.2 }
    ],
    gameDataVersion: gameData.getManifest().gameVersion,
    primary: build,
    targetActionId,
    teammates: [createChongyunBuild()]
  }
  return evaluateScenario(scenario, gameData)
}

function requireScalingTerms(evaluation: ReturnType<typeof evaluateScenario>) {
  const event = evaluation.rotation.events[0]
  const scalingTerms = event?.trace.find((entry) => entry.kind === "scaling_terms")
  if (!event || !scalingTerms || scalingTerms.kind !== "scaling_terms") {
    throw new Error("Expected one declared core hit with a scaling-terms trace")
  }
  return { event, scalingTerms }
}

function expectNoSturdyBoneTerm(evaluation: ReturnType<typeof evaluateScenario>): void {
  const scalingTerms = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")
  const sturdyBoneTerms =
    scalingTerms?.kind === "scaling_terms"
      ? scalingTerms.terms.filter((term) => term.label === sturdyBoneTermLabel)
      : []

  expect(sturdyBoneTerms).toEqual([])
  expect(evaluation.appliedEffects.some((effect) => effect.id === sturdyBoneEffectId)).toBe(false)
}

describe("Sturdy Bone declared scenarios", () => {
  it("adds the selected post-sprint normal hit inside the real infusion, Melt, bonus, and crit pipeline", () => {
    /**
     * This active snapshot means the caller has already declared this one core hit to be one of Sturdy Bone's
     * first 18 Normal Attacks in its seven-second window. The one-action evaluator intentionally does not infer
     * sprint timing or consume a hit count.
     */
    const r1Build = createSturdyBoneBuild(1)
    const r5Build = createSturdyBoneBuild(5)
    const inactive = evaluateSturdyBoneScenario(
      alhaithamNormalActionId,
      r1Build,
      [chongyunFieldEffectId],
      true
    )
    const r1 = evaluateSturdyBoneScenario(
      alhaithamNormalActionId,
      r1Build,
      [chongyunFieldEffectId, sturdyBoneEffectId],
      true
    )
    const r5 = evaluateSturdyBoneScenario(
      alhaithamNormalActionId,
      r5Build,
      [chongyunFieldEffectId, sturdyBoneEffectId],
      true
    )
    const { event: r1Event, scalingTerms: r1ScalingTerms } = requireScalingTerms(r1)
    const { event: r5Event, scalingTerms: r5ScalingTerms } = requireScalingTerms(r5)
    const r1Term = r1ScalingTerms.terms.find((term) => term.label === sturdyBoneTermLabel)
    const r5Term = r5ScalingTerms.terms.find((term) => term.label === sturdyBoneTermLabel)
    const r1Melt = r1Event.trace.find((entry) => entry.kind === "amplifying_reaction")
    const r1DamageBonus = r1Event.trace.find((entry) => entry.kind === "damage_bonus")
    const r1ExpectedCrit = r1Event.trace.find((entry) => entry.kind === "expected_crit")

    if (!r1Term || !r5Term || !r1Melt || !r1DamageBonus || !r1ExpectedCrit) {
      throw new Error("Expected Sturdy Bone's term and all shared hit-multiplier trace stages")
    }

    expectNoSturdyBoneTerm(inactive)
    expect(r1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: sturdyBoneEffectId,
          scalingStat: "attack",
          target: "matchedActionAdditiveDamageTerm",
          value: 0.16
        })
      ])
    )
    expect(r5.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: sturdyBoneEffectId,
          scalingStat: "attack",
          target: "matchedActionAdditiveDamageTerm",
          value: 0.32
        })
      ])
    )
    expect(r1Term).toMatchObject({ coefficient: 0.16, stat: "attack" })
    expect(r5Term).toMatchObject({ coefficient: 0.32, stat: "attack" })
    expect(r1Term.contribution).toBeCloseTo(r1.stats.effectiveAttack * 0.16)
    expect(r5Term.contribution).toBeCloseTo(r5.stats.effectiveAttack * 0.32)
    expect(r5Term.contribution).toBeCloseTo(r1Term.contribution * 2)
    expect(r1.rotation.events).toHaveLength(1)
    expect(r5.rotation.events).toHaveLength(1)
    expect(r1.rotation.events.some((event) => event.id.includes("sturdy-bone"))).toBe(false)
    expect(r5.rotation.events.some((event) => event.id.includes("sturdy-bone"))).toBe(false)
    expect(r1Event).toMatchObject({
      element: "cryo",
      elementalApplication: { applied: true, reaction: "melt_reverse" }
    })
    expect(r1Melt.before).toBeCloseTo(r1ScalingTerms.after)
    expect(r1DamageBonus.before).toBeCloseTo(r1Melt.after)
    expect(r1ExpectedCrit.before).toBeCloseTo(r1DamageBonus.after)
    expect(r1.actionExpectedDamage).toBeGreaterThan(inactive.actionExpectedDamage)
    expect(r5.actionExpectedDamage).toBeGreaterThan(r1.actionExpectedDamage)
  })

  it("does not resolve the selected sprint-followup term for an inactive or non-normal action", () => {
    const build = createSturdyBoneBuild(1)
    const inactiveNormal = evaluateSturdyBoneScenario(
      alhaithamNormalActionId,
      build,
      [chongyunFieldEffectId],
      true
    )
    const activeSkill = evaluateSturdyBoneScenario(
      "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
      build,
      [sturdyBoneEffectId]
    )

    expect(requireAction(alhaithamNormalActionId).talentSlot).toBe("normal")
    expect(requireAction("alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread").talentSlot).toBe(
      "skill"
    )
    expectNoSturdyBoneTerm(inactiveNormal)
    expectNoSturdyBoneTerm(activeSkill)
    expect(activeSkill.rotation.events).toHaveLength(1)
    expect(activeSkill.rotation.events.some((event) => event.id.includes("sturdy-bone"))).toBe(false)
  })
})
