import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponSpecialReaction, withWeaponChoice } from "../../combat/weapon-preparation.js"

export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const
export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ELEMENTAL_MASTERY = [240, 300, 360, 420, 480] as const
export const FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_STELLAR_DAMAGE_BONUS = [0.56, 0.7, 0.84, 0.98, 1.12] as const

const songs = [
  { variant: "1-attack", label: "攻击力", suffix: "attack-percent", target: "attackPercent",
    values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ATTACK_PERCENT },
  { variant: "2-elemental-mastery", label: "元素精通", suffix: "amplifying.elemental-mastery", target: "elementalMastery",
    values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_ELEMENTAL_MASTERY },
  { variant: "3-stellar-reaction", label: "星烁反应伤害", suffix: "stellar-reaction-damage-bonus", target: "specialReactionDamageBonus",
    values: FORGED_BY_THE_GOLDEN_MELODY_DOUBLE_STELLAR_DAMAGE_BONUS }
] as const

/** One current song plus an independently qualified copy, never an average of all songs. */
export const forgedByTheGoldenMelodyCombatActionEffects: readonly CombatActionEffect[] = withWeaponChoice([
  ...songs.flatMap((song) => [false, true].map((counterpoint): CombatActionEffect => ({
    activation: "active",
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: song.variant },
    id: `weapon.forged-by-the-golden-melody.${counterpoint ? "counterpoint" : "current-song-and-counterpoint"}.${song.suffix}`,
    label: `金律铸影 · ${song.label}${counterpoint ? "同类复调" : "当前乐章"}`,
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: song.target,
    ...(song.target === "specialReactionDamageBonus" ? { targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] } } : {}),
    ...(counterpoint ? { lifecycle: prepareWeaponSpecialReaction(["stellar_superconduct", "stellar_swirl"]) } : {}),
    value: { kind: "refinement_table", values: song.values.map((value) => value / 2) }
  }))),
  {
    activation: "automatic",
    lifecycle: { kind: "excluded", reason: "旧反应专用精通已合并为同一乐章的全局精通，避免重复" },
    exclusivity: { group: "forged-by-the-golden-melody-current-song", variant: "2-elemental-mastery" },
    id: "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.ordinary.elemental-mastery",
    label: "金律铸影 · 旧普通反应精通映射",
    source: { kind: "weapon", weaponId: "ForgedByTheGoldenMelody" },
    target: "elementalMastery",
    value: { kind: "fixed", value: 0 }
  }
], "forged-by-the-golden-melody-current-song", "当前乐章", "1-attack").map((effect) => effect.weaponChoice ? {
  ...effect, weaponChoice: { ...effect.weaponChoice, variantLabel: songs.find((song) => song.variant === effect.weaponChoice!.variant)!.label }
} : effect)
