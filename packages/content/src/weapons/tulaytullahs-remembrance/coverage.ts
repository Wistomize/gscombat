import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "weapon.tulaytullahs-remembrance.normal-attack-speed",
      label: "图莱杜拉的回忆 · 普通攻击速度",
      reason: "攻击速度会影响动作时长与循环，不改变选定普通攻击单段的期望数值。",
      source: weaponSource("TulaytullahsRemembrance"),
      status: "not_applicable"
    },
    {
      effectIds: [
        "weapon.tulaytullahs-remembrance.aeons-flow.1-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.2-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.3-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.4-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.5-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.6-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.7-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.8-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.9-unit.normal-damage-bonus",
        "weapon.tulaytullahs-remembrance.aeons-flow.10-unit.normal-damage-bonus"
      ],
      id: "weapon.tulaytullahs-remembrance.aeons-flow.normal-damage-bonus",
      label: "图莱杜拉的回忆 · 流转的微风当前累计量对应的普通攻击伤害",
      source: weaponSource("TulaytullahsRemembrance"),
      status: "implemented"
    }
  ],
  equipmentId: "TulaytullahsRemembrance",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
