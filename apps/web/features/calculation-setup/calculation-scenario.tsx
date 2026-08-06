import type { CatalogResponse, CharacterBuild, EvaluationScenario } from "@gscombat/contracts"

import { getCharacterLabel } from "../../lib/formatting/builds"
import { numberValue } from "../../lib/formatting/numbers"
import {
  getScenarioParameterRange,
  needsRecipientHpFraction,
  needsRecipientInSourceArea,
  needsSourceHpFraction,
  parseOptionalPercent,
  type CatalogPrimaryAction,
  type CatalogSupportMetric,
  type ScenarioEffectOption,
  type SupportMetricContextDraft
} from "./model"

type ScenarioConditions = EvaluationScenario["conditions"]
type ScenarioEnemy = EvaluationScenario["enemy"]
type ScenarioBuffs = EvaluationScenario["externalBuffs"]

interface CalculationScenarioProps {
  readonly buffs: ScenarioBuffs
  readonly catalog: CatalogResponse
  readonly characterEffectOptions: readonly ScenarioEffectOption[]
  readonly conditions: ScenarioConditions
  readonly enemy: ScenarioEnemy
  readonly hasCryoResonance: boolean
  readonly hasGeoResonance: boolean
  readonly optionalEffectGroups: readonly (readonly [string, readonly ScenarioEffectOption[]])[]
  readonly partyBuilds: readonly CharacterBuild[]
  readonly scenarioEffectOptionsError: string
  readonly scenarioEffectOptionsStatus: "error" | "idle" | "loading" | "ready"
  readonly selectedCharacterEffectIds: readonly string[]
  readonly selectedSupportMetric: CatalogSupportMetric | undefined
  readonly supportMetricContext: SupportMetricContextDraft
  readonly targetAction: CatalogPrimaryAction | undefined
  readonly targetBuild: CharacterBuild
  readonly onBuffPresetToggle: (presetId: string) => void
  readonly onCharacterEffectToggle: (effectId: string) => void
  readonly onConditionsChange: (update: (current: ScenarioConditions) => ScenarioConditions) => void
  readonly onEnemyChange: (update: (current: ScenarioEnemy) => ScenarioEnemy) => void
  readonly onOptionalEffectSelect: (effects: readonly ScenarioEffectOption[], effectId: string) => void
  readonly onReloadEffects: () => void
  readonly onRunAnalysis: () => Promise<void>
  readonly onSupportMetricContextChange: (
    update: (current: SupportMetricContextDraft) => SupportMetricContextDraft
  ) => void
}

