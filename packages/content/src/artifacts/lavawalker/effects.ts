import type { CombatActionEffect } from "../../combat/types.js"

export const LAVAWALKER_PYRO_AURA_DAMAGE_BONUS = 0.35

/** Typed selected four-piece contribution of Lavawalker to one current action. */
export const lavawalkerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { sourceFieldPresence: "on_field", teamElements: ["pyro"] },
      explanation: "用户确认：前台且队伍有火时默认生效，不改变全局敌人附着"
    },
    id: "artifact.lavawalker.4pc.pyro-aura.damage-bonus",
    label: "渡过烈火的贤人 · 四件套（前台、队伍含火的准备假设）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "Lavawalker" },
    target: "damageBonus",
    value: { kind: "fixed", value: LAVAWALKER_PYRO_AURA_DAMAGE_BONUS }
  }
]
