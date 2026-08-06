import type {
  ActiveScenarioEffectOption,
  CatalogResponse,
  CharacterBuild,
  EvaluationScenario,
  MetricEvaluationContext
} from "@gscombat/contracts"

export type CatalogPrimaryAction = CatalogResponse["characters"][number]["primaryActions"][number]
export type CatalogSupportMetric = CatalogResponse["characters"][number]["supportMetrics"][number]
type CatalogScenarioParameter = NonNullable<CatalogSupportMetric["scenarioParameters"]>[number]
export type ScenarioEffectOption = ActiveScenarioEffectOption

export interface SupportMetricContextDraft {
  readonly actionParameters?: Record<string, number> | undefined
  readonly recipient?: {
    readonly buildId?: string | undefined
    readonly currentHpFraction?: number | undefined
    readonly isMoonsign?: boolean | undefined
    readonly isWithinSourceArea?: boolean | undefined
  }
  readonly source?: {
    readonly currentHpFraction?: number | undefined
  }
}

export function getDefaultActionParameters(action: CatalogPrimaryAction | undefined): Record<string, number> | undefined {
  if (!action?.scenarioParameters?.length) return undefined
  return Object.fromEntries(action.scenarioParameters.map((parameter) => [parameter.id, parameter.defaultValue]))
}

export function getScenarioParameterRange(
  parameter: CatalogScenarioParameter,
  sourceConstellation: number
): Pick<CatalogScenarioParameter, "defaultValue" | "maximumValue" | "minimumValue"> {
  const eligibleRanges = parameter.rangeBySourceConstellation
    ?.filter((range) => sourceConstellation >= range.minimumSourceConstellation)
    .sort((left, right) => left.minimumSourceConstellation - right.minimumSourceConstellation)
  const range = eligibleRanges?.at(-1)
  return {
    defaultValue: range?.defaultValue ?? parameter.defaultValue,
    maximumValue: range?.maximumValue ?? parameter.maximumValue,
    minimumValue: range?.minimumValue ?? parameter.minimumValue
  }
}

export function createSupportMetricContextDraft(): SupportMetricContextDraft {
  return {}
}

export function createSupportMetricEvaluationContext(
  draft: SupportMetricContextDraft,
  teammates: readonly CharacterBuild[]
): MetricEvaluationContext {
  const context: MetricEvaluationContext = { teammates: [...teammates] }
  if (draft.actionParameters && Object.keys(draft.actionParameters).length > 0) {
    context.actionParameters = { ...draft.actionParameters }
  }
  if (draft.source) {
    context.source = draft.source.currentHpFraction === undefined ? {} : { currentHpFraction: draft.source.currentHpFraction }
  }
  if (draft.recipient?.buildId) {
    context.recipient = {
      buildId: draft.recipient.buildId,
      ...(draft.recipient.currentHpFraction === undefined
        ? {}
        : { currentHpFraction: draft.recipient.currentHpFraction }),
      ...(draft.recipient.isMoonsign === undefined ? {} : { isMoonsign: draft.recipient.isMoonsign }),
      ...(draft.recipient.isWithinSourceArea === undefined
        ? {}
        : { isWithinSourceArea: draft.recipient.isWithinSourceArea })
    }
  }
  return context
}

export function needsRecipientInSourceArea(metric: CatalogSupportMetric): boolean {
  return metric.recipientRequirements?.some((requirement) => requirement.kind === "recipient_in_source_area") ?? false
}

export function needsRecipientHpFraction(metric: CatalogSupportMetric, sourceBuild: CharacterBuild): boolean {
  const hasBaseRequirement =
    metric.recipientRequirements?.some(
      (requirement) =>
        requirement.kind === "recipient_hp_fraction" &&
        (requirement.waivedAtSourceConstellation === undefined ||
          sourceBuild.constellation < requirement.waivedAtSourceConstellation)
    ) ?? false
  const hasConditionalRequirement =
    metric.conditionalRecipientRequirements?.some(
      (requirement) => sourceBuild.constellation >= requirement.minimumSourceConstellation
    ) ?? false
  return hasBaseRequirement || hasConditionalRequirement
}

export function needsSourceHpFraction(metric: CatalogSupportMetric): boolean {
  return metric.sourceHpRequirements?.some((requirement) => requirement.kind === "source_hp_fraction") ?? false
}

