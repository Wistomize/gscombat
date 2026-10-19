import type { CatalogResponse } from "@gscombat/contracts"
import { getArtifactConditionRequirements, getWeaponConditionRequirements } from "../combat-action-effects.js"
import type { CombatActionIntegerScenarioParameter } from "../combat/types.js"
import { supportedArtifactSets, supportedBuffPresets, supportedCharacters, supportedWeapons } from "./index.js"

type CatalogParameter = NonNullable<CatalogResponse["characters"][number]["primaryActions"][number]["scenarioParameters"]>[number]

function copyParameter(parameter: CombatActionIntegerScenarioParameter): CatalogParameter {
  const { allowedValues, maximumValueByParameter, minimumSourceConstellationByValue, rangeBySourceConstellation, ...base } = parameter
  return {
    ...base,
    ...(allowedValues ? { allowedValues: [...allowedValues] } : {}),
    ...(maximumValueByParameter ? { maximumValueByParameter: {
      parameterId: maximumValueByParameter.parameterId,
      values: maximumValueByParameter.values.map(value => ({ ...value }))
    } } : {}),
    ...(minimumSourceConstellationByValue
      ? { minimumSourceConstellationByValue: minimumSourceConstellationByValue.map(value => ({ ...value })) } : {}),
    ...(rangeBySourceConstellation
      ? { rangeBySourceConstellation: rangeBySourceConstellation.map(range => ({ ...range })) } : {})
  }
}

/** Creates detached display data on the server/build side; this module is not a browser runtime entry. */
export function createCatalogResponse(): CatalogResponse {
  return {
    artifactSets: supportedArtifactSets.map(set => {
      const conditionRequirements = getArtifactConditionRequirements(set.setId)
      return { ...set, ...(conditionRequirements.length ? { conditionRequirements } : {}) }
    }),
    buffPresets: supportedBuffPresets.map(preset => ({ ...preset, buffs: preset.buffs.map(buff => ({ ...buff })) })),
    characters: supportedCharacters.map(character => ({
      ...character,
      primaryActionIds: [...character.primaryActionIds],
      primaryActions: character.primaryActions.map(({ scenarioParameters, tracePresentation, ...action }) => ({
        ...action,
        ...(scenarioParameters ? { scenarioParameters: scenarioParameters.map(copyParameter) } : {}),
        ...(tracePresentation ? { tracePresentation: { ...tracePresentation } } : {})
      })),
      supportMetrics: character.supportMetrics.map(({
        conditionalRecipientRequirements, recipientRequirements, scenarioParameters, sourceHpRequirements, ...metric
      }) => ({
        ...metric,
        ...(conditionalRecipientRequirements ? { conditionalRecipientRequirements: conditionalRecipientRequirements.map(condition => ({
          ...condition, requirement: { ...condition.requirement }
        })) } : {}),
        ...(recipientRequirements ? { recipientRequirements: recipientRequirements.map(requirement => ({ ...requirement })) } : {}),
        ...(scenarioParameters ? { scenarioParameters: scenarioParameters.map(copyParameter) } : {}),
        ...(sourceHpRequirements ? { sourceHpRequirements: sourceHpRequirements.map(requirement => ({ ...requirement })) } : {})
      }))
    })),
    weapons: supportedWeapons.map(({ comparison, ...weapon }) => {
      const conditionRequirements = getWeaponConditionRequirements(weapon.weaponId)
      const entry = { ...weapon, ...(conditionRequirements.length ? { conditionRequirements } : {}) }
      if (!comparison) return entry
      const { refinements, ...policy } = comparison
      return { ...entry, comparison: { ...policy, ...(refinements ? { refinements: [...refinements] } : {}) } }
    })
  }
}
