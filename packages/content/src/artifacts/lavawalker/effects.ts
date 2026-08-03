import type { CombatActionEffect } from "../../combat/types.js"

export const LAVAWALKER_PYRO_AURA_DAMAGE_BONUS = 0.35

/** Typed selected four-piece contribution of Lavawalker to one current action. */
export const lavawalkerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "artifact.lavawalker.4pc.pyro-aura.damage-bonus",
    label: "渡过烈火的贤人 · 四件套（当前目标受火元素影响）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "Lavawalker" },
    target: "damageBonus",
    value: { kind: "fixed", value: LAVAWALKER_PYRO_AURA_DAMAGE_BONUS }
  }
]
