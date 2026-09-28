import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect, prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

export const FLAME_FORGED_INSIGHT_AFTER_LISTED_REACTION_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const

/** Typed selected post-reaction elemental-mastery contribution of Flame-Forged Insight. */
export const flameForgedInsightCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: { kind: "any_of", alternatives: [
      ...(["electro_charged", "bloom", "ordinary_crystallize"] as const).map((reactionFamily) =>
        prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily, provider: "source", recipient: "source" }, "本人可触发武器列举的普通反应")),
      prepareWeaponSpecialReaction(["lunar_charged", "lunar_bloom", "lunar_crystallize"])
    ] },
    selectionMode: "optional",
    id: "weapon.flame-forged-insight.after-listed-reaction.elemental-mastery",
    label: "拾慧铸熔 · 触发感电、月感电、绽放、月绽放、结晶或月结晶后15秒内",
    source: { kind: "weapon", weaponId: "FlameForgedInsight" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: FLAME_FORGED_INSIGHT_AFTER_LISTED_REACTION_ELEMENTAL_MASTERY }
  }
]
