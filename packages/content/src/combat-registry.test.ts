import { describe, expect, it } from "vitest"

import { listCombatActionEffects } from "./combat-action-effects.js"
import {
  getCharacterCombatCoverage,
  getCharacterCombatDefinition,
  getCombatAction,
  getCombatActionDefinition,
  getCombatMetricDefinition,
  listCharacterCombatCoverage,
  listCharacterCombatMetrics,
  listCharacterTalentLevelConstellationBonuses,
  listCombatActions,
  listCombatMetrics
} from "./combat-registry.js"
import { supportedCharacters } from "./catalog.js"

describe("character combat coverage registry", () => {
  it("keeps every teammate damage-support metric connected to the damage pipeline", () => {
    const damageSupportSemantics = new Set([
      "attack_buff",
      "bloom_related_reaction_damage_bonus",
      "bloom_related_reaction_flat_damage_addition",
      "damage_bonus",
      "defense_buff",
      "elemental_flat_damage_bonus",
      "elemental_mastery_buff",
      "elemental_normal_attack_damage_bonus",
      "geo_damage_flat_bonus",
      "lunar_bloom_flat_damage_bonus",
      "lunar_crystallize_base_damage_bonus",
      "lunar_crystallize_flat_damage_bonus",
      "normal_attack_flat_damage_bonus",
      "normal_and_charged_attack_damage_bonus",
      "resistance_reduction"
    ])
    const effectIds = new Set(listCombatActionEffects().map((effect) => effect.id))
    const pipelineAliases = new Map([
      ["bennett.burst.field.attack_buff", "scenario.bennett.burst.field.attack-buff"],
      [
        "iansan.burst.the_three_principles_of_power.kinetic_scale.low_nightsoul_attack_bonus",
        "iansan.burst.the_three_principles_of_power.kinetic_scale.high_nightsoul_attack_bonus"
      ],
      [
        "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
        "furina.burst.let-the-people-rejoice.maximum-fanfare.damage-bonus"
      ],
      [
        "xilonen.skill.source_samples.resistance_reduction",
        "xilonen.skill.source-samples.resistance-reduction"
      ]
    ])
    const disconnectedMetrics = listCombatMetrics().flatMap((metric) => {
      if (metric.target === "self") return []
      const affectsDamage = metric.kind === "stat_buff" ||
        (metric.kind === "scalar" && damageSupportSemantics.has(metric.semantic))
      if (!affectsDamage) return []
      const pipelineId = pipelineAliases.get(metric.id) ?? metric.id
      if (pipelineId === "scenario.bennett.burst.field.attack-buff" || effectIds.has(pipelineId)) return []
      return [metric.id]
    })

    expect(disconnectedMetrics).toEqual([])
  })

  it("keeps every coverage declaration, action, and metric reachable through the shared lookup APIs", () => {
    const coverage = listCharacterCombatCoverage()
    const actions = listCombatActions()
    const metrics = listCombatMetrics()

    expect(new Set(coverage.map((entry) => entry.characterId)).size).toBe(coverage.length)
    expect(new Set(actions.map((action) => action.id)).size).toBe(actions.length)
    expect(new Set(metrics.map((metric) => metric.id)).size).toBe(metrics.length)

    for (const entry of coverage) {
      const actionIds = new Set(entry.actions.map((action) => action.id))

      expect(entry.label.trim()).not.toHaveLength(0)
      expect(entry.detail.trim()).not.toHaveLength(0)
      expect(getCharacterCombatDefinition(entry.characterId)).toBe(entry)
      expect(getCharacterCombatCoverage(entry.characterId)).toBe(entry)
      expect(listCharacterCombatMetrics(entry.characterId)).toEqual(entry.metrics ?? [])

      for (const action of entry.actions) {
        expect(action.characterId).toBe(entry.characterId)
        expect(getCombatActionDefinition(action.id)).toBe(action)
        expect(getCombatAction(action.id)).toBe(action)
      }
      for (const metric of entry.metrics ?? []) {
        expect(metric.characterId).toBe(entry.characterId)
        expect(actionIds.has(metric.sourceActionId)).toBe(true)
        expect(getCombatMetricDefinition(metric.id)).toBe(metric)
      }
    }

    expect(getCharacterCombatDefinition("missing-character")).toBeUndefined()
    expect(getCombatActionDefinition("missing-action")).toBeUndefined()
    expect(getCombatMetricDefinition("missing-metric")).toBeUndefined()
    expect(listCharacterCombatMetrics("missing-character")).toEqual([])
  })

  it("projects only maintainer-selected verified damage metrics into the selectable-character catalog", () => {
    const expectedActionIds = [
      ...new Set(
        listCombatMetrics().flatMap((metric) =>
          metric.kind === "damage" && metric.status === "verified" ? [metric.actionId] : []
        )
      )
    ].sort()
    const catalogActionIds = supportedCharacters.flatMap((character) => character.primaryActionIds).sort()

    expect(catalogActionIds).toEqual(expectedActionIds)
    expect(new Set(supportedCharacters.map((character) => character.characterId)).size).toBe(supportedCharacters.length)

    for (const character of supportedCharacters) {
      expect(character.label.trim()).not.toHaveLength(0)
      expect(character.primaryActionIds).toEqual(character.primaryActions.map((action) => action.id))
      expect(new Set(character.primaryActionIds).size).toBe(character.primaryActionIds.length)
      for (const action of character.primaryActions) {
        expect(action.label.trim()).not.toHaveLength(0)
        expect(getCombatActionDefinition(action.id)?.characterId).toBe(character.characterId)
      }
    }
  })

  it("covers every available character's source-verified C3 and C5 talent slots", () => {
    const coverage = listCharacterCombatCoverage()
    const aloy = getCharacterCombatDefinition("Aloy")
    const traveler = getCharacterCombatDefinition("Traveler")
    if (!aloy || !traveler) throw new Error("Expected Aloy and Traveler coverage declarations")

    expect(aloy.talentLevelConstellationBonuses ?? []).toEqual([])
    expect(traveler.talentLevelConstellationBonuses).toHaveLength(12)

    const nonTravelerMappings = coverage
      .filter((entry) => entry.characterId !== "Aloy" && entry.characterId !== "Traveler")
      .flatMap((entry) => entry.talentLevelConstellationBonuses ?? [])
    expect(nonTravelerMappings).toHaveLength(230)
    expect(nonTravelerMappings.every((bonus) => bonus.travelerElement === undefined && bonus.value === 3)).toBe(true)
    expect(nonTravelerMappings.filter((bonus) => bonus.minimumSourceConstellation === 3)).toHaveLength(115)
    expect(nonTravelerMappings.filter((bonus) => bonus.minimumSourceConstellation === 5)).toHaveLength(115)

    const allMappings = [...nonTravelerMappings, ...(traveler.talentLevelConstellationBonuses ?? [])]
    expect(allMappings).toHaveLength(242)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 3)).toHaveLength(121)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 5)).toHaveLength(121)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 3 && bonus.talentSlot === "normal")).toHaveLength(7)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 3 && bonus.talentSlot === "skill")).toHaveLength(62)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 3 && bonus.talentSlot === "burst")).toHaveLength(52)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 5 && bonus.talentSlot === "normal")).toHaveLength(1)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 5 && bonus.talentSlot === "skill")).toHaveLength(52)
    expect(allMappings.filter((bonus) => bonus.minimumSourceConstellation === 5 && bonus.talentSlot === "burst")).toHaveLength(68)

    const travelerElements = ["anemo", "geo", "electro", "dendro", "hydro", "pyro"] as const
    for (const travelerElement of travelerElements) {
      expect(listCharacterTalentLevelConstellationBonuses("Traveler", travelerElement)).toHaveLength(2)
    }
  })
})
