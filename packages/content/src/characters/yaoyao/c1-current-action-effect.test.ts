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

describe("Yaoyao C1 current-action effect", () => {
  it("declares an explicit on-field recipient snapshot for Dendro damage only", () => {
    const effectId = "yaoyao.constellation.1.adeptus_tutelage.white_jade_radish.active_character.dendro_damage_bonus"
    const dendroAction = requireAction("collei.burst.trump_card_kitty.initial_explosion")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "妙受琼阁 · C1 当前场上角色处于白玉萝卜爆炸范围内（草元素伤害加成 15%，8秒）",
      source: { characterId: "Yaoyao", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: { elements: ["dendro"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, dendroAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, physicalAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(dendroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(physicalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
