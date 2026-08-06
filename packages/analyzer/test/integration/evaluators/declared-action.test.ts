import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata,
  xianglingNationalBuiltinBuild
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateDeclaredDirectTalentAction,
  resolveDeclaredActionTalentLevelConstellationBonuses,
  resolveDeclaredTalentCoefficientValue
} from "../../../src/evaluators/declared-action.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireXianglingPyronado(): CombatActionMetadata {
  const action = getCombatActionDefinition("xiangling.burst.pyronado.reverse_vaporize")
  if (!action) throw new Error("Xiangling Pyronado must be declared in the combat registry")
  return action
}

function requireHuTaoChargedAttack(): CombatActionMetadata {
  const action = getCombatActionDefinition(
    "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
  )
  if (!action) throw new Error("Hu Tao Paramita Papilio charged attack must be declared in the combat registry")
  return action
}

function requireTravelerPyroBurst(): CombatActionMetadata {
  const action = getCombatActionDefinition("traveler.pyro.burst.scorching_firestrike.hit")
  if (!action) throw new Error("Traveler Pyro burst must be declared in the combat registry")
  return action
}

function createConstellationStackingFixture(action: CombatActionMetadata): CombatActionMetadata {
  return {
    ...action,
    talentLevelConstellationBonuses: [
      {
        id: "test.xiangling.constellation.1.burst-talent-level",
        label: "测试 C1",
        minimumSourceConstellation: 1,
        value: 1
      },
      ...(action.talentLevelConstellationBonuses ?? []),
      {
        id: "test.xiangling.constellation.5.burst-talent-level",
        label: "测试 C5",
        minimumSourceConstellation: 5,
        value: 1
      },
      {
        id: "test.xiangling.constellation.6.burst-talent-level",
        label: "测试 C6",
        minimumSourceConstellation: 6,
        value: 1
      }
    ]
  }
}

function evaluate(action: CombatActionMetadata, coefficientParameterId = "pyronado-tick-multiplier") {
  return evaluateDeclaredDirectTalentAction({
    action,
    build: { ...xianglingNationalBuiltinBuild, constellation: 0 },
    coefficientParameterId,
    enemy,
    gameData
  })
}

