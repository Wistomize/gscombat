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

describe("Hu Tao C4 current-action effect", () => {
  it("declares an explicit Blood Blossom defeat snapshot for teammates but not Hu Tao", () => {
    const effectId = "hu_tao.constellation.4.garden_of_eternal_rest.blood_blossom_defeated.party_crit_rate"
    const huTaoAction = requireAction("hu_tao.burst.spirit_soother.base_hit")
    const teammateAction = requireAction("xiangling.normal.auto.first_hit")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "伴君眠花房 · C4 血梅香敌人被击败后队友暴击率提高（12%，15秒）",
      source: { characterId: "HuTao", kind: "character", minimumSourceConstellation: 4 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.12 }
    })
    expect(isCombatActionEffectApplicable(effect!, huTaoAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, teammateAction)).toBe(true)
    expect(listActiveCombatActionEffectsForAction(huTaoAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(teammateAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
