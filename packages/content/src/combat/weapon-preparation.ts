import type { CombatCapabilityRequirement, CombatEffectLifecycle } from "./capabilities.js"
import type { CombatActionEffect } from "./types.js"

/** Binds authored variants to one necessary choice; no raw coefficients are accepted from clients. */
export function withWeaponChoice(
  effects: readonly CombatActionEffect[], group: string, label: string, defaultVariant: string,
  zeroVariant?: string
): readonly CombatActionEffect[] {
  const first = effects.find((effect) => effect.exclusivity?.group === group)
  const candidates = [...effects]
  if (zeroVariant && first && first.target !== "additionalDamageEvent" && first.target !== "matchedActionAdditiveDamageTerm") {
    candidates.push({ ...first, id: `${first.id}.zero`, label: `${label} · 0 / 无`,
      exclusivity: { group, variant: zeroVariant }, value: { kind: "fixed", value: 0 } })
  }
  return candidates.map((effect) => {
    if (effect.exclusivity?.group !== group) return effect
    return { ...effect, activation: "active", selectionMode: "optional",
      weaponChoice: { group, label, defaultVariant, variant: effect.exclusivity.variant, variantLabel: effect.label } }
  })
}

/** Adds an explicit disabled variant to a numeric on/off effect, preserving the legacy enabled ID. */
export function withWeaponToggle(
  effect: CombatActionEffect, group: string, label: string, defaultOn: boolean
): readonly CombatActionEffect[] {
  if (effect.target === "additionalDamageEvent" || effect.target === "matchedActionAdditiveDamageTerm") {
    throw new Error(`Weapon toggle ${group} requires numeric effects`)
  }
  return withWeaponChoice([
    { ...effect, exclusivity: { group, variant: "on" } },
    { ...effect, id: `${effect.id}.disabled`, label: `${label} · 关闭`,
      exclusivity: { group, variant: "off" }, value: { kind: "fixed", value: 0 } }
  ], group, label, defaultOn ? "on" : "off")
}

/** Declares a proven preparation without replacing the actual field context used by the damage hit. */
export function prepareWeaponEffect(
  requirement: CombatCapabilityRequirement,
  explanation: string,
  foregroundOnly = false
): CombatEffectLifecycle {
  return {
    kind: "conditional", preparation: "qualified",
    retention: foregroundOnly ? "clear_on_exit" : "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "on_field", capability: requirement },
    explanation
  }
}

/** Received healing requires a provider that can actually heal the wearer, including self healing. */
export function prepareWeaponHealing(): CombatEffectLifecycle {
  return prepareWeaponEffect({ kind: "healing", provider: "party", recipient: "source" },
    "有适用治疗来源时，按提前充分受疗后仍处于有效期计算；不推断当前血线")
}

/** Marks can come from receiving healing or healing someone else, then require an E/Q to consume them. */
export function prepareWeaponHealingMarks(): CombatEffectLifecycle {
  return { kind: "all_of", alternatives: [
    { kind: "any_of", alternatives: [prepareWeaponHealing(),
      prepareWeaponEffect({ kind: "healing", provider: "source", recipient: "recipient", recipientOtherThanSource: true },
        "装备者本人治疗队友也可准备三枚标记")
    ] },
    { kind: "any_of", alternatives: ["skill_cast", "burst_cast"].map((event) => ({
      kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
      trigger: { event: event as "skill_cast" | "burst_cast", sourceFieldPresence: "on_field" },
      explanation: "默认提前积攒三枚，并施放元素战技或元素爆发消耗标记"
    })) }
  ] }
}

/** E or Q is a cast preparation, not a hit requirement (non-damaging bursts also qualify). */
export function prepareWeaponSkillOrBurst(foregroundOnly = false): CombatEffectLifecycle {
  return { kind: "any_of", alternatives: (["skill_cast", "burst_cast"] as const).map((event) => ({
    kind: "conditional", preparation: "qualified", retention: foregroundOnly ? "clear_on_exit" : "retain_on_exit",
    trigger: { event, sourceFieldPresence: "on_field" }, explanation: "本人提前施放元素战技或元素爆发"
  })) }
}

/** Retains obsolete stack IDs without letting explicit legacy input bypass an automatic rule. */
export function prepareMaximumWeaponStacks(
  count: number, maximum: number, requirement: CombatCapabilityRequirement, foregroundOnly = false
): CombatEffectLifecycle {
  return count === maximum ? prepareWeaponEffect(requirement, "按已确认的本人能力准备满层", foregroundOnly)
    : { kind: "excluded", reason: "自动规则已接管层数；旧手选层数不再改变结果" }
}

/** Qualifies actual application-based special reactions, optionally including explicitly declared direct damage. */
export function prepareWeaponSpecialReaction(
  kinds: NonNullable<CombatCapabilityRequirement["specialReactions"]>, provider: "source" | "party" = "source",
  includeDirectDamage = false
): CombatEffectLifecycle {
  const family = kinds.every((kind) => kind.startsWith("lunar_")) ? "lunar" : "stellar"
  const reaction = prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: family,
    specialReactions: kinds, provider, recipient: "source" }, "由实际元素施加和转化能力证明反应触发，不用直伤冒充触发")
  return includeDirectDamage ? { kind: "any_of", alternatives: [reaction,
    prepareWeaponEffect({ kind: "special_reaction_damage", specialReactions: kinds, provider, recipient: "source" }, "也允许明确声明的同类特殊反应直伤能力")
  ] } : reaction
}

/** The hit and the applicable shield are independently qualified; self-only teammate shields do not count. */
export function prepareShieldedWeaponStacks(stackCount: number, shielded: boolean): CombatEffectLifecycle {
  if (stackCount !== 5) return { kind: "excluded", reason: "前台自动五层，旧层数只保留兼容" }
  return { kind: "all_of", alternatives: [
    prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source" }, "前台本人命中准备五层", true),
    prepareWeaponEffect({ kind: "shield", provider: "party", recipient: "source", present: shielded },
      shielded ? "有适用护盾来源时叠层攻击翻倍" : "无适用护盾来源时只计普通五层", true)
  ] }
}
