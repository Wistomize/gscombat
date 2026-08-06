import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

import { CharacterAvatar } from "../../components/ui/visual-icons"
import { getCharacterLabel, getConfigurationSourceLabel } from "../../lib/formatting/builds"

export interface PartyPickerState {
  readonly characterId: string | null
  readonly slot: number | null
}

interface PartyEditorProps {
  readonly builds: readonly CharacterBuild[]
  readonly catalog: CatalogResponse
  readonly groupedBuilds: readonly (readonly [string, readonly CharacterBuild[]])[]
  readonly partyBuildIds: readonly string[]
  readonly partyBuilds: readonly CharacterBuild[]
  readonly partyPicker: PartyPickerState | null
  readonly replacementBuild: CharacterBuild | null
  readonly onAssignBuild: (build: CharacterBuild, slot?: number | null) => void
  readonly onChoosePartyCharacter: (characterId: string) => void
  readonly onCloseReplacement: () => void
  readonly onConfirmParty: () => Promise<void>
  readonly onRemoveBuild: (buildId: string) => void
  readonly onReplaceBuild: (build: CharacterBuild, slot: number) => void
  readonly onSetPartyPicker: (picker: PartyPickerState | null) => void
}

/** Renders the unordered four-member party and its build-selection dialogs. */
export function PartyEditor({
  builds,
  catalog,
  groupedBuilds,
  partyBuildIds,
  partyBuilds,
  partyPicker,
  replacementBuild,
  onAssignBuild,
  onChoosePartyCharacter,
  onCloseReplacement,
  onConfirmParty,
  onRemoveBuild,
  onReplaceBuild,
  onSetPartyPicker
}: PartyEditorProps) {
  const pickerBuilds = partyPicker?.characterId
    ? builds.filter((build) => build.characterId === partyPicker.characterId)
    : []
  const pickerSlotCharacterId = partyPicker?.slot !== null && partyPicker?.slot !== undefined
    ? partyBuilds[partyPicker.slot]?.characterId
    : null
  const pickerCharacterGroups = groupedBuilds.filter(([characterId]) =>
    !partyBuilds.some((build) => build.characterId === characterId) || characterId === pickerSlotCharacterId
  )

  return (
    <>
      <section className="workspaceSection partySection">
        <div className="workspaceSectionHeading">
          <div><span>03</span><h2>队伍配置</h2></div>
          <small>{partyBuilds.length}/4</small>
        </div>
        <div className="partySlots">
          {[0, 1, 2, 3].map((slot) => {
            const build = partyBuilds[slot]
            return build ? (
              <div className="partySlot partySlot--filled" key={build.buildId}>
                <button
                  aria-label={`更换${getCharacterLabel(catalog, build.characterId)}配置`}
                  className="partyMemberButton"
                  type="button"
                  onClick={() => onSetPartyPicker({ characterId: build.characterId, slot })}
                >
                  <CharacterAvatar
                    characterId={build.characterId}
                    label={getCharacterLabel(catalog, build.characterId)}
                    size="large"
                  />
                  <strong>{getCharacterLabel(catalog, build.characterId)}</strong>
                  <small>{getConfigurationSourceLabel(build)}</small>
                </button>
                <button className="partyRemoveButton" type="button" onClick={() => onRemoveBuild(build.buildId)}>
                  移出
                </button>
              </div>
            ) : (
              <button
                className="partySlot partySlot--empty"
                key={slot}
                type="button"
                onClick={() => onSetPartyPicker({ characterId: null, slot })}
              >
                <b>＋</b><span>添加队伍成员</span>
              </button>
            )
          })}
        </div>
        <div className="partyConfirmBar">
          <p>坑位只用于展示，不代表队长、前台或出场顺序。</p>
          <button
            className="workspacePrimaryButton"
            disabled={partyBuilds.length === 0}
            type="button"
            onClick={() => void onConfirmParty()}
          >
            确认队伍并选择指标 →
          </button>
        </div>
      </section>

      {partyPicker ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading">
              <div>
                {partyPicker.characterId ? (
                  <button
                    className="dialogBackButton"
                    type="button"
                    onClick={() => onSetPartyPicker({ ...partyPicker, characterId: null })}
                  >
                    ← 角色
                  </button>
                ) : null}
                <h2>
                  {partyPicker.characterId
                    ? `选择${getCharacterLabel(catalog, partyPicker.characterId)}的配置`
                    : "选择队伍角色"}
                </h2>
              </div>
              <button type="button" onClick={() => onSetPartyPicker(null)}>×</button>
            </div>
            {partyPicker.characterId ? (
              <div className="configurationChoiceList">
                {pickerBuilds.map((build) => (
                  <button
                    className={partyBuildIds.includes(build.buildId) ? "active" : ""}
                    key={build.buildId}
                    type="button"
                    onClick={() => onAssignBuild(build, partyPicker.slot)}
                  >
                    <CharacterAvatar
                      characterId={build.characterId}
                      label={getCharacterLabel(catalog, build.characterId)}
                      size="small"
                    />
                    <span><strong>{getConfigurationSourceLabel(build)}</strong><small>{build.label}</small></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="characterPickerGrid">
                {pickerCharacterGroups.map(([characterId, characterBuilds]) => (
                  <button key={characterId} type="button" onClick={() => onChoosePartyCharacter(characterId)}>
                    <CharacterAvatar characterId={characterId} label={getCharacterLabel(catalog, characterId)} />
                    <strong>{getCharacterLabel(catalog, characterId)}</strong>
                    <small>{characterBuilds.length} 套</small>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {replacementBuild ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading">
              <h2>选择要替换的成员</h2>
              <button type="button" onClick={onCloseReplacement}>×</button>
            </div>
            <div className="workspacePickerList">
              {partyBuilds.map((build, index) => (
                <button key={build.buildId} type="button" onClick={() => onReplaceBuild(replacementBuild, index)}>
                  <CharacterAvatar
                    characterId={build.characterId}
                    label={getCharacterLabel(catalog, build.characterId)}
                    size="small"
                  />
                  <strong>{getCharacterLabel(catalog, build.characterId)}</strong>
                  <span>{getConfigurationSourceLabel(build)}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
