import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus"
      ],
      id: "weapon.ballad-of-the-boundless-blue.azure-skies.damage-bonus",
      label: "无垠蔚蓝之歌 · 前台具备普通攻击或重击命中能力时默认提前三层，后台不预存",
      source: {
        holder: "primary",
        kind: "weapon",
        weaponId: "BalladOfTheBoundlessBlue"
      },
      status: "implemented"
    }
  ],
  equipmentId: "BalladOfTheBoundlessBlue",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
