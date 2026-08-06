import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.mistsplitter-reforged.all-element-damage-bonus",
        "weapon.mistsplitter-reforged.emblem.anemo.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.anemo.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.anemo.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.cryo.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.cryo.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.cryo.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.dendro.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.dendro.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.dendro.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.electro.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.electro.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.electro.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.geo.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.geo.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.geo.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.hydro.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.hydro.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.hydro.3-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.pyro.1-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.pyro.2-stack.damage-bonus",
        "weapon.mistsplitter-reforged.emblem.pyro.3-stack.damage-bonus"
      ],
      id: "weapon.mistsplitter-reforged.passive",
      label: "雾切之回光 · 所有元素伤害与元素类型对应的雾切之巴层数",
      source: weaponSource("MistsplitterReforged"),
      status: "implemented"
    }
  ],
  equipmentId: "MistsplitterReforged",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
