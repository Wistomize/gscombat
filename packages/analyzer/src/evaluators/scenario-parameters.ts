import type { CombatActionMetadata } from "@gscombat/content"

/** Resolves and validates manual integer snapshot inputs declared by one target action. */
export function resolveActionScenarioParameters(
  action: CombatActionMetadata,
  selectedParameters: Readonly<Record<string, number>> | undefined,
  sourceConstellation: number
): ReadonlyMap<string, number> {
  if (!Number.isInteger(sourceConstellation) || sourceConstellation < 0 || sourceConstellation > 6) {
    throw new Error(`Declared action ${action.id} requires a source constellation from 0 to 6`)
  }
  const definitions = action.scenarioParameters ?? []
  const definitionsById = new Map(definitions.map((definition) => [definition.id, definition]))
  if (definitionsById.size !== definitions.length) {
    throw new Error(`Declared action ${action.id} has duplicate scenario parameter IDs`)
  }
  for (const parameterId of Object.keys(selectedParameters ?? {})) {
    if (!definitionsById.has(parameterId)) {
      throw new Error(`Declared action ${action.id} does not declare scenario parameter ${parameterId}`)
    }
  }

  const resolved = new Map<string, number>()
  for (const definition of definitions) {
    assertScenarioParameterDefinition(action.id, definition)
    const hasSelectedValue = Object.prototype.hasOwnProperty.call(selectedParameters ?? {}, definition.id)
    const range = resolveActionScenarioParameterRange(definition, sourceConstellation)
    const selectedValue = hasSelectedValue ? selectedParameters?.[definition.id] : range.defaultValue
    if (
      typeof selectedValue !== "number" ||
      !Number.isInteger(selectedValue) ||
      selectedValue < range.minimumValue ||
      selectedValue > range.maximumValue ||
      (definition.allowedValues !== undefined && !definition.allowedValues.includes(selectedValue))
    ) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} must be an allowed integer from ${range.minimumValue} to ${range.maximumValue}`
      )
    }
    const requiredConstellation = getScenarioParameterMinimumSourceConstellation(definition, selectedValue)
    if (requiredConstellation !== undefined && sourceConstellation < requiredConstellation) {
      throw new Error(
        `Scenario parameter ${definition.id} value ${selectedValue} for action ${action.id} requires source constellation ` +
          `${requiredConstellation}, but build has constellation ${sourceConstellation}`
      )
    }
    resolved.set(definition.id, selectedValue)
  }
  for (const definition of definitions) {
    const maximumByParameter = definition.maximumValueByParameter
    if (!maximumByParameter) continue
    const sourceValue = resolved.get(maximumByParameter.parameterId)
    const matchingMaximum = maximumByParameter.values.find((entry) => entry.parameterValue === sourceValue)
    if (!matchingMaximum) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} has no maximum for ${maximumByParameter.parameterId}=${sourceValue}`
      )
    }
    const value = resolved.get(definition.id)
    if (value === undefined || value > matchingMaximum.maximumValue) {
      throw new Error(
        `Scenario parameter ${definition.id} for action ${action.id} must not exceed ${matchingMaximum.maximumValue} when ${maximumByParameter.parameterId}=${sourceValue}`
      )
    }
  }
  return resolved
}

type ActionScenarioParameterDefinition = NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
type ActionScenarioParameterConstellationRange = NonNullable<
  ActionScenarioParameterDefinition["rangeBySourceConstellation"]
>[number]

interface ResolvedActionScenarioParameterRange {
  readonly defaultValue: number
  readonly maximumValue: number
  readonly minimumValue: number
}

/** Resolves the highest applicable constellation-specific bounds for one action snapshot input. */
function resolveActionScenarioParameterRange(
  definition: ActionScenarioParameterDefinition,
  sourceConstellation: number
): ResolvedActionScenarioParameterRange {
  let selectedRange: ActionScenarioParameterConstellationRange | undefined
  for (const candidate of definition.rangeBySourceConstellation ?? []) {
    if (candidate.minimumSourceConstellation > sourceConstellation) continue
    if (
      selectedRange === undefined ||
      candidate.minimumSourceConstellation > selectedRange.minimumSourceConstellation
    ) {
      selectedRange = candidate
    }
  }
  return {
    defaultValue: selectedRange?.defaultValue ?? definition.defaultValue,
    maximumValue: selectedRange?.maximumValue ?? definition.maximumValue,
    minimumValue: selectedRange?.minimumValue ?? definition.minimumValue
  }
}

