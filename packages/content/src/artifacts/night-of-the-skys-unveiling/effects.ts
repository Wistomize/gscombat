import type { CombatActionEffect } from "../../combat/types.js"

export const NIGHT_OF_THE_SKYS_UNVEILING_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const NIGHT_OF_THE_SKYS_UNVEILING_INITIAL_MOONSIGN_CRIT_RATE = 0.15
export const NIGHT_OF_THE_SKYS_UNVEILING_FULL_MOONSIGN_CRIT_RATE = 0.3
export const NIGHT_OF_THE_SKYS_UNVEILING_MOONGLEAM_LUNAR_REACTION_DAMAGE_BONUS = 0.1

/** Typed automatic two-piece contribution of Night of the Sky's Unveiling to one current action. */
export const nightOfTheSkysUnveilingCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.night-of-the-skys-unveiling.2pc.elemental-mastery",
    label: "穹境示现之夜 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "NightOfTheSkysUnveiling" },
    target: "elementalMastery",
    value: { kind: "fixed", value: NIGHT_OF_THE_SKYS_UNVEILING_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "nascent_gleam" },
    exclusivity: { group: "night-of-the-skys-unveiling-moonsign", variant: "initial" },
    id: "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate",
    label: "穹境示现之夜 · 附近队伍触发月曜反应后（初辉，装备者在场，4秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NightOfTheSkysUnveiling" },
    target: "critRate",
    value: { kind: "fixed", value: NIGHT_OF_THE_SKYS_UNVEILING_INITIAL_MOONSIGN_CRIT_RATE }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "night-of-the-skys-unveiling-moonsign", variant: "full" },
    id: "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate",
    label: "穹境示现之夜 · 附近队伍触发月曜反应后（满辉，装备者在场，4秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NightOfTheSkysUnveiling" },
    target: "critRate",
    value: { kind: "fixed", value: NIGHT_OF_THE_SKYS_UNVEILING_FULL_MOONSIGN_CRIT_RATE }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "nascent_gleam" },
    id: "artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus",
    label: "穹境示现之夜 · 月辉明光·蓄念（月曜反应伤害）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "NightOfTheSkysUnveiling" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
    value: { kind: "fixed", value: NIGHT_OF_THE_SKYS_UNVEILING_MOONGLEAM_LUNAR_REACTION_DAMAGE_BONUS }
  }
]
