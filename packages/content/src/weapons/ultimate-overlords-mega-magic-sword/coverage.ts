import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.ultimate-overlords-mega-magic-sword.attack-percent"],
      id: "weapon.ultimate-overlords-mega-magic-sword.attack-percent",
      label: "「究极霸王超级魔剑」· 攻击力",
      source: weaponSource("UltimateOverlordsMegaMagicSword"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.ultimate-overlords-mega-magic-sword.melusine.1-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.2-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.3-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.4-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.5-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.6-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.7-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.8-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.9-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.10-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.11-stack.attack-percent",
        "weapon.ultimate-overlords-mega-magic-sword.melusine.12-stack.attack-percent"
      ],
      id: "weapon.ultimate-overlords-mega-magic-sword.melusine.attack-percent",
      label: "「究极霸王超级魔剑」· 梅露辛数量对应的额外攻击力",
      source: weaponSource("UltimateOverlordsMegaMagicSword"),
      status: "implemented"
    }
  ],
  equipmentId: "UltimateOverlordsMegaMagicSword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
