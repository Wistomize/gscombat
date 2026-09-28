import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const TAMAYURATEI_NO_OHANASHI_AFTER_SKILL_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected post-skill attack contribution of Tamayuratei no Ohanashi. */
export const tamayurateiNoOhanashiCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.tamayuratei-no-ohanashi.after-skill.attack-percent",
    label: "且住亭御咄 · 施放元素战技后10秒内",
    source: { kind: "weapon", weaponId: "TamayurateiNoOhanashi" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: TAMAYURATEI_NO_OHANASHI_AFTER_SKILL_ATTACK_PERCENT }
  }
]
