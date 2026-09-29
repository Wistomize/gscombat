import type { ActionEffectOptionsResponse, CatalogResponse, CharacterBuild, EvaluationScenario } from "@gscombat/contracts"

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

function splitEffectOptionLabel(label: string): readonly [string, string] {
  const separator = label.includes(" · ") ? " · " : label.includes("·") ? "·" : "："
  const separatorIndex = label.indexOf(separator)
  if (separatorIndex < 0) return [label, label]
  return [label.slice(0, separatorIndex), label.slice(separatorIndex + separator.length)]
}

interface CalculationScenarioProps {
  readonly weaponChoices?: ActionEffectOptionsResponse["weaponChoices"]
  readonly buffs: ScenarioBuffs
  readonly catalog: CatalogResponse
  readonly characterEffectOptions: readonly ScenarioEffectOption[]
  readonly conditions: ScenarioConditions
  readonly enemy: ScenarioEnemy
  readonly hasFrozenCondition: boolean
  readonly hasGeoResonance: boolean
  readonly hasUnselectedRequiredEffect: boolean
  readonly partyBuilds: readonly CharacterBuild[]
  readonly scenarioEffectOptionsError: string
  readonly scenarioEffectOptionsStatus: "error" | "idle" | "loading" | "ready"
  readonly selectedCharacterEffectIds: readonly string[]
  readonly selectedSupportMetric: CatalogSupportMetric | undefined
  readonly selectableEffectGroups: readonly (readonly [string, readonly ScenarioEffectOption[]])[]
  readonly supportMetricContext: SupportMetricContextDraft
  readonly targetAction: CatalogPrimaryAction | undefined
  readonly targetBuild: CharacterBuild
  readonly onBuffPresetToggle: (presetId: string) => void
  readonly onCharacterEffectToggle: (effectId: string) => void
  readonly onConditionsChange: (update: (current: ScenarioConditions) => ScenarioConditions) => void
  readonly onEnemyChange: (update: (current: ScenarioEnemy) => ScenarioEnemy) => void
  readonly onScenarioEffectSelect: (effects: readonly ScenarioEffectOption[], effectId: string) => void
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
  weaponChoices,
  enemy,
  hasFrozenCondition,
  hasGeoResonance,
  hasUnselectedRequiredEffect,
  partyBuilds,
  scenarioEffectOptionsError,
  scenarioEffectOptionsStatus,
  selectedCharacterEffectIds,
  selectedSupportMetric,
  selectableEffectGroups,
  supportMetricContext,
  targetAction,
  targetBuild,
  onBuffPresetToggle,
  onCharacterEffectToggle,
  onConditionsChange,
  onEnemyChange,
  onScenarioEffectSelect,
  onReloadEffects,
  onRunAnalysis,
  onSupportMetricContextChange
}: CalculationScenarioProps) {
  return (
    <div className="calculationBlock">
      <div className="workspaceSectionHeading"><div><span>03</span><h2>敌人与 Buff</h2></div></div>
      {selectedSupportMetric || targetAction?.fieldPresence === "off_field" ? (
        <div className="scenarioControls">
          <label>
            <span>本次计算的前台角色</span>
            <select
              aria-label="本次计算的前台角色"
              value={conditions.onFieldBuildId ?? ""}
              onChange={(event) => onConditionsChange((current) => {
                const { onFieldBuildId: _previous, ...rest } = current
                return event.target.value ? { ...rest, onFieldBuildId: event.target.value } : rest
              })}
            >
              <option value="">未指定（不启用需要确认前台身份的效果）</option>
              {partyBuilds.filter((build) => selectedSupportMetric || build.buildId !== targetBuild.buildId).map((build) => (
                <option key={build.buildId} value={build.buildId}>{getCharacterLabel(catalog, build.characterId)}</option>
              ))}
            </select>
          </label>
          <p>{selectedSupportMetric ? "辅助指标与伤害指标共享队伍前台身份；选择前台不会切换计算对象。" : "当前指标由后台角色造成伤害；选择前台角色不会切换计算对象。"}</p>
        </div>
      ) : null}
      {(weaponChoices ?? []).length > 0 ? <div className="scenarioToggles">
        {(weaponChoices ?? []).flatMap((entry) => entry.choiceGroups.map((group) => {
          const source = partyBuilds.find((build) => build.buildId === entry.sourceBuildId)
          const weaponLabel = catalog.weapons.find((weapon) => weapon.weaponId === entry.weaponId)?.label ?? entry.weaponId
          return <label className="optionalEffectSelect" key={`${entry.sourceBuildId}:${group.id}`}>
            <span>{source ? getCharacterLabel(catalog, source.characterId) : ""} · {weaponLabel} · {group.label}</span>
            <select aria-label={`${weaponLabel} · ${group.label}`}
              value={conditions.weaponEffectChoices?.[entry.sourceBuildId]?.[group.id] ?? entry.choices[group.id] ?? group.defaultVariant}
              onChange={(event) => onConditionsChange((current) => ({ ...current, weaponEffectChoices: {
                ...current.weaponEffectChoices, [entry.sourceBuildId]: {
                  ...current.weaponEffectChoices?.[entry.sourceBuildId], [group.id]: event.target.value
                }
              } }))}>
              {group.options.map((option) => {
                const recipient = partyBuilds.find((build) => build.buildId === option.id)
                return <option key={option.id} value={option.id}>{recipient ? getCharacterLabel(catalog, recipient.characterId) : option.label}</option>
              })}
            </select>
          </label>
        }))}
      </div> : null}
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
          {hasFrozenCondition ? (
            <label className="toggleRow">
              <span>目标处于冻结状态（共鸣与装备共享）</span>
              <input type="checkbox" checked={conditions.targetFrozen ?? false}
                onChange={event => onConditionsChange(current => ({ ...current, targetFrozen: event.target.checked }))} />
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
                {parameter.allowedValues ? <select
                  aria-label={`${parameter.label}数值`}
                  value={conditions.actionParameters?.[parameter.id] ?? parameter.defaultValue}
                  onChange={(event) => onConditionsChange((current) => ({
                    ...current,
                    actionParameters: { ...current.actionParameters, [parameter.id]: Number(event.target.value) }
                  }))}
                >
                  {parameter.allowedValues.map((value) => <option key={value} value={value}>{value}</option>)}
                </select> : <input
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
                />}
              </label>
            ))}
          </div>
          <div className="scenarioToggles">
            {targetAction?.supportsArrowWeakPoint ? <label className="toggleRow"><span>本次箭命中要害（所有武器共用）</span>
              <input type="checkbox" checked={conditions.arrowHitsWeakPoint ?? false}
                onChange={(event) => onConditionsChange((current) => ({ ...current, arrowHitsWeakPoint: event.target.checked }))} />
            </label> : null}
            {catalog.characters.find((character) => character.characterId === targetBuild.characterId)?.weaponType === "polearm"
              ? <label className="toggleRow"><span>目标为史莱姆（所有武器共用）</span>
                <input type="checkbox" checked={conditions.targetIsSlime ?? false}
                  onChange={(event) => onConditionsChange((current) => ({ ...current, targetIsSlime: event.target.checked }))} />
              </label> : null}
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
            {hasFrozenCondition ? (
              <label className="toggleRow">
                <span>目标处于冻结状态（共鸣与装备共享）</span>
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
            {selectableEffectGroups.map(([group, effects]) => {
              const variants = [...effects.reduce((byVariant, effect) => {
                const variant = effect.exclusiveVariant ?? effect.id
                if (!byVariant.has(variant)) byVariant.set(variant, effect)
                return byVariant
              }, new Map<string, ScenarioEffectOption>()).values()]
              const label = effects[0] ? splitEffectOptionLabel(effects[0].label)[0] : "可选效果"
              const required = effects[0]?.selectionMode === "required"
              const preparationDescription = effects.find((effect) => effect.preparationDescription)?.preparationDescription
              const selectedVariant = variants.find((variant) => effects.some((effect) =>
                (effect.exclusiveVariant ?? effect.id) === (variant.exclusiveVariant ?? variant.id) &&
                selectedCharacterEffectIds.includes(effect.id)
              ))
              return (
                <label className="optionalEffectSelect" key={group}>
                  <span>{label}</span>
                  <select
                    aria-label={label}
                    value={selectedVariant?.id ?? ""}
                    onChange={(event) => onScenarioEffectSelect(effects, event.target.value)}
                  >
                    <option disabled={required} value="">{required ? "请选择" : "未选择 / 不触发"}</option>
                    {variants.map((effect) => (
                      <option key={effect.id} value={effect.id}>{splitEffectOptionLabel(effect.label)[1]}</option>
                    ))}
                  </select>
                  {preparationDescription ? <small>{preparationDescription}</small> : null}
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
          <p className="automaticEffectsNote">
            圣遗物效果按装备者、队伍能力与本次指标的前后台设定自动计算，无需选择触发或层数。
            仅保留需要明确指定的场景条件；生效与未生效原因可在计算结果中查看。
          </p>
        </>
      )}
      {scenarioEffectOptionsStatus === "loading" ? (
        <p className="automaticEffectsNote">正在加载当前队伍可用的角色、武器与圣遗物效果…</p>
      ) : null}
      {scenarioEffectOptionsStatus === "error" ? (
        <div className="effectOptionsError">
          <span>{scenarioEffectOptionsError}</span>
          <button type="button" onClick={onReloadEffects}>重新加载</button>
        </div>
      ) : null}
      <button
        className="workspacePrimaryButton calculateButton"
        disabled={Boolean(targetAction || selectedSupportMetric) &&
          (scenarioEffectOptionsStatus !== "ready" || (!selectedSupportMetric && hasUnselectedRequiredEffect))}
        type="button"
        onClick={() => void onRunAnalysis()}
      >
        {scenarioEffectOptionsStatus === "loading"
          ? "正在加载可用效果…"
          : !selectedSupportMetric && hasUnselectedRequiredEffect
            ? "请先完成必选 Buff"
            : "开始计算"}
      </button>
    </div>
  )
}
