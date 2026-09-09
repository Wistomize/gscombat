import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

const weaponIdByCharacter = {
  Alhaitham: "FavoniusSword",
  Arlecchino: "FavoniusLance",
  Candace: "FavoniusLance",
  Charlotte: "FavoniusCodex",
  Cyno: "FavoniusLance",
  Escoffier: "FavoniusLance",
  Eula: "FavoniusGreatsword",
  Furina: "FavoniusSword",
  Kachina: "FavoniusLance",
  Lyney: "FavoniusWarbow",
  Nahida: "FavoniusCodex",
  Navia: "FavoniusGreatsword",
  Wriothesley: "FavoniusCodex",
  Xilonen: "FavoniusSword",
  YaeMiko: "FavoniusCodex",
  Xiangling: "FavoniusLance",
  Yanfei: "FavoniusCodex",
  Yelan: "FavoniusWarbow"
} as const

type FixtureCharacterId = keyof typeof weaponIdByCharacter

afterAll(() => gameData.close())

function createBuild(characterId: FixtureCharacterId, constellation: number, index: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    artifacts: [...raidenNationalBuiltinBuild.artifacts].map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.system.c6-cumulative.${characterId.toLowerCase()}.${constellation}.${index}`,
    characterId,
    constellation,
    label: `${characterId} C${constellation} cumulative fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: weaponIdByCharacter[characterId] }
  }
}

function createScenario(
  primary: CharacterBuild,
  targetActionId: string,
  activeEffectIds: string[] = [],
  maximumReachable = true,
  teammates: CharacterBuild[] = [],
  enemyCount = 1
): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      activeEffectIds,
      ...(maximumReachable ? { equipmentEffectMode: "maximum_reachable" as const } : {}),
      enemyCount
    },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates
  }
}

