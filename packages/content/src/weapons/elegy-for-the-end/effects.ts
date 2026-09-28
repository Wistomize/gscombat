import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const ELEGY_FOR_THE_END_ELEMENTAL_MASTERY = [60, 75, 90, 105, 120] as const
export const ELEGY_FOR_THE_END_FULL_SIGIL_PARTY_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const ELEGY_FOR_THE_END_FULL_SIGIL_PARTY_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const

/** Typed self and selected full-sigil party contributions of Elegy for the End. */
export const elegyForTheEndCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.elegy-for-the-end.self-elemental-mastery",
    label: "终末嗟叹之诗 · 不羁的千风",
    source: { kind: "weapon", weaponId: "ElegyForTheEnd" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: ELEGY_FOR_THE_END_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill", "burst"], provider: "source", recipient: "source" }, "本人可用战技或爆发重复命中，符记无独立到期时间，提前完成四次有效命中"),
    exclusivity: { group: "millennial-movement.party-attack-percent", variant: "elegy-for-the-end", automaticPriority: "refinement" },
    id: "weapon.elegy-for-the-end.full-sigil.party-attack-percent",
    label: "终末嗟叹之诗 · 满层追思之符后12秒内（队伍攻击力）",
    source: { holder: "party_member", kind: "weapon", weaponId: "ElegyForTheEnd", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ELEGY_FOR_THE_END_FULL_SIGIL_PARTY_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["skill", "burst"], provider: "source", recipient: "source" }, "本人可用战技或爆发重复命中，符记无独立到期时间，提前完成四次有效命中"),
    id: "weapon.elegy-for-the-end.full-sigil.party-elemental-mastery",
    label: "终末嗟叹之诗 · 满层追思之符后12秒内（队伍元素精通）",
    source: { holder: "party_member", kind: "weapon", weaponId: "ElegyForTheEnd", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: ELEGY_FOR_THE_END_FULL_SIGIL_PARTY_ELEMENTAL_MASTERY }
  }
]
