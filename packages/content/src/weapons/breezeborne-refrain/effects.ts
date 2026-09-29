import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

/** The energy recharge is unconditional; the party buff requires the wearer's own E/Q hits. */
export const breezeborneRefrainCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic", id: "weapon.breezeborne-refrain.energy-recharge",
    label: "柔风游弦 · 元素充能效率", source: { kind: "weapon", weaponId: "BreezeborneRefrain" },
    target: "energyRecharge", value: { kind: "refinement_table", values: [0.2, 0.25, 0.3, 0.35, 0.4] }
  },
  {
    activation: "automatic", id: "weapon.breezeborne-refrain.party-stellar-damage",
    label: "柔风游弦 · 三次战技／爆发命中后的全队星烁反应伤害",
    source: { kind: "weapon", weaponId: "BreezeborneRefrain", holder: "party_member", resolveOneMatchingPartySource: true },
    lifecycle: { kind: "any_of", alternatives: [
      prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source",
        hitKinds: ["skill", "burst"], sustained: true }, "本人持续战技／爆发命中可提前积满；后台可触发"),
      prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source",
        hitKinds: ["skill", "burst"], opportunityWindow: {
          seconds: 12, minimum: 3, measure: "hits", minimumSeparationSeconds: 0.03
        } }, "本人有明确三次有效战技／爆发命中证据，可准备全队增益")
    ] },
    target: "specialReactionDamageBonus", targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
    value: { kind: "refinement_table", values: [0.24, 0.3, 0.36, 0.42, 0.48] }
  }
]
