import type { CatalogResponse } from "@gscombat/contracts"
import type { RefObject } from "react"

import { CharacterAvatar, ElementIcon, getCharacterElement, type CharacterElement } from "../../components/ui/visual-icons"
import { getCharacterLabel } from "../../lib/formatting/builds"

export type ImportPanel = "json" | "manual" | "showcase" | null

const selectableElements: readonly { readonly id: CharacterElement; readonly label: string }[] = [
  { id: "pyro", label: "火元素" },
  { id: "hydro", label: "水元素" },
  { id: "anemo", label: "风元素" },
  { id: "electro", label: "雷元素" },
  { id: "dendro", label: "草元素" },
  { id: "cryo", label: "冰元素" },
  { id: "geo", label: "岩元素" },
  { id: "traveler", label: "旅行者" }
]

interface BuildImportSectionProps {
  readonly buildCount: number
  readonly catalog: CatalogResponse
  readonly fileInputRef: RefObject<HTMLInputElement>
  readonly importPanel: ImportPanel
  readonly jsonSource: string
  readonly manualCharacterId: string
  readonly manualElement: CharacterElement | null
  readonly ready: boolean
  readonly showcaseUid: string
  readonly onCreateManualBuild: () => void
  readonly onDownload: () => void
  readonly onImportJson: () => void
  readonly onImportJsonFile: (file: File | undefined) => Promise<void>
  readonly onImportPanelChange: (panel: ImportPanel) => void
  readonly onImportShowcase: () => Promise<void>
  readonly onJsonSourceChange: (value: string) => void
  readonly onManualCharacterChange: (characterId: string) => void
  readonly onManualElementChange: (element: CharacterElement | null) => void
  readonly onShowcaseUidChange: (uid: string) => void
}

/** Renders every configuration import entry without owning workspace data. */
export function BuildImportSection({
  buildCount,
  catalog,
  fileInputRef,
  importPanel,
  jsonSource,
  manualCharacterId,
  manualElement,
  ready,
  showcaseUid,
  onCreateManualBuild,
  onDownload,
  onImportJson,
  onImportJsonFile,
  onImportPanelChange,
  onImportShowcase,
  onJsonSourceChange,
  onManualCharacterChange,
  onManualElementChange,
  onShowcaseUidChange
}: BuildImportSectionProps) {
  const manualCharacters = manualElement
    ? catalog.characters.filter((character) => getCharacterElement(character.characterId) === manualElement)
    : []

  return (
    <section className="workspaceSection">
      <div className="workspaceSectionHeading">
        <div><span>01</span><h2>配置操作</h2></div>
      </div>
      <div className="workspaceActions">
        <button type="button" onClick={() => onImportPanelChange("showcase")}>导入展示柜配置</button>
        <button type="button" onClick={() => onImportPanelChange("json")}>导入 JSON 配置</button>
        <button
          type="button"
          onClick={() => {
            onImportPanelChange("manual")
            onManualElementChange(null)
            onManualCharacterChange("")
          }}
        >
          手动初始化角色配置
        </button>
        <button disabled={!ready || buildCount === 0} type="button" onClick={onDownload}>导出配置</button>
      </div>

      {importPanel === "showcase" ? (
        <div className="workspaceInlinePanel">
          <label>
            <span>原神 UID</span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={showcaseUid}
              onChange={(event) => onShowcaseUidChange(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          <button disabled={!/^\d{9,10}$/.test(showcaseUid)} type="button" onClick={() => void onImportShowcase()}>
            确认导入
          </button>
          <button type="button" onClick={() => onImportPanelChange(null)}>取消</button>
        </div>
      ) : null}
      {importPanel === "json" ? (
        <div className="workspaceInlinePanel workspaceJsonPanel">
          <textarea
            aria-label="JSON 配置"
            placeholder="粘贴角色配置、旧场景或工作空间 JSON"
            rows={6}
            value={jsonSource}
            onChange={(event) => onJsonSourceChange(event.target.value)}
          />
          <input
            ref={fileInputRef}
            accept="application/json,.json"
            aria-label="选择 JSON 文件"
            type="file"
            onChange={(event) => void onImportJsonFile(event.target.files?.[0])}
          />
          <button disabled={!jsonSource.trim()} type="button" onClick={onImportJson}>导入粘贴内容</button>
          <button type="button" onClick={() => onImportPanelChange(null)}>取消</button>
        </div>
      ) : null}
      {importPanel === "manual" ? (
        <div className="workspaceManualPanel">
          <div className="manualPickerHeading">
            <strong>先选择元素，再选择角色</strong>
            <button type="button" onClick={() => onImportPanelChange(null)}>取消</button>
          </div>
          <div aria-label="选择元素" className="elementPicker">
            {selectableElements.map((element) => (
              <button
                aria-pressed={manualElement === element.id}
                className={`elementChoice elementChoice--${element.id}${manualElement === element.id ? " active" : ""}`}
                key={element.id}
                type="button"
                onClick={() => {
                  onManualElementChange(element.id)
                  onManualCharacterChange("")
                }}
              >
                <ElementIcon element={element.id} />
                <span>{element.label}</span>
              </button>
            ))}
          </div>
          {manualElement ? (
            <div aria-label="选择角色" className="manualCharacterGrid">
              {manualCharacters.map((character) => (
                <button
                  aria-pressed={manualCharacterId === character.characterId}
                  className={manualCharacterId === character.characterId ? "active" : ""}
                  key={character.characterId}
                  type="button"
                  onClick={() => onManualCharacterChange(character.characterId)}
                >
                  <CharacterAvatar characterId={character.characterId} label={character.label} />
                  <span>{character.label}</span>
                </button>
              ))}
            </div>
          ) : <p className="manualPickerHint">请选择一个元素。</p>}
          <div className="manualPickerActions">
            <span>{manualCharacterId ? `已选择 ${getCharacterLabel(catalog, manualCharacterId)}` : "尚未选择角色"}</span>
            <button
              className="workspacePrimaryButton"
              disabled={!manualCharacterId}
              type="button"
              onClick={onCreateManualBuild}
            >
              初始化配置
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
