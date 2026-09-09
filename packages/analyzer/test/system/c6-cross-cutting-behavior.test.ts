import { getCombatAction, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../src/scenario/evaluate.js"
import { resolveAdditionalDamageEventEffects } from "../../src/effects/action-effects.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

const ayatoC6EffectIds = [
  "kamisato_ayato.constellation.6.boundless_origin.first_extra_shunsuiken_strike",
  "kamisato_ayato.constellation.6.boundless_origin.second_extra_shunsuiken_strike"
]
const ineffaC1EffectId = "ineffa.constellation.1.lunar_charged_damage_bonus"
const jahodaC6EffectIds = [
  "jahoda.constellation.6.full_flask.moonsign_recipient.crit_rate",
  "jahoda.constellation.6.full_flask.moonsign_recipient.crit_damage"
]

afterAll(() => gameData.close())

function createBuild(
  characterId:
    | "Aino"
    | "Ineffa"
    | "Jahoda"
    | "KamisatoAyato"
    | "Nefer"
    | "Nicole"
    | "Ororon"
    | "Tighnari"
    | "Xiangling",
  constellation: number,
  index: number
): CharacterBuild {
  const weaponIdByCharacter = {
    Aino: "FavoniusGreatsword",
    Ineffa: "FavoniusLance",
    Jahoda: "FavoniusWarbow",
    KamisatoAyato: "FavoniusSword",
    Nefer: "FavoniusCodex",
    Nicole: "FavoniusSword",
    Ororon: "FavoniusWarbow",
    Tighnari: "FavoniusWarbow",
    Xiangling: "FavoniusLance"
  } as const
  return {
    ...raidenNationalBuiltinBuild,
    artifacts: [...raidenNationalBuiltinBuild.artifacts].map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.system.c6.${characterId.toLowerCase()}.${constellation}.${index}`,
    characterId,
    constellation,
    label: `${characterId} C${constellation} cross-cutting fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: weaponIdByCharacter[characterId] }
  }
}

function createScenario(
  primary: CharacterBuild,
  targetActionId: string,
  teammates: CharacterBuild[] = []
): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates
  }
}

