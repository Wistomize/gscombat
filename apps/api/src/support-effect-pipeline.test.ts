import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

function createBuild(characterId: string, weaponId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} support-pipeline fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

interface SupportPipelineEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly stats: {
    readonly damageBonus: number
    readonly elementalMastery: number
    readonly resistanceReduction: number
  }
}

async function evaluate(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  targetActionId: string
): Promise<SupportPipelineEvaluation> {
  const response = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary,
      targetActionId,
      teammates
    },
    url: "/v1/analysis"
  })

  expect(response.statusCode, response.body).toBe(200)
  return response.json().evaluation as SupportPipelineEvaluation
}

afterAll(async () => {
  await app.close()
})

describe("support effect pipeline API integration", () => {
  it("injects Shenhe's source-attack-scaled Icy Quill into a Cryo hit's base-damage stage", async () => {
    const ayaka = createBuild("KamisatoAyaka", "FavoniusSword", "support-pipeline.ayaka")
    const shenhe = createBuild("Shenhe", "TheCatch", "support-pipeline.shenhe")
    const xingqiu = createBuild("Xingqiu", "FavoniusSword", "support-pipeline.xingqiu")
    const xiangling = createBuild("Xiangling", "TheCatch", "support-pipeline.xiangling")
    const evaluation = await evaluate(
      ayaka,
      [shenhe, xingqiu, xiangling],
      "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting"
    )

    expect(evaluation.appliedEffects).toContainEqual(expect.objectContaining({
      id: "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
      sourceId: shenhe.buildId,
      target: "baseDamageFlat"
    }))
  })

  it("injects both Sucrose mastery shares into a teammate reaction action", async () => {
    const xiangling = createBuild("Xiangling", "TheCatch", "support-pipeline.xiangling-vape")
    const sucrose = createBuild("Sucrose", "TheWidsith", "support-pipeline.sucrose")
    const xingqiu = createBuild("Xingqiu", "FavoniusSword", "support-pipeline.xingqiu-vape")
    const bennett = createBuild("Bennett", "FavoniusSword", "support-pipeline.bennett")
    const evaluation = await evaluate(
      xiangling,
      [sucrose, xingqiu, bennett],
      "xiangling.burst.pyronado.reverse_vaporize"
    )

    expect(evaluation.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "sucrose.passive.catalyst_conversion.elemental_mastery_share",
        target: "elementalMastery",
        value: 50
      }),
      expect.objectContaining({
        id: "sucrose.passive.mollis_favonius.elemental_mastery_share",
        sourceId: sucrose.buildId,
        target: "elementalMastery"
      })
    ]))
    expect(evaluation.stats.elementalMastery).toBeGreaterThan(50)
  })

  it("stacks Gorou, Ningguang, and Zhongli effects for a complete Geo team", async () => {
    const itto = createBuild("AratakiItto", "LuxuriousSeaLord", "support-pipeline.itto")
    const gorou = createBuild("Gorou", "FavoniusWarbow", "support-pipeline.gorou")
    const ningguang = createBuild("Ningguang", "TheWidsith", "support-pipeline.ningguang")
    const zhongli = createBuild("Zhongli", "TheCatch", "support-pipeline.zhongli")
    const evaluation = await evaluate(
      itto,
      [gorou, ningguang, zhongli],
      "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final"
    )

    expect(evaluation.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "gorou.skill.field.defense_buff", target: "defenseFlat" }),
      expect.objectContaining({ id: "gorou.burst.general_glory.defense_percent_buff", target: "defensePercent" }),
      expect.objectContaining({ id: "gorou.skill.field.geo_damage_bonus", target: "damageBonus", value: 0.15 }),
      expect.objectContaining({
        id: "ningguang.passive.trove_of_marvelous_treasures.geo_damage_bonus",
        target: "damageBonus",
        value: 0.12
      }),
      expect.objectContaining({
        id: "zhongli.skill.jade_shield.universal_resistance_reduction",
        target: "enemyResistanceReduction",
        value: 0.2
      })
    ]))
  })

  it("injects Lauma's source-mastery reaction bonus into Hyperbloom", async () => {
    const kuki = createBuild("KukiShinobu", "FavoniusSword", "support-pipeline.kuki")
    const lauma = createBuild("Lauma", "TheWidsith", "support-pipeline.lauma")
    const collei = createBuild("Collei", "FavoniusWarbow", "support-pipeline.collei")
    const xingqiu = createBuild("Xingqiu", "FavoniusSword", "support-pipeline.xingqiu-hyperbloom")
    const evaluation = await evaluate(
      kuki,
      [lauma, collei, xingqiu],
      "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    )

    expect(evaluation.appliedEffects).toContainEqual(expect.objectContaining({
      id: "lauma.burst.pale_hymn.bloom_related_reaction_damage_bonus",
      sourceId: lauma.buildId,
      target: "reactionDamageBonus"
    }))
  })
})
