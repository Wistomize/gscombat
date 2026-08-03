import type { CombatActionEffect } from "../../combat/types.js"

export const BLIZZARD_STRAYER_CRYO_DAMAGE_BONUS = 0.15
export const BLIZZARD_STRAYER_CRYO_AURA_CRIT_RATE = 0.2
export const BLIZZARD_STRAYER_FROZEN_CRIT_RATE = 0.2

/** Typed two-piece and selected enemy-aura contributions of Blizzard Strayer to maintained core actions. */
export const blizzardStrayerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.blizzard-strayer.2pc.cryo-damage-bonus",
    label: "冰风迷途的勇士 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "BlizzardStrayer" },
    target: "damageBonus",
    targetFilter: { elements: ["cryo"] },
    value: { kind: "fixed", value: BLIZZARD_STRAYER_CRYO_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.blizzard-strayer.4pc.cryo-aura.crit-rate",
    label: "冰风迷途的勇士 · 四件套（当前目标处于冰元素影响下）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BlizzardStrayer" },
    target: "critRate",
    value: { kind: "fixed", value: BLIZZARD_STRAYER_CRYO_AURA_CRIT_RATE }
  },
  {
    activation: "active",
    id: "artifact.blizzard-strayer.4pc.frozen.crit-rate",
    label: "冰风迷途的勇士 · 四件套（当前目标处于冻结状态；可与冰元素影响叠加）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BlizzardStrayer" },
    target: "critRate",
    value: { kind: "fixed", value: BLIZZARD_STRAYER_FROZEN_CRIT_RATE }
  }
]
