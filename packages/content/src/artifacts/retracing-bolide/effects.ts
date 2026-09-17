import type { CombatActionEffect } from "../../combat/types.js"

export const RETRACING_BOLIDE_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS = 0.4

/** Typed selected four-piece contribution of Retracing Bolide to one current action. */
export const retracingBolideCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: { kind: "any_of", alternatives: [
      {
        kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
        trigger: { event: "capability", sourceFieldPresence: "any", capability: { kind: "shield", provider: "party", recipient: "source" } },
        explanation: "当前前台装备者有有效护盾来源保护，默认四件套生效；不借队友自盾"
      },
      {
        kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
        trigger: { event: "capability", sourceFieldPresence: "any", capability: {
          kind: "reaction_trigger", provider: "party", recipient: "source", reactionFamily: "ordinary_crystallize"
        } }, explanation: "当前前台且队伍具有普通结晶护盾条件，默认四件套生效；月结晶不视作护盾"
      }
    ] },
    id: "artifact.retracing-bolide.4pc.shielded.normal-charged-damage-bonus",
    label: "逆飞的流星 · 四件套（当前角色处于护盾庇护下）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "RetracingBolide" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: RETRACING_BOLIDE_SHIELDED_NORMAL_CHARGED_DAMAGE_BONUS }
  }
]
