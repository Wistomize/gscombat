import type { CombatActionEffect } from "../../combat/types.js"

export const PRIMORDIAL_JADE_CUTTER_HP_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const PRIMORDIAL_JADE_CUTTER_FINAL_HP_TO_FLAT_ATTACK = [0.012, 0.015, 0.018, 0.021, 0.024] as const

/** Typed automatic health contribution of Primordial Jade Cutter. */
export const primordialJadeCutterCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.primordial-jade-cutter.hp-percent",
    label: "磐岩结绿 · 生命值",
    source: { kind: "weapon", weaponId: "PrimordialJadeCutter" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: PRIMORDIAL_JADE_CUTTER_HP_PERCENT }
  },
  {
    activation: "automatic",
    id: "weapon.primordial-jade-cutter.hp-sourced-flat-attack",
    label: "磐岩结绿 · 生命值上限转固定攻击力",
    source: { kind: "weapon", weaponId: "PrimordialJadeCutter" },
    target: "finalHpToFlatAttack",
    value: { kind: "refinement_table", values: PRIMORDIAL_JADE_CUTTER_FINAL_HP_TO_FLAT_ATTACK }
  }
]
