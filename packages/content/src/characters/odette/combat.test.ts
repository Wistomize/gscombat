import { describe, expect, it } from "vitest"

import { listCharacterCombatCoverage } from "../../combat-registry.js"

import { odetteCombatCoverage, odetteEffectIds } from "./combat.js"
import { odetteDefinition } from "./definition.js"

describe("Odette combat logic", () => {
  it("publishes 7.0 logic in the executable registry", () => {
    expect(listCharacterCombatCoverage()).toContain(odetteCombatCoverage)
    expect(odetteDefinition.catalog.label).toBe("奥黛塔")
  })

  it("declares Plume and Wing ordinary, Stellar-Conduct, and Stellar-Swirl hit metrics", () => {
    const damageMetrics = odetteCombatCoverage.metrics?.filter((metric) => metric.kind === "damage") ?? []

    expect(damageMetrics.map((metric) => metric.actionId)).toEqual([
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume",
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_conduct",
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_swirl",
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing",
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_conduct",
      "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_swirl"
    ])
    expect(odetteCombatCoverage.actions.filter((action) => action.specialReaction?.kind === "stellar_swirl"))
      .toHaveLength(2)
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
