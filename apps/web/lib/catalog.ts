import {
  getCombatActionDefinition,
  listActiveScenarioEffectOptionsForAction,
  supportedArtifactSets,
  supportedBuffPresets,
  supportedCharacters,
  supportedWeapons
} from "@gscombat/content"
import type { CatalogResponse } from "@gscombat/contracts"

/** Catalog shared by the configuration and calculation routes. */
export const webCatalog: CatalogResponse = {
  artifactSets: [...supportedArtifactSets],
  buffPresets: supportedBuffPresets.map((preset) => ({ ...preset, buffs: [...preset.buffs] })),
  characters: supportedCharacters.map((character) => ({
    ...character,
    primaryActions: character.primaryActions.map(({ scenarioParameters, ...action }) => {
      const combatAction = getCombatActionDefinition(action.id)
      const scenarioEffects = combatAction
        ? listActiveScenarioEffectOptionsForAction(combatAction, character.weaponType)
        : []
      return {
        ...action,
        ...(scenarioEffects.length > 0 ? { scenarioEffects: [...scenarioEffects] } : {}),
        ...(scenarioParameters
          ? {
              scenarioParameters: scenarioParameters.map(({ allowedValues, maximumValueByParameter, ...parameter }) => ({
                ...parameter,
                ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
                ...(maximumValueByParameter
                  ? {
                      maximumValueByParameter: {
                        parameterId: maximumValueByParameter.parameterId,
                        values: maximumValueByParameter.values.map((value) => ({ ...value }))
                      }
                    }
                  : {})
              }))
            }
          : {})
      }
    }),
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
            conditionalRecipientRequirements: conditionalRecipientRequirements.map((requirement) => ({
              ...requirement,
              requirement: { ...requirement.requirement }
            }))
          }
        : {}),
      ...(recipientRequirements
        ? { recipientRequirements: recipientRequirements.map((requirement) => ({ ...requirement })) }
        : {}),
      ...(scenarioParameters
        ? {
            scenarioParameters: scenarioParameters.map(({ allowedValues, maximumValueByParameter, ...parameter }) => ({
              ...parameter,
              ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
              ...(maximumValueByParameter
                ? {
                    maximumValueByParameter: {
                      parameterId: maximumValueByParameter.parameterId,
                      values: maximumValueByParameter.values.map((value) => ({ ...value }))
                    }
                  }
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
