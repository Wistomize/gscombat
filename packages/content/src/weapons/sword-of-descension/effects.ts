import type { CombatActionEffect } from "../../combat/types.js"

/** Typed cooldown-ready physical hit of Sword of Descension. */
export const swordOfDescensionCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.sword-of-descension.descension.physical-hit",
    label: "降临之剑 · PlayStation Network 被动已生效，本次攻击触发物理伤害（冷却已就绪）",
    source: { kind: "weapon", weaponId: "SwordOfDescension" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "fixed", value: 2 },
      element: "physical",
      expectedTriggerProbability: 0.5,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  },
  {
    activation: "active",
    id: "weapon.sword-of-descension.playstation.traveler.flat-attack",
    label: "降临之剑 · PlayStation Network 被动已生效且旅行者装备时的固定攻击力",
    source: { kind: "weapon", weaponId: "SwordOfDescension" },
    target: "flatAttack",
    targetFilter: { recipientCharacterIds: ["Traveler"] },
    value: { kind: "fixed", value: 66 }
  }
]
