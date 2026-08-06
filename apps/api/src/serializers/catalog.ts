import {
  supportedArtifactSets,
  supportedBuffPresets,
  supportedCharacters,
  supportedWeapons
} from "@gscombat/content"
import type { CatalogResponse } from "@gscombat/contracts"

/** Projects the immutable Content catalog into the mutable public API response. */
export function serializeCatalogResponse(): CatalogResponse {
  return {
    artifactSets: [...supportedArtifactSets],
    buffPresets: supportedBuffPresets.map((preset) => ({ ...preset, buffs: [...preset.buffs] })),
    characters: supportedCharacters.map((character) => ({
      ...character,
      primaryActions: character.primaryActions.map(({ scenarioParameters, ...action }) => ({
        ...action,
        ...(scenarioParameters
          ? {
              scenarioParameters: scenarioParameters.map(({
                allowedValues,
                maximumValueByParameter,
                rangeBySourceConstellation,
                ...parameter
              }) => ({
                ...parameter,
                ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
                ...(maximumValueByParameter
                  ? {
                      maximumValueByParameter: {
                        parameterId: maximumValueByParameter.parameterId,
                        values: maximumValueByParameter.values.map((value) => ({ ...value }))
                      }
                    }
                  : {}),
                ...(rangeBySourceConstellation
                  ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
                  : {})
              }))
            }
          : {})
      })),
      primaryActionIds: [...character.primaryActionIds],
      supportMetrics: character.supportMetrics.map(({
        conditionalRecipientRequirements,
        recipientRequirements,
        scenarioParameters,
        sourceHpRequirements,
        ...metric
      }) => ({
        ...metric,
        ...(conditionalRecipientRequirements
          ? {
              conditionalRecipientRequirements: conditionalRecipientRequirements.map((condition) => ({
                ...condition,
                requirement: { ...condition.requirement }
              }))
            }
          : {}),
        ...(recipientRequirements
          ? { recipientRequirements: recipientRequirements.map((requirement) => ({ ...requirement })) }
          : {}),
        ...(scenarioParameters
          ? {
              scenarioParameters: scenarioParameters.map(({
                allowedValues,
                maximumValueByParameter,
                rangeBySourceConstellation,
                ...parameter
              }) => ({
                ...parameter,
                ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
                ...(maximumValueByParameter
                  ? {
                      maximumValueByParameter: {
                        parameterId: maximumValueByParameter.parameterId,
                        values: maximumValueByParameter.values.map((value) => ({ ...value }))
                      }
                    }
                  : {}),
                ...(rangeBySourceConstellation
                  ? { rangeBySourceConstellation: rangeBySourceConstellation.map((range) => ({ ...range })) }
                  : {})
              }))
            }
          : {}),
        ...(sourceHpRequirements
          ? { sourceHpRequirements: sourceHpRequirements.map((requirement) => ({ ...requirement })) }
          : {})
      }))
    })),
    weapons: [...supportedWeapons]
  }
}
