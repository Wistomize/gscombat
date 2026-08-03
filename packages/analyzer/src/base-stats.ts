import type { Element, RotationStats } from "@gscombat/calculator"
import { getTwoPieceHealingBonus, HEALING_BONUS_TWO_PIECE_SET_IDS } from "@gscombat/content"
import type { ArtifactStat, CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { aggregateArtifactStats, countArtifactSet } from "./artifact-stats.js"

/** Fully resolved build stats that do not depend on a damage element or character-kit conditions. */
export interface ResolvedCoreCombatStats extends Omit<RotationStats, "damageBonus"> {
  readonly attackPercent: number
  readonly artifactSetHealingBonus: number
  readonly baseAttack: number
  readonly baseDefense: number
  readonly baseHp: number
  readonly energyRecharge: number
  readonly flatAttack: number
  readonly flatDefense: number
  readonly flatHp: number
  readonly healingBonus: number
}

/** Fully resolved baseline stats before character kits, weapon passives, team buffs, or conditions. */
export interface ResolvedBaseCombatStats extends ResolvedCoreCombatStats {
  readonly damageBonus: number
}

const artifactDamageStatByElement: Readonly<Record<Element, ArtifactStat>> = {
  anemo: "anemo_damage_bonus",
  cryo: "cryo_damage_bonus",
  dendro: "dendro_damage_bonus",
  electro: "electro_damage_bonus",
  geo: "geo_damage_bonus",
  hydro: "hydro_damage_bonus",
  physical: "physical_damage_bonus",
  pyro: "pyro_damage_bonus"
}

const gameDataDamageStatByElement: Readonly<Record<Element, string>> = {
  anemo: "anemo_dmg_",
  cryo: "cryo_dmg_",
  dendro: "dendro_dmg_",
  electro: "electro_dmg_",
  geo: "geo_dmg_",
  hydro: "hydro_dmg_",
  physical: "physical_dmg_",
  pyro: "pyro_dmg_"
}

function requireValue(value: number | undefined, description: string): number {
  if (value === undefined) throw new Error(`Missing game data: ${description}`)
  return value
}

function getCharacterSecondaryStat(build: CharacterBuild, gameData: GameDataRepository, stat: string): number {
  return gameData.getCharacterAscensionBonus(build.characterId, stat, build.ascension) ?? 0
}

function getWeaponSecondaryStat(build: CharacterBuild, gameData: GameDataRepository, stat: string): number {
  return gameData.getWeaponStat(build.weapon.weaponId, stat, build.weapon.level, build.weapon.ascension) ?? 0
}

function getArtifactSetHealingBonus(build: CharacterBuild): number {
  return HEALING_BONUS_TWO_PIECE_SET_IDS.reduce(
    (total, setId) => total + getTwoPieceHealingBonus(setId, countArtifactSet(build, setId)),
    0
  )
}

/** Resolves self-owned stats before damage-element, kit, team, or target modifiers are applied. */
export function resolveCoreCombatStats(build: CharacterBuild, gameData: GameDataRepository): ResolvedCoreCombatStats {
  const artifacts = aggregateArtifactStats(build)
  const artifactSetHealingBonus = getArtifactSetHealingBonus(build)
  const baseHp = requireValue(
    gameData.getCharacterStat(build.characterId, "hp", build.level, build.ascension),
    `${build.characterId} hp`
  )
  const characterAttack = requireValue(
    gameData.getCharacterStat(build.characterId, "atk", build.level, build.ascension),
    `${build.characterId} attack`
  )
  const weaponAttack = requireValue(
    gameData.getWeaponStat(build.weapon.weaponId, "atk", build.weapon.level, build.weapon.ascension),
    `${build.weapon.weaponId} attack`
  )
  const baseDefense = requireValue(
    gameData.getCharacterStat(build.characterId, "def", build.level, build.ascension),
    `${build.characterId} defense`
  )
  const baseElementalMastery = gameData.getCharacterBaseStats(build.characterId).eleMas ?? 0
  const hpPercent = artifacts.hp_percent + getCharacterSecondaryStat(build, gameData, "hp_") + getWeaponSecondaryStat(build, gameData, "hp_")
  const attackPercent =
    artifacts.atk_percent + getCharacterSecondaryStat(build, gameData, "atk_") + getWeaponSecondaryStat(build, gameData, "atk_")
  const defensePercent =
    artifacts.def_percent + getCharacterSecondaryStat(build, gameData, "def_") + getWeaponSecondaryStat(build, gameData, "def_")
  const flatHp = artifacts.hp
  const flatAttack = artifacts.atk
  const flatDefense = artifacts.def
  const baseAttack = characterAttack + weaponAttack
  return {
    attack: baseAttack * (1 + attackPercent) + flatAttack,
    attackPercent,
    artifactSetHealingBonus,
    baseAttack,
    baseDefense,
    baseHp,
    critDamage:
      0.5 +
      artifacts.crit_damage +
      getCharacterSecondaryStat(build, gameData, "critDMG_") +
      getWeaponSecondaryStat(build, gameData, "critDMG_"),
    critRate:
      0.05 +
      artifacts.crit_rate +
      getCharacterSecondaryStat(build, gameData, "critRate_") +
      getWeaponSecondaryStat(build, gameData, "critRate_"),
    defense: baseDefense * (1 + defensePercent) + flatDefense,
    elementalMastery:
      baseElementalMastery +
      artifacts.elemental_mastery +
      getCharacterSecondaryStat(build, gameData, "eleMas") +
      getWeaponSecondaryStat(build, gameData, "eleMas"),
    energyRecharge:
      1 +
      artifacts.energy_recharge +
      getCharacterSecondaryStat(build, gameData, "enerRech_") +
      getWeaponSecondaryStat(build, gameData, "enerRech_"),
    flatAttack,
    flatDefense,
    flatHp,
    healingBonus:
      artifacts.healing_bonus +
      artifactSetHealingBonus +
      getCharacterSecondaryStat(build, gameData, "heal_") +
      getWeaponSecondaryStat(build, gameData, "heal_"),
    hp: baseHp * (1 + hpPercent) + flatHp,
    level: build.level
  }
}

/** Resolves a build's universal stats for a declared damage element before any kit-specific effects are applied. */
export function resolveBaseCombatStats(
  build: CharacterBuild,
  gameData: GameDataRepository,
  damageElement: Element
): ResolvedBaseCombatStats {
  const coreStats = resolveCoreCombatStats(build, gameData)
  const artifacts = aggregateArtifactStats(build)
  const damageStat = gameDataDamageStatByElement[damageElement]
  return {
    ...coreStats,
    damageBonus:
      artifacts[artifactDamageStatByElement[damageElement]] +
      getCharacterSecondaryStat(build, gameData, damageStat) +
      getWeaponSecondaryStat(build, gameData, damageStat)
  }
}
