import type { CombatActionEffect } from "./types.js"

/** Validates the shared equipped/comparison choice schema when loading the content registry. */
export function assertWeaponChoices(effects: readonly CombatActionEffect[]): void {
  const groups = new Map<string, CombatActionEffect[]>()
  const recipients = new Map<string, string>()
  for (const effect of effects) {
    if (effect.weaponRecipientChoice) {
      const choice = effect.weaponRecipientChoice
      if (effect.source.kind !== "weapon" || (choice.excludeSource && choice.defaultRecipient === "source")) {
        throw new Error(`Invalid weapon recipient choice: ${effect.id}`)
      }
      const key = `${effect.source.weaponId}:${choice.group}`
      const policy = JSON.stringify(choice)
      if (recipients.has(key) && recipients.get(key) !== policy) throw new Error(`Conflicting weapon recipient defaults: ${key}`)
      recipients.set(key, policy)
    }
    const choice = effect.weaponChoice
    if (!choice) continue
    if (effect.source.kind !== "weapon" || effect.activation !== "active" ||
      choice.group !== effect.exclusivity?.group || choice.variant !== effect.exclusivity?.variant) {
      throw new Error(`Invalid weapon choice: ${effect.id}`)
    }
    const key = `${effect.source.weaponId}:${choice.group}`
    groups.set(key, [...(groups.get(key) ?? []), effect])
  }
  for (const [key, definitions] of groups) {
    const variants = new Set(definitions.map((effect) => effect.weaponChoice!.variant))
    const first = definitions[0]!.weaponChoice!
    const policy = (choice: NonNullable<CombatActionEffect["weaponChoice"]>) => JSON.stringify([
      choice.defaultVariant, choice.defaultVariantByCharacter ?? {}, choice.fixedVariantByCharacter ?? {},
      choice.automaticVariant ?? null, choice.targetAuraElements ?? [], choice.labelByRefinement ?? []
    ])
    for (const effect of definitions) {
      const choice = effect.weaponChoice!
      if (choice.labelByRefinement && choice.labelByRefinement.length !== 5) throw new Error(`Invalid refinement labels: ${key}`)
      if (policy(choice) !== policy(first)) throw new Error(`Conflicting weapon choice defaults: ${key}`)
      const references = [choice.defaultVariant, ...Object.values(choice.defaultVariantByCharacter ?? {}),
        ...Object.values(choice.fixedVariantByCharacter ?? {}), ...(choice.automaticVariant ? [choice.automaticVariant.variant] : [])]
      if (references.some((variant) => !variants.has(variant))) throw new Error(`Unknown weapon choice default: ${key}`)
    }
  }
}
