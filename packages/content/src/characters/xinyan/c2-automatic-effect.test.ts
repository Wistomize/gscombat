import { describe, expect, it } from "vitest"

import { isCombatActionEffectApplicable, listCombatActionEffects } from "../../combat-action-effects.js"
import { getCombatActionDefinition } from "../../combat-registry.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

describe("Xinyan C2 automatic effect", () => {
  it("declares only Riff Revolution's initial Physical strum as a C2 automatic critical-rate effect", () => {
    const effectId = "xinyan.constellation.2.impromptu_opening.initial_strum.crit_rate"
    const initialStrum = requireAction("xinyan.burst.riff_revolution.initial_strum")
    const otherAction = requireAction("xinyan.normal.auto.first_hit")
    const wrongElementAction = { ...initialStrum, element: "pyro" as const }
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "automatic",
      id: effectId,
      label: "C2 · 开场即兴段：叛逆刮弦初段物理伤害暴击率 +100%",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: {
        actionIds: ["xinyan.burst.riff_revolution.initial_strum"],
        elements: ["physical"]
      },
      value: { kind: "fixed", value: 1 }
    })
    expect(isCombatActionEffectApplicable(effect!, initialStrum)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, otherAction)).toBe(false)
    expect(isCombatActionEffectApplicable(effect!, wrongElementAction)).toBe(false)
  })
})
