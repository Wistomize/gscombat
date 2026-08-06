"use client"

import type { CharacterBuild } from "@gscombat/contracts"
import { useState } from "react"

import generatedVisualAssets from "../../lib/visual-assets.generated.json"

export type CharacterElement = "anemo" | "cryo" | "dendro" | "electro" | "geo" | "hydro" | "pyro" | "traveler"

type ArtifactSlot = CharacterBuild["artifacts"][number]["slot"]

interface CharacterVisual {
  readonly element: CharacterElement
  readonly icon: string
}

const characterVisuals = generatedVisualAssets.characters as Readonly<Record<string, CharacterVisual>>
const weaponVisuals = generatedVisualAssets.weapons as Readonly<Record<string, string>>
const artifactVisuals = generatedVisualAssets.artifacts as Readonly<
  Record<string, Partial<Record<ArtifactSlot, string>>>
>
const elementPaths = generatedVisualAssets.elementPaths as Readonly<Record<Exclude<CharacterElement, "traveler">, string>>

const travelerPath = "M12 1.4 14.7 8l7.1.5-5.4 4.6 1.7 7-6.1-3.8-6.1 3.8 1.7-7L2.2 8.5 9.3 8 12 1.4Z"

function AssetImage({
  alt,
  className,
  src
}: {
  readonly alt: string
  readonly className: string
  readonly src: string | undefined
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <span aria-label={`${alt}图标缺失`} className={`${className} gameIconFallback`}>{alt.at(0)}</span>
  return <img alt={alt} className={className} decoding="async" loading="lazy" src={src} onError={() => setFailed(true)} />
}

export function getCharacterElement(characterId: string): CharacterElement {
  return characterVisuals[characterId]?.element ?? "traveler"
}

export function CharacterAvatar({
  characterId,
  label,
  size = "medium"
}: {
  readonly characterId: string
  readonly label: string
  readonly size?: "large" | "medium" | "small"
}) {
  const visual = characterVisuals[characterId]
  const element = visual?.element ?? "traveler"
  return (
    <span className={`characterAvatar characterAvatar--${size} characterAvatar--${element}`}>
      <AssetImage alt={`${label}头像`} className="characterAvatarImage" src={visual?.icon} />
      <span aria-hidden="true" className="characterAvatarElement"><ElementIcon element={element} /></span>
    </span>
  )
}

export function ElementIcon({ element }: { readonly element: CharacterElement }) {
  return (
    <svg aria-hidden="true" className="elementIcon" viewBox="0 0 24 24">
      <path d={element === "traveler" ? travelerPath : elementPaths[element]} />
    </svg>
  )
}

export function WeaponIcon({ label, weaponId }: { readonly label: string; readonly weaponId: string }) {
  return (
    <span className="equipmentIcon equipmentIcon--weapon">
      <AssetImage alt={`${label}图标`} className="equipmentIconImage" src={weaponVisuals[weaponId]} />
    </span>
  )
}

export function ArtifactIcon({
  label,
  setId,
  slot
}: {
  readonly label: string
  readonly setId: string
  readonly slot: ArtifactSlot
}) {
  const icons = artifactVisuals[setId]
  const icon = icons?.[slot] ?? Object.values(icons ?? {}).find((candidate) => candidate !== undefined)
  return (
    <span className="equipmentIcon equipmentIcon--artifact">
      <AssetImage alt={`${label}${slot}图标`} className="equipmentIconImage" src={icon} />
    </span>
  )
}