describe("cumulative lower-constellation effects on maintained C6 outputs", () => {
  it("applies Arlecchino C1 inside the Bond multiplier and C6 to her Burst base-damage stage", () => {
    const normalActionId = "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.hydro_aura_vaporize"
    const c0Normal = evaluateScenario(createScenario(createBuild("Arlecchino", 0, 0), normalActionId), gameData)
    const c1Normal = evaluateScenario(createScenario(createBuild("Arlecchino", 1, 1), normalActionId), gameData)
    const c6Normal = evaluateScenario(createScenario(createBuild("Arlecchino", 6, 2), normalActionId), gameData)
    const c1EffectId = "arlecchino.constellation.1.all_reprisals_and_arrears_are_mine_to_bear.masque.bond_bonus"

    expect(c0Normal.appliedEffects.map((effect) => effect.id)).not.toContain(c1EffectId)
    expect(c1Normal.appliedEffects.map((effect) => effect.id)).toContain(c1EffectId)
    expect(c1Normal.actionExpectedDamage).toBeGreaterThan(c0Normal.actionExpectedDamage)
    expect(c6Normal.appliedEffects.map((effect) => effect.id)).toContain(c1EffectId)

    const burstActionId = "arlecchino.burst.balemoon_rising.aoe"
    const c5Burst = evaluateScenario(createScenario(createBuild("Arlecchino", 5, 3), burstActionId), gameData)
    const c6Burst = evaluateScenario(createScenario(createBuild("Arlecchino", 6, 4), burstActionId), gameData)
    const c6BurstEffectId =
      "arlecchino.constellation.6.from_henceforth_we_shall_delight_in_new_life.burst.bond_base_damage"

    expect(c5Burst.appliedEffects.map((effect) => effect.id)).not.toContain(c6BurstEffectId)
    expect(c6Burst.appliedEffects.map((effect) => effect.id)).toContain(c6BurstEffectId)
    expect(c6Burst.actionExpectedDamage).toBeGreaterThan(c5Burst.actionExpectedDamage)
  })

  it("keeps maximum-reachable lower-constellation states on C6 owner actions", () => {
    const fixtures = [
      {
        actionId: "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread",
        characterId: "Alhaitham" as const,
        expectedEffectIds: [
          "alhaitham.constellation.2.debate.max_stacks.elemental_mastery",
          "alhaitham.constellation.4.elucidation.burst_generated_three_mirrors.dendro_damage_bonus"
        ]
      },
      {
        actionId: "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.no_reaction",
        characterId: "Cyno" as const,
        expectedEffectIds: [
          "cyno.burst.sacred_rite_wolfs_swiftness.elemental_mastery",
          "cyno.constellation.1.ordinance_unceasing_vigil.radiance.elemental_mastery",
          "cyno.constellation.2.ceremony_homecoming_of_spirits.max_stacks.electro_damage_bonus"
        ]
      },
      {
        actionId: "navia.skill.ceremonial_crystalshot",
        activeEffectIds: [
          "navia.constellation.2.the_presidents_pursuit_of_victory.three_shrapnel.crit_rate"
        ],
        characterId: "Navia" as const,
        expectedEffectIds: [
          "navia.constellation.2.the_presidents_pursuit_of_victory.three_shrapnel.crit_rate"
        ]
      },
      {
        actionId: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
        characterId: "Charlotte" as const,
        expectedEffectIds: [
          "charlotte.constellation.2.a_duty_to_pursue_truth.attack_percent.stack_1",
          "charlotte.constellation.2.a_duty_to_pursue_truth.attack_percent.stack_2",
          "charlotte.constellation.2.a_duty_to_pursue_truth.attack_percent.stack_3"
        ],
        enemyCount: 3
      }
    ]

    for (const [index, fixture] of fixtures.entries()) {
      const result = evaluateScenario(
        createScenario(
          createBuild(fixture.characterId, 6, index),
          fixture.actionId,
          fixture.activeEffectIds ?? [],
          true,
          [],
          fixture.enemyCount ?? 1
        ),
        gameData
      )
      expect(result.appliedEffects.map((effect) => effect.id)).toEqual(
        expect.arrayContaining(fixture.expectedEffectIds)
      )
      expect(result.actionExpectedDamage).toBeGreaterThan(0)
    }
  })

  it("keeps trigger-dependent lower constellations explicit on C6 actions", () => {
    const fixtures = [
      {
        actionId: "candace.constellation.6.the_overflow.hydro_wave.no_reaction",
        characterId: "Candace" as const,
        effectId: "candace.constellation.2.moon_piercing_brilliance.after_skill_hit.hp_percent"
      },
      {
        actionId: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
        characterId: "Xilonen" as const,
        effectId: "xilonen.constellation.4.such_a_transfiguration.source_samples.normal_attack.base_damage"
      },
      {
        actionId: "eula.burst.glacial_illumination.lightfall_sword.explosion",
        characterId: "Eula" as const,
        effectId: "eula.constellation.1.tidal_illusion.after_grimheart_consumption.physical_damage_bonus"
      }
    ]

    for (const [index, fixture] of fixtures.entries()) {
      const build = createBuild(fixture.characterId, 6, index)
      const baseline = evaluateScenario(createScenario(build, fixture.actionId), gameData)
      const active = evaluateScenario(createScenario(build, fixture.actionId, [fixture.effectId]), gameData)

      expect(baseline.appliedEffects.map((effect) => effect.id)).not.toContain(fixture.effectId)
      expect(active.appliedEffects.map((effect) => effect.id)).toContain(fixture.effectId)
      expect(active.actionExpectedDamage).toBeGreaterThan(baseline.actionExpectedDamage)
    }
  })

  it("uses Yae Miko's rank-four coefficient from C2 and Escoffier's C1 in a four-member Hydro-Cryo team", () => {
    const yaeActionId = "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt"
    const yaeC1 = evaluateScenario(createScenario(createBuild("YaeMiko", 1, 0), yaeActionId, [], false), gameData)
    const yaeC2 = evaluateScenario(createScenario(createBuild("YaeMiko", 2, 0), yaeActionId, [], false), gameData)
    expect(yaeC2.actionExpectedDamage / yaeC1.actionExpectedDamage).toBeCloseTo(1.25)
    const yaeC6 = evaluateScenario(createScenario(createBuild("YaeMiko", 6, 0), yaeActionId), gameData)
    expect(yaeC6.appliedEffects.map((effect) => effect.id)).toContain(
      "yae_miko.constellation.4.sakura_channeling.after_sesshou_sakura_hit.electro_damage_bonus"
    )

    const cynoStellar = evaluateScenario(
      createScenario(
        createBuild("Cyno", 6, 0),
        "cyno.constellation.6.raiment_just_scorer.duststalker_bolt.stellar_superconduct"
      ),
      gameData
    )
    expect(cynoStellar.appliedEffects.map((effect) => effect.id)).toEqual(
      expect.arrayContaining([
        "cyno.burst.sacred_rite_wolfs_swiftness.elemental_mastery",
        "cyno.constellation.1.ordinance_unceasing_vigil.radiance.elemental_mastery",
        "cyno.constellation.2.ceremony_homecoming_of_spirits.radiance.max_stacks.stellar_superconduct_damage_bonus"
      ])
    )
    const cynoBaseDamage = cynoStellar.rotation.events[0]?.trace.find(
      (entry) => entry.kind === "special_reaction" && entry.stage === "base_damage"
    )
    expect(cynoBaseDamage).toMatchObject({
      formula: {
        kind: "special_reaction_base_damage",
        terms: expect.arrayContaining([
          expect.objectContaining({ coefficient: 2, stat: "attack" }),
          expect.objectContaining({ coefficient: 6, stat: "elementalMastery" })
        ])
      },
      kind: "special_reaction",
      stage: "base_damage"
    })

    const escoffier = evaluateScenario(
      createScenario(
        createBuild("Escoffier", 6, 0),
        "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.single_hit",
        [],
        true,
        [createBuild("Furina", 0, 1), createBuild("Yelan", 0, 2), createBuild("Charlotte", 0, 3)]
      ),
      gameData
    )
    expect(escoffier.appliedEffects.map((effect) => effect.id)).toContain(
      "escoffier.constellation.1.pre_dinner_dance_for_your_tastebuds.freshly_prepared_delicacy.cryo_crit_damage"
    )
  })

  it("carries reviewed passive and lower-constellation maximum snapshots into C6 metrics", () => {
    const yelan = evaluateScenario(
      createScenario(
        createBuild("Yelan", 6, 0),
        "yelan.constellation.6.winner_takes_all.strategic_reserve.breakthrough_barbs",
        [],
        true,
        [createBuild("Xiangling", 0, 7), createBuild("Xilonen", 0, 8), createBuild("Cyno", 0, 9)]
      ),
      gameData
    )
    const yelanInitial = yelan.appliedEffects.find(
      (effect) => effect.id === "yelan.passive.adapt_with_ease.full_stacks.initial_damage_bonus"
    )
    const yelanElapsed = yelan.appliedEffects.find(
      (effect) => effect.id === "yelan.passive.adapt_with_ease.full_stacks.elapsed_damage_bonus"
    )
    expect(yelanInitial).toMatchObject({ target: "damageBonus" })
    expect(yelanInitial?.value).toBeCloseTo(0.01)
    expect(yelanElapsed).toMatchObject({ target: "damageBonus" })
    expect(yelanElapsed?.value).toBeCloseTo(0.49)
    const turnControlTotal = yelan.appliedEffects
      .filter((effect) => effect.id.startsWith("yelan.passive.turn_control."))
      .reduce((total, effect) => total + effect.value, 0)
    expect(turnControlTotal).toBeCloseTo(0.3)

    const yanfei = evaluateScenario(
      createScenario(
        createBuild("Yanfei", 6, 1),
        "yanfei.constellation.6.charged_attack.four_scarlet_seals.hydro_aura_vaporize"
      ),
      gameData
    )
    expect(yanfei.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "yanfei.passive.proviso.four_scarlet_seals.pyro_damage_bonus",
          target: "damageBonus",
          value: 0.2
        })
      ])
    )

    const lyney = evaluateScenario(
      createScenario(
        createBuild("Lyney", 6, 2),
        "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised",
        [],
        true,
        [createBuild("Yanfei", 0, 3), createBuild("Xiangling", 0, 4)]
      ),
      gameData
    )
    expect(lyney.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lyney.passive.conclusive_ovation.pyro_affected_target.base_damage_bonus",
          value: 0.6
        }),
        expect.objectContaining({
          id: "lyney.passive.conclusive_ovation.first_other_pyro_member.damage_bonus",
          value: 0.2
        }),
        expect.objectContaining({
          id: "lyney.passive.conclusive_ovation.second_other_pyro_member.damage_bonus",
          value: 0.2
        })
      ])
    )

    const wriothesley = evaluateScenario(
      createScenario(createBuild("Wriothesley", 6, 5), "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable"),
      gameData
    )
    expect(wriothesley.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "wriothesley.passive.there_shall_be_a_plea_for_justice.full_stacks.attack_percent",
          target: "attackPercent",
          value: 0.3
        })
      ])
    )

    const kachina = evaluateScenario(
      createScenario(
        createBuild("Kachina", 6, 6),
        "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage"
      ),
      gameData
    )
    expect(kachina.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "kachina.constellation.4.more_foes_more_caution.four_enemies.defense_percent",
          target: "defensePercent",
          value: 0.2
        })
      ])
    )

    const nahida = evaluateScenario(
      createScenario(
        createBuild("Nahida", 6, 10),
        "nahida.constellation.6.fruit_of_reason.karmic_oblivion.single_hit",
        [],
        true,
        [],
        4
      ),
      gameData
    )
    expect(nahida.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "nahida.constellation.4.the_stem_of_manifest_inference.4_marked_enemies.elemental_mastery",
          target: "elementalMastery",
          value: 160
        })
      ])
    )
  })
})
