import type { CombatActionEffect } from "../../combat/types.js"

export const AUBADE_OF_MORNINGSTAR_AND_MOON_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const AUBADE_OF_MORNINGSTAR_AND_MOON_OFF_FIELD_LUNAR_REACTION_DAMAGE_BONUS = 0.2
export const AUBADE_OF_MORNINGSTAR_AND_MOON_FULL_MOONSIGN_LUNAR_REACTION_DAMAGE_BONUS = 0.4

const lunarReactionKinds = ["lunar_bloom", "lunar_charged", "lunar_crystallize"] as const

/** Typed automatic two-piece contribution of Aubade of Morningstar and Moon to one current action. */
export const aubadeOfMorningstarAndMoonCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery",
    label: "晨星与月的晓歌 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "AubadeOfMorningstarAndMoon" },
    target: "elementalMastery",
    value: { kind: "fixed", value: AUBADE_OF_MORNINGSTAR_AND_MOON_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  {
    activation: "active",
    id: "artifact.aubade-of-morningstar-and-moon.4pc.off-field.lunar-reaction-damage-bonus",
    label: "晨星与月的晓歌 · 四件套（后台或登场未满3秒的月曜反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "AubadeOfMorningstarAndMoon" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: lunarReactionKinds },
    value: { kind: "fixed", value: AUBADE_OF_MORNINGSTAR_AND_MOON_OFF_FIELD_LUNAR_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    id: "artifact.aubade-of-morningstar-and-moon.4pc.full-moonsign.lunar-reaction-damage-bonus",
    label: "晨星与月的晓歌 · 四件套（满辉进一步提升月曜反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "AubadeOfMorningstarAndMoon" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: lunarReactionKinds },
    value: { kind: "fixed", value: AUBADE_OF_MORNINGSTAR_AND_MOON_FULL_MOONSIGN_LUNAR_REACTION_DAMAGE_BONUS }
  }
]
