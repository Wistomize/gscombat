import type { CombatActionEffect } from "../../combat/types.js"

export const ASTRAL_VULTURES_CRIMSON_PLUMAGE_AFTER_SWIRL_ATTACK_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const ASTRAL_VULTURES_CRIMSON_PLUMAGE_ONE_DIFFERENT_CHARGED_DAMAGE_BONUS = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const ASTRAL_VULTURES_CRIMSON_PLUMAGE_TWO_DIFFERENT_CHARGED_DAMAGE_BONUS = [0.48, 0.6, 0.72, 0.84, 0.96] as const
export const ASTRAL_VULTURES_CRIMSON_PLUMAGE_ONE_DIFFERENT_BURST_DAMAGE_BONUS = [0.1, 0.125, 0.15, 0.175, 0.2] as const
export const ASTRAL_VULTURES_CRIMSON_PLUMAGE_TWO_DIFFERENT_BURST_DAMAGE_BONUS = [0.24, 0.3, 0.36, 0.42, 0.48] as const

interface DifferentElementTeammateTier {
  readonly burstValues: readonly number[]
  readonly chargedValues: readonly number[]
  readonly label: string
  readonly maximum?: number
  readonly minimum: number
  readonly suffix: string
}

const differentElementTeammateTiers: readonly DifferentElementTeammateTier[] = [
  {
    chargedValues: ASTRAL_VULTURES_CRIMSON_PLUMAGE_ONE_DIFFERENT_CHARGED_DAMAGE_BONUS,
    maximum: 1,
    minimum: 1,
    suffix: "1-character",
    burstValues: ASTRAL_VULTURES_CRIMSON_PLUMAGE_ONE_DIFFERENT_BURST_DAMAGE_BONUS,
    label: "1名"
  },
  {
    chargedValues: ASTRAL_VULTURES_CRIMSON_PLUMAGE_TWO_DIFFERENT_CHARGED_DAMAGE_BONUS,
    minimum: 2,
    suffix: "2-character",
    burstValues: ASTRAL_VULTURES_CRIMSON_PLUMAGE_TWO_DIFFERENT_BURST_DAMAGE_BONUS,
    label: "至少2名"
  }
] as const

function createDifferentElementTeammateTierEffects(
  tier: (typeof differentElementTeammateTiers)[number]
): readonly CombatActionEffect[] {
  const condition = {
    kind: "primary_different_element_teammate_count" as const,
    minimum: tier.minimum,
    ...(tier.maximum === undefined ? {} : { maximum: tier.maximum })
  }
  const exclusivity = { group: "astral-vultures-crimson-plumage-different-element", variant: tier.suffix }
  return [
    {
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.astral-vultures-crimson-plumage.team-different-element.${tier.suffix}.charged-damage-bonus`,
      label: `星鹫赤羽 · ${tier.label}异元素队友（重击伤害）`,
      source: { kind: "weapon", weaponId: "AstralVulturesCrimsonPlumage" },
      target: "damageBonus",
      targetFilter: { attackKinds: ["charged"] },
      value: { kind: "refinement_table", values: tier.chargedValues }
    },
    {
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.astral-vultures-crimson-plumage.team-different-element.${tier.suffix}.burst-damage-bonus`,
      label: `星鹫赤羽 · ${tier.label}异元素队友（元素爆发伤害）`,
      source: { kind: "weapon", weaponId: "AstralVulturesCrimsonPlumage" },
      target: "damageBonus",
      targetFilter: { talentSlots: ["burst"] },
      value: { kind: "refinement_table", values: tier.burstValues }
    }
  ]
}

/** Typed selected post-Swirl self attack contribution of Astral Vulture's Crimson Plumage. */
export const astralVulturesCrimsonPlumageCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent",
    label: "星鹫赤羽 · 触发扩散反应后的攻击力",
    source: { kind: "weapon", weaponId: "AstralVulturesCrimsonPlumage" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ASTRAL_VULTURES_CRIMSON_PLUMAGE_AFTER_SWIRL_ATTACK_PERCENT }
  },
  ...differentElementTeammateTiers.flatMap(createDifferentElementTeammateTierEffects)
]