function assertScenarioParameterDefinition(
  actionId: string,
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
): void {
  if (!definition.id || !Number.isInteger(definition.defaultValue) || !Number.isInteger(definition.minimumValue)) {
    throw new Error(`Scenario parameter declaration for action ${actionId} must use a non-empty integer ID and bounds`)
  }
  if (!Number.isInteger(definition.maximumValue) || definition.minimumValue > definition.maximumValue) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has invalid bounds`)
  }
  if (definition.defaultValue < definition.minimumValue || definition.defaultValue > definition.maximumValue) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range default`)
  }
  const constellationRanges = definition.rangeBySourceConstellation
  if (constellationRanges) {
    const thresholds = new Set<number>()
    for (const range of constellationRanges) {
      if (
        !Number.isInteger(range.minimumSourceConstellation) ||
        range.minimumSourceConstellation < 1 ||
        range.minimumSourceConstellation > 6
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid constellation range threshold`)
      }
      if (thresholds.has(range.minimumSourceConstellation)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate constellation range thresholds`)
      }
      thresholds.add(range.minimumSourceConstellation)
      if (range.defaultValue === undefined && range.maximumValue === undefined && range.minimumValue === undefined) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an empty constellation range`)
      }
      if (
        (range.defaultValue !== undefined && !Number.isInteger(range.defaultValue)) ||
        (range.maximumValue !== undefined && !Number.isInteger(range.maximumValue)) ||
        (range.minimumValue !== undefined && !Number.isInteger(range.minimumValue))
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has non-integer constellation range bounds`)
      }
      const minimumValue = range.minimumValue ?? definition.minimumValue
      const maximumValue = range.maximumValue ?? definition.maximumValue
      const defaultValue = range.defaultValue ?? definition.defaultValue
      if (minimumValue > maximumValue || defaultValue < minimumValue || defaultValue > maximumValue) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has invalid constellation range bounds`)
      }
    }
  }
  if (definition.allowedValues) {
    const allowedValues = new Set<number>()
    for (const value of definition.allowedValues) {
      if (!Number.isInteger(value) || !isScenarioParameterValueWithinAnyDeclaredRange(definition, value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range allowed value`)
      }
      if (allowedValues.has(value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate allowed values`)
      }
      allowedValues.add(value)
    }
    if (!allowedValues.has(definition.defaultValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has a disallowed default`)
    }
    for (const range of constellationRanges ?? []) {
      const defaultValue = range.defaultValue ?? definition.defaultValue
      if (!allowedValues.has(defaultValue)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has a disallowed constellation default`)
      }
    }
  }
  const constellationRequirements = definition.minimumSourceConstellationByValue
  if (constellationRequirements) {
    const gatedValues = new Set<number>()
    for (const requirement of constellationRequirements) {
      if (
        !Number.isInteger(requirement.minimumSourceConstellation) ||
        requirement.minimumSourceConstellation < 1 ||
        requirement.minimumSourceConstellation > 6
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid constellation threshold`)
      }
      if (
        !Number.isInteger(requirement.value) ||
        !isScenarioParameterValueWithinRangeAtConstellation(
          definition,
          requirement.value,
          requirement.minimumSourceConstellation
        )
      ) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range constellation-gated value`)
      }
      if (definition.allowedValues && !definition.allowedValues.includes(requirement.value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} gates a disallowed value`)
      }
      if (gatedValues.has(requirement.value)) {
        throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate constellation-gated values`)
      }
      gatedValues.add(requirement.value)
    }
  }
  const maximumByParameter = definition.maximumValueByParameter
  if (!maximumByParameter) return
  if (!maximumByParameter.parameterId || maximumByParameter.values.length === 0) {
    throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an invalid dependent maximum`)
  }
  const sourceValues = new Set<number>()
  for (const entry of maximumByParameter.values) {
    if (!Number.isInteger(entry.parameterValue) || !Number.isInteger(entry.maximumValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has non-integer dependent bounds`)
    }
    if (!isScenarioParameterValueWithinAnyDeclaredRange(definition, entry.maximumValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has an out-of-range dependent maximum`)
    }
    if (sourceValues.has(entry.parameterValue)) {
      throw new Error(`Scenario parameter ${definition.id} for action ${actionId} has duplicate dependent bounds`)
    }
    sourceValues.add(entry.parameterValue)
  }
}

function isScenarioParameterValueWithinAnyDeclaredRange(
  definition: ActionScenarioParameterDefinition,
  value: number
): boolean {
  if (value >= definition.minimumValue && value <= definition.maximumValue) return true
  return (definition.rangeBySourceConstellation ?? []).some((range) => {
    const minimumValue = range.minimumValue ?? definition.minimumValue
    const maximumValue = range.maximumValue ?? definition.maximumValue
    return value >= minimumValue && value <= maximumValue
  })
}

function isScenarioParameterValueWithinRangeAtConstellation(
  definition: ActionScenarioParameterDefinition,
  value: number,
  sourceConstellation: number
): boolean {
  const range = resolveActionScenarioParameterRange(definition, sourceConstellation)
  return value >= range.minimumValue && value <= range.maximumValue
}

/** Returns the source-constellation threshold for one declared snapshot value, when it has one. */
export function getScenarioParameterMinimumSourceConstellation(
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number],
  value: number
): number | undefined {
  return definition.minimumSourceConstellationByValue?.find((entry) => entry.value === value)?.minimumSourceConstellation
}
