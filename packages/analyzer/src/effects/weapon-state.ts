import { getCombatActionDefinition, isCombatActionEffectApplicable, listCombatActionEffects, supportedCharacters, type CombatActionEffect, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { resolveRotationElementOverride } from "@gscombat/calculator"
import { resolveBuildElement } from "../core/build-variant.js"
import { resolveActionScenarioParameters } from "../evaluators/scenario-parameters.js"
import { resolveActiveElementOverrideWindows } from "./active-element-overrides.js"
import { resolveDependentActiveEffectIds } from "./dependent-effects.js"
import { findCapabilityProviders } from "../scenario/capabilities.js"
import { resolveFieldContext, resolveSupportFieldContext } from "../core/field-presence.js"
import { resolveCombatEffectLifecycle } from "../scenario/effect-lifecycle.js"

/** An explicit reaction bottom aura takes precedence over composition-based manual assumptions. */
export function resolveWeaponAuraVariant(effect: CombatActionEffect, action: CombatActionMetadata,
  input: Omit<Parameters<typeof findCapabilityProviders>[0], "requirement">,
  reactionKinds?: readonly NonNullable<CombatActionMetadata["amplifyingReaction"]>["kind"][],
  targetFrozen = false
): string | undefined {
  const elements = effect.weaponChoice?.targetAuraElements
  if (!elements) return undefined
  const auraByReaction = { melt_forward: "cryo", melt_reverse: "pyro", vaporize_forward: "pyro", vaporize_reverse: "hydro" } as const
  const reactions = reactionKinds ?? (action.amplifyingReaction ? [action.amplifyingReaction.kind] : [])
  const auras = targetFrozen ? ["cryo" as const] : reactions.map((kind) => auraByReaction[kind])
  if (auras.length > 0) return auras.some((element) => elements.includes(element)) ? "on" : "off"
  return findCapabilityProviders({ ...input, requirement: { kind: "damage_hit", provider: "party", recipient: "source", elements } }).length > 0
    ? undefined : "off"
}

const choicesByGroup = new Map<string, readonly CombatActionEffect[]>()
const recipientChoices = listCombatActionEffects().filter((effect) => effect.source.kind === "weapon" && effect.weaponRecipientChoice)
for (const effect of listCombatActionEffects()) {
  if (effect.source.kind !== "weapon" || !effect.weaponChoice) continue
  const key = `${effect.source.weaponId}:${effect.weaponChoice.group}`
  choicesByGroup.set(key, [...(choicesByGroup.get(key) ?? []), effect])
}

export interface WeaponChoiceGroup {
  id: string
  label: string
  defaultVariant: string
  options: { id: string; label: string }[]
}

/** Recipient choices reference a member of this exact team, not the currently evaluated contributor. */
function isValidRecipientChoice(source: CharacterBuild, builds: readonly CharacterBuild[], group: string, value: string): boolean {
  const effect = recipientChoices.find((candidate) => candidate.source.kind === "weapon" &&
    candidate.source.weaponId === source.weapon.weaponId && candidate.weaponRecipientChoice?.group === group)
  return effect !== undefined && (value === "none" || builds.some((build) => build.buildId === value &&
    (!effect.weaponRecipientChoice!.excludeSource || build.buildId !== source.buildId)))
}

/** A proven preparation replaces only the declaration's own choice, without inventing HP or reaction history. */
export function resolveAutomaticWeaponVariant(
  effect: CombatActionEffect,
  input: Omit<Parameters<typeof findCapabilityProviders>[0], "requirement">
): string | undefined {
  const automatic = effect.weaponChoice?.automaticVariant
  return automatic && findCapabilityProviders({ ...input, requirement: automatic.capability,
    fieldContext: automatic.prepareSourceOnField ? { ...input.fieldContext, onFieldBuildId: input.sourceBuildId } : input.fieldContext }).length > 0
    ? automatic.variant : undefined
}

/** Rejects unknown sources, groups, and variants before any stat evaluation. */
export function validateWeaponChoices(scenario: Pick<EvaluationScenario, "primary" | "teammates"> & {
  conditions: Pick<EvaluationScenario["conditions"], "weaponEffectChoices">
}): void {
  const builds = new Map([scenario.primary, ...scenario.teammates].map((build) => [build.buildId, build]))
  for (const [sourceId, choices] of Object.entries(scenario.conditions.weaponEffectChoices ?? {})) {
    const source = builds.get(sourceId)
    if (!source) throw Object.assign(new Error(`武器条件来源不在队伍中：${sourceId}`), { statusCode: 400 })
    for (const [group, variant] of Object.entries(choices)) {
      const effects = choicesByGroup.get(`${source.weapon.weaponId}:${group}`)
      if (!effects?.some((effect) => effect.weaponChoice?.variant === variant) &&
        !isValidRecipientChoice(source, [...builds.values()], group, variant)) {
        throw Object.assign(new Error(`武器条件无效：${source.weapon.weaponId} / ${group} / ${variant}`), { statusCode: 400 })
      }
    }
  }
}

/** Projects selected infusions at eligible event times without resolving stats or damage. */
function resolveChoiceActionElements(action: CombatActionMetadata, scenario: EvaluationScenario, gameData?: GameDataRepository) {
  if (!gameData || !action.timeline?.damageEvents.some((event) => event.elementOverrideTarget)) return [action.element]
  const activeEffectIds = resolveDependentActiveEffectIds({
    activeEffectIds: scenario.conditions.activeEffectIds,
    ...(scenario.conditions.activeEffectSourceBuildIds ? { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds } : {}),
    action, primary: scenario.primary, teammates: scenario.teammates
  })
  const windows = resolveActiveElementOverrideWindows({ activeEffectIds, gameData,
    primary: scenario.primary, teammates: scenario.teammates, targetAction: action })
  if (windows.length === 0) return [action.element]
  const parameters = resolveActionScenarioParameters(action, scenario.conditions.actionParameters, scenario.primary.constellation)
  return [...new Set(action.timeline.damageEvents.flatMap((event) => {
    if ((event.minimumSourceConstellation !== undefined && scenario.primary.constellation < event.minimumSourceConstellation) ||
      (event.maximumSourceConstellation !== undefined && scenario.primary.constellation > event.maximumSourceConstellation)) return []
    const hitCount = typeof event.hitCount === "object" ? parameters.get(event.hitCount.parameterId) : event.hitCount ?? 1
    if (hitCount === 0) return []
    const override = resolveRotationElementOverride({ ownerId: scenario.primary.buildId, time: event.at,
      ...(event.elementOverrideTarget ? { elementOverrideTarget: event.elementOverrideTarget } : {}) }, windows)
    return [override?.element ?? action.element]
  }))]
}

/** Projects only authored choices applicable to this weapon and action, not automatic preparations. */
export function describeWeaponChoices(scenario: EvaluationScenario, gameData?: GameDataRepository, sourceBuildId = scenario.primary.buildId,
  evaluationKind: "damage" | "support" = "damage"): {
  choices: Record<string, string>; choiceGroups: WeaponChoiceGroup[]
} {
  const action = getCombatActionDefinition(scenario.targetActionId)
  const choiceGroups: WeaponChoiceGroup[] = []
  const choices: Record<string, string> = {}
  if (!action) return { choices, choiceGroups }
  const builds = [scenario.primary, ...scenario.teammates]
  const source = builds.find((build) => build.buildId === sourceBuildId)
  if (!source) return { choices, choiceGroups }
  const effectiveElements = resolveChoiceActionElements(action, scenario, gameData)
  const recipientElement = gameData ? resolveBuildElement(scenario.primary, gameData) : null
  const fieldContext = { ...(evaluationKind === "support"
    ? resolveSupportFieldContext(scenario.primary.buildId, scenario.conditions.onFieldBuildId)
    : resolveFieldContext(action, scenario.primary, scenario.teammates, scenario.conditions.onFieldBuildId)),
    targetIsSlime: scenario.conditions.targetIsSlime ?? false, arrowHitsWeakPoint: scenario.conditions.arrowHitsWeakPoint ?? false }
  for (const effects of choicesByGroup.values()) {
    // Support source panels consume self-owned stats, not party damage or independent damage events.
    // Keep every variant of a relevant group (e.g. all Widsith songs), including its zero-benefit variant.
    if (evaluationKind === "support" && (source.buildId !== scenario.primary.buildId || !effects.some((effect) =>
      effect.source.kind === "weapon" && effect.source.holder !== "party_member" &&
      ["attackPercent", "defenseFlat", "defensePercent", "elementalMastery", "energyRecharge", "finalHpToFlatAttack",
        "flatAttack", "hpFlat", "hpPercent", "critRate", "critDamage"].includes(effect.target)))) continue
    const applicable = effects.filter((effect) => effect.source.kind === "weapon" &&
      effect.source.weaponId === source.weapon.weaponId &&
      (!gameData || !effect.targetFilter?.recipientNativeElements || (recipientElement !== null && recipientElement !== "physical" &&
        effect.targetFilter.recipientNativeElements.includes(recipientElement))) &&
      !(effect.requiresSourceOnField && fieldContext.onFieldBuildId !== source.buildId) &&
      resolveCombatEffectLifecycle({ ...(effect.lifecycle ? { lifecycle: effect.lifecycle } : {}),
        source, recipient: scenario.primary, builds,
        fieldContext, activeEffectIds: scenario.conditions.activeEffectIds, selected: true,
        enemyCount: scenario.conditions.enemyCount, ...(gameData ? { gameData } : {}) }).eligible &&
      (isCombatActionEffectApplicable(effect, action, effectiveElements) || (effect.targetFilter?.arrowHitsOnly &&
        action.aimedArrowDamagePartIds?.some((id) => isCombatActionEffectApplicable(effect, action, effectiveElements, undefined, [], [], undefined, undefined, id)))))
    const choice = applicable[0]?.weaponChoice
    if (!choice) continue
    if (resolveWeaponAuraVariant(applicable[0]!, action, { builds: [scenario.primary, ...scenario.teammates],
      sourceBuildId: source.buildId, recipientBuildId: scenario.primary.buildId,
      fieldContext, activeEffectIds: scenario.conditions.activeEffectIds, ...(gameData ? { gameData } : {}) },
      undefined, scenario.conditions.targetFrozen) !== undefined) continue
    if (choice.fixedVariantByCharacter?.[source.characterId]) continue
    if (resolveAutomaticWeaponVariant(applicable[0]!, { builds: [scenario.primary, ...scenario.teammates],
      sourceBuildId: source.buildId, recipientBuildId: scenario.primary.buildId,
      activeEffectIds: scenario.conditions.activeEffectIds, enemyCount: scenario.conditions.enemyCount,
      fieldContext,
      ...(gameData ? { gameData } : {}) })) continue
    const defaultVariant = choice.defaultVariantByCharacter?.[source.characterId] ?? choice.defaultVariant
    const options = [...new Map(applicable.map((effect) => [effect.weaponChoice!.variant,
      { id: effect.weaponChoice!.variant, label: effect.weaponChoice!.variantLabel }])).values()]
    choiceGroups.push({ id: choice.group, label: choice.labelByRefinement?.[source.weapon.refinement - 1] ?? choice.label, defaultVariant, options })
    choices[choice.group] = applicable.find((effect) => isWeaponChoiceSelected({ effect,
      sourceBuildId: source.buildId, actionOwnerBuildId: scenario.primary.buildId,
      sourceCharacterId: source.characterId,
      ...(scenario.conditions.weaponEffectChoices?.[source.buildId] ? { choices: scenario.conditions.weaponEffectChoices[source.buildId] } : {}),
      activeEffectIds: scenario.conditions.activeEffectIds,
      ...(scenario.conditions.activeEffectSourceBuildIds ? { activeEffectSourceBuildIds: scenario.conditions.activeEffectSourceBuildIds } : {})
    }))?.weaponChoice?.variant ?? defaultVariant
  }
  for (const effect of recipientChoices) {
    if (evaluationKind === "support") continue
    if (effect.source.kind !== "weapon" || effect.source.weaponId !== source.weapon.weaponId) continue
    if (!resolveCombatEffectLifecycle({ ...(effect.lifecycle ? { lifecycle: effect.lifecycle } : {}),
      source, recipient: scenario.primary, builds, fieldContext, selected: false,
      activeEffectIds: scenario.conditions.activeEffectIds, ...(gameData ? { gameData } : {}) }).eligible) continue
    const choice = effect.weaponRecipientChoice!
    const defaultVariant = choice.defaultRecipient === "source" ? source.buildId : "none"
    choiceGroups.push({ id: choice.group, label: choice.label, defaultVariant,
      options: [{ id: "none", label: "不指定 / 不拾取" }, ...builds.filter((build) =>
        !choice.excludeSource || build.buildId !== source.buildId).map((build) => ({ id: build.buildId,
          label: supportedCharacters.find((character) => character.characterId === build.characterId)?.label ?? build.characterId }))] })
    choices[choice.group] = scenario.conditions.weaponEffectChoices?.[source.buildId]?.[choice.group] ?? defaultVariant
  }
  return { choices, choiceGroups }
}

/** Translates validated variants into the same source-owned legacy IDs used by equipped evaluation. */
export function applyWeaponChoices(
  scenario: EvaluationScenario, overrides: Readonly<Record<string, string>> = {}, gameData?: GameDataRepository
): EvaluationScenario {
  const { choiceGroups } = describeWeaponChoices(scenario, gameData)
  for (const [group, variant] of Object.entries(overrides)) {
    const effects = choicesByGroup.get(`${scenario.primary.weapon.weaponId}:${group}`)
    if (!effects?.some((effect) => effect.weaponChoice?.variant === variant) &&
      !isValidRecipientChoice(scenario.primary, [scenario.primary, ...scenario.teammates], group, variant)) {
      throw Object.assign(new Error(`武器条件无效：${scenario.primary.weapon.weaponId} / ${group} / ${variant}`), { statusCode: 400 })
    }
  }
  const applicable = new Set(choiceGroups.map((group) => group.id))
  const retained = Object.fromEntries(Object.entries(scenario.conditions.weaponEffectChoices?.[scenario.primary.buildId] ?? {})
    .filter(([group]) => applicable.has(group)))
  return { ...scenario, conditions: { ...scenario.conditions, weaponEffectChoices: {
    ...scenario.conditions.weaponEffectChoices, [scenario.primary.buildId]: { ...retained,
      ...Object.fromEntries(Object.entries(overrides).filter(([group]) => applicable.has(group))) }
  } } }
}

/** Resolves a source-owned variant without promoting the source or changing the shared foreground. */
export function isWeaponChoiceSelected(input: {
  readonly effect: CombatActionEffect
  readonly sourceBuildId: string
  readonly sourceCharacterId?: string
  readonly choices?: Readonly<Record<string, string>> | undefined
  readonly automaticVariant?: string | undefined
  readonly actionOwnerBuildId: string
  readonly activeEffectIds: readonly string[]
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
}): boolean {
  const { effect } = input
  if (effect.source.kind !== "weapon" || !effect.weaponChoice) return true
  const choice = effect.weaponChoice
  if (input.automaticVariant !== undefined) return choice.variant === input.automaticVariant
  const fixed = choice.fixedVariantByCharacter?.[input.sourceCharacterId ?? ""]
  if (fixed !== undefined) return choice.variant === fixed
  const selected = input.choices?.[choice.group]
  if (selected !== undefined) return choice.variant === selected
  const variants = new Set((choicesByGroup.get(`${effect.source.weaponId}:${choice.group}`) ?? []).flatMap((candidate) => {
    if (!input.activeEffectIds.includes(candidate.id)) return []
    const source = input.activeEffectSourceBuildIds?.[candidate.id] ?? input.actionOwnerBuildId
    return source === input.sourceBuildId ? [candidate.weaponChoice!.variant] : []
  }))
  if (variants.size > 1) throw Object.assign(new Error(`Conflicting weapon choices for ${input.sourceBuildId}: ${choice.group}`), { statusCode: 400 })
  return choice.variant === (variants.values().next().value ??
    choice.defaultVariantByCharacter?.[input.sourceCharacterId ?? ""] ?? choice.defaultVariant)
}
