import type { CombatActionEffect } from "../../combat/types.js"

export const HEART_OF_THE_FURNACE_ATTACK_PERCENT = 0.18
export const HEART_OF_THE_FURNACE_TRIGGERED_ATTACK_PERCENT = 0.12
export const HEART_OF_THE_FURNACE_PARTY_STELLAR_DAMAGE_BONUS = 0.5

const stellarReactionKinds = ["stellar_superconduct", "stellar_swirl"] as const

/** Typed self and non-stacking party contributions of Heart of the Furnace. */
export const heartOfTheFurnaceCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.heart-of-the-furnace.2pc.attack-percent",
    label: "炉火融炼之心 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "HeartOfTheFurnace" },
    target: "attackPercent",
    value: { kind: "fixed", value: HEART_OF_THE_FURNACE_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.heart-of-the-furnace.4pc.after-stellar-reaction.self-attack-percent",
    label: "炉火融炼之心 · 触发或造成星烁反应伤害后的自身攻击力（12秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "HeartOfTheFurnace" },
    target: "attackPercent",
    value: { kind: "fixed", value: HEART_OF_THE_FURNACE_TRIGGERED_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus",
    label: "炉火融炼之心 · 队伍星超导/星扩散反应伤害（同名套装不叠加，12秒内）",
    source: {
      holder: "party_member",
      kind: "artifact_set",
      minimumPieces: 4,
      resolveOneMatchingPartySource: true,
      setId: "HeartOfTheFurnace"
    },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: stellarReactionKinds },
    value: { kind: "fixed", value: HEART_OF_THE_FURNACE_PARTY_STELLAR_DAMAGE_BONUS }
  }
]
