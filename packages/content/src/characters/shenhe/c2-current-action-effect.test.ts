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

describe("Shenhe C2 current-action effect", () => {
  it("declares an explicit Divine Maiden's Deliverance field snapshot for Cryo actions only", () => {
    const effectId = "shenhe.divine_maidens_deliverance.c2.current_character.cryo_damage_bonus"
    const cryoAction = requireAction("kaeya.skill.frostgnaw")
    const nonCryoAction = requireAction("kaeya.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "神女遣灵真诀领域内 · C2 当前场上角色冰元素伤害加成",
      source: { characterId: "Shenhe", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, cryoAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, nonCryoAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(cryoAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(nonCryoAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
