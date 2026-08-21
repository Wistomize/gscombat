import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

const sameElementEffectIds = [1, 2, 3].map(
  (stack) => `weapon.jade-vista.same-element-teammate.${stack}.elemental-mastery-stack`
)
const differentElementEffectIds = [1, 2, 3].map(
  (stack) => `weapon.jade-vista.different-element-teammate.${stack}.attack-percent-stack`
)

/** Reviewed 7.0 coverage for Jade Vista. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [...sameElementEffectIds, ...differentElementEffectIds],
      id: "weapon.jade-vista.party-element-composition",
      label: "悬黎千钧 · 同元素队友元素精通与异元素队友攻击力（总计至多三层）",
      source: weaponSource("JadeVista"),
      status: "implemented"
    }
  ],
  equipmentId: "JadeVista",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
