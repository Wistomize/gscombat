import type { ExternalBuff } from "@gscombat/contracts"

import {
  characterCatalogPresentation,
  type CatalogWeaponType,
  type CharacterCatalogPresentation
} from "../catalog-presentation.js"
import { listCombatActions, listCombatMetrics } from "../combat-registry.js"
import { listPublishedArtifactSets, listPublishedWeapons } from "../equipment-coverage-ledger.js"
import type {
  CombatActionIntegerScenarioParameter,
  CombatActionMetadata,
  CombatDamageMetricDefinition,
  CombatMetricDefinition,
  CombatMetricRecipientHpFractionRequirement,
  CombatMetricRecipientRequirement,
  CombatMetricSourceHpFractionRequirement,
  CombatTalentSlot
} from "../combat/types.js"

export interface CharacterCatalogEntry {
  readonly characterId: string
  readonly label: string
  readonly primaryActions: readonly CharacterPrimaryAction[]
  readonly primaryActionIds: readonly string[]
  /** Verified non-damage indicators calculated through the typed metric pipeline. */
  readonly supportMetrics: readonly CharacterSupportMetric[]
  readonly weaponType: WeaponType
}

export type WeaponType = CatalogWeaponType

/** A selectable, already-verified target action with its player-facing label. */
export interface CharacterPrimaryAction {
  readonly id: string
  readonly label: string
  /** Optional manual snapshot inputs that the selected action validates. */
  readonly scenarioParameters?: readonly CombatActionIntegerScenarioParameter[]
  /** Optional formula-display instruction inherited from the maintained action declaration. */
  readonly tracePresentation?: NonNullable<CombatActionMetadata["tracePresentation"]>
}

/** A selectable verified output that is intentionally not converted into damage. */
export interface CharacterSupportMetric {
  /** Recipient state that is only required after its source constellation is active. */
  readonly conditionalRecipientRequirements?: readonly CharacterSupportConditionalRecipientRequirement[]
  readonly id: string
  readonly kind: Exclude<CombatMetricDefinition["kind"], "damage">
  readonly label: string
  /** Optional action-owned inputs used by this metric's source action. */
  readonly scenarioParameters?: readonly CombatActionIntegerScenarioParameter[]
  /** Source HP-state conditions required by a source-owned healing modifier. */
  readonly sourceHpRequirements?: readonly CombatMetricSourceHpFractionRequirement[]
  readonly sourceActionId: string
  readonly target: CombatMetricDefinition["target"]
  /** Recipient conditions are exposed so the UI can request them explicitly rather than guessing. */
  readonly recipientRequirements?: readonly CombatMetricRecipientRequirement[]
  /** Explicit recipient state needed by a metric that routes its result from active recipient back to source. */
  readonly recipientTargetRouting?: "active_recipient_if_moonsign_else_self"
}

/** A recipient condition belonging to one constellation-gated support contribution. */
export interface CharacterSupportConditionalRecipientRequirement {
  readonly minimumSourceConstellation: number
  readonly requirement: CombatMetricRecipientHpFractionRequirement
}

export interface WeaponCatalogEntry {
  readonly label: string
  readonly rarity: 3 | 4 | 5
  readonly weaponId: string
  readonly weaponType: WeaponType
}

export interface ArtifactSetCatalogEntry {
  readonly label: string
  readonly setId: string
}

export interface BuffPresetCatalogEntry {
  readonly buffs: readonly ExternalBuff[]
  readonly id: string
  readonly label: string
}

const genericActionPrefixes: Readonly<Record<CombatTalentSlot, string>> = {
  burst: "元素爆发",
  constellation: "命之座",
  normal: "普通攻击",
  passive: "固有天赋",
  plunge: "下落攻击",
  skill: "元素战技"
}

function isSelectablePrimaryAction(action: CombatActionMetadata, selectedDamageActionIds: ReadonlySet<string>): boolean {
  return action.kind === "damage" && action.status === "verified" && selectedDamageActionIds.has(action.id)
}

/**
 * Removes an authored zero-constellation baseline qualifier from a catalog label.
 *
 * Metric labels describe the selected action or output, rather than limiting the configured character build. Actual
 * constellation effects and talent-level bonuses remain declared on the combat coverage and are evaluated later.
 */
