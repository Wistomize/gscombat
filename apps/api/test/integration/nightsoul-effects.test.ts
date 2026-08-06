import { resolveCoreCombatStats } from "@gscombat/analyzer"
import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(async () => {
  await app.close()
  gameData.close()
})

function equipArtifactSet(build: CharacterBuild, setId: string, buildId: string): CharacterBuild {
  return {
    ...build,
    artifacts: build.artifacts.map((artifact) => ({ ...artifact, setId })),
    buildId
  }
}

function createScenario(primary: CharacterBuild, teammates: CharacterBuild[]): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    externalBuffs: [],
    primary,
    targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
    teammates
  }
}

function createBuild(characterId: string, weaponId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    ascension: 6,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} 夜魂机制集成测试`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

describe("Nightsoul equipment effects API integration", () => {
  it("uses only Scroll of the Hero of Cinder City's standard bonus when its holder cannot enter Nightsoul's Blessing", async () => {
    const xiangling = {
      ...raidenNationalBuiltinScenario.teammates.find((build) => build.characterId === "Xiangling")!,
      buildId: "api.nightsoul.xiangling-primary"
    }
    const nonNightsoulHolder = equipArtifactSet(
      raidenNationalBuiltinBuild,
      "ScrollOfTheHeroOfCinderCity",
      "api.nightsoul.raiden-scroll-holder"
    )
    const response = await app.inject({
      method: "POST",
      payload: createScenario(xiangling, [nonNightsoulHolder]),
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    const appliedEffects = response.json().evaluation.appliedEffects as readonly { readonly id: string; readonly value: number }[]
    expect(appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus",
          value: 0.12
        })
      ])
    )
    expect(appliedEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
        })
      ])
    )
  })

  it("uses Scroll of the Hero of Cinder City's Nightsoul bonus from a capable support for a non-Natlan primary", async () => {
    const xiangling = {
      ...raidenNationalBuiltinScenario.teammates.find((build) => build.characterId === "Xiangling")!,
      buildId: "api.nightsoul.xiangling-with-xilonen-scroll"
    }
    const xilonen = equipArtifactSet(
      createBuild("Xilonen", "FavoniusSword", "api.nightsoul.xilonen-scroll-holder"),
      "ScrollOfTheHeroOfCinderCity",
      "api.nightsoul.xilonen-scroll-holder"
    )
    const response = await app.inject({
      method: "POST",
      payload: createScenario(xiangling, [xilonen]),
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus",
          sourceId: xilonen.buildId,
          value: 0.4
        })
      ])
    )
  })

  it("does not activate Obsidian Codex for a character that cannot enter Nightsoul's Blessing", async () => {
    const xiangling = equipArtifactSet(
      raidenNationalBuiltinScenario.teammates.find((build) => build.characterId === "Xiangling")!,
      "ObsidianCodex",
      "api.nightsoul.xiangling-obsidian"
    )
    const response = await app.inject({
      method: "POST",
      payload: createScenario(xiangling, []),
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    const appliedEffects = response.json().evaluation.appliedEffects as readonly { readonly id: string }[]
    expect(appliedEffects.some((effect) => effect.id.startsWith("artifact.obsidian-codex."))).toBe(false)
  })

  it("activates Obsidian Codex only for Traveler's Pyro variant", async () => {
    const baseTraveler = equipArtifactSet(
      createBuild("Traveler", "FavoniusSword", "api.nightsoul.traveler-obsidian"),
      "ObsidianCodex",
      "api.nightsoul.traveler-obsidian"
    )
    const pyroTraveler: CharacterBuild = {
      ...baseTraveler,
      buildId: "api.nightsoul.pyro-traveler-obsidian",
      variant: { element: "pyro", gender: "female", kind: "traveler" }
    }
    const anemoTraveler: CharacterBuild = {
      ...baseTraveler,
      buildId: "api.nightsoul.anemo-traveler-obsidian",
      variant: { element: "anemo", gender: "female", kind: "traveler" }
    }
    const [pyroResponse, anemoResponse] = await Promise.all([
      app.inject({
        method: "POST",
        payload: {
          ...createScenario(pyroTraveler, []),
          targetActionId: "traveler.pyro.burst.scorching_firestrike.hit"
        },
        url: "/v1/analysis"
      }),
      app.inject({
        method: "POST",
        payload: {
          ...createScenario(anemoTraveler, []),
          targetActionId: "traveler.anemo.skill.palm_vortex.initial_gust"
        },
        url: "/v1/analysis"
      })
    ])

    expect(pyroResponse.statusCode, pyroResponse.body).toBe(200)
    expect(anemoResponse.statusCode, anemoResponse.body).toBe(200)
    expect(pyroResponse.json().evaluation.appliedEffects.some(
      (effect: { readonly id: string }) => effect.id.startsWith("artifact.obsidian-codex.")
    )).toBe(true)
    expect(anemoResponse.json().evaluation.appliedEffects.some(
      (effect: { readonly id: string }) => effect.id.startsWith("artifact.obsidian-codex.")
    )).toBe(false)
  })

  it("applies Kachina's Geo damage bonus when the configured party can trigger a Nightsoul Burst", async () => {
    const kachina = createBuild("Kachina", "FavoniusLance", "api.nightsoul.kachina")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(kachina, []),
        targetActionId: "kachina.skill.go_go_turbo_twirly.independent_attack"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.teamState.nightsoulBurst).toEqual({
      characterBuildIds: [kachina.buildId],
      characterCount: 1,
      cooldownSeconds: 18,
      hasXilonenIndependentTrigger: false
    })
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "kachina.passive.mountain_echoes.after_nightsoul_burst.geo_damage_bonus",
          sourceId: kachina.buildId,
          value: 0.2
        })
      ])
    )
  })

  it("applies Mavuika's Attack bonus after a reachable Nightsoul Burst", async () => {
    const mavuika = createBuild("Mavuika", "AThousandBlazingSuns", "api.nightsoul.mavuika")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mavuika, []),
        conditions: {
          activeEffectIds: [],
          actionParameters: { "fighting-spirit": 200 },
          enemyCount: 1,
          equipmentEffectMode: "maximum_reachable"
        },
        targetActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mavuika.passive.gift_of_flaming_flowers.after_nightsoul_burst.attack_percent",
          sourceId: mavuika.buildId,
          value: 0.3
        })
      ])
    )
  })

  it("applies Xilonen's Defense bonus after a reachable Nightsoul Burst", async () => {
    const xilonen = createBuild("Xilonen", "FluteOfEzpitzal", "api.nightsoul.xilonen")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(xilonen, []),
        targetActionId: "xilonen.burst.ocelotlicues_ode.initial_hit"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "xilonen.passive.portable_armored_sheath.after_nightsoul_burst.defense_percent",
          sourceId: xilonen.buildId,
          value: 0.2
        })
      ])
    )
  })

  it("includes Xilonen's Nightsoul Burst Defense bonus in her healing metric", async () => {
    const xilonen = createBuild("Xilonen", "FavoniusSword", "api.nightsoul.xilonen-healing")
    const response = await app.inject({
      method: "POST",
      payload: {
        build: xilonen,
        context: {
          recipient: {
            buildId: xilonen.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: false,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 1 },
          teammates: []
        },
        metricId: "xilonen.burst.healing_rhythm.heal_tick"
      },
      url: "/v1/support-metrics/evaluate"
    })

    expect(response.statusCode, response.body).toBe(200)
    const coreStats = resolveCoreCombatStats(xilonen, gameData)
    const expectedHealing = (coreStats.defense + coreStats.baseDefense * 0.2) * 1.872 + 1101.7063
    expect(response.json().metric.value).toBeCloseTo(expectedHealing)
  })

  it("applies Ifa's Elemental Mastery bonus after a reachable Nightsoul Burst", async () => {
    const ifa = createBuild("Ifa", "MappaMare", "api.nightsoul.ifa")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(ifa, []),
        targetActionId: "ifa.skill.airborne_disease_prevention.remedy_bullet"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ifa.passive.mutual_aid_agreement.after_nightsoul_burst.elemental_mastery",
          sourceId: ifa.buildId,
          value: 80
        })
      ])
    )
  })

  it("includes Ifa's Nightsoul Burst Elemental Mastery in his healing metric", async () => {
    const ifa = createBuild("Ifa", "MappaMare", "api.nightsoul.ifa-healing")
    const response = await app.inject({
      method: "POST",
      payload: {
        build: ifa,
        context: {
          recipient: {
            buildId: ifa.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: false,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 1 },
          teammates: []
        },
        metricId: "ifa.skill.airborne_disease_prevention.remedy_bullet.heal_tick"
      },
      url: "/v1/support-metrics/evaluate"
    })

    expect(response.statusCode, response.body).toBe(200)
    const coreStats = resolveCoreCombatStats(ifa, gameData)
    const expectedHealing = (coreStats.elementalMastery + 80) * 0.36288 + 105.93467
    expect(response.json().metric.value).toBeCloseTo(expectedHealing)
  })

  it("applies both Varesa Attack stacks when two Natlan party members make them reachable", async () => {
    const varesa = createBuild("Varesa", "LostPrayerToTheSacredWinds", "api.nightsoul.varesa")
    const kachina = createBuild("Kachina", "FavoniusLance", "api.nightsoul.varesa-kachina")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(varesa, [kachina]),
        targetActionId: "varesa.normal.fiery_passion.high_plunge.follow_up_strike"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "varesa.passive.the_hero_twice_returned.after_nightsoul_burst.two_stacks.attack_percent",
          sourceId: varesa.buildId,
          value: 0.7
        })
      ])
    )
  })

  it("adds two Nightsoul Burst stacks to Kinich's Scalespiker Cannon with two Natlan party members", async () => {
    const kinich = createBuild("Kinich", "FangOfTheMountainKing", "api.nightsoul.kinich")
    const kachina = createBuild("Kachina", "FavoniusLance", "api.nightsoul.kinich-kachina")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(kinich, [kachina]),
        targetActionId: "kinich.skill.scalespiker_cannon.single_hit"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "kinich.passive.flame_spirit_pact.hunters_experience.two_stacks.attack_additive_damage",
          scalingStat: "attack",
          sourceId: kinich.buildId,
          target: "matchedActionAdditiveDamageTerm",
          value: 6.4
        })
      ])
    )
  })

  it("adds three Wavechaser stacks to Mualani's Burst with three Natlan party members", async () => {
    const mualani = createBuild("Mualani", "SurfsUp", "api.nightsoul.mualani")
    const kachina = createBuild("Kachina", "FavoniusLance", "api.nightsoul.mualani-kachina")
    const kinich = createBuild("Kinich", "FavoniusGreatsword", "api.nightsoul.mualani-kinich")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mualani, [kachina, kinich]),
        targetActionId: "mualani.burst.boomsharka_laka.tracking_missile"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mualani.passive.natlans_greatest_guide.wavechasers_exploits.three_stacks.hp_additive_damage",
          scalingStat: "hp",
          sourceId: mualani.buildId,
          target: "matchedActionAdditiveDamageTerm",
          value: 0.45
        })
      ])
    )
  })

  it("counts Xilonen's independent trigger toward Mualani's reachable Wavechaser stacks", async () => {
    const mualani = createBuild("Mualani", "SurfsUp", "api.nightsoul.mualani-with-xilonen")
    const xilonen = createBuild("Xilonen", "FavoniusSword", "api.nightsoul.mualani-xilonen")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mualani, [xilonen]),
        targetActionId: "mualani.burst.boomsharka_laka.tracking_missile"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.teamState.nightsoulBurst).toMatchObject({
      characterCount: 2,
      cooldownSeconds: 12,
      hasXilonenIndependentTrigger: true
    })
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mualani.passive.natlans_greatest_guide.wavechasers_exploits.three_stacks.hp_additive_damage",
          value: 0.45
        })
      ])
    )
  })

  it("does not count Xilonen's independent trigger before her fourth ascension", async () => {
    const mualani = createBuild("Mualani", "SurfsUp", "api.nightsoul.mualani-with-low-ascension-xilonen")
    const xilonen = {
      ...createBuild("Xilonen", "FavoniusSword", "api.nightsoul.low-ascension-xilonen"),
      ascension: 3,
      level: 60
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mualani, [xilonen]),
        targetActionId: "mualani.burst.boomsharka_laka.tracking_missile"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.teamState.nightsoulBurst).toMatchObject({
      characterCount: 2,
      cooldownSeconds: 12,
      hasXilonenIndependentTrigger: false
    })
    const appliedEffectIds = response.json().evaluation.appliedEffects.map(
      (effect: { readonly id: string }) => effect.id
    )
    expect(appliedEffectIds).toContain(
      "mualani.passive.natlans_greatest_guide.wavechasers_exploits.two_stacks.hp_additive_damage"
    )
    expect(appliedEffectIds).not.toContain(
      "mualani.passive.natlans_greatest_guide.wavechasers_exploits.three_stacks.hp_additive_damage"
    )
  })

  it("evaluates Iansan's single Warming Up heal after a reachable Nightsoul Burst", async () => {
    const iansan = createBuild("Iansan", "FavoniusLance", "api.nightsoul.iansan-healing")
    const response = await app.inject({
      method: "POST",
      payload: {
        build: iansan,
        context: {
          recipient: {
            buildId: iansan.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isMoonsign: false,
            isWithinSourceArea: true,
            missingHp: 999_999
          },
          source: { currentHpFraction: 1 },
          teammates: []
        },
        metricId: "iansan.passive.kinetic_energy_gradient_test.warming_up.heal_tick"
      },
      url: "/v1/support-metrics/evaluate"
    })

    expect(response.statusCode, response.body).toBe(200)
    const coreStats = resolveCoreCombatStats(iansan, gameData)
    expect(response.json().metric.value).toBeCloseTo((coreStats.attack + coreStats.baseAttack * 0.2) * 0.6)
  })

  it("applies Pyro Traveler C1's full damage bonus to a Nightsoul-capable active character", async () => {
    const mavuika = createBuild("Mavuika", "AThousandBlazingSuns", "api.nightsoul.traveler-c1-mavuika")
    const pyroTraveler: CharacterBuild = {
      ...createBuild("Traveler", "FavoniusSword", "api.nightsoul.pyro-traveler-c1"),
      constellation: 1,
      variant: { element: "pyro", gender: "female", kind: "traveler" }
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mavuika, [pyroTraveler]),
        conditions: {
          activeEffectIds: [],
          actionParameters: { "fighting-spirit": 200 },
          enemyCount: 1,
          equipmentEffectMode: "maximum_reachable"
        },
        targetActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.teamState.nightsoulBurst).toMatchObject({
      characterBuildIds: [mavuika.buildId],
      characterCount: 1,
      cooldownSeconds: 18
    })
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "traveler.pyro.constellation.1.starfires_flowing_light.active_character.damage_bonus",
          sourceId: pyroTraveler.buildId,
          value: 0.06
        }),
        expect.objectContaining({
          id: "traveler.pyro.constellation.1.starfires_flowing_light.nightsoul_active_character.extra_damage_bonus",
          sourceId: pyroTraveler.buildId,
          value: 0.09
        })
      ])
    )
  })

  it("does not apply Pyro Traveler effects from a non-Pyro Traveler source build", async () => {
    const mavuika = createBuild("Mavuika", "AThousandBlazingSuns", "api.nightsoul.anemo-traveler-mavuika")
    const anemoTraveler: CharacterBuild = {
      ...createBuild("Traveler", "FavoniusSword", "api.nightsoul.anemo-traveler-c1"),
      constellation: 1,
      variant: { element: "anemo", gender: "female", kind: "traveler" }
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...createScenario(mavuika, [anemoTraveler]),
        conditions: {
          activeEffectIds: [],
          actionParameters: { "fighting-spirit": 200 },
          enemyCount: 1,
          equipmentEffectMode: "maximum_reachable"
        },
        targetActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().evaluation.appliedEffects.some(
      (effect: { readonly id: string }) => effect.id.startsWith("traveler.pyro.constellation.1.")
    )).toBe(false)
  })
})
