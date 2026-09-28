import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.prototype-crescent.after-weak-point-hit.attack-percent",
        "weapon.prototype-crescent.after-weak-point-hit.attack-percent.disabled"
      ],
      id: "weapon.prototype-crescent.after-weak-point-hit.attack-percent",
      label: "试作澹月 · 重击命中要害后的攻击力",
      source: {
        kind: "weapon",
        weaponId: "PrototypeCrescent"
      },
      status: "implemented"
    },
    {
      id: "weapon.prototype-crescent.after-weak-point-hit.movement-speed",
      label: "试作澹月 · 重击命中要害后的移动速度",
      reason: "移动速度不会改变一个已选核心动作单次命中的伤害数值。",
      source: {
        kind: "weapon",
        weaponId: "PrototypeCrescent"
      },
      status: "not_applicable"
    }
  ],
  equipmentId: "PrototypeCrescent",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
