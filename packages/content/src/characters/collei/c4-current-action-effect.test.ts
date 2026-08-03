import { describe, expect, it } from "vitest"

import {
  isCombatActionEffectApplicable,
  listActiveCombatActionEffectOptionsForAction,
  listCombatActionEffects
} from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Collei C4 current-action effect", () => {
  it("declares an explicit Trump-Card Kitty snapshot for teammates but not Collei herself", () => {
    const effectId = "collei.constellation.4.gift_of_the_woods.party_elemental_mastery"
    const hyperbloom = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const colleiAction = requireAction("collei.skill.floral_sidewinder.outbound.spread")
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "骞林馈遗 · C4 猫猫秘宝施放后附近队友元素精通（不包括柯莱）",
      source: { characterId: "Collei", kind: "character", minimumSourceConstellation: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 60 }
    })
    expect(isCombatActionEffectApplicable(effect!, hyperbloom)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, colleiAction)).toBe(true)
    expect(listActiveCombatActionEffectOptionsForAction(hyperbloom)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          recipientSourceRelation: "not_source",
          source: { characterId: "Collei", kind: "character", minimumSourceConstellation: 4 }
        })
      ])
    )
  })
})
