import { getCharacterBurstEnergyCost, hasHexereiSecretRite, isHexereiCharacter, type CombatEffectLifecycle } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { getBuildFieldPresence, type FieldContext } from "../core/field-presence.js"
import { resolveBuildElement } from "../core/build-variant.js"
import { findCapabilityProviders } from "./capabilities.js"

/** Evaluates reviewed lifecycle rules for damage and support consumers against the same field context. */
export function resolveCombatEffectLifecycle(input: {
  readonly lifecycle?: CombatEffectLifecycle
  readonly targetFrozen?: boolean
  readonly requiresSourceOnField?: boolean
  readonly requiresRecipientOnField?: boolean
  readonly source: CharacterBuild
  readonly recipient: CharacterBuild
  readonly builds: readonly CharacterBuild[]
  readonly fieldContext: FieldContext
  readonly activeEffectIds: readonly string[]
  readonly activeEffectSourceBuildIds?: Readonly<Record<string, string>>
  readonly selected: boolean
  readonly gameData?: GameDataRepository
  readonly enemyCount?: number
}): { readonly eligible: boolean; readonly reason: string; readonly capabilitySourceIds: readonly string[] } {
  const deny = (reason: string) => ({ eligible: false, reason, capabilitySourceIds: [] })
  const capabilitySourceIds = new Set<string>()
  const lifecycle = input.lifecycle
  if (lifecycle?.kind === "any_of") {
    const outcomes = lifecycle.alternatives.map((alternative) => resolveCombatEffectLifecycle({ ...input, lifecycle: alternative }))
    return outcomes.find((outcome) => outcome.eligible) ?? deny(outcomes.map((outcome) => outcome.reason).join("；"))
  }
  if (lifecycle?.kind === "excluded") return deny(lifecycle.reason)
  const applicability = lifecycle?.kind === "conditional" ? lifecycle.applicability : undefined
  if (applicability?.sourceHomework && !isHexereiCharacter(input.source.characterId)) return deny("装备者没有魔女的课业机制")
  if (applicability?.hexereiSecretRite !== undefined &&
    hasHexereiSecretRite(input.builds.map((build) => build.characterId)) !== applicability.hexereiSecretRite) return deny("队伍魔导秘仪状态不匹配")
  if (applicability?.elementRelationship) {
    if (!input.gameData) return deny("缺少元素数据，不能证明来源元素关系")
    const { element, includeOnField } = applicability.elementRelationship
    const foreground = input.builds.find((build) => build.buildId === input.fieldContext.onFieldBuildId)
    if (resolveBuildElement(input.source, input.gameData) !== element &&
      !(includeOnField && foreground && resolveBuildElement(foreground, input.gameData) === element)) return deny("元素不属于装备者或实际前台")
  }
  if (applicability?.targetFrozen && input.targetFrozen !== true) return deny("目标冻结状态未开启")
  if (applicability?.energyResource) {
    const capacity = getCharacterBurstEnergyCost(input.source)
    if (capacity === undefined || (applicability.energyResource === "elemental" ? capacity < 15 : capacity !== 0)) {
      return deny("来源元素能量机制不满足准备条件")
    }
  }
  if (applicability?.teamElements !== undefined) {
    if (!input.gameData) return deny("缺少队伍元素数据，不能证明准备资格")
    const elements = input.builds.map((build) => resolveBuildElement(build, input.gameData!))
    if (!applicability.teamElements.every((element) => elements.includes(element))) return deny("队伍元素组合不满足准备条件")
  }
  if ((input.requiresSourceOnField && applicability?.sourceFieldPresence === "off_field") ||
    (input.requiresRecipientOnField && applicability?.recipientFieldPresence === "off_field")) {
    throw new Error("效果生命周期与旧前台限制冲突")
  }
  const sourcePresence = input.requiresSourceOnField ? "on_field" : applicability?.sourceFieldPresence
  const recipientPresence = input.requiresRecipientOnField ? "on_field" : applicability?.recipientFieldPresence
  if (sourcePresence && sourcePresence !== "any" &&
    getBuildFieldPresence(input.fieldContext, input.source.buildId) !== sourcePresence) return deny("来源站位不满足条件")
  if (recipientPresence && recipientPresence !== "any" &&
    getBuildFieldPresence(input.fieldContext, input.recipient.buildId) !== recipientPresence) return deny("受益者站位不满足条件")
  if (!lifecycle || lifecycle.kind === "constant") return { eligible: true, reason: "常驻或兼容条件", capabilitySourceIds: [] }
  if (lifecycle.retention === "clear_on_exit" &&
    getBuildFieldPresence(input.fieldContext, input.source.buildId) !== "on_field") return deny("来源退场后不保留")
  if (lifecycle.preparation === "selected" && !input.selected) return deny("尚未选择准备状态")
  if (lifecycle.preparation === "qualified_or_selected" && !input.selected) {
    const hasAlternative = lifecycle.manualAlternatives?.some((id) => input.activeEffectIds.includes(id) &&
      (input.activeEffectSourceBuildIds?.[id] ?? input.fieldContext.actionOwnerBuildId) === input.source.buildId)
    if (hasAlternative) return deny("显式层数覆盖默认准备")
    if (!lifecycle.defaultCapability) return deny("未声明可自动准备的能力")
    const providers = findCapabilityProviders({
      builds: input.builds, fieldContext: input.fieldContext, activeEffectIds: input.activeEffectIds,
      requirement: lifecycle.defaultCapability, sourceBuildId: input.source.buildId,
      recipientBuildId: input.recipient.buildId, ...(input.gameData ? { gameData: input.gameData } : {}),
      enemyCount: input.enemyCount ?? 1
    })
    if (providers.length === 0) return deny("缺少默认准备所需的能力来源")
    for (const provider of providers) capabilitySourceIds.add(provider.sourceBuildId)
  }
  // Retained preparations do not promote their source to the actual foreground at this hit.
  if (lifecycle.retention === "while_applicable" && lifecycle.trigger.sourceFieldPresence !== "any" &&
    getBuildFieldPresence(input.fieldContext, input.source.buildId) !== lifecycle.trigger.sourceFieldPresence) {
    return deny("当前触发来源站位不满足条件")
  }
  const requirement = lifecycle.trigger.capability
  // Only the eligibility query sees the declared preparation stance. The real hit/recipient context is unchanged.
  const preparationFieldContext = lifecycle.retention === "retain_on_exit" && lifecycle.trigger.sourceFieldPresence === "on_field"
    ? { ...input.fieldContext, onFieldBuildId: input.source.buildId } : input.fieldContext
  const providers = requirement ? findCapabilityProviders({
    builds: input.builds, fieldContext: preparationFieldContext, activeEffectIds: input.activeEffectIds,
    requirement, sourceBuildId: input.source.buildId, recipientBuildId: input.recipient.buildId,
    enemyCount: input.enemyCount ?? 1,
    ...(input.gameData ? { gameData: input.gameData } : {})
  }) : []
  if (requirement && (providers.length > 0) !== (requirement.present ?? true)) return deny("能力来源不满足准备条件")
  for (const provider of providers) capabilitySourceIds.add(provider.sourceBuildId)
  return { eligible: true, reason: lifecycle.explanation, capabilitySourceIds: [...capabilitySourceIds] }
}