/** Renders enemy, Buff, support-context, and optional-effect controls for the selected metric. */
export function CalculationScenario({
  buffs,
  catalog,
  characterEffectOptions,
  conditions,
  enemy,
  hasCryoResonance,
  hasGeoResonance,
  optionalEffectGroups,
  partyBuilds,
  scenarioEffectOptionsError,
  scenarioEffectOptionsStatus,
  selectedCharacterEffectIds,
  selectedSupportMetric,
  supportMetricContext,
  targetAction,
  targetBuild,
  onBuffPresetToggle,
  onCharacterEffectToggle,
  onConditionsChange,
  onEnemyChange,
  onOptionalEffectSelect,
  onReloadEffects,
  onRunAnalysis,
  onSupportMetricContextChange
}: CalculationScenarioProps) {
  return (
    <div className="calculationBlock">
      <div className="workspaceSectionHeading"><div><span>03</span><h2>敌人与 Buff</h2></div></div>
      {selectedSupportMetric ? (
        <div className="scenarioControls">
          {selectedSupportMetric.target === "friendly_recipient" ? (
            <label>
              <span>受益角色</span>
              <select
                aria-label="受益角色"
                value={supportMetricContext.recipient?.buildId ?? ""}
                onChange={(event) => onSupportMetricContextChange((current) => ({
                  ...current,
                  recipient: { ...current.recipient, buildId: event.target.value }
                }))}
              >
                <option value="">请选择</option>
                {partyBuilds.map((build) => (
                  <option key={build.buildId} value={build.buildId}>
                    {getCharacterLabel(catalog, build.characterId)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {needsRecipientHpFraction(selectedSupportMetric, targetBuild) ? (
            <label>
              <span>受益角色当前生命比例（%）</span>
              <input
                aria-label="受益角色当前生命比例"
                max={100}
                min={0}
                type="number"
                value={supportMetricContext.recipient?.currentHpFraction === undefined
                  ? ""
                  : supportMetricContext.recipient.currentHpFraction * 100}
                onChange={(event) => onSupportMetricContextChange((current) => ({
                  ...current,
                  recipient: { ...current.recipient, currentHpFraction: parseOptionalPercent(event.target.value) }
                }))}
              />
            </label>
          ) : null}
          {needsRecipientInSourceArea(selectedSupportMetric) ? (
            <label className="toggleRow">
              <span>受益角色位于来源技能区域内</span>
              <input
                aria-label="受益角色位于来源区域"
                checked={supportMetricContext.recipient?.isWithinSourceArea ?? false}
                type="checkbox"
                onChange={(event) => onSupportMetricContextChange((current) => ({
                  ...current,
                  recipient: { ...current.recipient, isWithinSourceArea: event.target.checked }
                }))}
              />
            </label>
          ) : null}
          {selectedSupportMetric.recipientTargetRouting === "active_recipient_if_moonsign_else_self" ? (
            <label className="toggleRow">
              <span>受益角色处于月兆状态</span>
              <input
                aria-label="受益角色处于月兆状态"
                checked={supportMetricContext.recipient?.isMoonsign ?? false}
                type="checkbox"
                onChange={(event) => onSupportMetricContextChange((current) => ({
                  ...current,
                  recipient: { ...current.recipient, isMoonsign: event.target.checked }
                }))}
              />
            </label>
          ) : null}
          {needsSourceHpFraction(selectedSupportMetric) ? (
            <label>
              <span>来源角色当前生命比例（%）</span>
              <input
                max={100}
                min={0}
                type="number"
                value={supportMetricContext.source?.currentHpFraction === undefined
                  ? ""
                  : supportMetricContext.source.currentHpFraction * 100}
                onChange={(event) => onSupportMetricContextChange((current) => ({
                  ...current,
                  source: { currentHpFraction: parseOptionalPercent(event.target.value) }
                }))}
              />
            </label>
          ) : null}
          {selectedSupportMetric.scenarioParameters?.map((parameter) => {
            const range = getScenarioParameterRange(parameter, targetBuild.constellation)
            return (
              <label key={parameter.id}>
                <span>{parameter.label}</span>
                <input
                  max={range.maximumValue}
                  min={range.minimumValue}
                  type="number"
                  value={supportMetricContext.actionParameters?.[parameter.id] ?? range.defaultValue}
                  onChange={(event) => onSupportMetricContextChange((current) => ({
                    ...current,
                    actionParameters: {
                      ...current.actionParameters,
                      [parameter.id]: numberValue(event.target.value, range.defaultValue)
                    }
                  }))}
                />
              </label>
            )
          })}
        </div>
      ) : (
        <>
          <div className="scenarioControls">
            <label>
              <span>敌人等级</span>
              <input
                max={200}
                min={1}
                type="number"
                value={enemy.level}
                onChange={(event) => onEnemyChange((current) => ({
                  ...current,
                  level: numberValue(event.target.value, 1)
                }))}
              />
            </label>
            <label>
              <span>目标元素抗性（%）</span>
              <input
                max={150}
                min={-100}
                type="number"
                value={enemy.resistance * 100}
                onChange={(event) => onEnemyChange((current) => ({
                  ...current,
                  resistance: numberValue(event.target.value) / 100
                }))}
              />
            </label>
            <label>
              <span>敌人数</span>
              <input
                max={20}
                min={1}
                type="number"
                value={conditions.enemyCount}
                onChange={(event) => onConditionsChange((current) => ({
                  ...current,
                  enemyCount: numberValue(event.target.value, 1)
                }))}
              />
            </label>
            {targetAction?.scenarioParameters?.map((parameter) => (
              <label key={parameter.id}>
                <span>{parameter.label}</span>
                <input
                  aria-label={`${parameter.label}数值`}
                  max={parameter.maximumValue}
                  min={parameter.minimumValue}
                  type="number"
                  value={conditions.actionParameters?.[parameter.id] ?? parameter.defaultValue}
                  onChange={(event) => onConditionsChange((current) => ({
                    ...current,
                    actionParameters: {
                      ...current.actionParameters,
                      [parameter.id]: numberValue(event.target.value, parameter.defaultValue)
                    }
                  }))}
                />
              </label>
            ))}
          </div>
          <div className="scenarioToggles">
            {hasGeoResonance ? (
              <label className="toggleRow">
                <span>角色处于护盾保护（双岩共鸣）</span>
                <input
                  checked={conditions.primaryShielded ?? false}
                  type="checkbox"
                  onChange={(event) => onConditionsChange((current) => ({
                    ...current,
                    primaryShielded: event.target.checked
                  }))}
                />
              </label>
            ) : null}
            {hasCryoResonance ? (
              <label className="toggleRow">
                <span>目标处于冻结状态（双冰共鸣）</span>
                <input
                  checked={conditions.targetFrozen ?? false}
                  type="checkbox"
                  onChange={(event) => onConditionsChange((current) => ({
                    ...current,
                    targetFrozen: event.target.checked
                  }))}
                />
              </label>
            ) : null}
            {characterEffectOptions.map((effect) => (
              <label className="toggleRow" key={effect.id}>
                <span>{effect.label}</span>
                <input
                  checked={selectedCharacterEffectIds.includes(effect.id)}
                  type="checkbox"
                  onChange={() => onCharacterEffectToggle(effect.id)}
                />
              </label>
            ))}
            {optionalEffectGroups.map(([group, effects]) => {
              const label = effects[0]?.label.split("：")[0] ?? "可选效果"
              return (
                <label className="optionalEffectSelect" key={group}>
                  <span>{label}</span>
                  <select
                    aria-label={label}
                    value={effects.find((effect) => selectedCharacterEffectIds.includes(effect.id))?.id ?? ""}
                    onChange={(event) => onOptionalEffectSelect(effects, event.target.value)}
                  >
                    <option value="">不触发</option>
                    {effects.map((effect) => (
                      <option key={effect.id} value={effect.id}>{effect.label.split("：").at(-1)}</option>
                    ))}
                  </select>
                </label>
              )
            })}
            {catalog.buffPresets.map((preset) => (
              <label className="toggleRow" key={preset.id}>
                <span>{preset.label}</span>
                <input
                  checked={buffs.some((buff) => buff.sourceId === preset.id)}
                  type="checkbox"
                  onChange={() => onBuffPresetToggle(preset.id)}
                />
              </label>
            ))}
          </div>
          {scenarioEffectOptionsStatus === "loading" ? (
            <p className="automaticEffectsNote">正在加载当前队伍可用的角色、武器与圣遗物效果…</p>
          ) : null}
          {scenarioEffectOptionsStatus === "error" ? (
            <div className="effectOptionsError">
              <span>{scenarioEffectOptionsError}</span>
              <button type="button" onClick={onReloadEffects}>重新加载</button>
            </div>
          ) : null}
          <p className="automaticEffectsNote">
            武器与圣遗物效果由系统按照当前角色、队伍和目标动作自动取可达到的最大值。
          </p>
        </>
      )}
      <button
        className="workspacePrimaryButton calculateButton"
        disabled={Boolean(targetAction) && scenarioEffectOptionsStatus !== "ready"}
        type="button"
        onClick={() => void onRunAnalysis()}
      >
        {scenarioEffectOptionsStatus === "loading" ? "正在加载可用效果…" : "开始计算"}
      </button>
    </div>
  )
}
