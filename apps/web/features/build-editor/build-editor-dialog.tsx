import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

import { getCharacterLabel } from "../../lib/formatting/builds"
import { BuildEditor } from "./build-editor"

interface BuildEditorDialogProps {
  readonly build: CharacterBuild
  readonly catalog: CatalogResponse
  readonly onCancel: () => void
  readonly onChange: (build: CharacterBuild) => void
  readonly onSave: () => void
}

/** Renders the full-screen character build editor around the reusable BuildEditor form. */
export function BuildEditorDialog({ build, catalog, onCancel, onChange, onSave }: BuildEditorDialogProps) {
  return (
    <div className="workspaceEditor">
      <div className="workspaceEditorHeading">
        <div><span>编辑角色配置</span><h2>{getCharacterLabel(catalog, build.characterId)}</h2></div>
        <div>
          <button type="button" onClick={onCancel}>取消</button>
          <button className="workspacePrimaryButton" type="button" onClick={onSave}>保存配置</button>
        </div>
      </div>
      <BuildEditor build={build} catalog={catalog} onChange={onChange} />
    </div>
  )
}
