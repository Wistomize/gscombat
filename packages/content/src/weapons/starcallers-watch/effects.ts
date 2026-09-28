import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const STARCALLERS_WATCH_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const
export const STARCALLERS_WATCH_SHIELDED_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed unconditional and selected shielded contributions of Starcaller's Watch. */
export const starcallersWatchCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.starcallers-watch.elemental-mastery",
    label: "祭星者之望 · 星芒的显迹",
    source: { kind: "weapon", weaponId: "StarcallersWatch" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: STARCALLERS_WATCH_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic", requiresRecipientOnField: true,
    lifecycle: { kind: "any_of", alternatives: [
      prepareWeaponEffect({ kind: "shield", provider: "source", recipient: "source" }, "装备者自身生成护盾后，实际前台角色获得增伤"),
      prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "ordinary_crystallize", provider: "source", recipient: "source" }, "装备者能够触发并拾取普通结晶，授予实际前台角色增伤")
    ] },
    id: "weapon.starcallers-watch.shielded.damage-bonus",
    label: "祭星者之望 · 当前角色处于护盾庇护下",
    source: { kind: "weapon", weaponId: "StarcallersWatch", holder: "party_member", resolveOneMatchingPartySource: true },
    target: "damageBonus",
    value: { kind: "refinement_table", values: STARCALLERS_WATCH_SHIELDED_DAMAGE_BONUS }
  }
]
