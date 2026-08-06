import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.chain-breaker.qualifying-party.1-character.attack-percent",
        "weapon.chain-breaker.qualifying-party.2-character.attack-percent",
        "weapon.chain-breaker.qualifying-party.3-character.attack-percent",
        "weapon.chain-breaker.qualifying-party.3-character.elemental-mastery",
        "weapon.chain-breaker.qualifying-party.4-character.attack-percent",
        "weapon.chain-breaker.qualifying-party.4-character.elemental-mastery"
      ],
      id: "weapon.chain-breaker.qualifying-party.stats",
      label: "碎链 · 符合条件的队伍角色数量对应的攻击力与元素精通",
      source: weaponSource("ChainBreaker"),
      status: "implemented"
    }
  ],
  equipmentId: "ChainBreaker",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
