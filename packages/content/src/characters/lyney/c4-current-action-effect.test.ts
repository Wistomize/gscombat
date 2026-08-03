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

describe("Lyney C4 current-action effect", () => {
  it("declares the post-hit Pyro-resistance snapshot for Pyro actions only", () => {
    const effectId = "lyney.constellation.4.well_versed_well_rehearsed.pyro_charged_attack.pyro_resistance_reduction"
    const pyroAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "熟稔习练的筹谋 · C4 火元素重击已命中目标（火元素抗性降低 20%，6秒）",
      source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
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