export function validateSupportMetricContext(
  metric: CatalogSupportMetric,
  sourceBuild: CharacterBuild,
  draft: SupportMetricContextDraft
): string | undefined {
  if (metric.target === "friendly_recipient") {
    const recipient = draft.recipient
    if (!recipient?.buildId) return "请选择该辅助指标的受益角色"
    if (needsRecipientInSourceArea(metric) && typeof recipient.isWithinSourceArea !== "boolean") {
      return "请明确受益角色是否位于来源技能区域内"
    }
    if (needsRecipientHpFraction(metric, sourceBuild) && recipient.currentHpFraction === undefined) {
      return "请填写受益角色当前生命比例"
    }
    if (metric.recipientTargetRouting === "active_recipient_if_moonsign_else_self" && typeof recipient.isMoonsign !== "boolean") {
      return "请明确受益角色是否处于月兆状态"
    }
  }
  if (needsSourceHpFraction(metric) && draft.source?.currentHpFraction === undefined) {
    return "请填写来源角色当前生命比例"
  }
  return undefined
}

export function parseOptionalPercent(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed / 100 : undefined
}

function countArtifactSetPieces(build: CharacterBuild, setId: string): number {
  return build.artifacts.filter((artifact) => artifact.setId === setId).length
}

function getScenarioEffectSourceBuilds(
  effect: ScenarioEffectOption,
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[]
): readonly CharacterBuild[] {
  const source = effect.source
  const party = [primary, ...teammates]
  let sourceBuilds: readonly CharacterBuild[]
  if (source.kind === "character") {
    sourceBuilds = party.filter(
      (build) => build.characterId === source.characterId && build.constellation >= (source.minimumSourceConstellation ?? 0)
    )
  } else if (source.kind === "weapon") {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => build.weapon.weaponId === source.weaponId)
  } else {
    const holders = source.holder === "party_member" ? party : [primary]
    sourceBuilds = holders.filter((build) => countArtifactSetPieces(build, source.setId) >= source.minimumPieces)
  }
  if (effect.recipientSourceRelation === "not_source") {
    return sourceBuilds.filter((build) => build.buildId !== primary.buildId)
  }
  if (effect.recipientSourceRelation === "source") {
    return sourceBuilds.filter((build) => build.buildId === primary.buildId)
  }
  return sourceBuilds
}

export function reconcileScenarioEffectIds(
  activeEffectIds: readonly string[],
  effectOptions: readonly ScenarioEffectOption[]
): string[] {
  const effectsById = new Map(effectOptions.map((effect) => [effect.id, effect]))
  const selectedEffectIds = new Set(
    activeEffectIds.filter((effectId) => {
      const effect = effectsById.get(effectId)
      return effect !== undefined && effect.requiredActiveEffectIds === undefined
    })
  )
  let added = true
  while (added) {
    added = false
    for (const effect of effectOptions) {
      const requiredActiveEffectIds = effect.requiredActiveEffectIds
      if (
        selectedEffectIds.has(effect.id) ||
        requiredActiveEffectIds === undefined ||
        !requiredActiveEffectIds.every((effectId) => selectedEffectIds.has(effectId))
      ) {
        continue
      }
      selectedEffectIds.add(effect.id)
      added = true
    }
  }
  return [...selectedEffectIds]
}


export function getMaximumReachableConditions(
  conditions: EvaluationScenario["conditions"],
  effectOptions: readonly ScenarioEffectOption[],
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  selectedCharacterEffectIds: readonly string[]
): EvaluationScenario["conditions"] {
  const activeEffectIds = reconcileScenarioEffectIds(selectedCharacterEffectIds, effectOptions)
  const activeEffectSourceBuildIds = Object.fromEntries(
    effectOptions.flatMap((effect) => {
      if (!activeEffectIds.includes(effect.id)) return []
      const sourceBuilds = [...getScenarioEffectSourceBuilds(effect, primary, teammates)]
      if (sourceBuilds.length < 2) return []
      sourceBuilds.sort((left, right) => right.weapon.refinement - left.weapon.refinement)
      return [[effect.id, sourceBuilds[0]!.buildId] as const]
    })
  )
  return {
    ...conditions,
    activeEffectIds,
    ...(Object.keys(activeEffectSourceBuildIds).length > 0 ? { activeEffectSourceBuildIds } : {})
  }
}

export function removeUnavailableResonanceConditions(
  conditions: EvaluationScenario["conditions"],
  hasCryoResonance: boolean,
  hasGeoResonance: boolean
): EvaluationScenario["conditions"] {
  let normalized = conditions
  if (!hasGeoResonance && normalized.primaryShielded !== undefined) {
    const { primaryShielded: _primaryShielded, ...withoutShield } = normalized
    normalized = withoutShield
  }
  if (!hasCryoResonance && normalized.targetFrozen !== undefined) {
    const { targetFrozen: _targetFrozen, ...withoutFrozen } = normalized
    normalized = withoutFrozen
  }
  return normalized
}
