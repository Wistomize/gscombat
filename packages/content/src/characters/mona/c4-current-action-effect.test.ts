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

describe("Mona C4 current-action effect", () => {
  it("declares an explicit Omen-target snapshot for any party attack", () => {
    const effectId = "mona.constellation.4.prophecy_of_oblivion.omen_target.crit_rate"
    const selfAction = requireAction("mona.normal.auto.first_hit")
    const teammateAction = requireAction("xiangling.normal.auto.first_hit")
    const nonCritAction = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "灭绝的预言 · C4 目标仍处于星异状态时队伍攻击暴击率 +15%",
      source: { characterId: "Mona", kind: "character", minimumSourceConstellation: 4 },
      target: "critRate",
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, selfAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, teammateAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, nonCritAction)).toBe(true)
    expect(listActiveCombatActionEffectsForAction(selfAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(teammateAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(nonCritAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
