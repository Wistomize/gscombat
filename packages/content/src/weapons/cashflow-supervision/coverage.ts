import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.cashflow-supervision.attack-percent"],
      id: "weapon.cashflow-supervision.attack-percent",
      label: "金流监督 · 攻击力",
      source: weaponSource("CashflowSupervision"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.cashflow-supervision.hp-change.1-stack.normal-damage-bonus",
        "weapon.cashflow-supervision.hp-change.2-stack.normal-damage-bonus",
        "weapon.cashflow-supervision.hp-change.3-stack.normal-damage-bonus",
        "weapon.cashflow-supervision.hp-change.1-stack.charged-damage-bonus",
        "weapon.cashflow-supervision.hp-change.2-stack.charged-damage-bonus",
        "weapon.cashflow-supervision.hp-change.3-stack.charged-damage-bonus"
      ],
      id: "weapon.cashflow-supervision.hp-change.normal-charged-damage-bonus",
      label: "金流监督 · 生命值变化后的普通攻击与重击伤害",
      source: weaponSource("CashflowSupervision"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.cashflow-supervision.hp-change.1-stack.star-superconduct-damage-bonus",
        "weapon.cashflow-supervision.hp-change.2-stack.star-superconduct-damage-bonus",
        "weapon.cashflow-supervision.hp-change.3-stack.star-superconduct-damage-bonus"
      ],
      id: "weapon.cashflow-supervision.hp-change.star-superconduct-damage-bonus",
      label: "金流监督 · 生命值变化后的星超导反应伤害",
      source: weaponSource("CashflowSupervision"),
      status: "implemented"
    },
    {
      id: "weapon.cashflow-supervision.hp-change.three-stack.attack-speed",
      label: "金流监督 · 三层生命值变化后的攻击速度",
      reason: "攻击速度不改变一个已选核心动作的单次伤害。",
      source: weaponSource("CashflowSupervision"),
      status: "not_applicable"
    }
  ],
  equipmentId: "CashflowSupervision",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
