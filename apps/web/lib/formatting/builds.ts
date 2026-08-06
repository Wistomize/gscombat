import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

/** Returns the official localized character label exposed by the catalog. */
export function getCharacterLabel(catalog: CatalogResponse, characterId: string): string {
  return catalog.characters.find((character) => character.characterId === characterId)?.label ?? "未知角色"
}

/** Returns the detailed source label used by configuration-management surfaces. */
export function getConfigurationSourceLabel(build: CharacterBuild): string {
  if (build.source.kind === "builtin") return "内设默认配置"
  if (build.source.kind === "showcase") return `展示柜 · UID ${build.source.uid}`
  if (build.source.kind === "json") return "JSON 导入"
  return "手动配置"
}

/** Returns the compact source label used by the calculation target selector. */
export function getCalculationSourceLabel(build: CharacterBuild): string {
  if (build.source.kind === "builtin") return "内设默认配置"
  if (build.source.kind === "showcase") return `展示柜 ${build.source.uid}`
  if (build.source.kind === "json") return "JSON 导入"
  return "手动配置"
}
