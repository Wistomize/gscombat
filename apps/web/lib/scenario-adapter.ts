import type {
  CharacterBuild,
  EnemyConfig,
  EvaluationScenario,
  ExternalBuff,
  ScenarioConditions
} from "@gscombat/contracts"

export interface AssembleScenarioInput {
  readonly baseScenario: EvaluationScenario
  readonly buffs: readonly ExternalBuff[]
  readonly conditions: ScenarioConditions
  readonly enemy: EnemyConfig
  readonly metricOwnerBuildId: string
  readonly partyBuilds: readonly CharacterBuild[]
  readonly targetActionId: string
}

/** Assembles the legacy analyzer scenario from an unordered party and the selected metric owner. */
export function assembleEvaluationScenario(input: AssembleScenarioInput): EvaluationScenario {
  const primary = input.partyBuilds.find((build) => build.buildId === input.metricOwnerBuildId)
  if (!primary) throw new Error("计算对象不在当前队伍中")
  if (input.partyBuilds.length < 1 || input.partyBuilds.length > 4) throw new Error("队伍需要包含 1–4 名角色")

  const characterIds = input.partyBuilds.map((build) => build.characterId)
  if (new Set(characterIds).size !== characterIds.length) throw new Error("同一角色不能重复加入队伍")

  return {
    ...input.baseScenario,
    conditions: input.conditions,
    enemy: input.enemy,
    externalBuffs: [...input.buffs],
    primary,
    targetActionId: input.targetActionId,
    teammates: input.partyBuilds.filter((build) => build.buildId !== primary.buildId)
  }
}