export function normalizeProjectedMetricLabel(label: string): string {
  return label
    .replace(/([（(])\s*(?:C0|0命|零命)\s*[，、,:：]?\s*/g, "$1")
    .replace(/([，、,:：])\s*(?:C0|0命|零命)\s*[，、,:：]?\s*/g, "$1")
    .replace(/(^|\s)(?:C0|0命|零命)\s*[，、,:：]?\s*/g, "$1")
    .replace(/[（(]\s*[）)]/g, "")
    .replace(/([，、,:：])\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function getPrimaryActionLabel(
  action: CombatActionMetadata,
  presentation: CharacterCatalogPresentation,
  metricLabel?: string
): string {
  const friendlyLabel = presentation.primaryActionLabels?.[action.id]
  if (friendlyLabel) return normalizeProjectedMetricLabel(friendlyLabel)
  if (metricLabel) return normalizeProjectedMetricLabel(metricLabel)
  const hitLabel = action.damageParts && action.damageParts.length > 1 ? "已验证基础多段伤害" : "已验证基础单段伤害"
  return `${genericActionPrefixes[action.talentSlot]} / ${hitLabel}`
}

function cloneScenarioParameter(
  parameter: CombatActionIntegerScenarioParameter
): CombatActionIntegerScenarioParameter {
  return {
    ...parameter,
    ...(parameter.allowedValues ? { allowedValues: [...parameter.allowedValues] } : {}),
    ...(parameter.maximumValueByParameter
      ? {
          maximumValueByParameter: {
            ...parameter.maximumValueByParameter,
            values: parameter.maximumValueByParameter.values.map((value) => ({ ...value }))
          }
        }
      : {}),
    ...(parameter.rangeBySourceConstellation
      ? { rangeBySourceConstellation: parameter.rangeBySourceConstellation.map((range) => ({ ...range })) }
      : {})
  }
}

function cloneRecipientRequirement(
  requirement: CombatMetricRecipientRequirement
): CombatMetricRecipientRequirement {
  return { ...requirement }
}

function cloneSourceHpRequirement(
  requirement: CombatMetricSourceHpFractionRequirement
): CombatMetricSourceHpFractionRequirement {
  return { ...requirement }
}

function cloneRecipientHpFractionRequirement(
  requirement: CombatMetricRecipientHpFractionRequirement
): CombatMetricRecipientHpFractionRequirement {
  return { ...requirement }
}

function createPrimaryAction(
  action: CombatActionMetadata,
  presentation: CharacterCatalogPresentation,
  metricLabel?: string
): CharacterPrimaryAction {
  return {
    id: action.id,
    label: getPrimaryActionLabel(action, presentation, metricLabel),
    ...(action.scenarioParameters?.length
      ? { scenarioParameters: action.scenarioParameters.map(cloneScenarioParameter) }
      : {}),
    ...(action.tracePresentation ? { tracePresentation: { ...action.tracePresentation } } : {})
  }
}

function createSupportMetric(
  metric: Exclude<CombatMetricDefinition, CombatDamageMetricDefinition>,
  actionById: ReadonlyMap<string, CombatActionMetadata>
): CharacterSupportMetric {
  const sourceAction = actionById.get(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Support metric ${metric.id} references missing action ${metric.sourceActionId}`)

  const recipientRequirements = metric.target === "friendly_recipient" ? metric.recipientRequirements : undefined
  const sourceHpRequirements =
    metric.kind === "healing"
      ? metric.sourceHealingBonuses?.flatMap((bonus) =>
          bonus.sourceRequirement === undefined ? [] : [cloneSourceHpRequirement(bonus.sourceRequirement)]
        )
      : undefined
  const recipientTargetRouting =
    metric.kind === "scalar" && metric.target === "friendly_recipient"
      ? metric.recipientTargetRouting
      : undefined
  const conditionalRecipientRequirements =
    metric.kind === "healing"
      ? metric.conditionalScalingBonuses?.map((bonus) => ({
          minimumSourceConstellation: bonus.minimumSourceConstellation,
          requirement: cloneRecipientHpFractionRequirement(bonus.recipientRequirement)
        }))
      : undefined
  return {
    ...(conditionalRecipientRequirements?.length ? { conditionalRecipientRequirements } : {}),
    id: metric.id,
    kind: metric.kind,
    label: normalizeProjectedMetricLabel(metric.label),
    ...(sourceAction.scenarioParameters?.length
      ? { scenarioParameters: sourceAction.scenarioParameters.map(cloneScenarioParameter) }
      : {}),
    ...(sourceHpRequirements?.length ? { sourceHpRequirements } : {}),
    sourceActionId: metric.sourceActionId,
    target: metric.target,
    ...(recipientRequirements?.length
      ? { recipientRequirements: recipientRequirements.map(cloneRecipientRequirement) }
      : {}),
    ...(recipientTargetRouting === undefined ? {} : { recipientTargetRouting })
  }
}

interface SelectableDamageAction {
  readonly action: CombatActionMetadata
  readonly metric: CombatDamageMetricDefinition
}

function groupSelectableDamageActionsByCharacter(): ReadonlyMap<string, readonly SelectableDamageAction[]> {
  const actionsByCharacter = new Map<string, SelectableDamageAction[]>()
  const selectedDamageMetrics = listCombatMetrics().filter(
    (metric): metric is CombatDamageMetricDefinition => metric.kind === "damage" && metric.status === "verified"
  )
  const selectedDamageMetricsByActionId = new Map(selectedDamageMetrics.map((metric) => [metric.actionId, metric]))
  const selectedDamageActionIds = new Set(selectedDamageMetricsByActionId.keys())
  for (const action of listCombatActions().filter((candidate) => isSelectablePrimaryAction(candidate, selectedDamageActionIds))) {
    const metric = selectedDamageMetricsByActionId.get(action.id)
    if (!metric) continue
    const characterActions = actionsByCharacter.get(action.characterId)
    if (characterActions) {
      characterActions.push({ action, metric })
      continue
    }
    actionsByCharacter.set(action.characterId, [{ action, metric }])
  }
  return actionsByCharacter
}

function groupSelectableSupportMetricsByCharacter(): ReadonlyMap<string, readonly CharacterSupportMetric[]> {
  const metricsByCharacter = new Map<string, CharacterSupportMetric[]>()
  const actionById = new Map(listCombatActions().map((action) => [action.id, action]))
  const selectedSupportMetrics = listCombatMetrics().filter(
    (metric): metric is Exclude<CombatMetricDefinition, CombatDamageMetricDefinition> =>
      metric.kind !== "damage" && metric.status === "verified"
  )
  for (const metric of selectedSupportMetrics) {
    const characterMetrics = metricsByCharacter.get(metric.characterId)
    const catalogMetric = createSupportMetric(metric, actionById)
    if (characterMetrics) {
      characterMetrics.push(catalogMetric)
      continue
    }
    metricsByCharacter.set(metric.characterId, [catalogMetric])
  }
  return metricsByCharacter
}

function indexCharacterPresentation(): ReadonlyMap<string, CharacterCatalogPresentation> {
  const presentationByCharacter = new Map<string, CharacterCatalogPresentation>()
  for (const presentation of characterCatalogPresentation) {
    if (presentationByCharacter.has(presentation.characterId)) {
      throw new Error(`Duplicate character catalog presentation: ${presentation.characterId}`)
    }
    presentationByCharacter.set(presentation.characterId, presentation)
  }
  return presentationByCharacter
}

function createSupportedCharacters(): readonly CharacterCatalogEntry[] {
  const actionsByCharacter = groupSelectableDamageActionsByCharacter()
  const supportMetricsByCharacter = groupSelectableSupportMetricsByCharacter()
  const presentationByCharacter = indexCharacterPresentation()
  const selectableCharacterIds = new Set([...actionsByCharacter.keys(), ...supportMetricsByCharacter.keys()])
  const missingPresentation = [...selectableCharacterIds].filter((characterId) => !presentationByCharacter.has(characterId))
  if (missingPresentation.length > 0) {
    throw new Error(`Missing character catalog presentation: ${missingPresentation.join(", ")}`)
  }

  return characterCatalogPresentation.flatMap((presentation) => {
    const actions = actionsByCharacter.get(presentation.characterId)
    const supportMetrics = supportMetricsByCharacter.get(presentation.characterId) ?? []
    if (!actions && supportMetrics.length === 0) return []
    const primaryActions =
      actions?.map(({ action, metric }) => createPrimaryAction(action, presentation, metric.label)) ?? []
    return [
      {
        characterId: presentation.characterId,
        label: presentation.label,
        primaryActions,
        primaryActionIds: primaryActions.map((action) => action.id),
        supportMetrics,
        weaponType: presentation.weaponType
      }
    ]
  })
}

/**
 * Configurable characters projected from maintainer-selected verified outputs and browser-safe presentation metadata.
 * Damage actions and typed support indicators remain separate because only damage actions use a team damage scenario.
 */
export const supportedCharacters: readonly CharacterCatalogEntry[] = createSupportedCharacters()

/** The current user-facing equipment projection; full inventory and review state live in the coverage ledger. */
export const supportedWeapons: readonly WeaponCatalogEntry[] = listPublishedWeapons()

/** The current user-facing artifact projection; unreviewed or unsupported set effects remain hidden. */
export const supportedArtifactSets: readonly ArtifactSetCatalogEntry[] = listPublishedArtifactSets()

export const supportedBuffPresets: readonly BuffPresetCatalogEntry[] = [
  {
    buffs: [
      { label: "仙跳墙 · 攻击力", sourceId: "food.adeptus-temptation", stat: "attack_flat", value: 372 },
      { label: "仙跳墙 · 暴击率", sourceId: "food.adeptus-temptation", stat: "crit_rate", value: 0.12 }
    ],
    id: "food.adeptus-temptation",
    label: "美味的仙跳墙"
  }
]
