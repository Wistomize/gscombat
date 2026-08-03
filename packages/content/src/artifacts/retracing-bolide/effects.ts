import type { CombatActionEffect } from "../../combat/types.js"

export const RETRACING_BOLIDE_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS = 0.4

/** Typed selected four-piece contribution of Retracing Bolide to one current action. */
export const retracingBolideCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus",
    label: "逆飞的流星 · 四件套（当前角色处于护盾庇护下）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "RetracingBolide" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: RETRACING_BOLIDE_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS }
  }
]
