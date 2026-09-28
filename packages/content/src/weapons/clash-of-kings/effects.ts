import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const CLASH_OF_KINGS_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const CLASH_OF_KINGS_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const

/** Typed post-skill contributions of Clash of Kings. */
export const clashOfKingsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.clash-of-kings.after-skill.attack-percent",
    label: "群王局戏 · 施放元素战技后的攻击力（棋中法度持续期间）",
    source: { kind: "weapon", weaponId: "ClashOfKings" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: CLASH_OF_KINGS_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "仅由装备者本人在当前队伍的合法准备能力触发，退场保留"),
    id: "weapon.clash-of-kings.after-skill.elemental-mastery",
    label: "群王局戏 · 施放元素战技后的元素精通（棋中法度持续期间）",
    source: { kind: "weapon", weaponId: "ClashOfKings" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: CLASH_OF_KINGS_ELEMENTAL_MASTERY }
  }
]
