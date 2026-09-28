import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"
import { prepareWeaponEffect, prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

const ownPreparation = ({ kind: "any_of", alternatives: [prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill"], provider: "source", recipient: "source" }, "本人战技命中"), prepareWeaponEffect({ kind: "special_reaction_damage", specialReactions: ["lunar_crystallize"], provider: "source", recipient: "source" }, "本人月结晶攻击")] } satisfies CombatEffectLifecycle)

export const GOLDEN_FROSTBOUND_OATH_DEFENSE_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const GOLDEN_FROSTBOUND_OATH_GEO_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const GOLDEN_FROSTBOUND_OATH_OTHER_PARTY_GEO_DAMAGE_BONUS = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const GOLDEN_FROSTBOUND_OATH_LUNAR_CRYSTALLIZE_DAMAGE_BONUS = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const GOLDEN_FROSTBOUND_OATH_OTHER_PARTY_LUNAR_CRYSTALLIZE_DAMAGE_BONUS = [
  0.2,
  0.25,
  0.3,
  0.35,
  0.4
] as const

/** Typed self and selected other-party Geo-damage contributions of Golden Frostbound Oath. */
export const goldenFrostboundOathCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.golden-frostbound-oath.defense-percent",
    label: "霜结的誓金枝 · 防御力提升",
    source: { kind: "weapon", weaponId: "GoldenFrostboundOath" },
    target: "defensePercent",
    value: { kind: "refinement_table", values: GOLDEN_FROSTBOUND_OATH_DEFENSE_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: ownPreparation,
    id: "weapon.golden-frostbound-oath.frost-fairys-requital.geo-damage-bonus",
    label: "霜结的誓金枝 · 霜妖精的报恩（岩元素伤害）",
    source: { kind: "weapon", weaponId: "GoldenFrostboundOath" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "refinement_table", values: GOLDEN_FROSTBOUND_OATH_GEO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: ownPreparation,
    id: "weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize.reaction-damage-bonus",
    label: "霜结的誓金枝 · 霜妖精的报恩（月结晶伤害）",
    source: { kind: "weapon", weaponId: "GoldenFrostboundOath" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_crystallize"] },
    value: { kind: "refinement_table", values: GOLDEN_FROSTBOUND_OATH_LUNAR_CRYSTALLIZE_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [ownPreparation, prepareWeaponSpecialReaction(["lunar_crystallize"], "party")] },
    id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-geo-damage-bonus",
    label: "霜结的誓金枝 · 霜妖精的恶戏已生效且月笼在旁（其他队友岩元素伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "GoldenFrostboundOath", resolveOneMatchingPartySource: true },
    target: "damageBonus",
    targetFilter: { elements: ["geo"], recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: GOLDEN_FROSTBOUND_OATH_OTHER_PARTY_GEO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [ownPreparation, prepareWeaponSpecialReaction(["lunar_crystallize"], "party")] },
    id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus",
    label: "霜结的誓金枝 · 霜妖精的恶戏已生效且月笼在旁（其他队友月结晶伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "GoldenFrostboundOath", resolveOneMatchingPartySource: true },
    target: "specialReactionDamageBonus",
    targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] },
    value: { kind: "refinement_table", values: GOLDEN_FROSTBOUND_OATH_OTHER_PARTY_LUNAR_CRYSTALLIZE_DAMAGE_BONUS }
  }
]
