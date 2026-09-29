import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

/** Element counts include the wearer; Radiance replaces both ordinary composition bonuses. */
export const wintersHeavyHeartCombatActionEffects: readonly CombatActionEffect[] = [0, 1, 2, 3, 4].flatMap(count =>
  [false, true].flatMap(stellar => {
      const rows = stellar
        ? [{ target: "elementalMastery", values: [20, 25, 30, 35, 40], elements: ["cryo", "electro"] },
           { target: "specialReactionDamageBonus", values: [0.06, 0.075, 0.09, 0.105, 0.12], elements: ["cryo", "electro"] }]
        : [{ target: "elementalMastery", values: [24, 30, 36, 42, 48], elements: ["cryo"] },
           { target: "attackPercent", values: [0.048, 0.06, 0.072, 0.084, 0.096], elements: ["electro"] }]
      return rows.map((row): CombatActionEffect => ({
        activation: "automatic", id: `weapon.winters-heavy-heart.${count}.${stellar}.${row.target}`,
        label: `凝雪沉心 · ${count}名${stellar ? "冰／雷角色（辉映·星烁）" : row.elements[0] === "cryo" ? "冰角色" : "雷角色"} · ${row.target === "attackPercent" ? "攻击力" : row.target === "elementalMastery" ? "元素精通" : "星烁反应伤害"}`,
        source: { kind: "weapon", weaponId: "WintersHeavyHeart" },
        condition: { kind: "team_element_count", elements: row.elements as ("cryo" | "electro")[], minimum: count, maximum: count },
        ...(stellar ? { lifecycle: prepareWeaponSpecialReaction(["stellar_superconduct", "stellar_swirl"], "party", true) } : {}),
        exclusivity: { group: "winters-heavy-heart-state", variant: stellar ? "stellar" : "ordinary", automaticPriority: stellar ? 2 : 1 },
        target: row.target as "attackPercent" | "elementalMastery" | "specialReactionDamageBonus",
        ...(row.target === "specialReactionDamageBonus" ? { targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] } } : {}),
        value: { kind: "refinement_table", values: row.values.map(value => value * count) }
      }))
    })
)
