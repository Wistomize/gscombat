import type { CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"

/** A single action's field identity; changing the stat recipient must never change this context. */
export interface FieldContext {
  readonly actionOwnerBuildId: string
  /** With no known foreground, damage owners default to off-field; support owners may be unknown. */
  readonly actionOwnerFieldPresence?: "off_field" | "unknown"
  readonly onFieldBuildId: string | null
}

/** Resolves a known active character, or preserves an unknown active teammate for an off-field metric. */
export function resolveFieldContext(
  action: CombatActionMetadata,
  owner: CharacterBuild,
  teammates: readonly CharacterBuild[],
  onFieldBuildId?: string
): FieldContext {
  if (onFieldBuildId !== undefined && ![owner, ...teammates].some((build) => build.buildId === onFieldBuildId)) {
    throw new Error("前台角色必须是当前队伍成员")
  }
  if (onFieldBuildId !== undefined && (
    (action.fieldPresence === "off_field" && onFieldBuildId === owner.buildId) ||
    (action.fieldPresence !== "off_field" && onFieldBuildId !== owner.buildId)
  )) {
    throw new Error("所选前台角色与当前指标的前后台要求冲突")
  }
  return {
    actionOwnerBuildId: owner.buildId,
    onFieldBuildId: onFieldBuildId ?? (action.fieldPresence === "off_field" ? null : owner.buildId)
  }
}

/** Preserves support source identity without assuming its presence when the foreground is unspecified. */
export function resolveSupportFieldContext(actionOwnerBuildId: string, onFieldBuildId?: string): FieldContext {
  return { actionOwnerBuildId, actionOwnerFieldPresence: "unknown", onFieldBuildId: onFieldBuildId ?? null }
}

/** Resolves a participant's actual presence, without promoting unknown teammates to the field. */
export function getBuildFieldPresence(context: FieldContext, buildId: string): "on_field" | "off_field" | "unknown" {
  if (context.onFieldBuildId !== null) return context.onFieldBuildId === buildId ? "on_field" : "off_field"
  return context.actionOwnerBuildId === buildId ? context.actionOwnerFieldPresence ?? "off_field" : "unknown"
}
