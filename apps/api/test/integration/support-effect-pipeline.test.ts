import { resolveBaseCombatStats } from "@gscombat/analyzer"
import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

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
  readonly result: {
    readonly expectedDamage: number
  }
  readonly rotation: {
    readonly dpr: number
    readonly events: readonly {
      readonly trace: readonly {
        readonly flatDamage?: number
        readonly flatDamageAddition?: number
        readonly kind: string
      }[]
    }[]
  }
  readonly stats: {
    readonly attackPercent: number
    readonly damageBonus: number
    readonly defensePercent: number
    readonly effectiveAttack: number
    readonly effectiveDefense: number
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
  gameData.close()
})

describe("support effect pipeline API integration", () => {
  it("publishes complete HP, defense, and elemental-mastery breakdowns with their resolved sources", async () => {
    const baseNoelle = createBuild("Noelle", "RedhornStonethresher", "support-pipeline.noelle-stat-breakdown")
    const noelle: CharacterBuild = {
      ...baseNoelle,
      artifacts: baseNoelle.artifacts.map((artifact) => {
        const huskArtifact = { ...artifact, setId: "HuskOfOpulentDreams" }
        if (artifact.slot === "flower") {
          return {
            ...huskArtifact,
            substats: [
              { stat: "hp_percent" as const, value: 0.1 },
              { stat: "elemental_mastery" as const, value: 80 }
            ]
          }
        }
        if (artifact.slot === "plume") {
          return {
            ...huskArtifact,
            substats: [
              { stat: "def_percent" as const, value: 0.1 },
              { stat: "def" as const, value: 100 }
            ]
          }
        }
        return huskArtifact
      })
    }
    const yelan = { ...createBuild("Yelan", "FavoniusWarbow", "support-pipeline.yelan-c4"), constellation: 4 }
    const nilou = createBuild("Nilou", "KeyOfKhajNisut", "support-pipeline.nilou-key")
    const keyEffectId = "weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"
    const response = await app.inject({
      method: "POST",
      payload: {
        ...raidenNationalBuiltinScenario,
        conditions: {
          activeEffectIds: [
            "yelan.constellation.4.bait_and_switch.full_stacks.hp_percent",
            keyEffectId
          ],
          enemyCount: 1
        },
        externalBuffs: [
          { label: "测试生命值%", sourceId: "test.hp-percent", stat: "hp_percent", value: 0.12 },
          { label: "测试固定生命值", sourceId: "test.hp-flat", stat: "hp_flat", value: 500 },
          { label: "测试防御力%", sourceId: "test.defense-percent", stat: "defense_percent", value: 0.15 },
          { label: "测试固定防御力", sourceId: "test.defense-flat", stat: "defense_flat", value: 120 },
          { label: "测试元素精通", sourceId: "test.elemental-mastery", stat: "elemental_mastery", value: 60 }
        ],
        primary: noelle,
        targetActionId: "noelle.normal.auto.first_hit",
        teammates: [yelan, nilou]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    const evaluation = response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly label: string; readonly value: number }[]
      readonly stats: {
        readonly baseDefense: number
        readonly baseElementalMastery: number
        readonly baseHp: number
        readonly defensePercent: number
        readonly effectiveDefense: number
        readonly effectiveHp: number
        readonly elementalMastery: number
        readonly flatDefense: number
        readonly flatElementalMastery: number
        readonly flatHp: number
        readonly hpPercent: number
        readonly statContributions: readonly { readonly label: string; readonly stage: string; readonly value: number }[]
      }
    }
    const { stats } = evaluation
    const keyEffect = evaluation.appliedEffects.find((effect) => effect.id === keyEffectId)

    expect(stats.effectiveHp).toBeCloseTo(stats.baseHp * (1 + stats.hpPercent) + stats.flatHp)
    expect(stats.effectiveDefense).toBeCloseTo(stats.baseDefense * (1 + stats.defensePercent) + stats.flatDefense)
    expect(stats.elementalMastery).toBeCloseTo(stats.baseElementalMastery + stats.flatElementalMastery)
    expect(stats.statContributions).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "生之花副词条 · 生命值%", stage: "hpPercent", value: 0.1 }),
      expect.objectContaining({ label: "测试固定生命值", stage: "flatHp", value: 500 }),
      expect.objectContaining({ label: "诓惑者，接树移花 · C4 满4次络命丝标记爆发后（全队生命上限提高40%，25秒）", stage: "hpPercent", value: 0.4 }),
      expect.objectContaining({ label: "死之羽副词条 · 防御力%", stage: "defensePercent", value: 0.1 }),
      expect.objectContaining({ label: "测试固定防御力", stage: "flatDefense", value: 120 }),
      expect.objectContaining({ label: "华馆梦醒形骸记 · 二件套", stage: "defensePercent", value: 0.3 }),
      expect.objectContaining({ label: "生之花副词条 · 元素精通", stage: "elementalMastery", value: 80 }),
      expect.objectContaining({ label: "测试元素精通", stage: "elementalMastery", value: 60 })
    ]))
    if (!keyEffect) throw new Error("Expected Key of Khaj-Nisut's team elemental-mastery effect to be applied")
    expect(stats.statContributions).toContainEqual(expect.objectContaining({
      label: keyEffect.label,
      stage: "elementalMastery",
      value: keyEffect.value
    }))
  })

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

    const icyQuill = evaluation.appliedEffects.find(
      (effect) => effect.id === "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase"
    )

    expect(icyQuill).toMatchObject({ sourceId: shenhe.buildId, target: "baseDamageFlat" })
    if (!icyQuill) throw new Error("Expected Icy Quill to be applied to Ayaka's Cryo burst hit")
    expect(icyQuill.value).toBeGreaterThan(0)
    expect(evaluation.rotation.dpr).toBeCloseTo(evaluation.result.expectedDamage)
    expect(evaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamage: icyQuill.value,
      kind: "scaling"
    }))
  })

  it("uses a support's own maximum-reachable weapon stat state for source-final-attack without buffing the recipient", async () => {
    const ayaka = createBuild("KamisatoAyaka", "FavoniusSword", "support-pipeline.ayaka-calamity-recipient")
    const shenhe = createBuild("Shenhe", "CalamityQueller", "support-pipeline.shenhe-calamity")
    const actionId = "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting"
    const baseline = await evaluate(ayaka, [], actionId)
    const evaluation = await evaluate(ayaka, [shenhe], actionId)
    const icyQuill = evaluation.appliedEffects.find(
      (effect) => effect.id === "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase"
    )
    const icyQuillRatio = gameData.getCharacterSkillParameter("Shenhe", "skill", 2, shenhe.talents.skill)
    const shenheBaseStats = resolveBaseCombatStats(shenhe, gameData, "cryo")

    if (!icyQuill || icyQuillRatio === undefined) throw new Error("Expected Shenhe's Icy Quill source snapshot")
    // At R1, off-field six stacks are 6 × 2 × 3.2% Attack, applied to Shenhe's base Attack only.
    const expectedSourceAttack = shenheBaseStats.attack + shenheBaseStats.baseAttack * 0.384
    expect(icyQuill.value).toBeCloseTo(icyQuillRatio * expectedSourceAttack)
    expect(evaluation.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent)
    expect(evaluation.stats.effectiveAttack).toBeCloseTo(baseline.stats.effectiveAttack)
  })

  it("uses a support's own maximum-reachable artifact stat state for source-final-defense without buffing the recipient", async () => {
    const noelle = createBuild("Noelle", "FavoniusGreatsword", "support-pipeline.noelle-husk-recipient")
    const baseYunJin = createBuild("YunJin", "FavoniusLance", "support-pipeline.yun-jin-husk")
    const yunJin: CharacterBuild = {
      ...baseYunJin,
      artifacts: baseYunJin.artifacts.map((artifact) => ({ ...artifact, setId: "HuskOfOpulentDreams" }))
    }
    const actionId = "noelle.normal.auto.first_hit"
    const baseline = await evaluate(noelle, [], actionId)
    const evaluation = await evaluate(noelle, [yunJin], actionId)
    const flyingCloud = evaluation.appliedEffects.find(
      (effect) => effect.id === "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase"
    )
    const flyingCloudRatio = gameData.getCharacterSkillParameter("YunJin", "burst", 1, yunJin.talents.burst)
    const yunJinBaseStats = resolveBaseCombatStats(yunJin, gameData, "physical")

    if (!flyingCloud || flyingCloudRatio === undefined) throw new Error("Expected Yun Jin's Flying Cloud Flag source snapshot")
    // Two-piece Husk grants 30% Defense; four Curiosity stacks add a further 24% Defense to Yun Jin herself.
    const expectedSourceDefense = yunJinBaseStats.defense + yunJinBaseStats.baseDefense * 0.54
    expect(flyingCloud.value).toBeCloseTo(flyingCloudRatio * expectedSourceDefense)
    expect(evaluation.stats.defensePercent).toBeCloseTo(baseline.stats.defensePercent)
    expect(evaluation.stats.effectiveDefense).toBeCloseTo(baseline.stats.effectiveDefense)
  })

  it("projects Yun Jin and Illuga's ordinary base-damage effects into their authoritative traces", async () => {
    const yunJin = createBuild("YunJin", "FavoniusLance", "support-pipeline.yun-jin")
    const illuga = createBuild("Illuga", "TheWidsith", "support-pipeline.illuga")
    const yunJinEvaluation = await evaluate(yunJin, [], "yun_jin.normal.auto.first_hit")
    const illugaEvaluation = await evaluate(illuga, [], "illuga.skill.dawnbearing_songbird.press")
    const yunJinEffect = yunJinEvaluation.appliedEffects.find(
      (effect) => effect.id === "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase"
    )
    const illugaEffect = illugaEvaluation.appliedEffects.find(
      (effect) => effect.id === "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus"
    )

    if (!yunJinEffect || !illugaEffect) throw new Error("Expected Yun Jin and Illuga base-damage effects")
    expect(yunJinEffect).toMatchObject({ sourceId: yunJin.buildId, target: "baseDamageFlat" })
    expect(illugaEffect).toMatchObject({ sourceId: illuga.buildId, target: "baseDamageFlat" })
    expect(yunJinEffect.value).toBeGreaterThan(0)
    expect(illugaEffect.value).toBeGreaterThan(0)
    expect(yunJinEvaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamage: yunJinEffect.value,
      kind: "scaling"
    }))
    expect(illugaEvaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamage: illugaEffect.value,
      kind: "scaling_terms"
    }))
  })

  it("injects Xianyun's A4 plunge base damage and its C2 source-Attack snapshot into the authoritative trace", async () => {
    const gaming = createBuild("Gaming", "LuxuriousSeaLord", "support-pipeline.gaming")
    const xianyun = createBuild("Xianyun", "TheWidsith", "support-pipeline.xianyun")
    const xianyunC2 = {
      ...xianyun,
      buildId: "support-pipeline.xianyun-c2",
      constellation: 2
    }
    const actionId = "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider"
    const baseline = await evaluate(gaming, [], actionId)
    const c0Evaluation = await evaluate(gaming, [xianyun], actionId)
    const c2Evaluation = await evaluate(gaming, [xianyunC2], actionId)
    const c0Effect = c0Evaluation.appliedEffects.find(
      (effect) => effect.id === "xianyun.passive.consider_the_adeptus_in_her_realm.plunge_base_damage"
    )
    const c2Effect = c2Evaluation.appliedEffects.find(
      (effect) => effect.id === "xianyun.constellation.2.consider_the_adeptus_in_her_realm.plunge_base_damage"
    )

    if (!c0Effect || !c2Effect) throw new Error("Expected Xianyun's A4 base-damage effect at C0 and C2")
    expect(c0Effect).toMatchObject({ sourceId: xianyun.buildId, target: "baseDamageFlat" })
    expect(c0Effect.value).toBeGreaterThan(0)
    expect(c0Effect.value).toBeLessThanOrEqual(9000)
    expect(c0Evaluation.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(c0Evaluation.rotation.dpr).toBeCloseTo(c0Evaluation.result.expectedDamage)
    expect(c0Evaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamage: c0Effect.value,
      kind: "scaling"
    }))

    expect(c2Effect).toMatchObject({ sourceId: xianyunC2.buildId, target: "baseDamageFlat" })
    const xianyunBaseAttack = resolveBaseCombatStats(xianyunC2, gameData, "anemo").baseAttack
    // C2 adds 20% Attack as an Attack% term: it increases only Xianyun's base Attack, not her entire final Attack.
    expect(c2Effect.value).toBeCloseTo(c0Effect.value * 2 + xianyunBaseAttack * 0.8)
    expect(c2Effect.value).toBeLessThanOrEqual(18000)
    expect(c2Evaluation.result.expectedDamage).toBeGreaterThan(c0Evaluation.result.expectedDamage)
    expect(c2Evaluation.rotation.dpr).toBeCloseTo(c2Evaluation.result.expectedDamage)
    expect(c2Evaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamage: c2Effect.value,
      kind: "scaling"
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

  it("injects Lauma's source-mastery additive base damage into Hyperbloom", async () => {
    const kuki = createBuild("KukiShinobu", "FavoniusSword", "support-pipeline.kuki")
    const lauma = createBuild("Lauma", "FavoniusCodex", "support-pipeline.lauma")
    const collei = createBuild("Collei", "FavoniusWarbow", "support-pipeline.collei")
    const xingqiu = createBuild("Xingqiu", "FavoniusSword", "support-pipeline.xingqiu-hyperbloom")
    const evaluation = await evaluate(
      kuki,
      [lauma, collei, xingqiu],
      "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    )

    const paleHymn = evaluation.appliedEffects.find(
      (effect) => effect.id === "lauma.burst.pale_hymn.bloom_related_reaction_flat_damage_addition"
    )
    const paleHymnMultiplier = gameData.getCharacterSkillParameter("Lauma", "burst", 2, lauma.talents.burst)
    const laumaBaseStats = resolveBaseCombatStats(lauma, gameData, "dendro")

    expect(paleHymn).toMatchObject({
      id: "lauma.burst.pale_hymn.bloom_related_reaction_flat_damage_addition",
      sourceId: lauma.buildId,
      target: "transformativeReactionFlatDamageAddition"
    })
    if (!paleHymn || paleHymnMultiplier === undefined) {
      throw new Error("Expected Lauma's Pale Hymn additive Hyperbloom damage")
    }
    expect(paleHymn.value).toBeCloseTo(laumaBaseStats.elementalMastery * paleHymnMultiplier)
    expect(evaluation.rotation.events[0]?.trace).toContainEqual(expect.objectContaining({
      flatDamageAddition: paleHymn.value,
      kind: "transformative_reaction"
    }))
  })
})
