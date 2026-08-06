import type { CombatActionMetadata } from "@gscombat/content"

export function getActionScenarioParameterValues(
  definition: NonNullable<CombatActionMetadata["scenarioParameters"]>[number]
): readonly number[] {
  if (definition.allowedValues) return definition.allowedValues
  return Array.from(
    { length: definition.maximumValue - definition.minimumValue + 1 },
    (_, index) => definition.minimumValue + index
  )
}
