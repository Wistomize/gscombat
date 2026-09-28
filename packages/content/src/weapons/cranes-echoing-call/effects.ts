import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const CRANES_ECHOING_CALL_PARTY_PLUNGE_DAMAGE_BONUS = [0.28, 0.41, 0.54, 0.67, 0.8] as const

/** Typed selected post-plunge team contribution of Crane's Echoing Call. */
export const cranesEchoingCallCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "plunge_access", provider: "party", recipient: "source" }, "装备者本人具有合法下落准备，触发后退场保留队伍增益"),
    id: "weapon.cranes-echoing-call.after-plunge-hit.party-plunge-damage-bonus",
    label: "鹤鸣余音 · 装备者下落攻击命中后20秒内（队伍下落攻击伤害）",
    source: { holder: "party_member", kind: "weapon", weaponId: "CranesEchoingCall", resolveOneMatchingPartySource: true },
    target: "damageBonus",
    targetFilter: { attackKinds: ["plunge"] },
    value: { kind: "refinement_table", values: CRANES_ECHOING_CALL_PARTY_PLUNGE_DAMAGE_BONUS }
  }
]
