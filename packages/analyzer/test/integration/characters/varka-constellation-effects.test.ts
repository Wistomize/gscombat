import {
  getCombatActionDefinition,
  listActiveCombatActionEffectOptionsForAction,
  xianglingNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const fourWindsAnemoActionId = "varka.skill.four_winds_ascension.anemo_damage"
const fourWindsHydroActionId = "varka.skill.four_winds_ascension.corresponding_hydro_damage"
const fourWindsPyroActionId = "varka.skill.four_winds_ascension.corresponding_pyro_damage"
const azureAnemoActionId = "varka.skill.azure_devour.anemo_damage"
const c2EffectId = "varka.constellation.2.journey_at_dawn.additional_anemo_strike.damage"
const c4TriggerEffectId = "varka.constellation.4.song_of_freedom.swirl_triggered.anemo_damage_bonus"
const c4HydroEffectId = "varka.constellation.4.song_of_freedom.hydro_swirl.anemo_and_hydro_damage_bonus"
const c6EffectId = "varka.constellation.6.mondstadt_steadfast.four_azure_fang_stacks.crit_damage"
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(
  characterId: CharacterBuild["characterId"],
  buildId: string,
  weaponId: string,
  constellation = 0,
  ascension = 6
): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    ascension,
    buildId,
    characterId,
    constellation,
    label: `${characterId} 法尔伽集成测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function createVarkaBuild(constellation: number, ascension = 6): CharacterBuild {
  return createBuild("Varka", `test.varka.c${constellation}.a${ascension}`, "FavoniusGreatsword", constellation, ascension)
}

function createTeammate(characterId: CharacterBuild["characterId"], index: number): CharacterBuild {
  const weaponId =
    characterId === "Venti" ? "FavoniusWarbow" : characterId === "Xiangling" ? "FavoniusLance" : "FavoniusSword"
  return createBuild(characterId, `test.varka.teammate.${characterId}.${index}`, weaponId)
}

function createScenario(
  constellation: number,
  actionId: string,
  teammates: CharacterBuild[],
  activeEffectIds: string[] = [],
  actionParameters?: Readonly<Record<string, number>>,
  ascension = 6,
  maximumReachable = true
): EvaluationScenario {
  return {
    conditions: {
      activeEffectIds,
      ...(actionParameters === undefined ? {} : { actionParameters }),
      enemyCount: 1,
      ...(maximumReachable ? { equipmentEffectMode: "maximum_reachable" as const } : {})
    },
    enemy: { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 },
    externalBuffs: [],
    gameDataVersion: "7.0",
    primary: createVarkaBuild(constellation, ascension),
    targetActionId: actionId,
    teammates
  }
}

function requireFirstScalingCoefficient(evaluation: ReturnType<typeof evaluateScenario>): number {
  const scaling = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")
  if (!scaling || scaling.kind !== "scaling_terms") throw new Error("Expected Varka's main hit scaling terms")
  const attackTerm = scaling.terms.find((term) => term.stat === "attack")
  if (!attackTerm) throw new Error("Expected Varka's main Attack scaling term")
  return attackTerm.coefficient
}

function requireAdditionalEvent(evaluation: ReturnType<typeof evaluateScenario>) {
  const event = evaluation.rotation.events.find((candidate) => candidate.id.endsWith(c2EffectId))
  if (!event) throw new Error("Expected Varka C2's independent additional Anemo hit")
  return event
}

function requireDamageBonus(evaluation: ReturnType<typeof evaluateScenario>, eventIndex: number): number {
  const damageBonus = evaluation.rotation.events[eventIndex]?.trace.find((entry) => entry.kind === "damage_bonus")
  if (!damageBonus || damageBonus.kind !== "damage_bonus") throw new Error("Expected a damage-bonus trace stage")
  return damageBonus.bonus
}

describe("Varka special actions and cumulative constellation effects", () => {
  it("evaluates its party-derived special actions and cumulative constellation effects", () => {
    {
      const venti = createTeammate("Venti", 0)
      const bennett = createTeammate("Bennett", 1)
      const xiangling = createTeammate("Xiangling", 2)
      const furina = createTeammate("Furina", 3)
      const xingqiu = createTeammate("Xingqiu", 4)

      const noPhec = evaluateScenario(createScenario(0, fourWindsAnemoActionId, [venti]), gameData)
      const ascensionZeroOnePyro = evaluateScenario(
        createScenario(0, fourWindsAnemoActionId, [bennett], [], undefined, 0),
        gameData
      )
      const ascensionZeroTwoPyro = evaluateScenario(
        createScenario(0, fourWindsAnemoActionId, [bennett, xiangling], [], undefined, 0),
        gameData
      )
      const onePyro = evaluateScenario(createScenario(0, fourWindsAnemoActionId, [bennett]), gameData)
      const twoPyro = evaluateScenario(createScenario(0, fourWindsAnemoActionId, [bennett, xiangling]), gameData)
      const twoAnemo = evaluateScenario(createScenario(0, fourWindsAnemoActionId, [venti, bennett]), gameData)
      const bothFormations = evaluateScenario(
        createScenario(0, fourWindsAnemoActionId, [venti, bennett, xiangling]),
        gameData
      )

      expect(requireFirstScalingCoefficient(noPhec)).toBe(0)
      expect(requireFirstScalingCoefficient(ascensionZeroOnePyro)).toBeCloseTo(1.70352)
      expect(requireFirstScalingCoefficient(ascensionZeroTwoPyro)).toBeCloseTo(1.70352)
      expect(ascensionZeroOnePyro.appliedEffects.map((effect) => effect.id)).not.toContain(
        "varka.passive.dawn_winds_march.anemo_damage_bonus"
      )
      expect(requireFirstScalingCoefficient(onePyro)).toBeCloseTo(1.70352)
      expect(requireFirstScalingCoefficient(twoPyro)).toBeCloseTo(1.70352 * 1.4)
      expect(requireFirstScalingCoefficient(twoAnemo)).toBeCloseTo(1.70352 * 1.4)
      expect(requireFirstScalingCoefficient(bothFormations)).toBeCloseTo(1.70352 * 2.2)

      const pyroPriority = [bennett, furina, xingqiu]
      const pyroComponent = evaluateScenario(createScenario(0, fourWindsPyroActionId, pyroPriority), gameData)
      const impossibleHydroComponent = evaluateScenario(
        createScenario(0, fourWindsHydroActionId, pyroPriority),
        gameData
      )
      expect(requireFirstScalingCoefficient(pyroComponent)).toBeCloseTo(3.16368)
      expect(requireFirstScalingCoefficient(impossibleHydroComponent)).toBe(0)

      expect(() =>
        evaluateScenario(
          createScenario(0, fourWindsAnemoActionId, [bennett], [], { "derived-phec-party-state": 1 }),
          gameData
        )
      ).toThrow("must be an allowed integer")
    }

    {
      const azure = requireAction(azureAnemoActionId)
      expect(azure.attackKind).toBe("charged")
      expect(azure.talentSlot).toBe("normal")
      expect(azure.parameterReferences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ groupId: "skill", parameterIndex: 16, talentSlot: "skill" })
        ])
      )
    }

    {
      const bennett = createTeammate("Bennett", 0)
      const c0 = evaluateScenario(createScenario(0, fourWindsAnemoActionId, [bennett]), gameData)
      const c1 = evaluateScenario(createScenario(1, fourWindsAnemoActionId, [bennett]), gameData)
      const c2 = evaluateScenario(createScenario(2, fourWindsAnemoActionId, [bennett]), gameData)
      const c2WithoutMaximumMode = evaluateScenario(
        createScenario(2, fourWindsAnemoActionId, [bennett], [], undefined, 6, false),
        gameData
      )

      expect(c1.actionExpectedDamage).toBeCloseTo(c0.actionExpectedDamage * 2)
      expect(c1.appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "varka.passive.winds_vanguard.four_stacks.damage_bonus",
            target: "damageBonus",
            value: 0.3
          }),
          expect.objectContaining({
            id: "varka.passive.dawn_winds_march.anemo_damage_bonus",
            target: "damageBonus",
            value: expect.closeTo(Math.min(c1.stats.effectiveAttack * 0.0001, 0.25), 10)
          })
        ])
      )
      expect(c1.rotation.events).toHaveLength(1)
      expect(c2.rotation.events).toHaveLength(2)
      expect(c2WithoutMaximumMode.rotation.events).toHaveLength(2)
      expect(c2WithoutMaximumMode.appliedEffects.map((effect) => effect.id)).toEqual(
        expect.arrayContaining(["varka.passive.dawn_winds_march.anemo_damage_bonus", c2EffectId])
      )
      expect(c2WithoutMaximumMode.appliedEffects.map((effect) => effect.id)).not.toContain(
        "varka.passive.winds_vanguard.four_stacks.damage_bonus"
      )
      expect(c2.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: c2EffectId, target: "additionalDamageEvent", value: 8 })])
      )

      const c2Event = requireAdditionalEvent(c2)
      expect(c2Event).toMatchObject({ element: "anemo", hitCount: 1 })
      expect(c2Event.trace[0]).toMatchObject({ coefficient: 8, kind: "scaling", stat: "attack" })
      expect(requireDamageBonus(c2, 0) - requireDamageBonus(c2, 1)).toBeCloseTo(0.3)
    }

    {
      const bennett = createTeammate("Bennett", 0)
      const c2 = evaluateScenario(createScenario(2, fourWindsAnemoActionId, [bennett]), gameData)
      const c3 = evaluateScenario(createScenario(3, fourWindsAnemoActionId, [bennett]), gameData)
      const c4 = evaluateScenario(createScenario(4, fourWindsAnemoActionId, [bennett]), gameData)
      const c5 = evaluateScenario(createScenario(5, fourWindsAnemoActionId, [bennett]), gameData)
      const c6 = evaluateScenario(createScenario(6, fourWindsAnemoActionId, [bennett]), gameData)

      expect(requireFirstScalingCoefficient(c3)).toBeGreaterThan(requireFirstScalingCoefficient(c2))
      expect(requireAdditionalEvent(c2).trace[0]).toMatchObject({ coefficient: 8 })
      expect(requireAdditionalEvent(c3).trace[0]).toMatchObject({ coefficient: 8 })
      expect(c3.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ target: "talentLevel", value: 3 })])
      )
      expect(c5.actionExpectedDamage).toBeCloseTo(c4.actionExpectedDamage)
      expect(c6.stats.critDamage - c5.stats.critDamage).toBeCloseTo(0.8)
      expect(c6.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: c6EffectId, target: "critDamage", value: 0.8 })])
      )
      expect(c6.rotation.events[0]!.expectedDamage).toBeGreaterThan(c5.rotation.events[0]!.expectedDamage)
      expect(requireAdditionalEvent(c6).expectedDamage).toBeGreaterThan(requireAdditionalEvent(c5).expectedDamage)
    }

    {
      const bennett = createTeammate("Bennett", 0)
      const anemoAction = requireAction(fourWindsAnemoActionId)
      const pyroAction = requireAction(fourWindsPyroActionId)

      expect(listActiveCombatActionEffectOptionsForAction(anemoAction).map((option) => option.id)).toContain(
        c4TriggerEffectId
      )
      expect(listActiveCombatActionEffectOptionsForAction(pyroAction).map((option) => option.id)).toContain(
        c4TriggerEffectId
      )

      const anemoBaseline = evaluateScenario(createScenario(4, fourWindsAnemoActionId, [bennett]), gameData)
      const anemoC4 = evaluateScenario(
        createScenario(4, fourWindsAnemoActionId, [bennett], [c4TriggerEffectId]),
        gameData
      )
      const pyroBaseline = evaluateScenario(createScenario(4, fourWindsPyroActionId, [bennett]), gameData)
      const pyroC4 = evaluateScenario(
        createScenario(4, fourWindsPyroActionId, [bennett], [c4TriggerEffectId]),
        gameData
      )

      expect(anemoC4.stats.damageBonus - anemoBaseline.stats.damageBonus).toBeCloseTo(0.2)
      expect(pyroC4.stats.damageBonus - pyroBaseline.stats.damageBonus).toBeCloseTo(0.2)
      expect(anemoC4.appliedEffects.map((effect) => effect.id)).toContain(c4TriggerEffectId)
      expect(pyroC4.appliedEffects.map((effect) => effect.id)).toContain(c4TriggerEffectId)
      expect(requireAdditionalEvent(anemoC4).expectedDamage).toBeGreaterThan(
        requireAdditionalEvent(anemoBaseline).expectedDamage
      )
      expect(() =>
        evaluateScenario(
          createScenario(4, fourWindsAnemoActionId, [bennett], [c4TriggerEffectId, c4HydroEffectId]),
          gameData
        )
      ).toThrow("cannot stack")
    }
  })
})
