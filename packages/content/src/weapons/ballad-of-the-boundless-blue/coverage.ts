import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus",
        "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus"
      ],
      id: "weapon.ballad-of-the-boundless-blue.azure-skies.damage-bonus",
      label: "无垠蔚蓝之歌 · 命中前已持有的1至3层普通攻击或重击伤害提升（6秒内）",
      source: weaponSource("BalladOfTheBoundlessBlue", "primary"),
      status: "implemented"
    }
  ],
  equipmentId: "BalladOfTheBoundlessBlue",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
