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

describe("Razor C1 current-action effect", () => {
  it("declares an explicit self-only orb-or-particle snapshot for all Razor damage", () => {
    const effectId = "razor.constellation.1.wolf_instinct.elemental_orb_or_particle.damage_bonus"
    const physicalAction = requireAction("razor.burst.lightning_fang.normal.fourth_hit")
    const electroAction = requireAction("razor.burst.lightning_fang.initial_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "狼性 · C1 获取元素晶球或元素微粒后伤害提高（10%，8秒）",
      source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.1 }
    })
    expect(isCombatActionEffectApplicable(effect!, physicalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, electroAction)).toBe(true)
    expect(listActiveCombatActionEffectsForAction(physicalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(electroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
