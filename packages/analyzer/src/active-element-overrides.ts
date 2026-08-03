import {
  getCombatElementOverrideEffectDefinition,
  type CombatActionMetadata,
  type CombatElementOverrideEffect,
  type CombatTalentParameterReference
} from "@gscombat/content"
import type { RotationElementOverrideWindow } from "@gscombat/calculator"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"

/** Input used to materialize maintained active effects into one target action's relative timeline. */
export interface ResolveActiveElementOverrideWindowsInput {
  readonly activeEffectIds: readonly string[]
  readonly gameData: GameDataRepository
  readonly primary: CharacterBuild
  readonly targetAction: CombatActionMetadata
  readonly teammates: readonly CharacterBuild[]
}

/**
 * Resolves content-owned active effects into rotation element-override windows for the primary build.
 *
 * The caller supplies only selected effect IDs. Each effect is verified against its source character,
 * source constellation, target weapon family, and pinned talent-duration parameter before it can
 * create a window. The window is action-relative because the current evaluator targets one action,
 * not a complete cast timeline.
 */
export function resolveActiveElementOverrideWindows(
  input: ResolveActiveElementOverrideWindowsInput
): readonly RotationElementOverrideWindow[] {
  const actionDuration = resolveActionDuration(input.targetAction)
  const windows: RotationElementOverrideWindow[] = []
  const activeEffectIds = new Set<string>()

  for (const effectId of input.activeEffectIds) {
    if (activeEffectIds.has(effectId)) {
      throw new Error(`Active effect ${effectId} is declared more than once`)
    }
    activeEffectIds.add(effectId)
  }

  for (const effectId of activeEffectIds) {
    const effect = getCombatElementOverrideEffectDefinition(effectId)
    if (!effect) continue
    if (!hasRequiredActiveEffects(effect, activeEffectIds)) continue

    const source = resolveEffectSourceBuild(effect, input.primary, input.teammates)
    validateSourceConstellation(effect, source)
    if (!isEligibleTarget(effect, input.primary, input.gameData)) continue

    const duration = resolveEffectDuration(effect, source, input.gameData)
    const existingWindow = windows.find((window) => window.target === effect.target)
    if (existingWindow) {
      throw new Error(
        `Active elemental override effects ${existingWindow.id} and ${effect.id} overlap on ${effect.target}`
      )
    }
    windows.push({
      element: effect.element,
      end: Math.min(actionDuration, duration),
      id: effect.id,
      ownerId: input.primary.buildId,
      start: 0,
      target: effect.target
    })
  }

  return windows
}

function hasRequiredActiveEffects(effect: CombatElementOverrideEffect, activeEffectIds: ReadonlySet<string>): boolean {
  return effect.requiredActiveEffectIds?.every((effectId) => activeEffectIds.has(effectId)) ?? true
}

function resolveActionDuration(action: CombatActionMetadata): number {
  const duration = action.timeline?.duration ?? 1
  if (Number.isFinite(duration) && duration > 0) return duration
  throw new Error(`Target action ${action.id} must declare a positive finite duration`)
}

function resolveEffectSourceBuild(
  effect: CombatElementOverrideEffect,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): CharacterBuild {
  const sourceBuilds = [primary, ...teammates].filter((build) => build.characterId === effect.sourceCharacterId)
  if (sourceBuilds.length === 1) return sourceBuilds[0] as CharacterBuild
  if (sourceBuilds.length === 0) {
    throw new Error(`Active effect ${effect.id} requires ${effect.sourceCharacterId} to be present in the configured team`)
  }
  throw new Error(`Active effect ${effect.id} requires exactly one ${effect.sourceCharacterId} source build`)
}

function validateSourceConstellation(effect: CombatElementOverrideEffect, source: CharacterBuild): void {
  const requiredConstellation = effect.minimumSourceConstellation
  if (requiredConstellation === undefined || source.constellation >= requiredConstellation) return
  throw new Error(
    `Active effect ${effect.id} requires ${effect.sourceCharacterId} constellation ${requiredConstellation}, ` +
      `but source build has constellation ${source.constellation}`
  )
}

function isEligibleTarget(
  effect: CombatElementOverrideEffect,
  primary: CharacterBuild,
  gameData: GameDataRepository
): boolean {
  const targetCharacter = gameData.getCharacter(primary.characterId)
  if (!targetCharacter) throw new Error(`Missing primary character ${primary.characterId} in game data`)
  return effect.eligibleWeaponTypes.includes(targetCharacter.weaponType as (typeof effect.eligibleWeaponTypes)[number])
}

function resolveEffectDuration(
  effect: CombatElementOverrideEffect,
  source: CharacterBuild,
  gameData: GameDataRepository
): number {
  const talentLevel = getConfiguredTalentLevel(source, effect.durationParameter)
  const duration = gameData.getCharacterSkillParameter(
    effect.sourceCharacterId,
    effect.durationParameter.groupId,
    effect.durationParameter.parameterIndex,
    talentLevel
  )
  if (duration === undefined || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Missing positive duration for active effect ${effect.id} at talent level ${talentLevel}`)
  }
  return duration
}

function getConfiguredTalentLevel(build: CharacterBuild, parameter: CombatTalentParameterReference): number {
  if (parameter.talentSlot === "passive") return 1
  if (parameter.talentSlot === "normal") return build.talents.normal
  if (parameter.talentSlot === "skill") return build.talents.skill
  return build.talents.burst
}
