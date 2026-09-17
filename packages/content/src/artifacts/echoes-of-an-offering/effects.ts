import type { CombatActionEffect } from "../../combat/types.js"
import { whileSourceOnField } from "../../combat/capabilities.js"

export const ECHOES_OF_AN_OFFERING_ATTACK_PERCENT = 0.18
export const ECHOES_OF_AN_OFFERING_VALLEY_RITE_ATTACK_COEFFICIENT = 0.7
export const ECHOES_OF_AN_OFFERING_AVERAGE_ATTACK_COEFFICIENT = 0.7 / 1.99188736

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
    activation: "automatic",
    lifecycle: whileSourceOnField("按平均触发率 1 / 1.99188736 折算同击基础区加算；不模拟随机事件或攻击频率"),
    id: "artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage",
    label: "来歆余响 · 四件套（前台普攻，平均触发率约 50.2%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "EchoesOfAnOffering" },
    target: "matchedActionAdditiveDamageTerm",
    targetFilter: { attackKinds: ["normal"] },
    value: {
      coefficient: { kind: "fixed", value: ECHOES_OF_AN_OFFERING_AVERAGE_ATTACK_COEFFICIENT },
      kind: "matched_action_additive_damage_term",
      scalingStat: "attack"
    }
  }
]
