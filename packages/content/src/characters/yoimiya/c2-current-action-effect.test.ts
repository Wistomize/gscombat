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

describe("Yoimiya C2 current-action effect", () => {
  it("declares an explicit self-only post-critical Pyro snapshot", () => {
    const effectId = "yoimiya.constellation.2.a_procession_of_jewels.pyro_critical_hit.pyro_damage_bonus"
    const pyroAction = requireAction("yoimiya.burst.ryukin_saxifrage.initial_arrow")
    const physicalAction = requireAction("yoimiya.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "万灯送火 · C2 火元素伤害暴击后火元素伤害加成（25%，6秒）",
      source: { characterId: "Yoimiya", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
    })
    expect(isCombatActionEffectApplicable(effect!, pyroAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, physicalAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(pyroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(physicalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
