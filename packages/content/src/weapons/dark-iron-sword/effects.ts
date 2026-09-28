import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

// The pinned 6.7 GO snapshot includes the expanded Electro-reaction list and full refinement table.
export const DARK_IRON_SWORD_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed selected post-Electro-reaction attack contribution of Dark Iron Sword. */
export const darkIronSwordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "any", reactionElements: ["electro"],
      elements: ["pyro", "hydro", "cryo", "electro", "dendro", "anemo"], provider: "source", recipient: "source" }, "本人可触发所列雷相关反应，岩结晶排除；不以直伤冒充反应触发"),
    id: "weapon.dark-iron-sword.electro-reaction-window.attack-percent",
    label: "暗铁剑 · 此前触发雷元素相关反应后的12秒内攻击力",
    source: { kind: "weapon", weaponId: "DarkIronSword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: DARK_IRON_SWORD_ATTACK_PERCENT }
  }
]
