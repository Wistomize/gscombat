import { getWeaponComparisonRefinement, type ArtifactPiece, type ArtifactStat, type CatalogResponse, type CharacterBuild } from "@gscombat/contracts"

import {
  artifactSlotLabels as slotLabels,
  artifactStatLabels as statLabels,
  artifactStats,
  artifactSubstatOptions as substatOptions
} from "../../lib/formatting/artifacts"
import { numberValue } from "../../lib/formatting/numbers"
import { fromDisplayStatValue, toDisplayStatValue } from "../../lib/formatting/stats"

interface BuildEditorProps {
  readonly build: CharacterBuild
  readonly catalog: CatalogResponse
  readonly onChange: (build: CharacterBuild) => void
}

function ArtifactEditor({
  artifact,
  catalog,
  onChange
}: {
  readonly artifact: ArtifactPiece
  readonly catalog: CatalogResponse
  readonly onChange: (artifact: ArtifactPiece) => void
}) {
  const updateSubstat = (index: number, update: Partial<ArtifactPiece["substats"][number]>) => {
    onChange({
      ...artifact,
      substats: artifact.substats.map((substat, substatIndex) =>
        substatIndex === index ? { ...substat, ...update } : substat
      )
    })
  }

  return (
    <article className="artifactEditor">
      <div className="artifactTitle">
        <div>
          <span>{slotLabels[artifact.slot]}</span>
          <strong>{artifact.setId}</strong>
        </div>
        <span className="levelTag">+{artifact.level}</span>
      </div>
      <div className="artifactMainGrid">
        <label>
          <span>套装</span>
          <select value={artifact.setId} onChange={(event) => onChange({ ...artifact, setId: event.target.value })}>
            {catalog.artifactSets.map((set) => (
              <option key={set.setId} value={set.setId}>
                {set.label}
              </option>
            ))}
            {!catalog.artifactSets.some((set) => set.setId === artifact.setId) && (
              <option value={artifact.setId}>{artifact.setId}</option>
            )}
          </select>
        </label>
        <label>
          <span>等级</span>
          <input
            max={20}
            min={0}
            type="number"
            value={artifact.level}
            onChange={(event) => onChange({ ...artifact, level: numberValue(event.target.value) })}
          />
        </label>
        <label>
          <span>主属性</span>
          <select
            value={artifact.mainStat.stat}
            onChange={(event) =>
              onChange({
                ...artifact,
                mainStat: { stat: event.target.value as ArtifactStat, value: 0 }
              })
            }
          >
            {artifactStats.map((stat) => (
              <option key={stat} value={stat}>
                {statLabels[stat]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>数值</span>
          <input
            min={0}
            step="0.1"
            type="number"
            value={toDisplayStatValue(artifact.mainStat.stat, artifact.mainStat.value)}
            onChange={(event) =>
              onChange({
                ...artifact,
                mainStat: {
                  ...artifact.mainStat,
                  value: fromDisplayStatValue(artifact.mainStat.stat, numberValue(event.target.value))
                }
              })
            }
          />
        </label>
      </div>
      <div className="substatList">
        {artifact.substats.map((substat, index) => (
          <div className="substatRow" key={`${artifact.id}-${index}`}>
            <select
              aria-label={`${slotLabels[artifact.slot]}副属性 ${index + 1}`}
              value={substat.stat}
              onChange={(event) => updateSubstat(index, { stat: event.target.value as ArtifactStat, value: 0 })}
            >
              {substatOptions.map((stat) => (
                <option key={stat} value={stat}>
                  {statLabels[stat]}
                </option>
              ))}
            </select>
            <input
              aria-label={`${statLabels[substat.stat]}数值`}
              min={0}
              step="0.1"
              type="number"
              value={toDisplayStatValue(substat.stat, substat.value)}
              onChange={(event) =>
                updateSubstat(index, {
                  value: fromDisplayStatValue(substat.stat, numberValue(event.target.value))
                })
              }
            />
            <button
              aria-label="删除副属性"
              className="iconButton"
              type="button"
              onClick={() =>
                onChange({ ...artifact, substats: artifact.substats.filter((_, substatIndex) => substatIndex !== index) })
              }
            >
              ×
            </button>
          </div>
        ))}
        {artifact.substats.length < 4 && (
          <button
            className="textButton"
            type="button"
            onClick={() =>
              onChange({ ...artifact, substats: [...artifact.substats, { stat: "crit_rate", value: 0.033 }] })
            }
          >
            ＋ 添加副属性
          </button>
        )}
      </div>
    </article>
  )
}

export function BuildEditor({ build, catalog, onChange }: BuildEditorProps) {
  const character = catalog.characters.find((candidate) => candidate.characterId === build.characterId)
  const weapons = catalog.weapons.filter((weapon) => weapon.weaponType === character?.weaponType)
  const artifactSectionLabel = build.artifacts.length === 0 ? "未装备圣遗物" : `${build.artifacts.length} 件圣遗物`
  const updateWeapon = (weaponId: string) => {
    const weapon = weapons.find((candidate) => candidate.weaponId === weaponId)
    onChange({
      ...build,
      weapon: {
        ...build.weapon,
        refinement: weapon ? getWeaponComparisonRefinement(weapon.rarity) : build.weapon.refinement,
        weaponId
      }
    })
  }
  const updateArtifact = (index: number, artifact: ArtifactPiece) => {
    onChange({ ...build, artifacts: build.artifacts.map((current, artifactIndex) => (artifactIndex === index ? artifact : current)) })
  }

  return (
    <div className="buildEditor">
      <div className="identityGrid">
        <label className="wideField">
          <span>配置名称</span>
          <input value={build.label} onChange={(event) => onChange({ ...build, label: event.target.value })} />
        </label>
        <label>
          <span>角色等级</span>
          <input
            max={100}
            min={1}
            type="number"
            value={build.level}
            onChange={(event) => onChange({ ...build, level: numberValue(event.target.value, 1) })}
          />
        </label>
        <label>
          <span>命座</span>
          <input
            max={6}
            min={0}
            type="number"
            value={build.constellation}
            onChange={(event) => onChange({ ...build, constellation: numberValue(event.target.value) })}
          />
        </label>
      </div>

      <div className="editorSection">
        <div className="editorSectionTitle">
          <span>WEAPON</span>
          <strong>武器配置</strong>
        </div>
        <div className="weaponGrid">
          <label className="wideField">
            <span>武器</span>
            <select
              value={build.weapon.weaponId}
              onChange={(event) => updateWeapon(event.target.value)}
            >
              {weapons.map((weapon) => (
                <option key={weapon.weaponId} value={weapon.weaponId}>
                  {weapon.label} · {weapon.rarity}★
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>等级</span>
            <input
              max={90}
              min={1}
              type="number"
              value={build.weapon.level}
              onChange={(event) =>
                onChange({ ...build, weapon: { ...build.weapon, level: numberValue(event.target.value, 1) } })
              }
            />
          </label>
          <label>
            <span>精炼</span>
            <input
              max={5}
              min={1}
              type="number"
              value={build.weapon.refinement}
              onChange={(event) =>
                onChange({ ...build, weapon: { ...build.weapon, refinement: numberValue(event.target.value, 1) } })
              }
            />
          </label>
        </div>
      </div>

      <div className="editorSection">
        <div className="editorSectionTitle">
          <span>TALENTS</span>
          <strong>天赋等级</strong>
        </div>
        <div className="talentGrid">
          {(["normal", "skill", "burst"] as const).map((talent) => (
            <label key={talent}>
              <span>{talent === "normal" ? "普通攻击" : talent === "skill" ? "元素战技" : "元素爆发"}</span>
              <input
                max={15}
                min={1}
                type="number"
                value={build.talents[talent]}
                onChange={(event) =>
                  onChange({
                    ...build,
                    talents: { ...build.talents, [talent]: numberValue(event.target.value, 1) }
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="editorSection artifactsSection">
        <div className="editorSectionTitle">
          <span>ARTIFACTS</span>
          <strong>{artifactSectionLabel} · 原始值输入</strong>
        </div>
        <p className="fieldHint">百分比直接输入面板数值，例如暴击率 31.1% 输入 31.1；展示柜导入会自动换算。</p>
        {build.artifacts.length === 0 ? (
          <p className="fieldHint">当前配置没有已装备的圣遗物，不会获得圣遗物属性或套装效果。</p>
        ) : (
          <div className="artifactGrid">
            {build.artifacts.map((artifact, index) => (
              <ArtifactEditor
                artifact={artifact}
                catalog={catalog}
                key={artifact.slot}
                onChange={(updated) => updateArtifact(index, updated)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
