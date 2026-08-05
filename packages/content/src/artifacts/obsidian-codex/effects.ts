import type { CombatActionEffect } from "../../combat/types.js"

export const OBSIDIAN_CODEX_NIGHTSOUL_DAMAGE_BONUS = 0.15
export const OBSIDIAN_CODEX_AFTER_NIGHTSOUL_CONSUMPTION_CRIT_RATE = 0.4

/** Typed selected Nightsoul-state contributions of Obsidian Codex to maintained core actions. */
export const obsidianCodexCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "artifact.obsidian-codex.2pc.nightsoul-blessing.damage-bonus",
    label: "黑曜秘典 · 二件套（前台且处于夜魂加持状态）",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ObsidianCodex" },
    target: "damageBonus",
    value: { kind: "fixed", value: OBSIDIAN_CODEX_NIGHTSOUL_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "source_nightsoul_blessing", required: true },
    id: "artifact.obsidian-codex.4pc.after-nightsoul-consumption.crit-rate",
    label: "黑曜秘典 · 四件套（消耗1点夜魂值后6秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ObsidianCodex" },
    target: "critRate",
    value: { kind: "fixed", value: OBSIDIAN_CODEX_AFTER_NIGHTSOUL_CONSUMPTION_CRIT_RATE }
  }
]