describe("declared direct talent action evaluation", () => {
  it("includes every declared lower-constellation talent bonus when the build is C6", () => {
    const action = createConstellationStackingFixture(requireXianglingPyronado())
    const bonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, {
      ...xianglingNationalBuiltinBuild,
      constellation: 6
    })

    expect(bonuses.map((bonus) => bonus.id)).toEqual([
      "test.xiangling.constellation.1.burst-talent-level",
      "xiangling.constellation.3.burst-talent-level",
      "test.xiangling.constellation.5.burst-talent-level",
      "test.xiangling.constellation.6.burst-talent-level"
    ])
  })

  it("does not include a C6-only talent bonus when the build is C5", () => {
    const action = createConstellationStackingFixture(requireXianglingPyronado())
    const bonuses = resolveDeclaredActionTalentLevelConstellationBonuses(action, {
      ...xianglingNationalBuiltinBuild,
      constellation: 5
    })

    expect(bonuses.map((bonus) => bonus.id)).toEqual([
      "test.xiangling.constellation.1.burst-talent-level",
      "xiangling.constellation.3.burst-talent-level",
      "test.xiangling.constellation.5.burst-talent-level"
    ])
  })

  it("applies a character C3 to an auxiliary Skill parameter used by a Normal Attack action", () => {
    const action = requireHuTaoChargedAttack()
    const c0Build: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.hu-tao.c0",
      characterId: "HuTao",
      constellation: 0,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Deathmatch" }
    }
    const c3Build: CharacterBuild = { ...c0Build, buildId: "test.hu-tao.c3", constellation: 3 }
    const c0Coefficient = resolveDeclaredTalentCoefficientValue({
      action,
      build: c0Build,
      coefficientParameterId: "paramita-papilio-attack-increase",
      gameData
    })
    const c3Coefficient = resolveDeclaredTalentCoefficientValue({
      action,
      build: c3Build,
      coefficientParameterId: "paramita-papilio-attack-increase",
      gameData
    })

    expect(resolveDeclaredActionTalentLevelConstellationBonuses(action, c3Build)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minimumSourceConstellation: 3, talentSlot: "skill", value: 3 })
      ])
    )
    expect(c3Coefficient).toBeGreaterThan(c0Coefficient)
  })

  it("applies Traveler's element-specific C5 burst bonus at C6", () => {
    const action = requireTravelerPyroBurst()
    const c0Build: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.pyro.c0",
      characterId: "Traveler",
      constellation: 0,
      talents: { burst: 10, normal: 10, skill: 10 },
      variant: { element: "pyro", gender: "female", kind: "traveler" },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }
    const c6Build: CharacterBuild = { ...c0Build, buildId: "test.traveler.pyro.c6", constellation: 6 }
    const c0Coefficient = resolveDeclaredTalentCoefficientValue({
      action,
      build: c0Build,
      coefficientParameterId: "scorching-firestrike-hit-damage",
      gameData
    })
    const c6Coefficient = resolveDeclaredTalentCoefficientValue({
      action,
      build: c6Build,
      coefficientParameterId: "scorching-firestrike-hit-damage",
      gameData
    })

    expect(resolveDeclaredActionTalentLevelConstellationBonuses(action, c6Build)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minimumSourceConstellation: 5, talentSlot: "burst", value: 3 })
      ])
    )
    expect(c6Coefficient).toBeGreaterThan(c0Coefficient)
  })

  it("uses Xiangling's selected base coefficient and inherits the C3 burst bonus at C6", () => {
    const action = requireXianglingPyronado()
    const evaluation = evaluate(action)
    const constellationThree = evaluateDeclaredDirectTalentAction({
      action,
      build: { ...xianglingNationalBuiltinBuild, constellation: 3 },
      coefficientParameterId: "pyronado-tick-multiplier",
      enemy,
      gameData
    })
    const constellationSix = evaluateDeclaredDirectTalentAction({
      action,
      build: { ...xianglingNationalBuiltinBuild, constellation: 6 },
      coefficientParameterId: "pyronado-tick-multiplier",
      enemy,
      gameData
    })

    expect(evaluation.coefficient).toBeCloseTo(2.016)
    expect(evaluation.coefficient).toBeCloseTo(
      gameData.getCharacterSkillParameter("Xiangling", "burst", 3, xianglingNationalBuiltinBuild.talents.burst) ?? 0
    )
    expect(constellationThree.coefficient).toBeCloseTo(
      gameData.getCharacterSkillParameter("Xiangling", "burst", 3, xianglingNationalBuiltinBuild.talents.burst + 3) ?? 0
    )
    expect(constellationSix.coefficient).toBeCloseTo(constellationThree.coefficient)
    expect(evaluation.rotation).toMatchObject({ duration: 1, dpr: evaluation.rotation.dps })
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.rotation.events[0]?.appliedEffectIds).toEqual([])
    expect(evaluation.rotation.events[0]?.trace[0]).toMatchObject({
      coefficient: 2.016,
      kind: "scaling",
      stat: "attack"
    })
  })

  it("resolves a declared Traveler talent parameter owner instead of inferring it from the static character ID", () => {
    const action = {
      characterId: "Traveler",
      damageKind: "direct",
      element: "anemo",
      evaluator: "declared_direct",
      id: "test.traveler.anemo.normal",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentParameterOwnerId: "TravelerAnemoF",
      talentSlot: "normal"
    } as CombatActionMetadata
    const evaluation = evaluateDeclaredDirectTalentAction({
      action,
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.traveler.anemo",
        characterId: "Traveler",
        talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
        variant: { element: "anemo", gender: "female", kind: "traveler" },
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
      },
      coefficientParameterId: "first-hit-multiplier",
      enemy,
      gameData
    })

    expect(evaluation.coefficient).toBeCloseTo(
      gameData.getCharacterSkillParameter("TravelerAnemoF", "auto", 0, 10) ?? 0
    )
  })

  it("derives the Traveler talent parameter owner from the selected build variant", () => {
    const action = {
      characterId: "Traveler",
      damageKind: "direct",
      element: "physical",
      evaluator: "declared_direct",
      id: "test.traveler.normal",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    } satisfies CombatActionMetadata
    const evaluation = evaluateDeclaredDirectTalentAction({
      action,
      build: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.traveler.pyro-male",
        characterId: "Traveler",
        talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
        variant: { element: "pyro", gender: "male", kind: "traveler" },
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
      },
      coefficientParameterId: "first-hit-multiplier",
      enemy,
      gameData
    })

    expect(evaluation.coefficient).toBeCloseTo(
      gameData.getCharacterSkillParameter("TravelerPyroM", "auto", 0, 10) ?? 0
    )
  })

  it("rejects a declared Traveler coefficient when its element eligibility does not match the build", () => {
    const action = {
      characterId: "Traveler",
      damageKind: "direct",
      element: "pyro",
      evaluator: "declared_direct",
      id: "test.traveler.pyro.skill",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill",
      travelerElement: "pyro"
    } satisfies CombatActionMetadata
    const travelerBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.traveler.anemo-female",
      characterId: "Traveler",
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      variant: { element: "anemo", gender: "female", kind: "traveler" },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }

    expect(() =>
      evaluateDeclaredDirectTalentAction({
        action,
        build: travelerBuild,
        coefficientParameterId: "skill-damage",
        enemy,
        gameData
      })
    ).toThrow("requires Traveler pyro, not anemo")
  })

  it("rejects a non-Traveler variant through the direct talent evaluator", () => {
    const action = requireXianglingPyronado()

    expect(() =>
      evaluateDeclaredDirectTalentAction({
        action,
        build: {
          ...xianglingNationalBuiltinBuild,
          variant: { element: "pyro", gender: "female", kind: "traveler" }
        },
        coefficientParameterId: "pyronado-tick-multiplier",
        enemy,
        gameData
      })
    ).toThrow("Only Traveler builds may declare a character variant")
  })

  it("rejects unsupported, non-direct, missing-scaling, and missing-reference actions", () => {
    const action = requireXianglingPyronado()
    const { scalingStat: _scalingStat, ...actionWithoutScaling } = action

    expect(() => evaluate({ ...action, status: "unsupported" })).toThrow("is unsupported")
    expect(() => evaluate({ ...action, damageKind: "transformative" })).toThrow("must declare direct damage")
    expect(() => evaluate(actionWithoutScaling)).toThrow("must declare a scaling stat")
    expect(() => evaluate({ ...action, parameterReferences: [] })).toThrow("does not declare coefficient parameter")
  })
})
