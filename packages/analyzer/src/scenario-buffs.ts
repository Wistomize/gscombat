import {
  isMoonsignCharacter,
  type CombatActionMetadata,
  type ElementalResonanceId
} from "@gscombat/content"
import {
  type CharacterBuild,
  type EvaluationScenario,
  type ExternalBuffStat
} from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

import { resolveCoreCombatStats } from "./base-stats.js"
import { resolveBuildElement } from "./build-variant.js"
import type { ResolvedTeamState } from "./team-state.js"

export interface AppliedScenarioBuff {
  readonly label: string
  readonly sourceId: string
  readonly stat: ExternalBuffStat
  readonly value: number
}

function hasResonance(teamState: ResolvedTeamState, id: ElementalResonanceId): boolean {
  return teamState.activeResonanceIds.includes(id)
}

function resolveFullMoonsignReactionBonus(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  teamState: ResolvedTeamState
): { readonly source: CharacterBuild; readonly value: number } | undefined {
  const candidates = [scenario.primary, ...scenario.teammates].flatMap((build) => {
    if (isMoonsignCharacter(build.characterId)) return []
    const element = resolveBuildElement(build, gameData)
    if (element === null || element === "physical") return []
    const stats = resolveCoreCombatStats(build, gameData)
    const attack = stats.attack * (hasResonance(teamState, "resonance.pyro") ? 1.25 : 1)
    const hp = stats.hp + (hasResonance(teamState, "resonance.hydro") ? stats.baseHp * 0.25 : 0)
    const elementalMastery = stats.elementalMastery + (hasResonance(teamState, "resonance.dendro") ? 50 : 0)
    const value =
      element === "pyro" || element === "electro" || element === "cryo"
        ? attack * 0.00009
        : element === "hydro"
          ? hp * 0.000006
          : element === "geo"
            ? stats.defense * 0.0001
            : elementalMastery * 0.000225
    return [{ source: build, value: Math.min(value, 0.36) }]
  })
  return candidates.reduce<(typeof candidates)[number] | undefined>(
    (best, candidate) => best === undefined || candidate.value > best.value ? candidate : best,
    undefined
  )
}

/** Resolves scenario-level buffs supplied by external inputs, resonances, and Moonsign. */
export function resolveTeamBuffs(
  scenario: EvaluationScenario,
  gameData: GameDataRepository,
  teamState: ResolvedTeamState,
  action: CombatActionMetadata
): readonly AppliedScenarioBuff[] {
  const buffs: AppliedScenarioBuff[] = [...scenario.externalBuffs]
  if (hasResonance(teamState, "resonance.pyro")) {
    buffs.push({ label: "热诚之火", sourceId: "resonance.pyro", stat: "attack_percent", value: 0.25 })
  }
  if (hasResonance(teamState, "resonance.hydro")) {
    buffs.push({ label: "愈疗之水", sourceId: "resonance.hydro", stat: "hp_percent", value: 0.25 })
  }
  if (hasResonance(teamState, "resonance.dendro")) {
    buffs.push({ label: "蔓生之草", sourceId: "resonance.dendro", stat: "elemental_mastery", value: 50 })
    let reactionKind =
      "transformativeReaction" in action
        ? action.transformativeReaction.kind
        : "specialReaction" in action
          ? action.specialReaction.kind
          : "additiveReaction" in action
            ? action.additiveReaction?.kind
            : undefined
    if (
      reactionKind === undefined &&
      scenario.conditions.targetAuraWindows?.some((window) => window.element === "quicken")
    ) {
      if (action.element === "electro") reactionKind = "aggravate"
      if (action.element === "dendro") reactionKind = "spread"
    }
    if (
      ["burning", "bloom", "lunar_bloom", "quicken", "aggravate", "spread", "hyperbloom", "burgeon"].includes(
        reactionKind ?? ""
      )
    ) {
      buffs.push({ label: "蔓生之草 · 一阶反应", sourceId: "resonance.dendro", stat: "elemental_mastery", value: 30 })
    }
    if (["aggravate", "spread", "hyperbloom", "burgeon"].includes(reactionKind ?? "")) {
      buffs.push({ label: "蔓生之草 · 二阶反应", sourceId: "resonance.dendro", stat: "elemental_mastery", value: 20 })
    }
  }
  const targetHasCryo =
    scenario.conditions.targetFrozen === true ||
    scenario.conditions.targetAuraWindows?.some((window) => window.element === "cryo") === true
  if (hasResonance(teamState, "resonance.cryo") && targetHasCryo) {
    buffs.push({ label: "粉碎之冰", sourceId: "resonance.cryo", stat: "crit_rate", value: 0.15 })
  }
  const nearMooncage = "specialReaction" in action && action.specialReaction.kind === "lunar_crystallize"
  if (hasResonance(teamState, "resonance.geo") && (scenario.conditions.primaryShielded === true || nearMooncage)) {
    buffs.push({ label: "坚定之岩", sourceId: "resonance.geo", stat: "damage_bonus", value: 0.15 })
    if (action.element === "geo") {
      buffs.push({
        label: "坚定之岩 · 岩元素抗性降低",
        sourceId: "resonance.geo",
        stat: "enemy_resistance_reduction",
        value: 0.2
      })
    }
  }
  const isLunarReaction =
    "specialReaction" in action &&
    ["lunar_bloom", "lunar_charged", "lunar_crystallize"].includes(action.specialReaction.kind)
  if (teamState.moonsign.level === "ascendant_gleam" && isLunarReaction) {
    const bonus = resolveFullMoonsignReactionBonus(scenario, gameData, teamState)
    if (bonus && bonus.value > 0) {
      buffs.push({
        label: `月兆·满辉 · ${bonus.source.label}`,
        sourceId: bonus.source.buildId,
        stat: "special_reaction_damage_bonus",
        value: bonus.value
      })
    }
  }

  return buffs
}
