import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

afterAll(async () => app.close())

function createBuild(
  characterId: "Sandrone" | "Zibai",
  weaponId: "ATeaspoonOfTranscendence" | "LightbearingMoonshard"
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `api.${characterId.toLowerCase()}.${weaponId.toLowerCase()}`,
    characterId,
    constellation: 0,
    label: `${characterId} ${weaponId} API 特殊反应测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function createScenario(
  primary: CharacterBuild,
  targetActionId: string,
  activeEffectIds: readonly string[] = [],
  actionParameters?: Readonly<Record<string, number>>
): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      activeEffectIds: [...activeEffectIds],
      ...(actionParameters === undefined ? {} : { actionParameters }),
      equipmentEffectMode: "maximum_reachable",
      enemyCount: 1
    },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates: []
  }
}

function createTeammate(characterId: string, index: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `api.moonsign.${characterId.toLowerCase()}.${index}`,
    characterId,
    label: `${characterId} 月兆队友`
  }
}

interface ApiSpecialEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly result: { readonly expectedDamage: number }
  readonly teamState: {
    readonly activeResonanceIds: readonly string[]
    readonly moonsign: { readonly characterCount: number; readonly level: string }
  }
  readonly rotation: {
    readonly events: readonly {
      readonly trace: readonly {
        readonly formula: {
          readonly bonus?: number
          readonly kind: string
          readonly terms?: readonly {
            readonly coefficient: number
            readonly stat: string
            readonly value: number
          }[]
        }
        readonly kind: string
        readonly stage: string
      }[]
    }[]
  }
}

function getReactionDamageBonus(evaluation: ApiSpecialEvaluation): { readonly bonus?: number; readonly kind: string } | undefined {
  return evaluation.rotation.events[0]?.trace.find((entry) => entry.stage === "reaction_damage_bonus")?.formula
}

describe("special-reaction weapon effects API", () => {
  it("evaluates real Stellar-Superconduct and Lunar-Crystallize actions through the public analysis endpoint", async () => {
    const sandrone = createBuild("Sandrone", "ATeaspoonOfTranscendence")
    const zibai = createBuild("Zibai", "LightbearingMoonshard")
    const [catalogResponse, stellarActiveResponse, lunarActiveResponse] = await Promise.all([
      app.inject({ method: "GET", url: "/v1/catalog" }),
      app.inject({
        method: "POST",
        payload: createScenario(
          sandrone,
          "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
          [],
          { "stored-elemental-applications": 12 }
        ),
        url: "/v1/analysis"
      }),
      app.inject({
        method: "POST",
        payload: {
          ...createScenario(zibai, "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize"),
          teammates: [createTeammate("Aino", 1), createTeammate("Furina", 2), createTeammate("Bennett", 3)]
        },
        url: "/v1/analysis"
      })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const characters = catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActions: readonly { readonly id: string }[]
    }[]
    expect(characters.find((character) => character.characterId === "Sandrone")?.primaryActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct" })
      ])
    )
    expect(characters.find((character) => character.characterId === "Zibai")?.primaryActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize" })
      ])
    )
    for (const response of [stellarActiveResponse, lunarActiveResponse]) {
      expect(response.statusCode).toBe(200)
    }

    const stellarActive = stellarActiveResponse.json().evaluation as ApiSpecialEvaluation
    const lunarActive = lunarActiveResponse.json().evaluation as ApiSpecialEvaluation

    expect(stellarActive.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus",
          sourceId: sandrone.buildId,
          target: "specialReactionDamageBonus",
          value: 0.48
        })
      ])
    )
    expect(lunarActive.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus",
          sourceId: zibai.buildId,
          target: "specialReactionDamageBonus",
          value: 0.64
        })
      ])
    )
    expect(getReactionDamageBonus(stellarActive)).toMatchObject({
      bonus: 0.48,
      kind: "special_reaction_damage_bonus"
    })
    expect(getReactionDamageBonus(lunarActive)).toMatchObject({ kind: "special_reaction_damage_bonus" })
    expect(getReactionDamageBonus(lunarActive)?.bonus).toBeGreaterThan(0.64)
    expect(lunarActive.teamState).toMatchObject({
      activeResonanceIds: ["resonance.hydro"],
      moonsign: { characterCount: 2, level: "ascendant_gleam" }
    })
    expect(stellarActive.result.expectedDamage).toBeGreaterThan(0)
    expect(lunarActive.result.expectedDamage).toBeGreaterThan(0)
  }, 20_000)

  it("serializes the independent Lunar-Crystallize base terms without ordinary bonus or defense stages", async () => {
    const zibai = createBuild("Zibai", "LightbearingMoonshard")
    const response = await app.inject({
      method: "POST",
      payload: createScenario(zibai, "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize"),
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    const evaluation = response.json().evaluation as ApiSpecialEvaluation
    const trace = evaluation.rotation.events[0]?.trace ?? []
    const baseDamage = trace.find((entry) => entry.stage === "base_damage")

    expect(baseDamage).toMatchObject({
      formula: {
        kind: "special_reaction_base_damage",
        terms: [expect.objectContaining({ coefficient: expect.any(Number), stat: "defense", value: expect.any(Number) })]
      },
      kind: "special_reaction"
    })
    expect(trace.some((entry) => entry.kind === "damage_bonus" || entry.kind === "defense")).toBe(false)
  })
})
