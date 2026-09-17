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
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { sourceFieldPresence: "on_field", teamElements: ["cryo"] },
      explanation: "装备者前台且队伍有冰元素时默认20%暴击；仅本套准备，不改变全局敌人附着"
    },
    id: "artifact.blizzard-strayer.4pc.cryo-aura.crit-rate",
    label: "冰风迷途的勇士 · 四件套（前台且队伍有冰，默认20%暴击）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BlizzardStrayer" },
    target: "critRate",
    value: { kind: "fixed", value: BLIZZARD_STRAYER_CRYO_AURA_CRIT_RATE }
  },
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { sourceFieldPresence: "on_field", teamElements: ["cryo"], targetFrozen: true },
      explanation: "外部冻结开关开启时追加20%暴击；开关不能绕过前台与队伍有冰的要求"
    },
    id: "artifact.blizzard-strayer.4pc.frozen.crit-rate",
    label: "冰风迷途的勇士 · 四件套（当前目标处于冻结状态；可与冰元素影响叠加）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BlizzardStrayer" },
    target: "critRate",
    value: { kind: "fixed", value: BLIZZARD_STRAYER_FROZEN_CRIT_RATE }
  }
]
