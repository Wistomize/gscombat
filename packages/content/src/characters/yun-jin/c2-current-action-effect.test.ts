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

describe("Yun Jin C2 current-action effect", () => {
  it("declares an explicit Flying Cloud Flag Formation snapshot for self and teammate Normal Attacks only", () => {
    const effectId = "yun_jin.constellation.2.myriad_mise_en_scene.normal_attack_damage_bonus"
    const selfNormalAction = requireAction("yun_jin.normal.auto.first_hit")
    const teammateNormalAction = requireAction("xiangling.normal.auto.first_hit")
    const nonNormalAction = requireAction("yun_jin.skill.opening_flourish.press")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "诸般切末 · C2 施放破嶂见旌仪后普通攻击伤害加成（12秒）",
      source: { characterId: "YunJin", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { attackKinds: ["normal"] },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, selfNormalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, teammateNormalAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, nonNormalAction)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(selfNormalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(teammateNormalAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(nonNormalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
