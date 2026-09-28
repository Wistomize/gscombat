import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SONG_OF_BROKEN_PINES_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const SONG_OF_BROKEN_PINES_FULL_SIGIL_PARTY_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed self and selected full-sigil team attack contribution of Song of Broken Pines. */
export const songOfBrokenPinesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.song-of-broken-pines.attack-percent",
    label: "松籁响起之时 · 攻击力",
    source: { kind: "weapon", weaponId: "SongOfBrokenPines" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SONG_OF_BROKEN_PINES_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["normal", "charged"], provider: "source", recipient: "source" }, "本人提前完成普攻或重击符记准备，退场保留"),
    exclusivity: { group: "millennial-movement.party-attack-percent", variant: "song-of-broken-pines", automaticPriority: "refinement" },
    id: "weapon.song-of-broken-pines.full-sigil.party-attack-percent",
    label: "松籁响起之时 · 满层低语之符后12秒内（队伍攻击力）",
    source: { holder: "party_member", kind: "weapon", weaponId: "SongOfBrokenPines", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SONG_OF_BROKEN_PINES_FULL_SIGIL_PARTY_ATTACK_PERCENT }
  }
]
