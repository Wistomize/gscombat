import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect, prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

/** Radiance replaces, rather than adds to, the ordinary Verdure state. */
export const newBoughCombatActionEffects: readonly CombatActionEffect[] = [1, 2, 3].flatMap(count =>
  [false, true].flatMap(stellar => {
    const rows = stellar
      ? [{ target: "attackPercent", values: [0.06, 0.075, 0.09, 0.105, 0.12] },
         { target: "specialReactionDamageBonus", values: [0.08, 0.1, 0.12, 0.14, 0.16] }]
      : [{ target: "attackPercent", values: [0.04, 0.05, 0.06, 0.07, 0.08] },
         { target: "elementalMastery", values: [20, 25, 30, 35, 40] }]
    return rows.map((row): CombatActionEffect => ({
      activation: "automatic", id: `weapon.new-bough.${stellar ? "stellar" : "ordinary"}.${count}.${row.target}`,
      label: `新枝 · ${count}层蓊郁${stellar ? "（辉映·星烁）" : ""} · ${row.target === "attackPercent" ? "攻击力" : row.target === "elementalMastery" ? "元素精通" : "星烁反应伤害"}`,
      source: { kind: "weapon", weaponId: "NewBough" },
      lifecycle: { kind: "all_of", alternatives: [
        { kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
          trigger: { event: "skill_cast", sourceFieldPresence: "on_field" }, explanation: "施放战技后准备蓊郁" },
        prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source",
          opportunityWindow: { seconds: 6, minimum: count, measure: "hits", minimumSeparationSeconds: 1 } },
          "六秒内每秒至多叠一层，后台可触发"),
        ...(stellar ? [prepareWeaponSpecialReaction(["stellar_superconduct", "stellar_swirl"], "party", true)] : [])
      ] },
      exclusivity: { group: "new-bough-verdure", variant: `${stellar}-${count}`, automaticPriority: (stellar ? 10 : 0) + count },
      target: row.target as "attackPercent" | "elementalMastery" | "specialReactionDamageBonus",
      ...(row.target === "specialReactionDamageBonus" ? { targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] } } : {}),
      value: { kind: "refinement_table", values: row.values.map(value => value * count) }
    }))
  })
)
