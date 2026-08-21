import { afterAll, describe, expect, it } from "vitest"
import {
  listCombatActions,
  listCombatMetrics,
  raidenNationalBuiltinScenario,
  supportedWeapons
} from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"

import { buildApp, serializeCombatAction, serializeRotationEvent } from "../../src/app.js"

const app = buildApp()

function countSelectableWeapons(weaponType: (typeof supportedWeapons)[number]["weaponType"]): number {
  return supportedWeapons.filter(
    (weapon) => weapon.weaponType === weaponType && (weapon.rarity === 4 || weapon.rarity === 5)
  ).length
}

async function getProjectedActionEffects(actionId: string): Promise<readonly Record<string, unknown>[]> {
  const response = await app.inject({
    body: { actionId },
    method: "POST",
    url: "/v1/action-effect-options"
  })
  expect(response.statusCode).toBe(200)
  return response.json().options
}

afterAll(async () => {
  await app.close()
})

describe("API", () => {
  it("serializes an event-level elemental application outcome in an analysis response", () => {
    const elementalApplication = {
      applied: true,
      auraElement: "hydro" as const,
      auraId: "target.hydro",
      reaction: "vaporize_reverse" as const
    }
    const elementOverride = {
      baseElement: "physical" as const,
      element: "pyro" as const,
      id: "bennett.c6"
    }
    const hitCountTrace = { after: 4500, before: 1500, hitCount: 3, kind: "hit_count" as const }

    const serialized = serializeRotationEvent({
      appliedEffectIds: ["bennett.field"],
      critDamage: 2,
      elementalApplication,
      element: "pyro",
      elementOverride,
      expectedDamage: 1.5,
      hitCount: 1,
      id: "xiangling.pyronado.tick-1",
      nonCritDamage: 1,
      ownerId: "xiangling.default",
      statSnapshotTime: 0,
      time: 0,
      trace: [hitCountTrace]
    })

    expect(serialized).toMatchObject({ elementalApplication })
    expect(serialized.elementalApplication).not.toBe(elementalApplication)
    expect(serialized).toMatchObject({ elementOverride })
    expect(serialized.elementOverride).not.toBe(elementOverride)
    expect(serialized.trace).toEqual([hitCountTrace])
    expect(serialized.trace[0]).not.toBe(hitCountTrace)
  })

  it("detaches timeline elemental-application metadata from combat content", () => {
    const elementalApplication = { icd: { groupId: "xiangling.pyronado", kind: "standard" as const } }
    const action = {
      characterId: "Xiangling",
      damageKind: "direct" as const,
      damageParts: [{ coefficientParameterId: "pyronado-tick", id: "pyronado-tick" }],
      element: "pyro" as const,
      evaluator: "declared_direct" as const,
      id: "test.xiangling.pyronado",
      kind: "damage" as const,
      scalingStat: "attack" as const,
      status: "verified" as const,
      talentSlot: "burst" as const,
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "pyronado-tick",
            elementalApplication,
            id: "tick-1",
            snapshot: "hit" as const
          }
        ] as const,
        duration: 1
      }
    }

    const serialized = serializeCombatAction(action)
    const serializedApplication = serialized.timeline?.damageEvents[0]?.elementalApplication

    expect(serializedApplication).toEqual(elementalApplication)
    expect(serializedApplication).not.toBe(elementalApplication)
    expect(serializedApplication?.icd).not.toBe(elementalApplication.icd)
  })

  it("serializes a talent-linear event multiplier without leaking maintainer snapshot checks", () => {
    const action = {
      characterId: "Bennett",
      damageKind: "direct" as const,
      damageParts: [{ coefficientParameterId: "test-hit", id: "test-hit" }],
      element: "pyro" as const,
      evaluator: "declared_direct" as const,
      id: "system.talent-linear-multiplier",
      kind: "damage" as const,
      scalingStat: "attack" as const,
      status: "verified" as const,
      talentSlot: "burst" as const,
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              base: 1,
              kind: "scenario_parameter_talent_linear" as const,
              parameterId: "stored-resource",
              perParameterTalentCoefficientId: "per-resource-ratio",
              perParameterTalentCoefficientSnapshotChecks: [
                { expectedCoefficient: 0.004, talentLevel: 1 },
                { expectedCoefficient: 0.004, talentLevel: 10 }
              ]
            },
            damagePartId: "test-hit",
            id: "test-hit",
            snapshot: "cast" as const
          }
        ] as const,
        duration: 1
      }
    }

    const multiplier = serializeCombatAction(action).timeline?.damageEvents[0]?.coefficientMultiplier

    expect(multiplier).toEqual({
      base: 1,
      kind: "scenario_parameter_talent_linear",
      parameterId: "stored-resource",
      perParameterTalentCoefficientId: "per-resource-ratio"
    })
    expect(multiplier).not.toHaveProperty("perParameterTalentCoefficientSnapshotChecks")
  })

  it("reports health", async () => {
    const response = await app.inject({ method: "GET", url: "/health" })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: "ok" })
  })

  it("reports the bundled read-only game-data snapshot", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/game-data/status" })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      counts: {
        artifactSets: 63,
        characterSkillParameterGroups: 1764,
        characterSkillParameters: 46418,
        characters: 119,
        weapons: 247
      },
      gameVersion: "7.0",
      schemaVersion: 2,
      upstreamCommit: "98aafa1f135f086524b611c7d5b5bfb78d98bb6d"
    })
  })

  it("publishes concrete Pyro reaction labels together with a no-reaction metric", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })

    expect(response.statusCode).toBe(200)
    const arlecchino = response.json().characters.find(
      (character: { characterId: string }) => character.characterId === "Arlecchino"
    )
    const labels = arlecchino.primaryActions.map((action: { label: string }) => action.label)
    expect(labels).toEqual(
      expect.arrayContaining([
        expect.stringContaining("无反应"),
        expect.stringContaining("水底蒸发"),
        expect.stringContaining("冰底融化")
      ])
    )
    expect(labels).not.toContain("已验证基础单段伤害")
  })

  it("uses plain no-reaction wording for every public damage metric", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })

    expect(response.statusCode).toBe(200)
    const catalogLabels = response.json().characters.flatMap(
      (character: { primaryActions: readonly { label: string }[] }) =>
        character.primaryActions.map((action) => action.label)
    )
    const labels = [...catalogLabels, ...listCombatMetrics().map((metric) => metric.label)]
    expect(labels.filter((label) =>
      label.includes("无预设反应") || label.includes("反应由场景决定")
    )).toEqual([])
    expect(labels).toContain("所闻遍计 / 灭净三业单次触发 · 无反应")
  })

  it("keeps the startup catalog lightweight and excludes action effect snapshots", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })

    expect(response.statusCode).toBe(200)
    expect(Buffer.byteLength(response.body, "utf8")).toBeLessThan(300_000)
    expect(
      response.json().characters.every((character: { primaryActions: readonly Record<string, unknown>[] }) =>
        character.primaryActions.every((action) => !("scenarioEffects" in action))
      )
    ).toBe(true)
  })

  it("loads action effects on demand and filters them to the configured party sources", async () => {
    const bennett = raidenNationalBuiltinScenario.teammates.find((build) => build.characterId === "Bennett")
    if (!bennett) throw new Error("Expected the built-in Bennett build")
    const primary = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.neuvillette.widsith",
      characterId: "Neuvillette",
      constellation: 0,
      weapon: {
        ...raidenNationalBuiltinScenario.primary.weapon,
        refinement: 5,
        weaponId: "TheWidsith"
      }
    }
    const response = await app.inject({
      body: {
        actionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
        primary,
        teammates: [bennett]
      },
      method: "POST",
      url: "/v1/action-effect-options"
    })

    expect(response.statusCode).toBe(200)
    const options = response.json().options as readonly { id: string }[]
    expect(options.map((option) => option.id)).toEqual(
      expect.arrayContaining([
        "bennett.burst.field",
        "weapon.the-widsith.aria.all-element-damage-bonus"
      ])
    )
    expect(options.map((option) => option.id)).not.toEqual(
      expect.arrayContaining([
        "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
        "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"
      ])
    )

    const raidenResponse = await app.inject({
      body: {
        actionId: "raiden.burst.initial_slash",
        primary: raidenNationalBuiltinScenario.primary,
        teammates: raidenNationalBuiltinScenario.teammates
      },
      method: "POST",
      url: "/v1/action-effect-options"
    })
    expect(raidenResponse.statusCode).toBe(200)
    expect((raidenResponse.json().options as readonly { id: string }[]).map((option) => option.id)).toEqual(
      expect.arrayContaining(["raiden.skill.eye", "bennett.burst.field"])
    )
  })

  it("requires the Slingshot holder to choose one arrow flight-time state", async () => {
    const primary = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.tighnari.slingshot",
      characterId: "Tighnari",
      weapon: {
        ...raidenNationalBuiltinScenario.primary.weapon,
        refinement: 5,
        weaponId: "Slingshot"
      }
    }
    const response = await app.inject({
      body: {
        actionId: "tighnari.normal.wreath_arrow.single_hit.spread",
        primary,
        teammates: []
      },
      method: "POST",
      url: "/v1/action-effect-options"
    })

    expect(response.statusCode).toBe(200)
    const options = (response.json().options as readonly {
      exclusiveGroup?: string
      id: string
      selectionMode?: string
    }[]).filter((option) => option.exclusiveGroup === "slingshot-flight-time")
    expect(options.map((option) => option.id)).toEqual([
      "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
      "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
    ])
    expect(options.every((option) => option.selectionMode === "required")).toBe(true)
  })

  it("exposes Ultimate Overlord's Mega Magic Sword Melusine progress as an optional Buff choice", async () => {
    const primary = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.noelle.ultimate-overlord",
      characterId: "Noelle",
      weapon: {
        ...raidenNationalBuiltinScenario.primary.weapon,
        refinement: 5,
        weaponId: "UltimateOverlordsMegaMagicSword"
      }
    }
    const response = await app.inject({
      body: {
        actionId: "noelle.burst.sweeping_time.normal_attack_combo",
        primary,
        teammates: []
      },
      method: "POST",
      url: "/v1/action-effect-options"
    })

    expect(response.statusCode).toBe(200)
    const options = (response.json().options as readonly {
      exclusiveGroup?: string
      id: string
      selectionMode?: string
    }[]).filter((option) => option.exclusiveGroup === "ultimate-overlords-mega-magic-sword-melusine")
    expect(options).toHaveLength(12)
    expect(options.every((option) => option.selectionMode === "optional")).toBe(true)
  })

  it("projects mutually exclusive weapon Buff variants through the action-effect API", async () => {
    const primary = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.neuvillette.cashflow-buff",
      characterId: "Neuvillette",
      weapon: {
        ...raidenNationalBuiltinScenario.primary.weapon,
        refinement: 1,
        weaponId: "CashflowSupervision"
      }
    }
    const response = await app.inject({
      body: {
        actionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
        primary,
        teammates: []
      },
      method: "POST",
      url: "/v1/action-effect-options"
    })

    expect(response.statusCode).toBe(200)
    const options = (response.json().options as readonly {
      exclusiveGroup?: string
      exclusiveVariant?: string
      selectionMode?: string
    }[]).filter((option) => option.exclusiveGroup === "cashflow-supervision-hp-change")
    expect(options.map((option) => option.exclusiveVariant)).toEqual(["1-stack", "2-stack", "3-stack"])
    expect(options.every((option) => option.selectionMode === "optional")).toBe(true)
  })

  it("exposes the complete combat coverage graph without relying on a character-by-character fixture list", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/combat-coverage" })

    expect(response.statusCode, response.body).toBe(200)
    const coverage = response.json() as {
      readonly characterStatusCounts: Readonly<Record<string, number>>
      readonly characters: readonly {
        readonly actions: readonly { readonly characterId: string; readonly id: string; readonly kind: string; readonly status: string }[]
        readonly canCalculateDamage: boolean
        readonly characterId: string
        readonly maintainedStatus: string
        readonly metrics: readonly { readonly label: string; readonly sourceActionId: string; readonly status: string }[]
        readonly status: string
        readonly verifiedActionCount: number
        readonly verifiedMetricCount: number
      }[]
      readonly totalCharacters: number
      readonly verifiedActionCount: number
      readonly verifiedMetricCount: number
    }

    expect(coverage.characters).toHaveLength(coverage.totalCharacters)
    expect(new Set(coverage.characters.map((character) => character.characterId)).size).toBe(coverage.totalCharacters)
    expect(Object.values(coverage.characterStatusCounts).reduce((total, count) => total + count, 0)).toBe(
      coverage.totalCharacters
    )
    expect(coverage.verifiedActionCount).toBe(
      coverage.characters.reduce(
        (total, character) => total + character.actions.filter((action) => action.status === "verified").length,
        0
      )
    )
    expect(coverage.verifiedMetricCount).toBe(
      coverage.characters.reduce(
        (total, character) => total + character.metrics.filter((metric) => metric.status === "verified").length,
        0
      )
    )
    expect(
      coverage.characters.flatMap((character) => character.metrics.map((metric) => metric.label)).some(
        (label) => /C0|0命|零命/.test(label)
      )
    ).toBe(false)

    for (const character of coverage.characters) {
      const actionIds = new Set(character.actions.map((action) => action.id))

      expect(actionIds.size).toBe(character.actions.length)
      expect(character.status).toBe(character.maintainedStatus)
      expect(character.verifiedActionCount).toBe(character.actions.filter((action) => action.status === "verified").length)
      expect(character.verifiedMetricCount).toBe(character.metrics.filter((metric) => metric.status === "verified").length)
      expect(character.canCalculateDamage).toBe(
        character.actions.some((action) => action.kind === "damage" && action.status === "verified")
      )
      for (const action of character.actions) expect(action.characterId).toBe(character.characterId)
      for (const metric of character.metrics) {
        expect(metric.label.trim()).not.toHaveLength(0)
        expect(actionIds.has(metric.sourceActionId)).toBe(true)
      }
    }
  })

  it("projects exactly the maintainer-selected damage metric action set into the browser catalog", async () => {
    const [coverageResponse, catalogResponse] = await Promise.all([
      app.inject({ method: "GET", url: "/v1/combat-coverage" }),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(coverageResponse.statusCode).toBe(200)
    expect(catalogResponse.statusCode).toBe(200)
    const coverage = coverageResponse.json() as {
      readonly characters: readonly {
        readonly actions: readonly {
          readonly id: string
          readonly kind: string
          readonly scenarioParameters?: unknown
          readonly status: string
        }[]
        readonly characterId: string
        readonly metrics: readonly {
          readonly kind: string
          readonly sourceActionId: string
          readonly status: string
        }[]
        readonly weaponType: string
      }[]
    }
    const catalog = catalogResponse.json() as {
      readonly characters: readonly {
        readonly characterId: string
        readonly label: string
        readonly primaryActionIds: readonly string[]
        readonly primaryActions: readonly {
          readonly id: string
          readonly label: string
          readonly scenarioParameters?: unknown
        }[]
        readonly weaponType: string
      }[]
    }
    const expectedActions = [
      ...new Set(
        listCombatMetrics()
          .filter((metric) => metric.kind === "damage" && metric.status === "verified")
          .map((metric) => [metric.characterId, metric.sourceActionId].join(":"))
      )
    ].sort()
    const catalogActions = catalog.characters
      .flatMap((character) => character.primaryActionIds.map((actionId) => [character.characterId, actionId].join(":")))
      .sort()
    const coverageByCharacterId = new Map(coverage.characters.map((character) => [character.characterId, character]))
    const actionById = new Map(listCombatActions().map((action) => [action.id, action]))

    expect(catalogActions).toEqual(expectedActions)
    expect(new Set(catalog.characters.map((character) => character.characterId)).size).toBe(catalog.characters.length)
    for (const character of catalog.characters) {
      const coverageCharacter = coverageByCharacterId.get(character.characterId)

      expect(coverageCharacter).toBeDefined()
      expect(character.label.trim()).not.toHaveLength(0)
      expect(character.weaponType).toBe(coverageCharacter?.weaponType)
      expect(character.primaryActionIds).toEqual(character.primaryActions.map((action) => action.id))
      expect(new Set(character.primaryActionIds).size).toBe(character.primaryActionIds.length)
      for (const action of character.primaryActions) {
        const registryAction = actionById.get(action.id)

        expect(action.label.trim()).not.toHaveLength(0)
        const publicScenarioParameters = registryAction?.scenarioParameters?.map(
          ({ minimumSourceConstellationByValue: _minimumSourceConstellationByValue, ...parameter }) => parameter
        )
        expect(action.scenarioParameters).toEqual(publicScenarioParameters)
      }
    }
  })

  it("projects verified Bennett support metrics with their explicit recipient conditions", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })
    const bennett = response.json().characters.find((character: { readonly characterId: string }) => character.characterId === "Bennett")

    expect(response.statusCode).toBe(200)
    expect(bennett?.supportMetrics).toEqual([
      expect.objectContaining({
        id: "bennett.burst.field.heal_tick",
        kind: "healing",
        recipientRequirements: expect.arrayContaining([
          expect.objectContaining({ kind: "recipient_in_source_area" }),
          expect.objectContaining({ kind: "recipient_hp_fraction", threshold: 0.7 })
        ]),
        sourceActionId: "bennett.burst.field",
        target: "friendly_recipient"
      }),
      expect.objectContaining({
        id: "bennett.burst.field.attack_buff",
        kind: "stat_buff",
        sourceActionId: "bennett.burst.field",
        target: "friendly_recipient"
      })
    ])
  })

  it("projects Furina's constellation-sensitive Fanfare bounds into the browser catalog", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })
    const furina = response.json().characters.find((character: { readonly characterId: string }) => character.characterId === "Furina")
    const fanfareMetric = furina?.supportMetrics.find(
      (metric: { readonly id: string }) => metric.id === "furina.burst.let_the_people_rejoice.fanfare.damage_bonus"
    )
    const fanfareParameter = fanfareMetric?.scenarioParameters?.find(
      (parameter: { readonly id: string }) => parameter.id === "fanfare-points"
    )

    expect(response.statusCode).toBe(200)
    expect(fanfareMetric?.label).toBe("万众狂欢 / 气氛值全伤害加成")
    expect(fanfareParameter).toEqual({
      defaultValue: 300,
      id: "fanfare-points",
      label: "当前气氛值（C0：0–300点；C1及以上：施放元素爆发后初始150点，最多400点）",
      maximumValue: 300,
      minimumValue: 0,
      rangeBySourceConstellation: [
        {
          defaultValue: 400,
          maximumValue: 400,
          minimumSourceConstellation: 1,
          minimumValue: 150
        }
      ]
    })
  })

  it("projects content-owned Xiangling snapshots through the action effect endpoint", async () => {
    const scenarioEffects = await getProjectedActionEffects("xiangling.burst.pyronado.reverse_vaporize")

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "xiangling.guoba.chili.attack",
          label: "绝云朝天椒（已拾取）",
          source: { characterId: "Xiangling", kind: "character" }
        }),
        expect.objectContaining({
          id: "xiangling.guoba.c1.pyro_resistance_shred",
          source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 1 }
        })
      ])
    )
  })

  it("projects equipment-owned current-action snapshots through the action effect endpoint", async () => {
    const scenarioEffects = await getProjectedActionEffects("xiangling.burst.pyronado.reverse_vaporize")

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
          source: { holder: "party_member", kind: "weapon", weaponId: "WolfsGravestone" }
        }),
        expect.objectContaining({
          id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
          recipientSourceRelation: "not_source",
          source: { holder: "party_member", kind: "weapon", weaponId: "ThrillingTalesOfDragonSlayers" }
        }),
        expect.objectContaining({
          id: "artifact.noblesse-oblige.4pc-attack",
          source: {
            holder: "party_member",
            kind: "artifact_set",
            minimumPieces: 4,
            setId: "NoblesseOblige"
          }
        }),
        expect.objectContaining({
          id: "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus",
          source: {
            holder: "party_member",
            kind: "artifact_set",
            minimumPieces: 4,
            setId: "ArchaicPetra"
          }
        })
      ])
    )
    expect(scenarioEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge" })
      ])
    )
  })

  it("exposes fully reviewed three-star weapons for character configuration", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })

    expect(response.statusCode).toBe(200)
    expect(response.json().weapons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "讨龙英杰谭",
          rarity: 3,
          weaponId: "ThrillingTalesOfDragonSlayers",
          weaponType: "catalyst"
        })
      ])
    )
  })

  it("projects Skyward Spine's cooldown-ready Vacuum Blade only for eligible normal or charged targets", async () => {
    const scenarioEffects = await getProjectedActionEffects(
      "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.skyward-spine.vacuum-blade",
          label: "天空之脊 · 真空刃（2秒冷却已就绪）",
          source: { kind: "weapon", weaponId: "SkywardSpine" }
        })
      ])
    )
  })

  it("keeps browser catalog weapon types aligned with the pinned game-data snapshot", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/catalog" })
    const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

    try {
      expect(response.statusCode).toBe(200)
      for (const character of response.json().characters as Array<{ characterId: string; weaponType: string }>) {
        expect(gameData.getCharacter(character.characterId)?.weaponType).toBe(character.weaponType)
      }
    } finally {
      gameData.close()
    }
  })

  it("reports structural combat-authoring work without binding Traveler variants automatically", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/combat-authoring/audit" })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      readinessCounts: {
        missing_talent_parameters: 0,
        ready_for_semantic_authoring: 118,
        requires_explicit_variant_binding: 1
      },
      totalStaticCharacters: 119,
      unboundTalentParameterOwnerIds: [
        "TravelerAnemoF",
        "TravelerAnemoM",
        "TravelerCryoF",
        "TravelerCryoM",
        "TravelerDendroF",
        "TravelerDendroM",
        "TravelerElectroF",
        "TravelerElectroM",
        "TravelerGeoF",
        "TravelerGeoM",
        "TravelerHydroF",
        "TravelerHydroM",
        "TravelerPyroF",
        "TravelerPyroM"
      ]
    })
    expect(response.json().characters.find((character: { staticCharacterId: string }) => character.staticCharacterId === "Traveler"))
      .toMatchObject({
        readiness: "requires_explicit_variant_binding",
        selectedTalentParameterOwnerId: null,
        staticCharacterId: "Traveler"
      })
  })

  it("does not expose the removed Foundation evaluation route", async () => {
    const response = await app.inject({
      method: "POST",
      payload: { presetId: "raiden-national.initial-slash" },
      url: "/v1/evaluations"
    })

    expect(response.statusCode).toBe(404)
  })

  it("returns the normalized built-in scenario", async () => {
    const response = await app.inject({ method: "GET", url: "/v1/presets" })

    expect(response.statusCode).toBe(200)
    expect(response.json().presets[0]).toMatchObject({
      id: "raiden-national.initial-slash",
      scenario: {
        conditions: { actionParameters: { "resolve-stack-count": 60 }, enemyCount: 1 },
        primary: { characterId: "RaidenShogun" },
        teammates: [{ characterId: "Bennett" }, { characterId: "Xiangling" }, { characterId: "Xingqiu" }]
      }
    })
  })

  it("evaluates Bennett's field single-tick healing through the typed support metric endpoint", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const scenario = presetResponse.json().presets[0].scenario
    const bennett = scenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Bennett")
    if (!bennett) throw new Error("Missing Bennett built-in configuration")
    const response = await app.inject({
      method: "POST",
      payload: {
        build: bennett,
        context: {
          recipient: {
            buildId: scenario.primary.buildId,
            currentHpFraction: 0.5,
            isWithinSourceArea: true,
            missingHp: 1000
          },
          teammates: [scenario.primary]
        },
        metricId: "bennett.burst.field.heal_tick"
      },
      url: "/v1/support-metrics/evaluate"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json()).toMatchObject({
      engineVersion: "support-metric-1",
      metric: {
        conditions: expect.arrayContaining([
          expect.objectContaining({ kind: "recipient_in_source_area", satisfied: true }),
          expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, threshold: 0.7 })
        ]),
        actualRestoredFormula: expect.objectContaining({ kind: "minimum" }),
        actualRestoredValue: 1000,
        formula: expect.objectContaining({ kind: "condition", satisfied: true }),
        id: "bennett.burst.field.heal_tick",
        kind: "healing",
        recipient: { buildId: scenario.primary.buildId, characterId: "RaidenShogun", kind: "friendly_recipient" },
        unit: "hp"
      }
    })
    expect(response.json().metric.value).toBeGreaterThan(0)
  })

  it("evaluates Bennett's C1 field attack contribution independently from healing", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const scenario = presetResponse.json().presets[0].scenario
    const bennett = scenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Bennett")
    if (!bennett) throw new Error("Missing Bennett built-in configuration")
    const response = await app.inject({
      method: "POST",
      payload: {
        build: bennett,
        context: {
          recipient: {
            buildId: scenario.primary.buildId,
            currentHpFraction: 0.5,
            isWithinSourceArea: true
          },
          teammates: [scenario.primary]
        },
        metricId: "bennett.burst.field.attack_buff"
      },
      url: "/v1/support-metrics/evaluate"
    })

    expect(response.statusCode, response.body).toBe(200)
    expect(response.json()).toMatchObject({
      engineVersion: "support-metric-1",
      metric: {
        affectedStat: "attack_flat",
        conditions: expect.arrayContaining([
          expect.objectContaining({ kind: "recipient_in_source_area", satisfied: true }),
          expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, waived: true })
        ]),
        formula: expect.objectContaining({ kind: "condition", satisfied: true }),
        id: "bennett.burst.field.attack_buff",
        kind: "stat_buff",
        ratioConstellationBonus: 0.2,
        recipient: { buildId: scenario.primary.buildId, characterId: "RaidenShogun", kind: "friendly_recipient" },
        unit: "attack"
      }
    })
    expect(response.json().metric.value).toBeGreaterThan(0)
  })

  it("returns target damage, weapon comparisons, and marginal substat gains", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const scenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({ method: "POST", payload: scenario, url: "/v1/analysis" })

    expect(response.statusCode).toBe(200)
    expect(response.json().engineVersion).toBe("scenario-1")
    expect(response.json().evaluation.appliedBuffs.map((buff: { label: string }) => buff.label)).toEqual(["热诚之火"])
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "bennett.burst.field.attack_bonus" }),
        expect.objectContaining({ id: "bennett.constellation.1.grand_expectation.field_attack_bonus" }),
        expect.objectContaining({ id: "artifact.noblesse-oblige.4pc-attack", value: 0.2 }),
        expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge", value: 0.3 })
      ])
    )
    expect(response.json().analysis.baselineExpectedDamage).toBeGreaterThan(140_000)
    expect(response.json().evaluation.rotation.events).toHaveLength(1)
    expect(response.json().evaluation.rotation.dpr).toBeCloseTo(response.json().analysis.baselineExpectedDamage)
    expect(response.json().analysis.weapons).toHaveLength(countSelectableWeapons("polearm"))
    expect(response.json().analysis.marginalSubstats).toHaveLength(11)
    const elementalDamageBonus = response.json().analysis.marginalSubstats.find(
      (result: { stat: string }) => result.stat === "electro_damage_bonus"
    )
    expect(elementalDamageBonus).toMatchObject({ averageRoll: 0.05, label: "雷元素伤害加成" })
    expect(elementalDamageBonus.gainRatio).toBeGreaterThan(0)
  })

  it("returns Xiangling's one-hit Hydro-aura Vaporize Pyronado through the same analysis path", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          ...presetScenario.conditions,
          actionParameters: undefined,
          activeEffectIds: [
            "bennett.burst.field",
            "xiangling.guoba.chili.attack",
            "xiangling.guoba.c1.pyro_resistance_shred"
          ]
        },
        primary: xiangling,
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: [
          presetScenario.primary,
          ...presetScenario.teammates.filter((build: { characterId: string }) => build.characterId !== "Xiangling")
        ]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.the-catch.burst-crit-rate", value: 0.12 }),
        expect.objectContaining({ id: "weapon.the-catch.burst-damage-bonus", value: 0.32 }),
        expect.objectContaining({ id: "artifact.emblem-of-severed-fate.2pc.energy-recharge", value: 0.2 }),
        expect.objectContaining({ id: "xiangling.constellation.3.burst-talent-level", value: 3 }),
        expect.objectContaining({ id: "xiangling.guoba.chili.attack", value: 0.1 }),
        expect.objectContaining({ id: "xiangling.guoba.c1.pyro_resistance_shred", value: 0.15 })
      ])
    )
    expect(response.json().evaluation.stats.resistanceReduction).toBeCloseTo(0.15)
    expect(response.json().evaluation.result.trace.map((entry: { stage: string }) => entry.stage)).toContain(
      "amplifying_reaction"
    )
    const rotationTrace = response.json().evaluation.rotation.events[0]?.trace as Array<Record<string, unknown>>
    const amplifying = rotationTrace.find((entry) => entry.kind === "amplifying_reaction")
    const defense = rotationTrace.find((entry) => entry.kind === "defense")
    const resistance = rotationTrace.find((entry) => entry.kind === "resistance")

    expect(amplifying).toMatchObject({
      baseMultiplier: 1.5,
      elementalMastery: expect.any(Number),
      kind: "amplifying_reaction",
      reaction: "vaporize_reverse"
    })
    expect(defense).toMatchObject({ attackerLevel: 90, enemyLevel: 100, kind: "defense" })
    expect(resistance).toMatchObject({
      baseResistance: expect.any(Number),
      effectiveResistance: expect.any(Number),
      kind: "resistance",
      resistance: expect.any(Number),
      resistanceReduction: expect.any(Number)
    })
    expect(resistance?.resistance).toBe(resistance?.effectiveResistance)
    expect(resistance?.resistanceReduction).toBeCloseTo(0.15)
    expect(resistance?.effectiveResistance).toBeCloseTo(
      (resistance?.baseResistance as number) - (resistance?.resistanceReduction as number)
    )
    expect(
      response.json().analysis.marginalSubstats.find((result: { stat: string }) => result.stat === "elemental_mastery")
        ?.gainRatio
    ).toBeGreaterThan(0)
    const elementalDamageBonus = response.json().analysis.marginalSubstats.find(
      (result: { stat: string }) => result.stat === "pyro_damage_bonus"
    )
    expect(elementalDamageBonus).toMatchObject({ averageRoll: 0.05, label: "火元素伤害加成" })
    expect(elementalDamageBonus.gainRatio).toBeGreaterThan(0)
  })

  it("automatically derives Engulfing Lightning's post-burst state for Xiangling Pyronado", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const primary = {
      ...xiangling,
      buildId: "test.xiangling.engulfing-lightning-auto-api",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
    }
    const basePayload = {
      ...presetScenario,
      conditions: { activeEffectIds: [], enemyCount: 1 },
      externalBuffs: [],
      primary,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }
    const [automaticResponse, explicitResponse] = await Promise.all([
      app.inject({ method: "POST", payload: basePayload, url: "/v1/analysis" }),
      app.inject({
        method: "POST",
        payload: {
          ...basePayload,
          conditions: {
            ...basePayload.conditions,
            activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
          }
        },
        url: "/v1/analysis"
      })
    ])

    expect(automaticResponse.statusCode).toBe(200)
    expect(explicitResponse.statusCode).toBe(200)
    const automaticEvaluation = automaticResponse.json().evaluation
    const explicitEvaluation = explicitResponse.json().evaluation

    expect(automaticEvaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.engulfing-lightning.post-burst-energy-recharge",
          target: "energyRecharge",
          value: 0.3
        }),
        expect.objectContaining({
          id: "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus",
          target: "damageBonus",
          value: 0.64232
        })
      ])
    )
    expect(automaticEvaluation.stats.energyRecharge).toBeCloseTo(2.56928)
    expect(automaticEvaluation.result.expectedDamage).toBeCloseTo(explicitEvaluation.result.expectedDamage)
  })

  it("keeps Crimson Moon ahead of Disaster and Remorse for Arlecchino in a non-Hexerei team", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const bennett = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Bennett")
    const arlecchino = {
      ...xiangling,
      buildId: "test.arlecchino.crimson-moon-api",
      characterId: "Arlecchino",
      level: 80,
      talents: { ...xiangling.talents, normal: 8 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "CrimsonMoonsSemblance" }
    }
    const zhongli = {
      ...presetScenario.primary,
      buildId: "test.zhongli.crimson-moon-api",
      characterId: "Zhongli"
    }
    const basePayload = {
      ...presetScenario,
      conditions: {
        actionParameters: { "bond-of-life-percent": 100 },
        activeEffectIds: [
          "weapon.crimson-moons-semblance.bond-of-life.at-least-thirty-percent.damage-bonus"
        ],
        enemyCount: 1,
        equipmentEffectMode: "maximum_reachable"
      },
      externalBuffs: [],
      primary: arlecchino,
      targetActionId: "arlecchino.normal.masque_of_the_red_death.first_hit.full_bond.no_reaction",
      teammates: [zhongli, bennett, xiangling]
    }
    const [defaultResponse, refinedResponse] = await Promise.all([
      app.inject({ method: "POST", payload: basePayload, url: "/v1/analysis" }),
      app.inject({
        method: "POST",
        payload: { ...basePayload, weaponComparisonRefinements: { CrimsonMoonsSemblance: 5 } },
        url: "/v1/analysis"
      })
    ])

    expect(defaultResponse.statusCode).toBe(200)
    expect(refinedResponse.statusCode).toBe(200)
    const body = defaultResponse.json()
    const refinedBody = refinedResponse.json()
    const crimsonMoon = body.analysis.weapons.find(
      (weapon: { weaponId: string }) => weapon.weaponId === "CrimsonMoonsSemblance"
    )
    const disasterAndRemorse = body.analysis.weapons.find(
      (weapon: { weaponId: string }) => weapon.weaponId === "DisasterAndRemorse"
    )
    expect(body.evaluation.teamState.hexereiSecretRite).toBe(false)
    expect(body.evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionParameterId: "bond-of-life-percent",
          id: "weapon.crimson-moons-semblance.charged-hit.bond-of-life",
          target: "actionParameter",
          value: 25
        })
      ])
    )
    const refinedCrimsonMoon = refinedBody.analysis.weapons.find(
      (weapon: { weaponId: string }) => weapon.weaponId === "CrimsonMoonsSemblance"
    )
    expect(crimsonMoon).toMatchObject({ refinement: 1 })
    expect(crimsonMoon.expectedDamage).toBeGreaterThan(disasterAndRemorse.expectedDamage)
    expect(refinedCrimsonMoon).toMatchObject({ refinement: 5 })
    expect(refinedCrimsonMoon.expectedDamage).toBeGreaterThan(crimsonMoon.expectedDamage)
    expect(body.analysis.progressionGains.map((gain: { id: string }) => gain.id)).toEqual(
      expect.arrayContaining(["talent.normal.9", "character-level.90", "character-level.95", "character-level.100"])
    )
    expect(body.evaluation.stats.statContributions.map((contribution: { label: string }) => contribution.label)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("空之杯主词条 · 火元素伤害加成"),
        "固有天赋 · 唯有厄月知晓"
      ])
    )
  })

  it("keeps a partial-party Xiangling Burst analysis available while excluding full-party-energy weapon candidates", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: [],
          enemyCount: 1
        },
        externalBuffs: [],
        primary: xiangling,
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().analysis.baselineExpectedDamage).toBeGreaterThan(0)
    expect(response.json().analysis.weapons.some((weapon: { weaponId: string }) => weapon.weaponId === "WavebreakersFin")).toBe(
      false
    )
  })

  it("applies Ballad of the Fjords only when the public scenario configures three team elements", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const xingqiu = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xingqiu")
    const primary = {
      ...xiangling,
      buildId: "test.xiangling.ballad-of-the-fjords-api",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "BalladOfTheFjords" }
    }
    const requestWithTeammates = async (teammates: readonly unknown[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds: [], enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates
        },
        url: "/v1/analysis"
      })

    const twoElementResponse = await requestWithTeammates([presetScenario.primary])
    const threeElementResponse = await requestWithTeammates([presetScenario.primary, xingqiu])

    expect(twoElementResponse.statusCode).toBe(200)
    expect(twoElementResponse.json().evaluation.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.ballad-of-the-fjords.team-elemental-mastery" })])
    )
    expect(threeElementResponse.statusCode).toBe(200)
    expect(threeElementResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
          target: "elementalMastery",
          value: 240
        })
      ])
    )
    expect(threeElementResponse.json().evaluation.stats.elementalMastery).toBeCloseTo(
      twoElementResponse.json().evaluation.stats.elementalMastery + 240
    )
  })

  it("applies a selected party-owned Archaic Petra crystallize snapshot through the public endpoint", async () => {
    const effectId = "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const archaicPetraHolder = {
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "ArchaicPetra"
      })),
      buildId: "test.raiden.archaic-petra-holder"
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: [effectId],
          activeEffectSourceBuildIds: { [effectId]: archaicPetraHolder.buildId },
          enemyCount: 1
        },
        externalBuffs: [],
        primary: xiangling,
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: [archaicPetraHolder]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: archaicPetraHolder.buildId, target: "damageBonus", value: 0.35 })
      ])
    )
  })

  it("applies Elegy's selected full-sigil teammate snapshots through the public endpoint", async () => {
    const activeEffectIds = [
      "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
      "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery"
    ]
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const elegyHolder = {
      ...presetScenario.primary,
      buildId: "test.venti.elegy-r5-api",
      characterId: "Venti",
      label: "温迪 终末嗟叹之诗 API 测试",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "ElegyForTheEnd" }
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds,
          activeEffectSourceBuildIds: Object.fromEntries(activeEffectIds.map((effectId) => [effectId, elegyHolder.buildId])),
          enemyCount: 1
        },
        externalBuffs: [],
        primary: xiangling,
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: [elegyHolder]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
          sourceId: elegyHolder.buildId,
          target: "attackPercent",
          value: 0.4
        }),
        expect.objectContaining({
          id: "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery",
          sourceId: elegyHolder.buildId,
          target: "elementalMastery",
          value: 200
        })
      ])
    )
    expect(response.json().evaluation.stats.attackPercent).toBeGreaterThanOrEqual(0.4)
    expect(response.json().evaluation.stats.elementalMastery).toBeGreaterThanOrEqual(200)
  })

  it("applies Astral Vulture's Crimson Plumage at the configured different-element teammate tier", async () => {
    const effectId = "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.charged-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const bennett = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Bennett")
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const xingqiu = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xingqiu")
    const ganyu = {
      ...xiangling,
      buildId: "test.ganyu.astral-vultures-api",
      characterId: "Ganyu",
      talents: { ...xiangling.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "AstralVulturesCrimsonPlumage" }
    }
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { activeEffectIds: [], enemyCount: 1 },
        externalBuffs: [],
        primary: ganyu,
        targetActionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
        teammates: [bennett, xingqiu]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, target: "damageBonus", value: 0.96 })])
    )
  })

  it("returns an action-filtered C6 Crit DMG effect through the public analysis endpoint", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [], enemyCount: 1 },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.arataki-itto.c6-api",
          characterId: "AratakiItto",
          constellation: 6,
          label: "荒泷一斗 C6 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
        },
        targetActionId: "arataki_itto.burst.royal_descent.arataki_kesagiri_chain_and_final",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "arataki_itto.constellation.6.arataki_kesagiri.crit_damage",
          target: "critDamage",
          value: 0.7
        })
      ])
    )
  })

  it("returns Redhorn's same-hit defense term without creating an independent rotation event", async () => {
    const effectId = "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [], enemyCount: 1 },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.noelle.redhorn-same-hit-api",
          characterId: "Noelle",
          constellation: 0,
          label: "诺艾尔 赤角石溃杵 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RedhornStonethresher" }
        },
        targetActionId: "noelle.normal.auto.first_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    const evaluation = response.json().evaluation as {
      readonly appliedEffects: readonly Record<string, unknown>[]
      readonly rotation: {
        readonly events: readonly { readonly id: string; readonly trace: readonly Record<string, unknown>[] }[]
      }
    }
    const scalingTrace = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, scalingStat: "defense", target: "matchedActionAdditiveDamageTerm", value: 0.4 })
      ])
    )
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.rotation.events[0]?.id).not.toContain(effectId)
    expect(scalingTrace).toMatchObject({
      kind: "scaling_terms",
      terms: expect.arrayContaining([
        expect.objectContaining({
          coefficient: 0.4,
          label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
          stat: "defense"
        })
      ])
    })
  })

  it("returns Cinnabar Spindle's selected Albedo single-hit term without publishing a new rotation event", async () => {
    const effectId = "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            buildId: `test.albedo.cinnabar-spindle.${activeEffectIds.length > 0 ? "active" : "inactive"}-api`,
            characterId: "Albedo",
            constellation: 0,
            label: "阿贝多 辰砂之纺锤 API 测试",
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "CinnabarSpindle" }
          },
          targetActionId: "albedo.skill.transient_blossom",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const inactiveResponse = await requestAnalysis([])
    const activeResponse = await requestAnalysis([effectId])

    expect(inactiveResponse.statusCode).toBe(200)
    expect(activeResponse.statusCode).toBe(200)
    const evaluation = activeResponse.json().evaluation as {
      readonly appliedEffects: readonly Record<string, unknown>[]
      readonly rotation: {
        readonly dpr: number
        readonly events: readonly { readonly id: string; readonly trace: readonly Record<string, unknown>[] }[]
      }
    }
    const scalingTrace = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling_terms")

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, scalingStat: "defense", target: "matchedActionAdditiveDamageTerm", value: 0.4 })
      ])
    )
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.rotation.events[0]?.id).not.toContain(effectId)
    expect(scalingTrace).toMatchObject({
      kind: "scaling_terms",
      terms: expect.arrayContaining([expect.objectContaining({ coefficient: 0.4, stat: "defense" })])
    })
    expect(evaluation.rotation.dpr).toBeGreaterThan(inactiveResponse.json().evaluation.rotation.dpr)
  })

  it("returns Staff of Homa's automatic and selected low-HP conversions through the public analysis endpoint", async () => {
    const lowHpEffectId = "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.hu-tao.staff-of-homa-api",
      characterId: "HuTao",
      constellation: 0,
      label: "胡桃 护摩之杖 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "StaffOfHoma" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const noLowHpResponse = await requestAnalysis([])
    const lowHpResponse = await requestAnalysis([lowHpEffectId])

    expect(noLowHpResponse.statusCode).toBe(200)
    expect(lowHpResponse.statusCode).toBe(200)

    const noLowHpEvaluation = noLowHpResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly flatAttack: number }
    }
    const lowHpEvaluation = lowHpResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly flatAttack: number }
    }
    const automaticConversion = noLowHpEvaluation.appliedEffects.find(
      (effect) => effect.id === "weapon.staff-of-homa.hp-sourced-flat-attack"
    )
    const selectedConversion = lowHpEvaluation.appliedEffects.find((effect) => effect.id === lowHpEffectId)

    expect(noLowHpEvaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.staff-of-homa.hp-percent", target: "hpPercent", value: 0.2 }),
        expect.objectContaining({
          id: "weapon.staff-of-homa.hp-sourced-flat-attack",
          target: "flatAttack",
          value: expect.any(Number)
        })
      ])
    )
    expect(noLowHpEvaluation.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: lowHpEffectId })]))
    expect(automaticConversion?.value).toBeGreaterThan(0)
    expect(selectedConversion).toMatchObject({ id: lowHpEffectId, target: "flatAttack" })
    expect(selectedConversion?.value).toBeCloseTo((automaticConversion?.value as number) * 1.25)
    expect(lowHpEvaluation.stats.flatAttack - noLowHpEvaluation.stats.flatAttack).toBeCloseTo(selectedConversion?.value as number)
  })

  it("materializes Key of Khaj-Nisut's selected final-HP elemental mastery through the public analysis endpoint", async () => {
    const effectId = "weapon.key-of-khaj-nisut.grand-hymn.3-stack.final-hp-to-elemental-mastery"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.nilou.key-of-khaj-nisut-api",
      characterId: "Nilou",
      constellation: 0,
      label: "妮露 圣显之钥 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "KeyOfKhajNisut" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "nilou.skill.dance_of_haftkarsvar.initial_hit",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const stackedResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(stackedResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as { readonly stats: { readonly elementalMastery: number } }
    const stackedEvaluation = stackedResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly elementalMastery: number }
    }
    const effect = stackedEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, target: "elementalMastery", value: expect.any(Number) })
    expect(effect?.value).toBeGreaterThan(0)
    expect(stackedEvaluation.stats.elementalMastery - baselineEvaluation.stats.elementalMastery).toBeCloseTo(
      effect?.value as number
    )
  })

  it("uses a teammate Key of Khaj-Nisut holder's final HP for the selected party elemental mastery through the API", async () => {
    const effectId = "weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.xiangling.key-of-khaj-nisut-api-recipient",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱 圣显之钥队伍受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheCatch" }
    }
    const keyHolder = {
      ...presetScenario.primary,
      buildId: "test.nilou.key-of-khaj-nisut-api-source",
      characterId: "Nilou",
      constellation: 0,
      label: "妮露 圣显之钥队伍来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "KeyOfKhajNisut" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: [keyHolder]
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode, baselineResponse.body).toBe(200)
    expect(snapshotResponse.statusCode, snapshotResponse.body).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as { readonly stats: { readonly elementalMastery: number } }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly elementalMastery: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ sourceId: keyHolder.buildId, target: "elementalMastery", value: expect.any(Number) })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.elementalMastery - baselineEvaluation.stats.elementalMastery).toBeCloseTo(
      effect?.value as number
    )
  })

  it("materializes Jadefall's Splendor's selected final-HP own-element damage bonus through the public analysis endpoint", async () => {
    const effectId = "weapon.jadefalls-splendor.after-burst-or-shield.final-hp-to-own-element-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.baizhu.jadefalls-splendor-api",
      characterId: "Baizhu",
      constellation: 0,
      label: "白术 碧落之珑 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "JadefallsSplendor" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "baizhu.skill.universal_diagnosis.gossamer_sprite.initial_hit",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as { readonly stats: { readonly damageBonus: number } }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly damageBonus: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, target: "damageBonus", value: expect.any(Number) })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.damageBonus - baselineEvaluation.stats.damageBonus).toBeCloseTo(effect?.value as number)
  })

  it("materializes Ring of Yaxche's selected final-HP normal-attack damage bonus through the public analysis endpoint", async () => {
    const effectId = "weapon.ring-of-yaxche.after-skill.final-hp-to-normal-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.mualani.ring-of-yaxche-api",
      characterId: "Mualani",
      constellation: 0,
      label: "玛拉妮 木棉之环 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "RingOfYaxche" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as { readonly stats: { readonly damageBonus: number } }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly damageBonus: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, target: "damageBonus", value: expect.any(Number) })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.damageBonus - baselineEvaluation.stats.damageBonus).toBeCloseTo(effect?.value as number)
  })

  it("materializes Staff of the Scarlet Sands' automatic and selected elemental-mastery attack conversions through the API", async () => {
    const automaticEffectId = "weapon.staff-of-the-scarlet-sands.elemental-mastery-to-flat-attack"
    const threeStackEffectId = "weapon.staff-of-the-scarlet-sands.red-sands-dream.3-stack.elemental-mastery-to-flat-attack"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.xiangling.staff-of-the-scarlet-sands-api",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱 赤沙之杖 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "StaffOfTheScarletSands" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([threeStackEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly flatAttack: number }
    }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly flatAttack: number }
    }
    const automaticEffect = baselineEvaluation.appliedEffects.find((candidate) => candidate.id === automaticEffectId)
    const threeStackEffect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === threeStackEffectId)

    expect(automaticEffect).toMatchObject({ id: automaticEffectId, target: "flatAttack", value: expect.any(Number) })
    expect(automaticEffect?.value).toBeGreaterThan(0)
    expect(threeStackEffect).toMatchObject({ id: threeStackEffectId, target: "flatAttack", value: expect.any(Number) })
    expect(threeStackEffect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.flatAttack - baselineEvaluation.stats.flatAttack).toBeCloseTo(
      threeStackEffect?.value as number
    )
  })

  it("materializes a teammate Xiphos' Moonlight holder's elemental-mastery energy recharge snapshot through the API", async () => {
    const effectId = "weapon.xiphos-moonlight.after-10s.other-party.source-em-to-energy-recharge"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const xingqiu = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xingqiu")
    if (!xiangling) throw new Error("Expected the built-in preset to contain Xiangling")
    if (!xingqiu) throw new Error("Expected the built-in preset to contain Xingqiu")
    const xiphosHolder = {
      ...xingqiu,
      buildId: "test.xingqiu.xiphos-moonlight-api",
      label: "行秋 西福斯的月光 API 测试",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "XiphosMoonlight" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary: xiangling,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: [xiphosHolder]
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as { readonly stats: { readonly energyRecharge: number } }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly stats: { readonly energyRecharge: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, sourceId: xiphosHolder.buildId, target: "energyRecharge" })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.energyRecharge - baselineEvaluation.stats.energyRecharge).toBeCloseTo(effect?.value as number)
  })

  it("materializes a teammate Peak Patrol Song holder's full-stack defense party snapshot through the API", async () => {
    const effectId = "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    if (!xiangling) throw new Error("Expected the built-in preset to contain Xiangling")
    const peakPatrolHolder = {
      ...xiangling,
      buildId: "test.xilonen.peak-patrol-song-api",
      characterId: "Xilonen",
      label: "希诺宁 岩峰巡歌 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PeakPatrolSong" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary: xiangling,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: [peakPatrolHolder]
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, sourceId: peakPatrolHolder.buildId, target: "damageBonus" })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.damageBonus - baselineEvaluation.stats.damageBonus).toBeCloseTo(effect?.value as number)
    expect(snapshotEvaluation.result.expectedDamage).toBeGreaterThan(baselineEvaluation.result.expectedDamage)
  })

  it("materializes a teammate Angelos Heptades holder's source-attack current-on-field snapshot through the API", async () => {
    const effectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    if (!xiangling) throw new Error("Expected the built-in preset to contain Xiangling")
    const angelosHolder = {
      ...xiangling,
      buildId: "test.mona.angelos-heptades-api",
      characterId: "Mona",
      label: "莫娜 尘光七谕 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AngelosHeptades" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary: xiangling,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: [angelosHolder]
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, sourceId: angelosHolder.buildId, target: "damageBonus" })
    expect(effect?.value).toBeGreaterThan(0)
    expect(snapshotEvaluation.stats.damageBonus - baselineEvaluation.stats.damageBonus).toBeCloseTo(effect?.value as number)
    expect(snapshotEvaluation.result.expectedDamage).toBeGreaterThan(baselineEvaluation.result.expectedDamage)
  })

  it("materializes Predator's selected PlayStation Aloy fixed-attack snapshot through the public analysis endpoint", async () => {
    const effectId = "weapon.predator.playstation.aloy.flat-attack"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const primary = {
      ...presetScenario.primary,
      buildId: "test.aloy.predator-api",
      characterId: "Aloy",
      constellation: 0,
      label: "埃洛伊 掠食者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Predator" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds, equipmentEffectMode: undefined, enemyCount: 1 },
          externalBuffs: [],
          primary,
          targetActionId: "aloy.burst.prophecies_of_dawn.explosion",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const baselineResponse = await requestAnalysis([])
    const snapshotResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(snapshotResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly flatAttack: number }
    }
    const snapshotEvaluation = snapshotResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly flatAttack: number }
    }
    const effect = snapshotEvaluation.appliedEffects.find((candidate) => candidate.id === effectId)

    expect(effect).toMatchObject({ id: effectId, sourceId: primary.buildId, target: "flatAttack", value: 66 })
    expect(snapshotEvaluation.stats.flatAttack - baselineEvaluation.stats.flatAttack).toBeCloseTo(66)
    expect(snapshotEvaluation.result.expectedDamage).toBeGreaterThan(baselineEvaluation.result.expectedDamage)
  })

  it("returns an explicitly selected C2 target defense reduction through the public analysis endpoint", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const effectId = "klee.constellation.2.sparkling_burst.enemy_defense_reduction"
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [effectId], enemyCount: 1 },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.klee.c2-api",
          characterId: "Klee",
          constellation: 2,
          label: "可莉 C2 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
        },
        targetActionId: "klee.normal.charged_attack.single_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, target: "enemyDefenseReduction", value: 0.23 })])
    )
    expect(response.json().evaluation.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ defenseReduction: 0.23, kind: "defense" })])
    )
  })

  it("serializes automatic and selected elemental-mastery equipment effects through the public endpoint", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          ...presetScenario.conditions,
          actionParameters: undefined,
          activeEffectIds: ["weapon.starcallers-watch.shielded.damage-bonus"],
          enemyCount: 1
        },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
            ...artifact,
            setId: "Instructor"
          })),
          buildId: "test.klee.instructor-starcallers-watch-api",
          characterId: "Klee",
          constellation: 0,
          label: "可莉 教官祭星者之望 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "StarcallersWatch" }
        },
        targetActionId: "klee.normal.charged_attack.single_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.instructor.2pc.elemental-mastery", target: "elementalMastery", value: 80 }),
        expect.objectContaining({ id: "weapon.starcallers-watch.elemental-mastery", target: "elementalMastery", value: 100 }),
        expect.objectContaining({ id: "weapon.starcallers-watch.shielded.damage-bonus", target: "damageBonus", value: 0.28 })
      ])
    )
    expect(response.json().evaluation.stats.elementalMastery).toBeGreaterThanOrEqual(180)
  })

  it("serializes reviewed fixed-health and fixed-defense set bonuses through the public endpoint", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario

    const requestWithArtifactSet = async (setId: "Adventurer" | "LuckyDog") =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            ...presetScenario.conditions,
            actionParameters: undefined,
            activeEffectIds: [],
            enemyCount: 1
          },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
              ...artifact,
              setId
            })),
            buildId: `test.klee.${setId.toLowerCase()}-api`,
            characterId: "Klee",
            constellation: 0,
            label: `可莉 ${setId} API 测试`,
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
          },
          targetActionId: "klee.normal.charged_attack.single_hit",
          teammates: []
        },
        url: "/v1/analysis"
      })

    const adventurerResponse = await requestWithArtifactSet("Adventurer")
    const luckyDogResponse = await requestWithArtifactSet("LuckyDog")

    expect(adventurerResponse.statusCode).toBe(200)
    expect(adventurerResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.adventurer.2pc.flat-hp", target: "hpFlat", value: 1000 })
      ])
    )
    expect(luckyDogResponse.statusCode).toBe(200)
    expect(luckyDogResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.lucky-dog.2pc.flat-defense", target: "defenseFlat", value: 100 })
      ])
    )
  })

  it("serializes Primordial Jade Cutter's final-HP conversion as a resolved flat-attack effect", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [], enemyCount: 1 },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.bennett.primordial-jade-cutter-api",
          characterId: "Bennett",
          constellation: 0,
          label: "班尼特 磐岩结绿 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PrimordialJadeCutter" }
        },
        targetActionId: "bennett.skill.passion_overload.press",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack",
          target: "flatAttack",
          value: expect.any(Number)
        })
      ])
    )
    const effect = response
      .json()
      .evaluation.appliedEffects.find((candidate: { readonly id: string }) =>
        candidate.id === "weapon.primordial-jade-cutter.hp-sourced-flat-attack"
      )
    expect(effect.value).toBeGreaterThan(0)
  })

  it("returns Yae Miko's automatic C6 defense ignore only for the declared Sesshou Sakura action", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [], enemyCount: 1 },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.yae-miko.c6-api",
          characterId: "YaeMiko",
          constellation: 6,
          label: "八重神子 C6 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
        },
        targetActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
          target: "enemyDefenseIgnore",
          value: 0.6
        })
      ])
    )
    expect(response.json().evaluation.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ defenseIgnore: 0.6, kind: "defense" })])
    )
  })

  it("returns Skyward Spine's selected Vacuum Blade as an independent physical event", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { characterId: string }) => build.characterId === "Xiangling")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: ["weapon.skyward-spine.vacuum-blade"],
          enemyCount: 1
        },
        externalBuffs: [],
        primary: {
          ...xiangling,
          buildId: "test.xiangling.skyward-spine-api",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardSpine" }
        },
        targetActionId: "xiangling.normal.auto.first_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.skyward-spine.vacuum-blade",
          target: "additionalDamageEvent",
          value: 0.2
        })
      ])
    )
    const vacuumBlade = response.json().evaluation.rotation.events.find(
      (event: { id: string }) => event.id.endsWith("weapon.skyward-spine.vacuum-blade")
    )
    expect(vacuumBlade).toMatchObject({ element: "physical", hitCount: 1 })
    expect(vacuumBlade.elementalApplication).toBeUndefined()
    expect(vacuumBlade.trace[0]).toMatchObject({ coefficient: 0.2, kind: "scaling", stat: "attack" })
    expect(vacuumBlade.trace.some((entry: { kind: string }) => entry.kind === "amplifying_reaction")).toBe(false)
  })

  it("returns Messenger's selected weak-point extra hit as a guaranteed critical event", async () => {
    const effectId = "weapon.messenger.weak-point-guaranteed-crit.additional-damage"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: [effectId],
          enemyCount: 1
        },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.amber.messenger-api",
          characterId: "Amber",
          constellation: 0,
          label: "安柏 信使 API 测试",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Messenger" }
        },
        targetActionId: "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, target: "additionalDamageEvent", value: 1 })
      ])
    )
    const messengerEvent = response.json().evaluation.rotation.events.find(
      (event: { id: string }) => event.id.endsWith(effectId)
    )

    expect(messengerEvent).toMatchObject({ element: "physical", hitCount: 1 })
    expect(messengerEvent.expectedDamage).toBeCloseTo(messengerEvent.critDamage)
    expect(messengerEvent.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ critRate: 1, kind: "expected_crit", multiplier: expect.any(Number) })
      ])
    )
    expect(messengerEvent.trace.some((entry: { kind: string }) => entry.kind === "amplifying_reaction")).toBe(false)
  })

  it("applies Flowing Purity's explicit post-skill and complete Bond-of-Life-clear snapshots", async () => {
    const afterSkillEffectId = "weapon.flowing-purity.after-skill.all-element-damage-bonus"
    const clearEffectId = "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (refinement: number, activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            buildId: `test.yae-miko.flowing-purity.r${refinement}`,
            characterId: "YaeMiko",
            constellation: 0,
            label: "八重神子 纯水流华 API 测试",
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement, weaponId: "FlowingPurity" }
          },
          targetActionId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis(1, [])
    const r1Response = await requestAnalysis(1, [afterSkillEffectId, clearEffectId])
    const r5Response = await requestAnalysis(5, [afterSkillEffectId, clearEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(r1Response.statusCode).toBe(200)
    expect(r5Response.statusCode).toBe(200)
    expect(r1Response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: afterSkillEffectId, target: "damageBonus", value: 0.08 }),
        expect.objectContaining({ id: clearEffectId, target: "damageBonus", value: 0.12 })
      ])
    )
    expect(r5Response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: afterSkillEffectId, target: "damageBonus", value: 0.16 }),
        expect.objectContaining({ id: clearEffectId, target: "damageBonus", value: 0.24 })
      ])
    )
    expect(r1Response.json().evaluation.rotation.dpr).toBeGreaterThan(baselineResponse.json().evaluation.rotation.dpr)
    expect(r5Response.json().evaluation.rotation.dpr).toBeGreaterThan(r1Response.json().evaluation.rotation.dpr)
  })

  it("applies Finale of the Deep's selected capped Bond-of-Life snapshot through the public endpoint", async () => {
    const afterSkillEffectId = "weapon.finale-of-the-deep.after-skill.attack-percent"
    const cappedEffectId = "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xingqiu = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xingqiu")
    const requestAnalysis = (refinement: number, activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...xingqiu,
            buildId: `test.xingqiu.finale-of-the-deep.r${refinement}`,
            characterId: "Xingqiu",
            constellation: 0,
            label: "行秋 海渊终曲 API 测试",
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement, weaponId: "FinaleOfTheDeep" }
          },
          targetActionId: "xingqiu.skill.fatal_rainscreen",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis(1, [])
    const r1Response = await requestAnalysis(1, [afterSkillEffectId, cappedEffectId])
    const r5Response = await requestAnalysis(5, [cappedEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(r1Response.statusCode).toBe(200)
    expect(r5Response.statusCode).toBe(200)
    expect(r1Response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: afterSkillEffectId, target: "attackPercent", value: 0.12 }),
        expect.objectContaining({ id: cappedEffectId, target: "flatAttack", value: 150 })
      ])
    )
    expect(r5Response.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: cappedEffectId, target: "flatAttack", value: 300 })])
    )
    expect(r1Response.json().evaluation.stats.flatAttack).toBeCloseTo(
      baselineResponse.json().evaluation.stats.flatAttack + 150
    )
    expect(r1Response.json().evaluation.rotation.dpr).toBeGreaterThan(baselineResponse.json().evaluation.rotation.dpr)
    expect(r5Response.json().evaluation.rotation.dpr).toBeGreaterThan(baselineResponse.json().evaluation.rotation.dpr)
  })

  it("keeps Echoes of an Offering's selected Valley Rite on the triggering normal-hit formula", async () => {
    const effectId = "artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
              ...artifact,
              setId: "EchoesOfAnOffering"
            })),
            buildId: "test.tartaglia.echoes-of-an-offering-api",
            characterId: "Tartaglia",
            constellation: 0,
            label: "达达利亚 来歆余响 API 测试",
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
          },
          targetActionId: "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis([])
    const activeResponse = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(activeResponse.statusCode).toBe(200)
    expect(activeResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          scalingStat: "attack",
          target: "matchedActionAdditiveDamageTerm",
          value: 0.7
        })
      ])
    )
    const activeEvent = activeResponse.json().evaluation.rotation.events[0]

    expect(activeEvent.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "scaling_terms",
          terms: expect.arrayContaining([expect.objectContaining({ coefficient: 0.7, stat: "attack" })])
        })
      ])
    )
    expect(activeResponse.json().evaluation.rotation.dpr).toBeGreaterThan(baselineResponse.json().evaluation.rotation.dpr)
  })

  it("applies Scroll of the Hero of Cinder City's selected reaction-element team snapshot", async () => {
    const standardEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus"
    const nightsoulEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xiangling")
    const standardHolder = {
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "ScrollOfTheHeroOfCinderCity"
      })),
      buildId: "test.cinder-city-standard-holder",
      label: "烬城勇者绘卷普通状态持有者"
    }
    const nightsoulHolder = {
      ...standardHolder,
      buildId: "test.cinder-city-nightsoul-holder",
      characterId: "Xilonen",
      label: "烬城勇者绘卷夜魂状态持有者",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[], holder = standardHolder) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: { ...xiangling, buildId: "test.xiangling.cinder-city-api" },
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: [holder]
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis([])
    const standardResponse = await requestAnalysis([standardEffectId])
    const nightsoulResponse = await requestAnalysis([nightsoulEffectId], nightsoulHolder)

    expect(baselineResponse.statusCode).toBe(200)
    expect(standardResponse.statusCode).toBe(200)
    expect(nightsoulResponse.statusCode).toBe(200)
    expect(standardResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: standardEffectId, sourceId: standardHolder.buildId, value: 0.12 })
      ])
    )
    expect(nightsoulResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: nightsoulEffectId, sourceId: nightsoulHolder.buildId, value: 0.4 })
      ])
    )
    expect(standardResponse.json().evaluation.rotation.dpr).toBeGreaterThan(baselineResponse.json().evaluation.rotation.dpr)
    expect(nightsoulResponse.json().evaluation.rotation.dpr).toBeGreaterThan(standardResponse.json().evaluation.rotation.dpr)
  })

  it("applies Celestial Gift's selected elemental team snapshot from a matching party holder", async () => {
    const celestialGuidanceEffectId = "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus"
    const mortalHymnEffectId = "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xiangling")
    const bennett = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Bennett")
    const celestialGiftHolder = {
      ...bennett,
      artifacts: bennett.artifacts.map((artifact: { readonly setId: string }) => ({ ...artifact, setId: "CelestialGift" })),
      buildId: "test.celestial-gift-holder",
      characterId: "Klee",
      label: "天之美赐持有者",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheWidsith" }
    }
    const hexereiTeammate = {
      ...bennett,
      buildId: "test.celestial-gift-venti",
      characterId: "Venti",
      label: "魔导秘仪测试温迪",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheStringless" }
    }
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: { ...xiangling, buildId: "test.xiangling.celestial-gift-api" },
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: [celestialGiftHolder, hexereiTeammate]
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis([])
    const celestialGuidanceResponse = await requestAnalysis([celestialGuidanceEffectId])
    const mortalHymnResponse = await requestAnalysis([mortalHymnEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(celestialGuidanceResponse.statusCode).toBe(200)
    expect(mortalHymnResponse.statusCode).toBe(200)
    expect(celestialGuidanceResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: celestialGuidanceEffectId, sourceId: celestialGiftHolder.buildId, value: 0.2 })
      ])
    )
    expect(mortalHymnResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: mortalHymnEffectId, sourceId: celestialGiftHolder.buildId, value: 0.4 })
      ])
    )
    expect(celestialGuidanceResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      baselineResponse.json().evaluation.rotation.dpr
    )
    expect(mortalHymnResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      celestialGuidanceResponse.json().evaluation.rotation.dpr
    )
  })

  it("applies Crimson Witch's automatic Vaporize and Melt multiplier bonus through the public endpoint", async () => {
    const effectId = "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xiangling")
    const requestAnalysis = (setId: string) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds: [], enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...xiangling,
            artifacts: xiangling.artifacts.map((artifact: { readonly setId: string }) => ({ ...artifact, setId })),
            buildId: `test.xiangling.${setId.toLowerCase()}-api`
          },
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis("TestNoArtifactSet")
    const crimsonWitchResponse = await requestAnalysis("CrimsonWitchOfFlames")

    expect(baselineResponse.statusCode).toBe(200)
    expect(crimsonWitchResponse.statusCode).toBe(200)
    expect(crimsonWitchResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, target: "amplifyingReactionBonus", value: 0.15 })])
    )
    const directReaction = crimsonWitchResponse.json().evaluation.result.trace.find(
      (entry: { readonly stage: string }) => entry.stage === "amplifying_reaction"
    )
    const rotationReaction = (crimsonWitchResponse.json().evaluation.rotation.events[0]?.trace as Array<Record<string, unknown>>).find(
      (entry) => entry.kind === "amplifying_reaction"
    )

    expect(directReaction).toMatchObject({ formula: { bonus: 0.15, reaction: "vaporize_reverse" } })
    expect(rotationReaction).toMatchObject({ bonus: 0.15, reaction: "vaporize_reverse" })
    expect(crimsonWitchResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      baselineResponse.json().evaluation.rotation.dpr
    )
  })

  it("evaluates one existing Dendro Core as Kuki Shinobu's single Hyperbloom through the public endpoint", async () => {
    const actionId = "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    const effectId = "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus"
    const catalogResponse = await app.inject({ method: "GET", url: "/v1/catalog" })
    const catalogKuki = catalogResponse.json().characters.find(
      (character: { readonly characterId: string }) => character.characterId === "KukiShinobu"
    )

    expect(catalogResponse.statusCode).toBe(200)
    expect(catalogKuki?.primaryActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: actionId,
          label: "越祓雷草之轮 / 越祓草轮单枚超绽放（已存在草原核）"
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (setId: string) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds: [], enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
              ...artifact,
              setId
            })),
            buildId: `test.kuki-shinobu.${setId.toLowerCase()}-single-hyperbloom-api`,
            characterId: "KukiShinobu",
            constellation: 0,
            label: "久岐忍单枚超绽放 API 测试",
            talents: { burst: 6, normal: 6, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
          },
          targetActionId: actionId,
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis("TestNoArtifactSet")
    const thunderingFuryResponse = await requestAnalysis("ThunderingFury")

    expect(baselineResponse.statusCode).toBe(200)
    expect(thunderingFuryResponse.statusCode).toBe(200)
    const baseline = baselineResponse.json().evaluation
    const thunderingFury = thunderingFuryResponse.json().evaluation
    const baselineEvent = baseline.rotation.events[0]
    const thunderingFuryEvent = thunderingFury.rotation.events[0]
    const baselineReaction = baselineEvent?.trace.find((entry: { readonly kind: string }) => entry.kind === "transformative_reaction")
    const thunderingFuryReaction = thunderingFuryEvent?.trace.find(
      (entry: { readonly kind: string }) => entry.kind === "transformative_reaction"
    )
    if (!baselineEvent || !thunderingFuryEvent || !baselineReaction || !thunderingFuryReaction) {
      throw new Error("Expected one complete Hyperbloom reaction trace for each API response")
    }

    expect(thunderingFury.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, target: "reactionDamageBonus", value: 0.4 })])
    )
    expect(thunderingFury.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "artifact.thundering-fury.2pc.electro-damage-bonus" })])
    )
    expect(baselineEvent).toMatchObject({
      element: "dendro",
      hitCount: 1,
      id: `${actionId}.single-reaction`
    })
    expect(thunderingFuryEvent.critDamage).toBeCloseTo(thunderingFuryEvent.nonCritDamage)
    expect(thunderingFuryEvent.expectedDamage).toBeCloseTo(thunderingFuryEvent.nonCritDamage)
    expect(thunderingFuryEvent.trace.map((entry: { readonly kind: string }) => entry.kind)).toEqual([
      "transformative_reaction",
      "resistance"
    ])
    expect(thunderingFuryEvent.trace.some((entry: { readonly kind: string }) => entry.kind === "defense")).toBe(false)
    expect(thunderingFuryEvent.trace.some((entry: { readonly kind: string }) => entry.kind === "damage_bonus")).toBe(false)
    expect(thunderingFuryReaction).toMatchObject({ bonus: 0.4, hitCount: 1, multiplier: 3, reaction: "hyperbloom" })
    expect(baselineReaction).toMatchObject({ bonus: 0, hitCount: 1, multiplier: 3, reaction: "hyperbloom" })
    expect(thunderingFuryReaction.after).toBeCloseTo(
      thunderingFuryReaction.baseDamage *
        thunderingFuryReaction.multiplier *
        (1 +
          (16 * thunderingFuryReaction.elementalMastery) / (thunderingFuryReaction.elementalMastery + 2000) +
          thunderingFuryReaction.bonus) *
        thunderingFuryReaction.hitCount
    )
    const baselineReactionFactor =
      1 + (16 * baselineReaction.elementalMastery) / (baselineReaction.elementalMastery + 2000)
    expect(thunderingFury.result.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          formula: expect.objectContaining({ bonus: 0.4, kind: "transformative_reaction", reaction: "hyperbloom" }),
          stage: "transformative_reaction"
        })
      ])
    )
    expect(thunderingFury.result.expectedDamage / baseline.result.expectedDamage).toBeCloseTo(
      (baselineReactionFactor + 0.4) / baselineReactionFactor
    )
  })

  it("applies Kuki Shinobu C6's selected low-HP mastery snapshot to single Hyperbloom through the public endpoint", async () => {
    const actionId = "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    const effectId = "kuki_shinobu.constellation.6.to_ward_weakness.low_hp.elemental_mastery"
    const scenarioEffects = await getProjectedActionEffects(actionId)

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          label: "割舍软弱之心 · C6 生命值低于25%时的元素精通",
          recipientSourceRelation: "source",
          source: { characterId: "KukiShinobu", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
              ...artifact,
              setId: "TestNoArtifactSet"
            })),
            buildId: `test.kuki-shinobu.c6-low-hp-${activeEffectIds.length > 0 ? "active" : "baseline"}-api`,
            characterId: "KukiShinobu",
            constellation: 6,
            label: "久岐忍 C6 低生命超绽放 API 测试",
            talents: { burst: 6, normal: 6, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
          },
          targetActionId: actionId,
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis([])
    const c6Response = await requestAnalysis([effectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(c6Response.statusCode).toBe(200)
    const baseline = baselineResponse.json().evaluation
    const c6 = c6Response.json().evaluation
    const baselineReaction = baseline.rotation.events[0]?.trace.find(
      (entry: { readonly kind: string }) => entry.kind === "transformative_reaction"
    )
    const c6Reaction = c6.rotation.events[0]?.trace.find(
      (entry: { readonly kind: string }) => entry.kind === "transformative_reaction"
    )
    if (!baselineReaction || !c6Reaction) {
      throw new Error("Expected one complete Hyperbloom reaction trace for each C6 snapshot response")
    }

    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          sourceId: "test.kuki-shinobu.c6-low-hp-active-api",
          target: "elementalMastery",
          value: 150
        })
      ])
    )
    expect(c6Reaction).toMatchObject({ bonus: 0, hitCount: 1, multiplier: 3, reaction: "hyperbloom" })
    expect(c6Reaction.elementalMastery - baselineReaction.elementalMastery).toBeCloseTo(150)
    const baselineReactionFactor =
      1 + (16 * baselineReaction.elementalMastery) / (baselineReaction.elementalMastery + 2000)
    const c6ReactionFactor = 1 + (16 * c6Reaction.elementalMastery) / (c6Reaction.elementalMastery + 2000)
    expect(c6Reaction.after).toBeCloseTo(
      c6Reaction.baseDamage * c6Reaction.multiplier * c6ReactionFactor * c6Reaction.hitCount
    )
    expect(c6.result.expectedDamage / baseline.result.expectedDamage).toBeCloseTo(c6ReactionFactor / baselineReactionFactor)
  })

  it("exposes and evaluates Venti and Albedo C4 explicit current-action snapshots through the public endpoint", async () => {
    const ventiEffectId = "venti.constellation.4.hurricane_of_freedom.anemo_damage_bonus"
    const albedoEffectId = "albedo.constellation.4.descent_of_divinity.plunge_damage_bonus"
    const ventiActionId = "venti.skill.skyward_sonnet.press"
    const gamingPlungeActionId = "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider"
    const [ventiEffects, gamingPlungeEffects] = await Promise.all([
      getProjectedActionEffects(ventiActionId),
      getProjectedActionEffects(gamingPlungeActionId)
    ])

    expect(ventiEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: ventiEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
    expect(gamingPlungeEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: albedoEffectId,
          source: { characterId: "Albedo", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createArtifacts = () =>
      presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      }))
    const venti = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.venti.c6-pickup-snapshot-api",
      characterId: "Venti",
      constellation: 6,
      label: "温迪 C6 元素微粒拾取快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const gaming = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.gaming.albedo-c4-recipient-api",
      characterId: "Gaming",
      constellation: 0,
      label: "嘉明阳华领域下落攻击 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const albedo = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.albedo.c6-field-snapshot-api",
      characterId: "Albedo",
      constellation: 6,
      label: "阿贝多 C6 阳华领域快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }
    const requestVenti = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: venti,
          targetActionId: ventiActionId,
          teammates: []
        },
        url: "/v1/analysis"
      })
    const requestGamingPlunge = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0
              ? {}
              : { activeEffectSourceBuildIds: { [albedoEffectId]: albedo.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary: gaming,
          targetActionId: gamingPlungeActionId,
          teammates: [albedo]
        },
        url: "/v1/analysis"
      })

    const [ventiBaselineResponse, ventiC6Response, gamingBaselineResponse, gamingFieldResponse] = await Promise.all([
      requestVenti([]),
      requestVenti([ventiEffectId]),
      requestGamingPlunge([]),
      requestGamingPlunge([albedoEffectId])
    ])

    expect(ventiBaselineResponse.statusCode).toBe(200)
    expect(ventiC6Response.statusCode).toBe(200)
    expect(gamingBaselineResponse.statusCode).toBe(200)
    expect(gamingFieldResponse.statusCode).toBe(200)
    const ventiBaseline = ventiBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const ventiC6 = ventiC6Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const gamingBaseline = gamingBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const gamingField = gamingFieldResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }

    expect(ventiC6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ventiEffectId, sourceId: venti.buildId, value: 0.25 })
      ])
    )
    expect(ventiC6.stats.damageBonus - ventiBaseline.stats.damageBonus).toBeCloseTo(0.25)
    expect(ventiC6.result.expectedDamage).toBeGreaterThan(ventiBaseline.result.expectedDamage)
    expect(gamingField.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: albedoEffectId, sourceId: albedo.buildId, value: 0.3 })
      ])
    )
    expect(gamingField.stats.damageBonus - gamingBaseline.stats.damageBonus).toBeCloseTo(0.3)
    expect(gamingField.result.expectedDamage).toBeGreaterThan(gamingBaseline.result.expectedDamage)
  })

  it("exposes and evaluates Sucrose C6 and Barbara C2 teammate damage snapshots through the public endpoint", async () => {
    const sucroseEffectId = "sucrose.constellation.6.chaotic_entropy.pyro_damage_bonus"
    const barbaraEffectId = "barbara.let_the_show_begin.c2.current_character.hydro_damage_bonus"
    const xianglingActionId = "xiangling.burst.pyronado.reverse_vaporize"
    const xingqiuActionId = "xingqiu.burst.raincutter.rain_sword.single_volley"
    const [xianglingEffects, xingqiuEffects] = await Promise.all([
      getProjectedActionEffects(xianglingActionId),
      getProjectedActionEffects(xingqiuActionId)
    ])

    expect(xianglingEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: sucroseEffectId,
          source: { characterId: "Sucrose", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )
    expect(xingqiuEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: barbaraEffectId,
          source: { characterId: "Barbara", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createArtifacts = () =>
      presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      }))
    const xiangling = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xiangling.sucrose-c6-recipient-api",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱砂糖 C6 火转化快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const sucrose = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.sucrose.c6-absorption-source-api",
      characterId: "Sucrose",
      constellation: 6,
      label: "砂糖 C6 火元素转化快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const xingqiu = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xingqiu.barbara-c2-recipient-api",
      characterId: "Xingqiu",
      constellation: 0,
      label: "行秋芭芭拉 C2 水伤快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SacrificialSword" }
    }
    const barbara = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.barbara.c6-melody-loop-source-api",
      characterId: "Barbara",
      constellation: 6,
      label: "芭芭拉 C6 演唱开始快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const requestAnalysis = (
      primary: typeof xiangling | typeof xingqiu,
      targetActionId: string,
      teammate: typeof sucrose | typeof barbara,
      effectId: string,
      activeEffectIds: readonly string[]
    ) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0
              ? {}
              : { activeEffectSourceBuildIds: { [effectId]: teammate.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates: [teammate]
        },
        url: "/v1/analysis"
      })

    const [xianglingBaselineResponse, xianglingC6Response, xingqiuBaselineResponse, xingqiuC2Response] = await Promise.all([
      requestAnalysis(xiangling, xianglingActionId, sucrose, sucroseEffectId, []),
      requestAnalysis(xiangling, xianglingActionId, sucrose, sucroseEffectId, [sucroseEffectId]),
      requestAnalysis(xingqiu, xingqiuActionId, barbara, barbaraEffectId, []),
      requestAnalysis(xingqiu, xingqiuActionId, barbara, barbaraEffectId, [barbaraEffectId])
    ])

    expect(xianglingBaselineResponse.statusCode).toBe(200)
    expect(xianglingC6Response.statusCode).toBe(200)
    expect(xingqiuBaselineResponse.statusCode).toBe(200)
    expect(xingqiuC2Response.statusCode).toBe(200)
    const xianglingBaseline = xianglingBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const xianglingC6 = xianglingC6Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const xingqiuBaseline = xingqiuBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const xingqiuC2 = xingqiuC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }

    expect(xianglingC6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: sucroseEffectId, sourceId: sucrose.buildId, value: 0.2 })
      ])
    )
    expect(xianglingC6.stats.damageBonus - xianglingBaseline.stats.damageBonus).toBeCloseTo(0.2)
    expect(xianglingC6.result.expectedDamage).toBeGreaterThan(xianglingBaseline.result.expectedDamage)
    expect(xingqiuC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: barbaraEffectId, sourceId: barbara.buildId, value: 0.15 })
      ])
    )
    expect(xingqiuC2.stats.damageBonus - xingqiuBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(xingqiuC2.result.expectedDamage).toBeGreaterThan(xingqiuBaseline.result.expectedDamage)
  })

  it("exposes and evaluates Yun Jin C2, Kirara C6, and Collei C4 teammate snapshots through the public endpoint", async () => {
    const yunJinEffectId = "yun_jin.constellation.2.myriad_mise_en_scene.normal_attack_damage_bonus"
    const kiraraEffectId = "kirara.constellation.6.countless_sights_to_see.party_elemental_damage_bonus"
    const colleiEffectId = "collei.constellation.4.gift_of_the_woods.party_elemental_mastery"
    const tartagliaNormalActionId = "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit"
    const xianglingPyronadoActionId = "xiangling.burst.pyronado.reverse_vaporize"
    const kukiHyperbloomActionId = "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    const [tartagliaNormalEffects, xianglingPyronadoEffects, kukiHyperbloomEffects] = await Promise.all([
      getProjectedActionEffects(tartagliaNormalActionId),
      getProjectedActionEffects(xianglingPyronadoActionId),
      getProjectedActionEffects(kukiHyperbloomActionId)
    ])

    expect(tartagliaNormalEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: yunJinEffectId,
          source: { characterId: "YunJin", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )
    expect(xianglingPyronadoEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: kiraraEffectId,
          source: { characterId: "Kirara", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )
    expect(kukiHyperbloomEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: colleiEffectId,
          recipientSourceRelation: "not_source",
          source: { characterId: "Collei", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createArtifacts = () =>
      presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      }))
    const tartaglia = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.tartaglia.yun-jin-c2-recipient-api",
      characterId: "Tartaglia",
      constellation: 0,
      label: "达达利亚云堇 C2 普通攻击受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const xiangling = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xiangling.kirara-c6-recipient-api",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱绮良良 C6 元素伤害受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const yunJin = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.yun-jin.c2-normal-attack-source-api",
      characterId: "YunJin",
      constellation: 2,
      label: "云堇 C2 普通攻击加成来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const kirara = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.kirara.c6-elemental-damage-source-api",
      characterId: "Kirara",
      constellation: 6,
      label: "绮良良 C6 全队元素伤害加成来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const kuki = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.kuki-shinobu.collei-c4-recipient-api",
      characterId: "KukiShinobu",
      constellation: 0,
      label: "久岐忍柯莱 C4 元素精通受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const collei = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.collei.c4-elemental-mastery-source-api",
      characterId: "Collei",
      constellation: 4,
      label: "柯莱 C4 元素精通来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const requestAnalysis = (
      primary: typeof tartaglia | typeof xiangling | typeof kuki,
      targetActionId: string,
      teammate: typeof yunJin | typeof kirara | typeof collei,
      effectId: string,
      activeEffectIds: readonly string[]
    ) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0
              ? {}
              : { activeEffectSourceBuildIds: { [effectId]: teammate.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates: [teammate]
        },
        url: "/v1/analysis"
      })

    const [yunJinBaselineResponse, yunJinC2Response, kiraraBaselineResponse, kiraraC6Response, colleiBaselineResponse, colleiC4Response] =
      await Promise.all([
        requestAnalysis(tartaglia, tartagliaNormalActionId, yunJin, yunJinEffectId, []),
        requestAnalysis(tartaglia, tartagliaNormalActionId, yunJin, yunJinEffectId, [yunJinEffectId]),
        requestAnalysis(xiangling, xianglingPyronadoActionId, kirara, kiraraEffectId, []),
        requestAnalysis(xiangling, xianglingPyronadoActionId, kirara, kiraraEffectId, [kiraraEffectId]),
        requestAnalysis(kuki, kukiHyperbloomActionId, collei, colleiEffectId, []),
        requestAnalysis(kuki, kukiHyperbloomActionId, collei, colleiEffectId, [colleiEffectId])
      ])

    expect(yunJinBaselineResponse.statusCode).toBe(200)
    expect(yunJinC2Response.statusCode).toBe(200)
    expect(kiraraBaselineResponse.statusCode).toBe(200)
    expect(kiraraC6Response.statusCode).toBe(200)
    expect(colleiBaselineResponse.statusCode).toBe(200)
    expect(colleiC4Response.statusCode).toBe(200)
    const yunJinBaseline = yunJinBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const yunJinC2 = yunJinC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const kiraraBaseline = kiraraBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const kiraraC6 = kiraraC6Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const colleiBaseline = colleiBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly elementalMastery: number }
    }
    const colleiC4 = colleiC4Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly elementalMastery: number }
    }

    expect(yunJinC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: yunJinEffectId,
          sourceId: yunJin.buildId,
          target: "damageBonus",
          value: 0.15
        })
      ])
    )
    expect(yunJinC2.stats.damageBonus - yunJinBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(yunJinC2.result.expectedDamage).toBeGreaterThan(yunJinBaseline.result.expectedDamage)
    expect(kiraraC6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: kiraraEffectId,
          sourceId: kirara.buildId,
          target: "damageBonus",
          value: 0.12
        })
      ])
    )
    expect(kiraraC6.stats.damageBonus - kiraraBaseline.stats.damageBonus).toBeCloseTo(0.12)
    expect(kiraraC6.result.expectedDamage).toBeGreaterThan(kiraraBaseline.result.expectedDamage)
    expect(colleiC4.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: colleiEffectId,
          sourceId: collei.buildId,
          target: "elementalMastery",
          value: 60
        })
      ])
    )
    expect(colleiC4.stats.elementalMastery - colleiBaseline.stats.elementalMastery).toBeCloseTo(60)
    expect(colleiC4.result.expectedDamage).toBeGreaterThan(colleiBaseline.result.expectedDamage)
  })

  it("exposes and evaluates Lyney C4, Razor C1, and Yoimiya C2 snapshots through the public endpoint", async () => {
    const lyneyEffectId = "lyney.constellation.4.well_versed_well_rehearsed.pyro_charged_attack.pyro_resistance_reduction"
    const razorEffectId = "razor.constellation.1.wolf_instinct.elemental_orb_or_particle.damage_bonus"
    const yoimiyaEffectId = "yoimiya.constellation.2.a_procession_of_jewels.pyro_critical_hit.pyro_damage_bonus"
    const xianglingActionId = "xiangling.burst.pyronado.reverse_vaporize"
    const razorActionId = "razor.burst.lightning_fang.normal.fourth_hit"
    const yoimiyaActionId = "yoimiya.normal.niwabi_fire_dance.fifth_hit.hydro_aura_vaporize"
    const [xianglingEffects, razorEffects, yoimiyaEffects] = await Promise.all([
      getProjectedActionEffects(xianglingActionId),
      getProjectedActionEffects(razorActionId),
      getProjectedActionEffects(yoimiyaActionId)
    ])

    expect(xianglingEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: lyneyEffectId,
          source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
    expect(razorEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: razorEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 1 }
        })
      ])
    )
    expect(yoimiyaEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: yoimiyaEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createArtifacts = () =>
      presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      }))
    const xiangling = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xiangling.lyney-c4-recipient-api",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱林尼 C4 火元素减抗受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheCatch" }
    }
    const lyney = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.lyney.c4-pyro-resistance-source-api",
      characterId: "Lyney",
      constellation: 4,
      label: "林尼 C4 火元素减抗来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const razor = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.razor.c1-orb-or-particle-source-api",
      characterId: "Razor",
      constellation: 1,
      label: "雷泽 C1 晶球或微粒快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const yoimiya = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.yoimiya.c2-post-critical-source-api",
      characterId: "Yoimiya",
      constellation: 2,
      label: "宵宫 C2 火元素暴击后快照 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const requestAnalysis = (
      primary: typeof razor | typeof xiangling | typeof yoimiya,
      targetActionId: string,
      teammates: readonly typeof lyney[],
      effectId: string,
      effectSourceBuildId: string,
      activeEffectIds: readonly string[]
    ) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0
              ? {}
              : { activeEffectSourceBuildIds: { [effectId]: effectSourceBuildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates
        },
        url: "/v1/analysis"
      })

    const [lyneyBaselineResponse, lyneyC4Response, razorBaselineResponse, razorC1Response, yoimiyaBaselineResponse, yoimiyaC2Response] =
      await Promise.all([
        requestAnalysis(xiangling, xianglingActionId, [lyney], lyneyEffectId, lyney.buildId, []),
        requestAnalysis(xiangling, xianglingActionId, [lyney], lyneyEffectId, lyney.buildId, [lyneyEffectId]),
        requestAnalysis(razor, razorActionId, [], razorEffectId, razor.buildId, []),
        requestAnalysis(razor, razorActionId, [], razorEffectId, razor.buildId, [razorEffectId]),
        requestAnalysis(yoimiya, yoimiyaActionId, [], yoimiyaEffectId, yoimiya.buildId, []),
        requestAnalysis(yoimiya, yoimiyaActionId, [], yoimiyaEffectId, yoimiya.buildId, [yoimiyaEffectId])
      ])

    expect(lyneyBaselineResponse.statusCode).toBe(200)
    expect(lyneyC4Response.statusCode).toBe(200)
    expect(razorBaselineResponse.statusCode).toBe(200)
    expect(razorC1Response.statusCode).toBe(200)
    expect(yoimiyaBaselineResponse.statusCode).toBe(200)
    expect(yoimiyaC2Response.statusCode).toBe(200)
    const lyneyBaseline = lyneyBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly resistanceReduction: number }
    }
    const lyneyC4 = lyneyC4Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly resistanceReduction: number }
    }
    const razorBaseline = razorBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const razorC1 = razorC1Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const yoimiyaBaseline = yoimiyaBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const yoimiyaC2 = yoimiyaC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }

    expect(lyneyC4.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: lyneyEffectId,
          sourceId: lyney.buildId,
          target: "enemyResistanceReduction",
          value: 0.2
        })
      ])
    )
    expect(lyneyC4.stats.resistanceReduction - lyneyBaseline.stats.resistanceReduction).toBeCloseTo(0.2)
    expect(lyneyC4.result.expectedDamage).toBeGreaterThan(lyneyBaseline.result.expectedDamage)
    expect(razorC1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: razorEffectId, sourceId: razor.buildId, target: "damageBonus", value: 0.1 })
      ])
    )
    expect(razorC1.stats.damageBonus - razorBaseline.stats.damageBonus).toBeCloseTo(0.1)
    expect(razorC1.result.expectedDamage).toBeGreaterThan(razorBaseline.result.expectedDamage)
    expect(yoimiyaC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: yoimiyaEffectId, sourceId: yoimiya.buildId, target: "damageBonus", value: 0.25 })
      ])
    )
    expect(yoimiyaC2.stats.damageBonus - yoimiyaBaseline.stats.damageBonus).toBeCloseTo(0.25)
    expect(yoimiyaC2.result.expectedDamage).toBeGreaterThan(yoimiyaBaseline.result.expectedDamage)
  })

  it("exposes and evaluates Hu Tao C4, Yaoyao C1, and Sigewinne C2 snapshots through the public endpoint", async () => {
    const huTaoEffectId = "hu_tao.constellation.4.garden_of_eternal_rest.blood_blossom_defeated.party_crit_rate"
    const yaoyaoEffectId = "yaoyao.constellation.1.adeptus_tutelage.white_jade_radish.active_character.dendro_damage_bonus"
    const sigewinneEffectId = "sigewinne.constellation.2.can_the_merciful_spirit_defeat_its_foes.hydro_resistance_reduction"
    const xianglingActionId = "xiangling.burst.pyronado.reverse_vaporize"
    const colleiActionId = "collei.burst.trump_card_kitty.leap_tick"
    const xingqiuActionId = "xingqiu.burst.raincutter.rain_sword.single_volley"
    const [xianglingEffects, colleiEffects, xingqiuEffects] = await Promise.all([
      getProjectedActionEffects(xianglingActionId),
      getProjectedActionEffects(colleiActionId),
      getProjectedActionEffects(xingqiuActionId)
    ])

    expect(xianglingEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: huTaoEffectId,
          recipientSourceRelation: "not_source",
          source: { characterId: "HuTao", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
    expect(colleiEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: yaoyaoEffectId,
          source: { characterId: "Yaoyao", kind: "character", minimumSourceConstellation: 1 }
        })
      ])
    )
    expect(xingqiuEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: sigewinneEffectId,
          source: { characterId: "Sigewinne", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createArtifacts = () =>
      presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      }))
    const xiangling = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xiangling.hu-tao-c4-recipient-api",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱胡桃 C4 暴击率受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheCatch" }
    }
    const huTao = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.hu-tao.c4-crit-rate-source-api",
      characterId: "HuTao",
      constellation: 4,
      label: "胡桃 C4 暴击率来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const collei = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.collei.yaoyao-c1-recipient-api",
      characterId: "Collei",
      constellation: 0,
      label: "柯莱瑶瑶 C1 草元素伤害受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const yaoyao = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.yaoyao.c1-dendro-damage-source-api",
      characterId: "Yaoyao",
      constellation: 1,
      label: "瑶瑶 C1 草元素伤害来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const xingqiu = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.xingqiu.sigewinne-c2-recipient-api",
      characterId: "Xingqiu",
      constellation: 0,
      label: "行秋希格雯 C2 水元素减抗受益者 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const sigewinne = {
      ...presetScenario.primary,
      artifacts: createArtifacts(),
      buildId: "test.sigewinne.c2-hydro-resistance-source-api",
      characterId: "Sigewinne",
      constellation: 2,
      label: "希格雯 C2 水元素减抗来源 API 测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const requestAnalysis = (
      primary: typeof collei | typeof xiangling | typeof xingqiu,
      targetActionId: string,
      teammate: typeof huTao | typeof sigewinne | typeof yaoyao,
      effectId: string,
      activeEffectIds: readonly string[]
    ) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0
              ? {}
              : { activeEffectSourceBuildIds: { [effectId]: teammate.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates: [teammate]
        },
        url: "/v1/analysis"
      })

    const [huTaoBaselineResponse, huTaoC4Response, yaoyaoBaselineResponse, yaoyaoC1Response, sigewinneBaselineResponse, sigewinneC2Response] =
      await Promise.all([
        requestAnalysis(xiangling, xianglingActionId, huTao, huTaoEffectId, []),
        requestAnalysis(xiangling, xianglingActionId, huTao, huTaoEffectId, [huTaoEffectId]),
        requestAnalysis(collei, colleiActionId, yaoyao, yaoyaoEffectId, []),
        requestAnalysis(collei, colleiActionId, yaoyao, yaoyaoEffectId, [yaoyaoEffectId]),
        requestAnalysis(xingqiu, xingqiuActionId, sigewinne, sigewinneEffectId, []),
        requestAnalysis(xingqiu, xingqiuActionId, sigewinne, sigewinneEffectId, [sigewinneEffectId])
      ])

    expect(huTaoBaselineResponse.statusCode).toBe(200)
    expect(huTaoC4Response.statusCode).toBe(200)
    expect(yaoyaoBaselineResponse.statusCode).toBe(200)
    expect(yaoyaoC1Response.statusCode).toBe(200)
    expect(sigewinneBaselineResponse.statusCode).toBe(200)
    expect(sigewinneC2Response.statusCode).toBe(200)
    const huTaoBaseline = huTaoBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const huTaoC4 = huTaoC4Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const yaoyaoBaseline = yaoyaoBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const yaoyaoC1 = yaoyaoC1Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const sigewinneBaseline = sigewinneBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly resistanceReduction: number }
    }
    const sigewinneC2 = sigewinneC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly resistanceReduction: number }
    }

    expect(huTaoC4.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: huTaoEffectId, sourceId: huTao.buildId, target: "critRate", value: 0.12 })
      ])
    )
    expect(huTaoC4.stats.critRate - huTaoBaseline.stats.critRate).toBeCloseTo(0.12)
    expect(huTaoC4.result.expectedDamage).toBeGreaterThan(huTaoBaseline.result.expectedDamage)
    expect(yaoyaoC1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: yaoyaoEffectId, sourceId: yaoyao.buildId, target: "damageBonus", value: 0.15 })
      ])
    )
    expect(yaoyaoC1.stats.damageBonus - yaoyaoBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(yaoyaoC1.result.expectedDamage).toBeGreaterThan(yaoyaoBaseline.result.expectedDamage)
    expect(sigewinneC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: sigewinneEffectId,
          sourceId: sigewinne.buildId,
          target: "enemyResistanceReduction",
          value: 0.35
        })
      ])
    )
    expect(sigewinneC2.stats.resistanceReduction - sigewinneBaseline.stats.resistanceReduction).toBeCloseTo(0.35)
    expect(sigewinneC2.result.expectedDamage).toBeGreaterThan(sigewinneBaseline.result.expectedDamage)
  })

  it("exposes and evaluates Amber C2, Yanfei C2, Razor C2, and Baizhu C4 snapshots through the public endpoint", async () => {
    const amberEffectId = "amber.constellation.2.bunny_triggered.manual_baron_bunny_detonation.damage_bonus"
    const yanfeiEffectId = "yanfei.constellation.2.final_interpretation.low_hp_target.charged_attack.crit_rate"
    const razorEffectId = "razor.constellation.2.suppression.low_hp_target.crit_rate"
    const baizhuEffectId = "baizhu.constellation.4.ancient_art_of_perception.holistic_revivification.party_elemental_mastery"
    const amberActionId = "amber.skill.explosive_puppet.baron_bunny.explosion"
    const yanfeiActionId = "yanfei.normal.charged_attack.three_scarlet_seals.hydro_aura_vaporize"
    const razorActionId = "razor.burst.lightning_fang.normal.fourth_hit"
    const kukiActionId = "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    const [amberEffects, yanfeiEffects, razorEffects, kukiEffects] = await Promise.all([
      getProjectedActionEffects(amberActionId),
      getProjectedActionEffects(yanfeiActionId),
      getProjectedActionEffects(razorActionId),
      getProjectedActionEffects(kukiActionId)
    ])

    expect(amberEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: amberEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Amber", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )
    expect(yanfeiEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: yanfeiEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Yanfei", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )
    expect(razorEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: razorEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 2 }
        })
      ])
    )
    expect(kukiEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: baizhuEffectId,
          source: { characterId: "Baizhu", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createBuild = (
      characterId: string,
      buildId: string,
      constellation: number,
      label: string,
      weaponId: string
    ) => ({
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      })),
      buildId,
      characterId,
      constellation,
      label,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
    })
    const amber = createBuild("Amber", "test.amber.c2-api", 2, "安柏 C2 API 测试", "FavoniusWarbow")
    const yanfei = createBuild("Yanfei", "test.yanfei.c2-api", 2, "烟绯 C2 API 测试", "FavoniusCodex")
    const razor = createBuild("Razor", "test.razor.c2-api", 2, "雷泽 C2 API 测试", "FavoniusGreatsword")
    const kuki = createBuild("KukiShinobu", "test.kuki.baizhu-c4-api", 0, "久岐忍白术 C4 受益 API 测试", "FavoniusSword")
    const baizhu = createBuild("Baizhu", "test.baizhu.c4-api", 4, "白术 C4 API 测试", "FavoniusCodex")
    const requestAnalysis = (
      primary: typeof amber,
      targetActionId: string,
      activeEffectIds: readonly string[],
      sourceBuildId?: string,
      teammates: readonly typeof amber[] = []
    ) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(sourceBuildId === undefined ? {} : { activeEffectSourceBuildIds: { [activeEffectIds[0]!]: sourceBuildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates
        },
        url: "/v1/analysis"
      })
    const [amberBaselineResponse, amberC2Response, yanfeiBaselineResponse, yanfeiC2Response, razorBaselineResponse, razorC2Response, baizhuBaselineResponse, baizhuC4Response] =
      await Promise.all([
        requestAnalysis(amber, amberActionId, []),
        requestAnalysis(amber, amberActionId, [amberEffectId], amber.buildId),
        requestAnalysis(yanfei, yanfeiActionId, []),
        requestAnalysis(yanfei, yanfeiActionId, [yanfeiEffectId], yanfei.buildId),
        requestAnalysis(razor, razorActionId, []),
        requestAnalysis(razor, razorActionId, [razorEffectId], razor.buildId),
        requestAnalysis(kuki, kukiActionId, [], undefined, [baizhu]),
        requestAnalysis(kuki, kukiActionId, [baizhuEffectId], baizhu.buildId, [baizhu])
      ])

    for (const response of [
      amberBaselineResponse,
      amberC2Response,
      yanfeiBaselineResponse,
      yanfeiC2Response,
      razorBaselineResponse,
      razorC2Response,
      baizhuBaselineResponse,
      baizhuC4Response
    ]) {
      expect(response.statusCode).toBe(200)
    }

    const amberBaseline = amberBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const amberC2 = amberC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const yanfeiBaseline = yanfeiBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const yanfeiC2 = yanfeiC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const razorBaseline = razorBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const razorC2 = razorC2Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const baizhuBaseline = baizhuBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly elementalMastery: number }
    }
    const baizhuC4 = baizhuC4Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly elementalMastery: number }
    }

    expect(amberC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: amberEffectId, sourceId: amber.buildId, target: "damageBonus", value: 2 })
      ])
    )
    expect(amberC2.stats.damageBonus - amberBaseline.stats.damageBonus).toBeCloseTo(2)
    expect(amberC2.result.expectedDamage).toBeGreaterThan(amberBaseline.result.expectedDamage)
    expect(yanfeiC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: yanfeiEffectId, sourceId: yanfei.buildId, target: "critRate", value: 0.2 })
      ])
    )
    expect(yanfeiC2.stats.critRate - yanfeiBaseline.stats.critRate).toBeCloseTo(0.2)
    expect(yanfeiC2.result.expectedDamage).toBeGreaterThan(yanfeiBaseline.result.expectedDamage)
    expect(razorC2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: razorEffectId, sourceId: razor.buildId, target: "critRate", value: 0.1 })
      ])
    )
    expect(razorC2.stats.critRate - razorBaseline.stats.critRate).toBeCloseTo(0.1)
    expect(razorC2.result.expectedDamage).toBeGreaterThan(razorBaseline.result.expectedDamage)
    expect(baizhuC4.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: baizhuEffectId, sourceId: baizhu.buildId, target: "elementalMastery", value: 80 })
      ])
    )
    expect(baizhuC4.stats.elementalMastery - baizhuBaseline.stats.elementalMastery).toBeCloseTo(80)
    expect(baizhuC4.result.expectedDamage).toBeGreaterThan(baizhuBaseline.result.expectedDamage)
  })

  it("exposes and evaluates self-owned Diluc C4 and Hu Tao C6 snapshots through the public endpoint", async () => {
    const dilucEffectId = "diluc.constellation.4.flowing_flame.searing_onslaught.next_hit.damage_bonus"
    const huTaoEffectId = "hu_tao.constellation.6.butterflys_rest.post_trigger.crit_rate"
    const dilucActionId = "diluc.skill.searing_onslaught.third_hit.hydro_aura_vaporize"
    const huTaoActionId = "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    const [dilucEffects, huTaoEffects] = await Promise.all([
      getProjectedActionEffects(dilucActionId),
      getProjectedActionEffects(huTaoActionId)
    ])

    expect(dilucEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: dilucEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "Diluc", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
    expect(huTaoEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: huTaoEffectId,
          recipientSourceRelation: "source",
          source: { characterId: "HuTao", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createBuild = (
      characterId: string,
      buildId: string,
      constellation: number,
      label: string,
      weaponId: string
    ) => ({
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      })),
      buildId,
      characterId,
      constellation,
      label,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
    })
    const diluc = createBuild("Diluc", "test.diluc.c4-api", 4, "迪卢克 C4 API 测试", "FavoniusGreatsword")
    const huTao = createBuild("HuTao", "test.hu-tao.c6-api", 6, "胡桃 C6 API 测试", "FavoniusLance")
    const requestAnalysis = (primary: typeof diluc, targetActionId: string, effectId?: string) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds: effectId === undefined ? [] : [effectId],
            ...(effectId === undefined ? {} : { activeEffectSourceBuildIds: { [effectId]: primary.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary,
          targetActionId,
          teammates: []
        },
        url: "/v1/analysis"
      })
    const [dilucBaselineResponse, dilucC4Response, huTaoBaselineResponse, huTaoC6Response] = await Promise.all([
      requestAnalysis(diluc, dilucActionId),
      requestAnalysis(diluc, dilucActionId, dilucEffectId),
      requestAnalysis(huTao, huTaoActionId),
      requestAnalysis(huTao, huTaoActionId, huTaoEffectId)
    ])

    for (const response of [dilucBaselineResponse, dilucC4Response, huTaoBaselineResponse, huTaoC6Response]) {
      expect(response.statusCode).toBe(200)
    }

    const dilucBaseline = dilucBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const dilucC4 = dilucC4Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly damageBonus: number }
    }
    const huTaoBaseline = huTaoBaselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }
    const huTaoC6 = huTaoC6Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critRate: number }
    }

    expect(dilucC4.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: dilucEffectId, sourceId: diluc.buildId, target: "damageBonus", value: 0.4 })
      ])
    )
    expect(dilucC4.stats.damageBonus - dilucBaseline.stats.damageBonus).toBeCloseTo(0.4)
    expect(dilucC4.result.expectedDamage).toBeGreaterThan(dilucBaseline.result.expectedDamage)
    expect(huTaoC6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: huTaoEffectId, sourceId: huTao.buildId, target: "critRate", value: 1 })
      ])
    )
    expect(huTaoC6.stats.critRate - huTaoBaseline.stats.critRate).toBeCloseTo(1)
    expect(huTaoC6.result.expectedDamage).toBeGreaterThan(huTaoBaseline.result.expectedDamage)
  })

  it("derives Gorou C6's three-Geo crit snapshot from the public team configuration", async () => {
    const effectId = "gorou.constellation.6.valorous_hound.three_or_more_geo.crit_damage"
    const actionId = "albedo.skill.transient_blossom"
    const scenarioEffects = await getProjectedActionEffects(actionId)

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          source: { characterId: "Gorou", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )

    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const createBuild = (
      characterId: string,
      buildId: string,
      constellation: number,
      label: string,
      weaponId: string
    ) => ({
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "TestNoArtifactSet"
      })),
      buildId,
      characterId,
      constellation,
      label,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
    })
    const albedo = createBuild("Albedo", "test.albedo.gorou-c6-api", 0, "阿贝多五郎 C6 API 测试", "AquilaFavonia")
    const gorou = createBuild("Gorou", "test.gorou.c6-api", 6, "五郎 C6 API 测试", "FavoniusWarbow")
    const navia = createBuild("Navia", "test.navia.gorou-c6-api", 0, "娜维娅五郎 C6 队伍 API 测试", "FavoniusGreatsword")
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length === 0 ? {} : { activeEffectSourceBuildIds: { [effectId]: gorou.buildId } }),
            enemyCount: 1
          },
          externalBuffs: [],
          primary: albedo,
          targetActionId: actionId,
          teammates: [gorou, navia]
        },
        url: "/v1/analysis"
      })
    const [baselineResponse, c6Response] = await Promise.all([requestAnalysis([]), requestAnalysis([effectId])])

    expect(baselineResponse.statusCode).toBe(200)
    expect(c6Response.statusCode).toBe(200)

    const baseline = baselineResponse.json().evaluation as {
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critDamage: number }
    }
    const c6 = c6Response.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly critDamage: number }
    }

    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: gorou.buildId, target: "critDamage", value: 0.4 })
      ])
    )
    expect(c6.stats.critDamage - baseline.stats.critDamage).toBeCloseTo(0.4)
    expect(c6.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
  })

  it("applies Crimson Witch's multiplier bonus to a Vaporize derived from a target aura through the public endpoint", async () => {
    const effectId = "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const requestAnalysis = (setId: string) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds: [],
            enemyCount: 1,
            targetAuraWindows: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
          },
          externalBuffs: [],
          primary: {
            ...presetScenario.primary,
            artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({ ...artifact, setId })),
            buildId: `test.mualani.${setId.toLowerCase()}-api`,
            characterId: "Mualani",
            constellation: 0,
            label: "玛拉妮 API 测试",
            talents: { burst: 10, normal: 10, skill: 10 },
            weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
          },
          targetActionId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
          teammates: []
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis("TestNoArtifactSet")
    const crimsonWitchResponse = await requestAnalysis("CrimsonWitchOfFlames")

    expect(baselineResponse.statusCode).toBe(200)
    expect(crimsonWitchResponse.statusCode).toBe(200)
    expect(crimsonWitchResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, target: "amplifyingReactionBonus", value: 0.15 })])
    )
    const rotationReaction = (crimsonWitchResponse.json().evaluation.rotation.events[0]?.trace as Array<Record<string, unknown>>).find(
      (entry) => entry.kind === "amplifying_reaction"
    )

    expect(rotationReaction).toMatchObject({ bonus: 0.15, reaction: "vaporize_forward" })
    expect(crimsonWitchResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      baselineResponse.json().evaluation.rotation.dpr
    )
  })

  it("applies Night of the Sky's Unveiling's selected full-moonsign crit snapshot through the public endpoint", async () => {
    const fullEffectId = "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xiangling")
    const moonsignTeammates = [
      {
        ...xiangling,
        artifacts: xiangling.artifacts.map((artifact: { readonly setId: string }) => ({
          ...artifact,
          setId: "TestNoArtifactSet"
        })),
        buildId: "test.night-of-the-skys-unveiling.aino",
        characterId: "Aino",
        label: "爱诺 满辉测试",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "LuxuriousSeaLord" }
      },
      {
        ...xiangling,
        artifacts: xiangling.artifacts.map((artifact: { readonly setId: string }) => ({
          ...artifact,
          setId: "TestNoArtifactSet"
        })),
        buildId: "test.night-of-the-skys-unveiling.lauma",
        characterId: "Lauma",
        label: "菈乌玛 满辉测试",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheWidsith" }
      }
    ]
    const requestAnalysis = (setId: string, activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: { activeEffectIds, enemyCount: 1 },
          externalBuffs: [],
          primary: {
            ...xiangling,
            artifacts: xiangling.artifacts.map((artifact: { readonly setId: string }) => ({ ...artifact, setId })),
            buildId: `test.xiangling.${setId.toLowerCase()}-night-of-the-skys-unveiling-api`
          },
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: moonsignTeammates
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis("TestNoArtifactSet", [])
    const fullMoonsignResponse = await requestAnalysis("NightOfTheSkysUnveiling", [fullEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(fullMoonsignResponse.statusCode).toBe(200)
    expect(fullMoonsignResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: fullEffectId, target: "critRate", value: 0.3 })])
    )
    expect(fullMoonsignResponse.json().evaluation.stats.critRate).toBeCloseTo(
      baselineResponse.json().evaluation.stats.critRate + 0.3
    )
    expect(fullMoonsignResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      baselineResponse.json().evaluation.rotation.dpr
    )
  })

  it("applies Silken Moon's Serenade's selected full-moonsign mastery from a teammate through the public endpoint", async () => {
    const fullEffectId = "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const xiangling = presetScenario.teammates.find((build: { readonly characterId: string }) => build.characterId === "Xiangling")
    const holder = {
      ...presetScenario.primary,
      artifacts: presetScenario.primary.artifacts.map((artifact: { readonly setId: string }) => ({
        ...artifact,
        setId: "SilkenMoonsSerenade"
      })),
      buildId: "test.silken-moons-serenade-holder-api",
      characterId: "Bennett",
      constellation: 0,
      label: "班尼特 纺月的夜歌来源测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const moonsignTeammates = [
      {
        ...holder,
        artifacts: holder.artifacts.map((artifact: { readonly setId: string }) => ({
          ...artifact,
          setId: "TestNoArtifactSet"
        })),
        buildId: "test.silken-moons-serenade.aino",
        characterId: "Aino",
        label: "爱诺 满辉测试",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "LuxuriousSeaLord" }
      },
      {
        ...holder,
        artifacts: holder.artifacts.map((artifact: { readonly setId: string }) => ({
          ...artifact,
          setId: "TestNoArtifactSet"
        })),
        buildId: "test.silken-moons-serenade.lauma",
        characterId: "Lauma",
        label: "菈乌玛 满辉测试",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheWidsith" }
      }
    ]
    const requestAnalysis = (activeEffectIds: readonly string[]) =>
      app.inject({
        method: "POST",
        payload: {
          ...presetScenario,
          conditions: {
            activeEffectIds,
            ...(activeEffectIds.length > 0 ? { activeEffectSourceBuildIds: { [fullEffectId]: holder.buildId } } : {}),
            enemyCount: 1
          },
          externalBuffs: [],
          primary: xiangling,
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: [holder, ...moonsignTeammates]
        },
        url: "/v1/analysis"
      })
    const baselineResponse = await requestAnalysis([])
    const fullMoonsignResponse = await requestAnalysis([fullEffectId])

    expect(baselineResponse.statusCode).toBe(200)
    expect(fullMoonsignResponse.statusCode).toBe(200)
    expect(fullMoonsignResponse.json().evaluation.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: fullEffectId, sourceId: holder.buildId, value: 120 })])
    )
    expect(fullMoonsignResponse.json().evaluation.stats.elementalMastery).toBeCloseTo(
      baselineResponse.json().evaluation.stats.elementalMastery + 120
    )
    expect(fullMoonsignResponse.json().evaluation.rotation.dpr).toBeGreaterThan(
      baselineResponse.json().evaluation.rotation.dpr
    )
  })

  it("derives Chongyun's active field through the API instead of accepting a caller-injected infusion", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: ["chongyun.skill.chonghuas_frost_field"],
          enemyCount: 1,
          targetAuraWindows: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
        },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.chongyun.normal",
          characterId: "Chongyun",
          constellation: 0,
          label: "重云测试配置",
          talents: { ...presetScenario.primary.talents, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
        },
        targetActionId: "chongyun.normal.auto.first_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.formulaAuthority).toBe("rotation_events")
    expect(response.json().evaluation.rotation.events[0]).toMatchObject({
      element: "cryo",
      elementOverride: {
        baseElement: "physical",
        element: "cryo",
        id: "chongyun.skill.chonghuas_frost_field"
      },
      elementalApplication: { applied: true, reaction: "melt_reverse" },
      trace: expect.arrayContaining([expect.objectContaining({ kind: "amplifying_reaction", reaction: "melt_reverse" })])
    })
    expect(response.json().evaluation.rotation.dpr).toBeGreaterThan(response.json().evaluation.result.expectedDamage)
  })

  it("does not let a caller-supplied elemental override window change an action", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: {
          activeEffectIds: [],
          enemyCount: 1,
          elementOverrideWindows: [
            { element: "pyro", end: 1, id: "forged.pyro", start: 0, target: "normal_attack" }
          ],
          targetAuraWindows: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
        },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.chongyun.uninfused",
          characterId: "Chongyun",
          constellation: 0,
          label: "重云未附魔测试配置",
          talents: { ...presetScenario.primary.talents, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
        },
        targetActionId: "chongyun.normal.auto.first_hit",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.rotation.events[0]).toMatchObject({
      element: "physical",
      elementalApplication: { applied: false }
    })
    expect(response.json().evaluation.rotation.events[0].elementOverride).toBeUndefined()
  })

  it("returns Collei's one-hit Spread trace and elemental-mastery marginal gain", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined, activeEffectIds: [] },
        externalBuffs: [],
        primary: {
          ...presetScenario.primary,
          buildId: "test.collei.skill.floral-sidewinder-outbound",
          characterId: "Collei",
          constellation: 0,
          label: "柯莱测试配置",
          talents: { ...presetScenario.primary.talents, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
        },
        targetActionId: "collei.skill.floral_sidewinder.outbound.spread",
        teammates: []
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.result.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          formula: expect.objectContaining({ kind: "additive_reaction", reaction: "spread" }),
          stage: "additive_reaction"
        })
      ])
    )
    expect(
      response.json().analysis.marginalSubstats.find((result: { stat: string }) => result.stat === "elemental_mastery")
        ?.gainRatio
    ).toBeGreaterThan(0)
  })

  it("returns Dehya's mixed attack and health terms as one target hit", async () => {
    const presetResponse = await app.inject({ method: "GET", url: "/v1/presets" })
    const presetScenario = presetResponse.json().presets[0].scenario
    const response = await app.inject({
      method: "POST",
      payload: {
        ...presetScenario,
        conditions: { ...presetScenario.conditions, actionParameters: undefined },
        primary: {
          ...presetScenario.primary,
          buildId: "test.dehya.burst.flame-manes-fist",
          characterId: "Dehya",
          constellation: 0,
          label: "迪希雅测试配置",
          talents: { ...presetScenario.primary.talents, burst: 10 },
          weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
        },
        targetActionId: "dehya.burst.flame_manes_fist"
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().evaluation.result.trace[0]).toMatchObject({
      formula: {
        kind: "scaling_terms",
        terms: [
          { coefficient: 1.7766, stat: "attack" },
          { coefficient: 0.030456, stat: "hp" }
        ]
      },
      stage: "scaling"
    })
    expect(response.json().evaluation.stats).toMatchObject({
      scalingTerms: [
        { coefficient: 1.7766, stat: "attack" },
        { coefficient: 0.030456, stat: "hp" }
      ],
      talentMultiplier: null
    })
    expect(response.json().analysis.marginalSubstats.find((result: { stat: string }) => result.stat === "atk")?.gainRatio)
      .toBeGreaterThan(0)
    expect(response.json().analysis.marginalSubstats.find((result: { stat: string }) => result.stat === "hp")?.gainRatio)
      .toBeGreaterThan(0)
  })
})
