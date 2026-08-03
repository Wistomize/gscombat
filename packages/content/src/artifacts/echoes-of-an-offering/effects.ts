import type { CombatActionEffect } from "../../combat/types.js"

export const ECHOES_OF_AN_OFFERING_ATTACK_PERCENT = 0.18
export const ECHOES_OF_AN_OFFERING_VALLEY_RITE_ATTACK_COEFFICIENT = 0.7

/** Typed two-piece and selected Valley Rite same-hit contributions of Echoes of an Offering. */
export const echoesOfAnOfferingCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.echoes-of-an-offering.2pc.attack-percent",
    label: "来歆余响 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "EchoesOfAnOffering" },
    target: "attackPercent",
    value: { kind: "fixed", value: ECHOES_OF_AN_OFFERING_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage",
    label: "来歆余响 · 四件套（本次普通攻击触发幽谷祝祀）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "EchoesOfAnOffering" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      coefficient: { kind: "fixed", value: ECHOES_OF_AN_OFFERING_VALLEY_RITE_ATTACK_COEFFICIENT },
      kind: "matched_action_additive_damage_term",
      scalingStat: "attack"
    }
  }
]
