import { describe, expect, it } from "vitest"

import {
  isCombatActionEffectApplicable,
  listActiveCombatActionEffectsForAction,
  listCombatActionEffects
} from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Xinyan C4 current-action effect", () => {
  it("declares an explicit Sweeping Fervor hit snapshot for Physical actions only", () => {
    const effectId = "xinyan.constellation.4.wildfire_rhythm.sweeping_fervor.physical_resistance_reduction"
    const selfPhysicalAction = requireAction("xinyan.normal.auto.first_hit")
    const teammatePhysicalAction = requireAction("xiangling.normal.auto.first_hit")
    const elementalAction = requireAction("xinyan.skill.sweeping_fervor.swing")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "节奏的传染 · C4 热情拂扫已命中目标（物理抗性降低 15%，12秒）",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, selfPhysicalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, teammatePhysicalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, elementalAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(selfPhysicalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(teammatePhysicalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(elementalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
