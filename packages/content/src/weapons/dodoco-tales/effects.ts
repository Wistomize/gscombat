import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const DODOCO_TALES_CHARGED_DAMAGE_BONUS_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const DODOCO_TALES_ATTACK_PERCENT_BY_REFINEMENT = [0.08, 0.1, 0.12, 0.14, 0.16] as const

/** Typed selected normal-hit and charged-hit contributions of Dodoco Tales. */
export const dodocoTalesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["normal"], provider: "source", recipient: "source" }, "前台普攻命中准备重击增伤", true),
    id: "weapon.dodoco-tales.after-normal-hit.charged-damage-bonus",
    label: "嘟嘟可故事集 · 普通攻击命中后（重击伤害）",
    source: { kind: "weapon", weaponId: "DodocoTales" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: DODOCO_TALES_CHARGED_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["charged"], provider: "source", recipient: "source" }, "前台重击命中准备攻击力", true),
    id: "weapon.dodoco-tales.after-charged-hit.attack-percent",
    label: "嘟嘟可故事集 · 重击命中后（攻击力）",
    source: { kind: "weapon", weaponId: "DodocoTales" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: DODOCO_TALES_ATTACK_PERCENT_BY_REFINEMENT }
  }
]
