import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

type CatalogCharacter = CatalogResponse["characters"][number]

const localBuildIdPrefix = "local.draft."
const localBuildIdMaximumLength = 100
const localDraftLabelSuffix = " · 新建配置"
const localDraftLabelMaximumLength = 80
const weaponTypeLabels: Readonly<Record<CatalogCharacter["weaponType"], string>> = {
  bow: "弓",
  catalyst: "法器",
  claymore: "双手剑",
  polearm: "长柄武器",
  sword: "单手剑"
}

function cloneArtifacts(artifacts: CharacterBuild["artifacts"]): CharacterBuild["artifacts"] {
  return artifacts.map((artifact) => ({
    ...artifact,
    mainStat: { ...artifact.mainStat },
    substats: artifact.substats.map((substat) => ({ ...substat }))
  }))
}

function createLocalBuildId(characterId: string): string {
  const timestamp = Date.now().toString()
  const maximumCharacterIdLength = localBuildIdMaximumLength - localBuildIdPrefix.length - timestamp.length - 1
  return `${localBuildIdPrefix}${characterId.slice(0, maximumCharacterIdLength)}.${timestamp}`
}

function createLocalDraftLabel(character: CatalogCharacter): string {
  const label = character.label.trim() || "未命名角色"
  return `${label.slice(0, localDraftLabelMaximumLength - localDraftLabelSuffix.length)}${localDraftLabelSuffix}`
}

/**
 * Creates an editable local build for a catalog character from a complete template build.
 *
 * The template retains its level, talents, and artifact shape so the draft remains valid while
 * the user edits it. The first compatible catalog weapon is selected deterministically.
 */
export function createLocalDraftBuild(
  template: CharacterBuild,
  catalog: CatalogResponse,
  character: CatalogCharacter
): CharacterBuild {
  const weapon = catalog.weapons.find((candidate) => candidate.weaponType === character.weaponType)
  if (!weapon) {
    const characterLabel = character.label || "未命名角色"
    const missingWeaponMessage = [
      `无法为 ${characterLabel} 新建配置`,
      `目录中没有已维护的${weaponTypeLabels[character.weaponType]}`
    ].join("：")
    throw new Error(missingWeaponMessage)
  }

  const { variant: _templateVariant, ...templateWithoutVariant } = template
  return {
    ...templateWithoutVariant,
    artifacts: cloneArtifacts(template.artifacts),
    buildId: createLocalBuildId(character.characterId),
    characterId: character.characterId,
    label: createLocalDraftLabel(character),
    source: { kind: "local" },
    talents: { ...template.talents },
    weapon: { ...template.weapon, weaponId: weapon.weaponId },
    ...(character.characterId === "Traveler"
      ? { variant: { element: "dendro", gender: "female", kind: "traveler" } as const }
      : {})
  }
}
