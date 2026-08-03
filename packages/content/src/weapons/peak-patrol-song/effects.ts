import type { CombatActionEffect } from "../../combat/types.js"

export const PEAK_PATROL_SONG_DEFENSE_PERCENT_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const PEAK_PATROL_SONG_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK = [0.1, 0.125, 0.15, 0.175, 0.2] as const
export const PEAK_PATROL_SONG_PARTY_DAMAGE_BONUS_PER_DEFENSE = [0.00008, 0.0001, 0.00012, 0.00014, 0.00016] as const
export const PEAK_PATROL_SONG_PARTY_DAMAGE_BONUS_MAXIMUM = [0.256, 0.32, 0.384, 0.448, 0.512] as const

const stackCounts = [1, 2] as const
const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const fullOdeToFlowersDefenseEffectId = "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent"
const fullOdeToFlowersDamageEffectId = "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"

function getValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "peak-patrol-song-ode-to-flowers", variant: `${stackCount}-stack` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.peak-patrol-song.ode-to-flowers.${stackCount}-stack.defense-percent`,
      label: `岩峰巡歌 · ${stackCount}层花之颂防御力`,
      source: { holder: "party_member", kind: "weapon", resolveAllMatchingPartySources: true, weaponId: "PeakPatrolSong" },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "refinement_table", values: getValues(PEAK_PATROL_SONG_DEFENSE_PERCENT_PER_STACK, stackCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.peak-patrol-song.ode-to-flowers.${stackCount}-stack.all-element-damage-bonus`,
      label: `岩峰巡歌 · ${stackCount}层花之颂所有元素伤害`,
      source: { holder: "party_member", kind: "weapon", resolveAllMatchingPartySources: true, weaponId: "PeakPatrolSong" },
      target: "damageBonus",
      targetFilter: { elements: elementalDamageElements, recipientSourceRelation: "source" },
      value: { kind: "refinement_table", values: getValues(PEAK_PATROL_SONG_ALL_ELEMENT_DAMAGE_BONUS_PER_STACK, stackCount) }
    }
  ]
}

/** Typed selected self and full-stack party contributions of Peak Patrol Song. */
export const peakPatrolSongCombatActionEffects: readonly CombatActionEffect[] = [
  ...stackCounts.flatMap(createStackEffects),
  {
    activation: "active",
    id: "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus",
    label: "岩峰巡歌 · 2层荣花之歌触发的队伍所有元素伤害",
    source: { holder: "party_member", kind: "weapon", weaponId: "PeakPatrolSong" },
    target: "sourceFinalDefenseToDamageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: {
      kind: "source_final_defense",
      maximumValue: { kind: "refinement_table", values: PEAK_PATROL_SONG_PARTY_DAMAGE_BONUS_MAXIMUM },
      multiplier: { kind: "refinement_table", values: PEAK_PATROL_SONG_PARTY_DAMAGE_BONUS_PER_DEFENSE },
      sourceDefenseSnapshotEffectIds: [fullOdeToFlowersDefenseEffectId, fullOdeToFlowersDamageEffectId]
    }
  }
]
