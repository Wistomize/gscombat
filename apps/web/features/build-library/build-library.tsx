import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

import { CharacterAvatar } from "../../components/ui/visual-icons"
import { getCharacterLabel, getConfigurationSourceLabel } from "../../lib/formatting/builds"

interface BuildLibraryProps {
  readonly catalog: CatalogResponse
  readonly groupedBuilds: readonly (readonly [string, readonly CharacterBuild[]])[]
  readonly managedBuilds: readonly CharacterBuild[]
  readonly managedCharacterId: string | null
  readonly partyBuilds: readonly CharacterBuild[]
  readonly ready: boolean
  readonly onAddConfiguredCharacter: (characterId: string, builds: readonly CharacterBuild[]) => void
  readonly onCloseManager: () => void
  readonly onDeleteBuild: (build: CharacterBuild) => void
  readonly onEditBuild: (build: CharacterBuild) => void
  readonly onManageCharacter: (characterId: string) => void
}

/** Renders configured character groups and the per-character build manager. */
export function BuildLibrary({
  catalog,
  groupedBuilds,
  managedBuilds,
  managedCharacterId,
  partyBuilds,
  ready,
  onAddConfiguredCharacter,
  onCloseManager,
  onDeleteBuild,
  onEditBuild,
  onManageCharacter
}: BuildLibraryProps) {
  return (
    <>
      <section className="workspaceSection">
        <div className="workspaceSectionHeading">
          <div><span>02</span><h2>已配置角色</h2></div>
          <small>{groupedBuilds.reduce((total, [, builds]) => total + builds.length, 0)} 份配置</small>
        </div>
        {!ready ? <p className="workspaceEmpty">正在读取配置…</p> : null}
        {ready && groupedBuilds.length === 0 ? (
          <p className="workspaceEmpty">还没有角色配置，请先从上方导入或初始化。</p>
        ) : null}
        <div className="buildGroups">
          {groupedBuilds.map(([characterId, characterBuilds]) => {
            const label = getCharacterLabel(catalog, characterId)
            const inParty = partyBuilds.some((build) => build.characterId === characterId)
            return (
              <article className="buildGroup" key={characterId}>
                <div className="configuredCharacterVisual">
                  <CharacterAvatar characterId={characterId} label={label} size="large" />
                  <span>{characterBuilds.length}</span>
                </div>
                <div className="configuredCharacterMeta"><h3>{label}</h3><small>{characterBuilds.length} 套配置</small></div>
                <div className="buildCardActions">
                  <button type="button" onClick={() => onManageCharacter(characterId)}>查看配置</button>
                  <button
                    className={inParty ? "active" : ""}
                    type="button"
                    onClick={() => onAddConfiguredCharacter(characterId, characterBuilds)}
                  >
                    {inParty ? "移出队伍" : "加入队伍"}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {managedCharacterId ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading">
              <div>
                <CharacterAvatar
                  characterId={managedCharacterId}
                  label={getCharacterLabel(catalog, managedCharacterId)}
                  size="small"
                />
                <h2>{getCharacterLabel(catalog, managedCharacterId)}的配置</h2>
              </div>
              <button type="button" onClick={onCloseManager}>×</button>
            </div>
            <div className="configurationChoiceList">
              {managedBuilds.map((build) => (
                <div className="configurationManagedBuild" key={build.buildId}>
                  <button className="configurationEditButton" type="button" onClick={() => onEditBuild(build)}>
                    <CharacterAvatar
                      characterId={build.characterId}
                      label={getCharacterLabel(catalog, build.characterId)}
                      size="small"
                    />
                    <span><strong>{getConfigurationSourceLabel(build)}</strong><small>{build.label}</small></span>
                    <b>编辑</b>
                  </button>
                  <button
                    aria-label={`删除配置：${build.label}`}
                    className="configurationDeleteButton"
                    type="button"
                    onClick={() => onDeleteBuild(build)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
