import { describe, expect, it } from "vitest"

import { listCharacterCombatCoverage } from "../../combat-registry.js"

import { odetteCombatCoverage, odetteDamageActionIds, odetteEffectIds } from "./combat.js"
import { odetteDefinition } from "./definition.js"

describe("Odette combat logic", () => {
  it("publishes 7.0 logic in the executable registry", () => {
    expect(listCharacterCombatCoverage()).toContain(odetteCombatCoverage)
    expect(odetteDefinition.catalog.label).toBe("奥黛塔")
  })

  it("uses Coda at Dawn as the primary Stellar-Conduct and Stellar-Swirl metric", () => {
    const damageMetrics = odetteCombatCoverage.metrics?.filter((metric) => metric.kind === "damage") ?? []

    expect(damageMetrics.map((metric) => metric.actionId)).toEqual([
      odetteDamageActionIds.codaStellarSuperconduct,
      odetteDamageActionIds.codaStellarSwirl,
      odetteDamageActionIds.c4CoordinatedStellarSuperconduct,
      odetteDamageActionIds.c4CoordinatedStellarSwirl
    ])
    expect(damageMetrics.slice(2).map((metric) => metric.minimumSourceConstellation)).toEqual([4, 4])
  })

  it("adds the matching C1 extra hit to each Coda ending without replacing its talent multiplier", () => {
    const codaActionIds: readonly string[] = [
      odetteDamageActionIds.codaStellarSuperconduct,
      odetteDamageActionIds.codaStellarSwirl
    ]
    const codaActions = odetteCombatCoverage.actions.filter((action) => codaActionIds.includes(action.id))

    expect(codaActions).toHaveLength(2)
    expect(
      codaActions.map((action) => {
        const reference = action.parameterReferences?.[0]
        return reference?.source === "talent" ? reference.parameterIndex : undefined
      })
    ).toEqual([2, 3])
    expect(codaActions.map((action) => action.damageParts?.[1]?.scalingTerms?.[0])).toEqual([
      expect.objectContaining({ fixedCoefficient: 3, minimumSourceConstellation: 1, stat: "attack" }),
      expect.objectContaining({ fixedCoefficient: 4.5, minimumSourceConstellation: 1, stat: "attack" })
    ])
    expect(codaActions.map((action) => action.timeline?.damageEvents[1]?.minimumSourceConstellation)).toEqual([1, 1])
  })

  it("keeps Pathetique in the shared base multiplier and cumulative C6 in Elevation", () => {
    const effects = odetteCombatCoverage.actionEffects ?? []
    const pathetique = effects.find((effect) => effect.id === "odette.passive.pathetique.base_damage_multiplier")
    const c6Elevation = effects.filter((effect) => effect.target === "specialReactionElevation")

    expect(pathetique).toMatchObject({
      target: "specialReactionBaseDamageMultiplier",
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.3 },
        multiplier: { kind: "fixed", value: 0.00015 },
        offset: -1000
      }
    })
    expect(c6Elevation.map((effect) => effect.value)).toEqual([
      { kind: "fixed", value: 0.25 },
      { kind: "fixed", value: 0.2 }
    ])
  })

  it("declares the full reachable Splendor values and explicit C2 Radiance modes", () => {
    const effects = odetteCombatCoverage.actionEffects ?? []
    const c2Attack = effects.find(
      (effect) => effect.id === "odette.constellation.2.marvelous_splendor.attack_percent"
    )
    const attackMetric = odetteCombatCoverage.metrics?.find(
      (metric) => metric.id === "odette.constellation.2.marvelous_splendor.attack_percent"
    )

    expect(c2Attack).toMatchObject({ target: "attackPercent", value: { kind: "fixed", value: 0.42 } })
    expect(attackMetric).toMatchObject({
      ratioConstellationBonuses: [{ minimumConstellation: 2, value: 0.42 }],
      unit: "ratio"
    })
    expect(odetteCombatCoverage.scenarioEffectOptions?.map((option) => option.id)).toEqual([
      odetteEffectIds.stellarConductRadiance,
      odetteEffectIds.stellarSwirlRadiance
    ])
  })

  it("places the attack-based team bonus, Burst bonus, and C4 share in their reviewed stages", () => {
    const effects = odetteCombatCoverage.actionEffects ?? []
    const teamBaseBonus = effects.find(
      (effect) => effect.id === "odette.passive.stellar_benediction.silver_dawn_dance.base_damage_bonus"
    )
    const burstBonuses = effects.filter(
      (effect) => effect.id.includes("snow_swan_dream") && effect.target === "specialReactionDamageBonus"
    )

    expect(teamBaseBonus).toMatchObject({
      target: "specialReactionBaseDamageBonus",
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.14 },
        multiplier: { kind: "fixed", value: 0.00007 }
      }
    })
    expect(burstBonuses).toHaveLength(2)
    expect(burstBonuses[1]).toMatchObject({
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "talent_parameter", multiplier: 0.5 }
    })
  })
})