describe("cross-cutting C6 behavior", () => {
  it("lets a typed character event inherit its own attack category without changing untyped procs", () => {
    const effectId = "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus"
    const action = getCombatAction("kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit")
    expect(action).toBeDefined()
    if (!action) throw new Error("Missing Ayato Shunsuiken action fixture")

    const primary = {
      ...createBuild("KamisatoAyato", 6, 0),
      artifacts: createBuild("KamisatoAyato", 6, 0).artifacts.map((artifact) => ({
        ...artifact,
        setId: "ShimenawasReminiscence"
      }))
    }
    const sharedInput = {
      action,
      activeEffectIds: [effectId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary,
      primaryElement: "hydro" as const,
      teammates: []
    }
    const event = {
      canCrit: true,
      coefficient: 1,
      element: "hydro" as const,
      expectedTriggerProbability: 1,
      id: "test.character.c6.typed-event",
      label: "typed character event",
      reactionPolicy: "none" as const,
      scalingStat: "attack" as const,
      sourceId: primary.buildId
    }
    const typed = resolveAdditionalDamageEventEffects({
      ...sharedInput,
      additionalDamageEvent: { ...event, attackKind: "normal", talentSlot: "normal" }
    })
    const untyped = resolveAdditionalDamageEventEffects({ ...sharedInput, additionalDamageEvent: event })

    expect(typed.damageBonus).toBeCloseTo(0.5)
    expect(typed.appliedEffects.map((effect) => effect.id)).toContain(effectId)
    expect(untyped.damageBonus).toBe(0)
    expect(untyped.appliedEffects.map((effect) => effect.id)).not.toContain(effectId)
  })

  it("does not leak an undeclared attack kind from the triggering action into a typed event", () => {
    const effectId = "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus"
    const action = getCombatAction("tighnari.normal.wreath_arrow.single_hit.spread")
    expect(action).toBeDefined()
    if (!action) throw new Error("Missing Tighnari charged attack action fixture")

    const baseBuild = createBuild("Tighnari", 6, 0)
    const primary = {
      ...baseBuild,
      artifacts: baseBuild.artifacts.map((artifact) => ({ ...artifact, setId: "ShimenawasReminiscence" }))
    }
    const resolved = resolveAdditionalDamageEventEffects({
      action,
      activeEffectIds: [effectId],
      additionalDamageEvent: {
        canCrit: true,
        coefficient: 1,
        element: "cryo",
        expectedTriggerProbability: 1,
        id: "test.character.c6.skill-event",
        label: "typed skill event",
        reactionPolicy: "none",
        scalingStat: "attack",
        sourceId: primary.buildId,
        talentSlot: "skill"
      },
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary,
      primaryElement: "dendro",
      teammates: []
    })

    expect(resolved.damageBonus).toBe(0)
    expect(resolved.appliedEffects.map((effect) => effect.id)).not.toContain(effectId)
  })

  it("gates an automatic Normal-Attack additional event from C5 to C6", () => {
    const actionId = "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"
    const c2EffectId = "kamisato_ayato.constellation.2.world_source.namisen_three_stacks.hp_percent"
    const c1InvalidScenario = createScenario(createBuild("KamisatoAyato", 1, 0), actionId)
    const c2 = evaluateScenario(createScenario(createBuild("KamisatoAyato", 2, 0), actionId), gameData)
    const c5 = evaluateScenario(createScenario(createBuild("KamisatoAyato", 5, 0), actionId), gameData)
    const c6Scenario = createScenario(createBuild("KamisatoAyato", 6, 0), actionId)
    const c6 = evaluateScenario(c6Scenario, gameData)
    const c6WithC2 = evaluateScenario(
      {
        ...c6Scenario,
        conditions: {
          ...c6Scenario.conditions,
          actionParameters: { "namisen-stack-count": 5 },
          activeEffectIds: [c2EffectId]
        }
      },
      gameData
    )

    expect(() =>
      evaluateScenario(
        {
          ...c1InvalidScenario,
          conditions: { ...c1InvalidScenario.conditions, actionParameters: { "namisen-stack-count": 5 } }
        },
        gameData
      )
    ).toThrow()
    expect(c2.stats.actionParameters).toEqual({ "namisen-stack-count": 5 })

    expect(c5.appliedEffects.map((effect) => effect.id)).not.toEqual(expect.arrayContaining(ayatoC6EffectIds))
    expect(c6.appliedEffects.map((effect) => effect.id)).toEqual(expect.arrayContaining(ayatoC6EffectIds))
    expect(c6.actionExpectedDamage).toBeGreaterThan(c5.actionExpectedDamage)
    expect(c6WithC2.stats.effectiveHp - c6.stats.effectiveHp).toBeCloseTo(c6.stats.baseHp * 0.5)
    for (const effectId of ayatoC6EffectIds) {
      const baseEvent = c6.rotation.events.find((event) => event.id.includes(effectId))
      const c2Event = c6WithC2.rotation.events.find((event) => event.id.includes(effectId))
      expect(c2Event?.expectedDamage).toBeCloseTo(baseEvent?.expectedDamage ?? 0)
    }
  })

  it("retains Nicole C1 and Ororon C1-C2 when evaluating C6 sources", () => {
    const nicoleC1EffectId =
      "nicole.constellation.1.foreseen_destiny.arcane_projection.active_character_attack_addition"
    const xiangling = createBuild("Xiangling", 0, 0)
    const xianglingActionId = "xiangling.skill.guoba.single_flame_breath"
    const nicoleC0 = evaluateScenario(
      createScenario(xiangling, xianglingActionId, [createBuild("Nicole", 0, 1)]),
      gameData
    )
    const nicoleC1 = evaluateScenario(
      createScenario(xiangling, xianglingActionId, [createBuild("Nicole", 1, 1)]),
      gameData
    )
    const nicoleC6 = evaluateScenario(
      createScenario(xiangling, xianglingActionId, [createBuild("Nicole", 6, 1)]),
      gameData
    )
    const findNicoleC1Event = (evaluation: typeof nicoleC0) =>
      evaluation.rotation.events.find((event) => event.id.includes(nicoleC1EffectId))
    const c1Event = findNicoleC1Event(nicoleC1)
    const c1Scaling = c1Event?.trace.find((entry) => entry.kind === "scaling")
    const baseProjectionEvent = nicoleC1.rotation.events.find((event) =>
      event.id.includes("nicole.burst.pilgrimage_of_the_heavenly_path.arcane_projection.coordinated_damage")
    )
    const baseProjectionScaling = baseProjectionEvent?.trace.find((entry) => entry.kind === "scaling")
    const baseProjectionCoefficient = gameData.getCharacterSkillParameter("Nicole", "burst", 1, 10)

    expect(findNicoleC1Event(nicoleC0)).toBeUndefined()
    expect(c1Event?.expectedDamage).toBeGreaterThan(0)
    expect(baseProjectionCoefficient).toBeDefined()
    expect((c1Scaling?.after ?? 0) / (baseProjectionScaling?.after ?? 1)).toBeCloseTo(
      6 / (baseProjectionCoefficient ?? 1)
    )
    expect(findNicoleC1Event(nicoleC6)?.expectedDamage).toBeGreaterThan(0)

    const ororonActionId = "ororon.passive.nightshade_synesthesia.super_sensory_thunderbolt"
    const ororonC1EffectId =
      "ororon.constellation.1.trails_amidst_forest_fog.nighttide.hypersense.damage_bonus"
    const ororonC0 = evaluateScenario(createScenario(createBuild("Ororon", 0, 0), ororonActionId), gameData)
    const ororonC2OneEnemy = evaluateScenario(
      createScenario(createBuild("Ororon", 2, 0), ororonActionId),
      gameData
    )
    const fourEnemyScenario = createScenario(createBuild("Ororon", 2, 0), ororonActionId)
    const ororonC2FourEnemies = evaluateScenario(
      { ...fourEnemyScenario, conditions: { ...fourEnemyScenario.conditions, enemyCount: 4 } },
      gameData
    )
    const ororonC6Scenario = createScenario(createBuild("Ororon", 6, 0), ororonActionId)
    const ororonC6 = evaluateScenario(
      {
        ...ororonC6Scenario,
        conditions: { ...ororonC6Scenario.conditions, activeEffectIds: [ororonC1EffectId], enemyCount: 4 }
      },
      gameData
    )
    const ororonBurstActionId = "ororon.burst.dark_voices_echo.activation_hit"
    const ororonC6BurstEffectId = "ororon.constellation.6.deepest_depths.praise.burst_super_sensory_thunderbolt"
    const ororonC6BurstScenario = createScenario(createBuild("Ororon", 6, 0), ororonBurstActionId)
    const ororonC6Burst = evaluateScenario(
      {
        ...ororonC6BurstScenario,
        conditions: {
          ...ororonC6BurstScenario.conditions,
          activeEffectIds: [ororonC1EffectId],
          enemyCount: 4
        }
      },
      gameData
    )
    const ororonC6BurstBaseEvent = ororonC6Burst.rotation.events.find(
      (event) => !event.id.includes(ororonC6BurstEffectId)
    )
    const ororonC6HypersenseEvent = ororonC6Burst.rotation.events.find((event) =>
      event.id.includes(ororonC6BurstEffectId)
    )

    expect(ororonC2OneEnemy.stats.damageBonus - ororonC0.stats.damageBonus).toBeCloseTo(0.16)
    expect(ororonC2FourEnemies.stats.damageBonus - ororonC0.stats.damageBonus).toBeCloseTo(0.4)
    expect(ororonC6.stats.damageBonus - ororonC0.stats.damageBonus).toBeCloseTo(0.9)
    expect(ororonC6.appliedEffects.map((effect) => effect.id)).toContain(ororonC1EffectId)
    expect(ororonC6BurstBaseEvent?.appliedEffectIds).not.toContain(ororonC1EffectId)
    expect(ororonC6HypersenseEvent?.appliedEffectIds).toContain(ororonC1EffectId)
  })

  it("keeps Nefer C1 inside the shade hit and replaces only the C6 second self-hit", () => {
    const actionId = "nefer.skill.senet_strategy.phantom_performance.second_hit"
    const evaluate = (constellation: number) =>
      evaluateScenario(createScenario(createBuild("Nefer", constellation, 0), actionId), gameData)
    const c0 = evaluate(0)
    const c1 = evaluate(1)
    const c5 = evaluate(5)
    const c6 = evaluate(6)
    const findEvent = (evaluation: typeof c0, eventId: string) =>
      evaluation.rotation.events.find((event) => event.id.endsWith(eventId))

    expect(findEvent(c1, "phantom-performance-shade-third-hit")?.expectedDamage).toBeGreaterThan(
      findEvent(c0, "phantom-performance-shade-third-hit")?.expectedDamage ?? Number.POSITIVE_INFINITY
    )
    expect(findEvent(c5, "phantom-performance-self-second-hit")).toBeDefined()
    expect(findEvent(c5, "phantom-performance-c6-self-second-hit")).toBeUndefined()
    expect(findEvent(c6, "phantom-performance-self-second-hit")).toBeUndefined()
    expect(findEvent(c6, "phantom-performance-c6-self-second-hit")).toBeDefined()
    expect(findEvent(c6, "phantom-performance-c6-ending-hit")).toBeDefined()
  })

  it("gates Ineffa's C6 Lunar-Charged finite event and retains her C1 reaction bonus", () => {
    const actionId = "ineffa.constellation.6.a_dawning_morn_for_you.additional_lunar_charged"
    const c5 = evaluateScenario(createScenario(createBuild("Ineffa", 5, 0), actionId), gameData)
    const c6 = evaluateScenario(createScenario(createBuild("Ineffa", 6, 0), actionId), gameData)

    expect(c5.actionExpectedDamage).toBe(0)
    expect(c6.actionExpectedDamage).toBeGreaterThan(0)
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: ineffaC1EffectId, target: "specialReactionDamageBonus" })])
    )
  })

  it("applies Jahoda C6's full-Moonsign double crit only to a Moonsign recipient", () => {
    const moonsignActionId = "aino.normal.auto.first_hit"
    const moonsignC5 = evaluateScenario(
      createScenario(createBuild("Aino", 0, 0), moonsignActionId, [
        createBuild("Jahoda", 5, 1),
        createBuild("Xiangling", 0, 2)
      ]),
      gameData
    )
    const moonsignC6 = evaluateScenario(
      createScenario(createBuild("Aino", 0, 0), moonsignActionId, [
        createBuild("Jahoda", 6, 1),
        createBuild("Xiangling", 0, 2)
      ]),
      gameData
    )
    const ordinaryC6 = evaluateScenario(
      createScenario(createBuild("Xiangling", 0, 0), "xiangling.skill.guoba.single_flame_breath", [
        createBuild("Jahoda", 6, 1),
        createBuild("Aino", 0, 2)
      ]),
      gameData
    )

    expect(moonsignC6.teamState.moonsign.level).toBe("ascendant_gleam")
    expect(moonsignC6.stats.critRate - moonsignC5.stats.critRate).toBeCloseTo(0.05)
    expect(moonsignC6.stats.critDamage - moonsignC5.stats.critDamage).toBeCloseTo(0.4)
    expect(moonsignC6.appliedEffects.map((effect) => effect.id)).toEqual(expect.arrayContaining(jahodaC6EffectIds))
    expect(ordinaryC6.teamState.moonsign.level).toBe("ascendant_gleam")
    expect(ordinaryC6.appliedEffects.map((effect) => effect.id)).not.toEqual(expect.arrayContaining(jahodaC6EffectIds))
  })
})
