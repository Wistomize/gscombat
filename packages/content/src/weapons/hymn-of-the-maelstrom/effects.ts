import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"
import { prepareWeaponEffect, prepareWeaponSpecialReaction } from "../../combat/weapon-preparation.js"

function preparation(stacks: number, enhanced: boolean): CombatEffectLifecycle {
  return { kind: "all_of", alternatives: [
    prepareWeaponEffect({ kind: "healing", provider: "source", recipient: "source",
      ...(stacks === 3 ? { sustained: true } : {}) }, "装备者本人治疗；持续治疗按三层，后台可触发"),
    ...(enhanced ? [{ kind: "any_of" as const, alternatives: [
      prepareWeaponSpecialReaction(["stellar_swirl"], "party"),
      { kind: "conditional" as const, preparation: "qualified" as const, retention: "while_applicable" as const,
        trigger: { event: "none" as const, sourceFieldPresence: "any" as const },
        applicability: { targetFrozen: true as const }, explanation: "仅明确冻结目标时计入冻结增强" }
    ] }] : [])
  ] }
}

/** HP is resolved before the capped source-HP conversion; only the actual foreground receives ATK%. */
export const hymnOfTheMaelstromCombatActionEffects: readonly CombatActionEffect[] = [1, 3].flatMap(stacks =>
  [false, true].flatMap((enhanced): CombatActionEffect[] => {
    const scale = stacks * (enhanced ? 1.75 : 1)
    const lifecycle = preparation(stacks, enhanced)
    const exclusivity = { group: "hymn-of-the-maelstrom-mead", variant: `${stacks}-${enhanced}`,
      automaticPriority: stacks + (enhanced ? 10 : 0) }
    return [
      {
        activation: "automatic", id: `weapon.hymn-of-the-maelstrom.${stacks}-${enhanced}.hp`,
        label: `漩流颂歌 · 告真的蜜酿${stacks}层生命值${enhanced ? "（增强75%）" : ""}`,
        source: { kind: "weapon", weaponId: "HymnOfTheMaelstrom" }, lifecycle, exclusivity,
        target: "hpPercent", value: { kind: "refinement_table", values: [0.04, 0.05, 0.06, 0.07, 0.08].map(value => value * scale) }
      },
      {
        activation: "automatic", id: `weapon.hymn-of-the-maelstrom.${stacks}-${enhanced}.party-attack`,
        label: `漩流颂歌 · ${stacks}层蜜酿，来源生命超过40000转前台攻击力${enhanced ? "（增强75%）" : ""}`,
        source: { kind: "weapon", weaponId: "HymnOfTheMaelstrom", holder: "party_member", resolveOneMatchingPartySource: true },
        lifecycle, exclusivity, requiresRecipientOnField: true,
        target: "attackPercent", value: { kind: "final_hp", offset: -40000,
          multiplier: { kind: "refinement_table", values: [0.004, 0.005, 0.006, 0.007, 0.008].map(value => value * scale / 1000) },
          maximumValue: { kind: "refinement_table", values: [0.08, 0.1, 0.12, 0.14, 0.16].map(value => value * scale) } }
      }
    ]
  })
)
