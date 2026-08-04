import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

interface TeamEffectEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly stats: {
    readonly resistanceReduction: number
  }
}

function createBuild(
  characterId: string,
  weaponId: string,
  buildId: string,
  constellation = 0
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    ascension: 6,
    buildId,
    characterId,
    constellation,
    label: `${characterId} 夏沃蕾尼可队伍效果测试`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

const arlecchino = createBuild("Arlecchino", "StaffOfTheScarletSands", "test.arlecchino.chevreuse-nicole")
const chevreuse = createBuild("Chevreuse", "FavoniusLance", "test.chevreuse.c6", 6)
const nicole = createBuild("Nicole", "FavoniusSword", "test.nicole.attack-buff")
const fischl = createBuild("Fischl", "FavoniusWarbow", "test.fischl.electro")

afterAll(async () => {
  await app.close()
})

describe("Chevreuse and Nicole team effects API integration", () => {
  it("automatically applies their reachable Pyro/Electro team effects to Arlecchino", async () => {
    const response = await app.inject({
      method: "POST",
      payload: {
        ...raidenNationalBuiltinScenario,
        conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
        externalBuffs: [],
        primary: arlecchino,
        targetActionId: "arlecchino.burst.balemoon_rising.aoe",
        teammates: [chevreuse, nicole, fischl]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    const evaluation = response.json().evaluation as TeamEffectEvaluation
    const chevreuseResistance = evaluation.appliedEffects.find(
      (effect) => effect.id === "chevreuse.passive.vanguards_coordinated_tactics.pyro_electro_resistance_reduction"
    )
    const chevreuseDamageBonus = evaluation.appliedEffects.find(
      (effect) => effect.id === "chevreuse.constellation.in_pursuit_of_ending_evil.pyro_electro_damage_bonus"
    )
    const nicoleAttackBonus = evaluation.appliedEffects.find(
      (effect) => effect.id === "nicole.skill.sacred_word_revelation.unseen_light.grace_of_kenosis.attack_bonus"
    )

    expect(chevreuseResistance?.value).toBeCloseTo(0.4)
    expect(chevreuseDamageBonus?.value).toBeCloseTo(0.6)
    expect(nicoleAttackBonus?.value).toBeGreaterThan(0)
    expect(evaluation.stats.resistanceReduction).toBeCloseTo(0.4)
  })
})
