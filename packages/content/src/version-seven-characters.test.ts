import { describe, expect, it } from "vitest"

import { listCharacterCombatCoverage } from "./combat-registry.js"

describe("7.0 character registry", () => {
  const activeCoverage = listCharacterCombatCoverage()
  const cryoTraveler = activeCoverage.find((coverage) => coverage.characterId === "Traveler")
  const alyosha = activeCoverage.find((coverage) => coverage.characterId === "Alyosha")

  it("publishes Alyosha, Odette, and Cryo Traveler in the executable registry", () => {
    expect(activeCoverage.map((coverage) => coverage.characterId)).toEqual(
      expect.arrayContaining(["Alyosha", "Odette", "Traveler"])
    )
  })

  it("selects exactly Icebound Charged Attack and full-stack Ice-Forged Edge for Cryo Traveler", () => {
    expect(cryoTraveler?.metrics?.map((metric) => metric.label)).toEqual(
      expect.arrayContaining([
        "重击·冰凝 / 辉映·星超导特殊重击总伤害",
        "聚冰成锋 / 满8层寒辉·辉映·星超导五段总伤害"
      ])
    )
    const cryoActions = cryoTraveler?.actions.filter((action) => action.travelerElement === "cryo") ?? []
    expect(cryoActions).toHaveLength(2)
    expect(cryoActions[1]?.scenarioParameters).toEqual(expect.arrayContaining([
      expect.objectContaining({ defaultValue: 8, id: "cold-radiance-stacks", maximumValue: 8 })
    ]))

    const effects = cryoTraveler?.actionEffects ?? []
    expect(effects.find((effect) => effect.id.includes("icebound.fixed_attack_scaling"))).toMatchObject({
      target: "matchedActionAdditiveDamageTerm",
      value: { coefficient: { kind: "fixed", value: 1.4 }, scalingStat: "attack" }
    })
    expect(effects.find((effect) => effect.id.includes("stellar_benediction"))).toMatchObject({
      target: "specialReactionBaseDamageBonus",
      value: { maximumValue: { kind: "fixed", value: 0.07 }, multiplier: { kind: "fixed", value: 0.000035 } }
    })
  })

  it("models Alyosha as a source-owned support profile instead of personal damage", () => {
    expect(alyosha?.metrics?.map((metric) => metric.label)).toEqual([
      "猎者之准 / 攻击力提升",
      "图加林 / 单次当前场上角色治疗量",
      "星赴险域 / 场上角色星超导反应伤害提升",
      "复夺旌幡 / C6满2层元素精通提升"
    ])
    expect(alyosha?.actions.every((action) => action.kind === "support")).toBe(true)

    const precision = alyosha?.actions.find((action) => action.id.includes("hunters_precision"))
    expect(precision?.scenarioParameters?.[0]).toMatchObject({
      defaultValue: 1,
      maximumValue: 1,
      rangeBySourceConstellation: [{ defaultValue: 2, maximumValue: 2, minimumSourceConstellation: 6 }]
    })

    const effects = alyosha?.actionEffects ?? []
    expect(effects.filter((effect) => effect.target === "attackPercent")).toHaveLength(2)
    expect(effects.find((effect) => effect.target === "specialReactionDamageBonus")).toMatchObject({
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.2 }
    })

    expect(alyosha?.talentLevelConstellationBonuses).toEqual([
      { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
      { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
    ])

    const attackBuffMetric = alyosha?.metrics?.find(
      (metric) => metric.id === "alyosha.skill.hunters_precision.attack_percent"
    )
    expect(attackBuffMetric).toMatchObject({
      kind: "scalar",
      ratioParameter: {
        snapshotChecks: expect.arrayContaining([{ expectedValue: 0.25016, talentLevel: 13 }])
      }
    })
    if (attackBuffMetric?.kind !== "scalar" || attackBuffMetric.ratioParameter == null) {
      throw new Error("Alyosha's Hunter's Precision metric must use a talent ratio parameter")
    }
    const level13Ratio = attackBuffMetric.ratioParameter.snapshotChecks?.find((check) => check.talentLevel === 13)
    expect((level13Ratio?.expectedValue ?? 0) * 2).toBeCloseTo(0.50032)
  })
})
