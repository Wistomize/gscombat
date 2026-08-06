import type {
  CombatActionMetadata,
  CombatTalentParameterGroupId,
  CombatTalentParameterSlot
} from "@gscombat/content"

import { getTravelerTalentParameterOwnerIds } from "../core/build-variant.js"

const talentGroupsBySlot: Readonly<Record<CombatTalentParameterSlot, readonly CombatTalentParameterGroupId[]>> = {
  burst: ["burst"],
  normal: ["auto"],
  passive: ["passive", "passive1", "passive2", "passive3", "lockedPassive", "sprint"],
  skill: ["skill"]
}

export function isTalentParameterGroupCompatible(
  talentSlot: CombatTalentParameterSlot,
  groupId: CombatTalentParameterGroupId
): boolean {
  return talentGroupsBySlot[talentSlot]?.includes(groupId) ?? false
}

export function expectedTalentGroups(talentSlot: CombatTalentParameterSlot): string {
  return talentGroupsBySlot[talentSlot]?.join(", ") ?? ""
}

export function getActionTalentParameterOwnerIds(action: CombatActionMetadata): readonly string[] {
  if (action.travelerElement === undefined) return [action.talentParameterOwnerId ?? action.characterId]
  if (action.characterId !== "Traveler" || action.talentParameterOwnerId !== undefined) return []
  return getTravelerTalentParameterOwnerIds(action.travelerElement)
}

export function isValidMetricConstellation(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 6
}

export function isValidMetricAscension(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 6
}
