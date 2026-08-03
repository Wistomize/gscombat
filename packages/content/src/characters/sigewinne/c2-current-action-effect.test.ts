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

describe("Sigewinne C2 current-action effect", () => {
  it("declares only C2's explicit post-hit Hydro-resistance-reduction clause", () => {
    const effectId = "sigewinne.constellation.2.can_the_merciful_spirit_defeat_its_foes.hydro_resistance_reduction"
    const hydroAction = requireAction("mona.normal.auto.first_hit")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "最仁慈的精灵，可否化解仇敌 · C2 减抗子句：水球或心意注射已命中目标（水元素抗性降低 35%，8秒）",
      source: { characterId: "Sigewinne", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.35 }
    })
    expect(isCombatActionEffectApplicable(effect!, hydroAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, physicalAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(hydroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(physicalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
