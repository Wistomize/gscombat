import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"

const stellarPreparation: CombatEffectLifecycle = { kind: "any_of", alternatives: [
  {
    kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "any", capability: {
      kind: "reaction_trigger", recipient: "source", provider: "source", reactionFamily: "stellar"
    } }, explanation: "装备者自身具备星烁反应触发资格，默认已触发；前后台均保留"
  },
  {
    kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "any", capability: {
      kind: "special_reaction_damage", recipient: "source", provider: "source", specialReactions: ["stellar_swirl", "stellar_superconduct"]
    } }, explanation: "装备者自身具有符合当前队伍与站位的星烁伤害能力，默认已造成伤害；不借队友的伤害能力"
  }
] }

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
    activation: "automatic",
    lifecycle: stellarPreparation,
    id: "artifact.heart-of-the-furnace.4pc.after-stellar-reaction.self-attack-percent",
    label: "炉火融炼之心 · 触发或造成星烁反应伤害后的自身攻击力（12秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "HeartOfTheFurnace" },
    target: "attackPercent",
    value: { kind: "fixed", value: HEART_OF_THE_FURNACE_TRIGGERED_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: stellarPreparation,
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
