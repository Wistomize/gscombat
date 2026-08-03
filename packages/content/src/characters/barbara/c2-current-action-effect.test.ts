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

describe("Barbara C2 current-action effect", () => {
  it("declares an explicit Let the Show Begin snapshot for Hydro actions only", () => {
    const effectId = "barbara.let_the_show_begin.c2.current_character.hydro_damage_bonus"
    const hydroAction = requireAction("mona.normal.auto.first_hit")
    const nonHydroAction = requireAction("xiangling.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "演唱，开始♪持续期间 · C2 当前场上角色水元素伤害加成",
      source: { characterId: "Barbara", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, hydroAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, nonHydroAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(hydroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(nonHydroAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
