import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"],
      id: "weapon.cinnabar-spindle.albedo-transient-blossom.defense-additive-damage",
      label: "辰砂之纺锤 · 阿贝多单次刹那之花（武器冷却就绪）的防御力伤害加算",
      source: weaponSource("CinnabarSpindle"),
      status: "implemented"
    },
    {
      id: "weapon.cinnabar-spindle.other-skill-hits.per-trigger-cooldown",
      label: "辰砂之纺锤 · 其它元素战技命中的1.5秒触发上限",
      reason: "当前同一命中加算会作用于一个元素战技的每一段，无法表示该被动每1.5秒至多触发一次；不能错误地让多段战技全段加算。",
      requiredCapability: "matched_action_additive_damage_term_with_per_trigger_cooldown_across_multi_hit_actions",
      source: weaponSource("CinnabarSpindle"),
      status: "unsupported"
    }
  ],
  equipmentId: "CinnabarSpindle",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
