import { describe, expect, it } from "vitest"
import { getCombatActionEffectDefinition, listCombatActionEffects, listCombatActionEffectsForSources } from "./combat-action-effects.js"

describe("fixed combat effect indexes", () => {
  it("preserves every declaration and registry order for each source bucket", () => {
    const all = listCombatActionEffects()
    for (const effect of all) expect(getCombatActionEffectDefinition(effect.id)).toBe(effect)
    const keys = new Set(all.map(({ source }) => source.kind === "character" ? `character:${source.characterId}`
      : source.kind === "weapon" ? `weapon:${source.weaponId}` : `artifact_set:${source.setId}`))
    for (const key of keys) {
      const [kind, id] = key.split(":")
      const query = { characterId: kind === "character" ? id! : "", weaponId: kind === "weapon" ? id! : "",
        artifactSetIds: kind === "artifact_set" ? [id!] : [] }
      const expected = all.filter(({ source }) => source.kind === "character" ? source.characterId === query.characterId
        : source.kind === "weapon" ? source.weaponId === query.weaponId : query.artifactSetIds.includes(source.setId))
      expect(listCombatActionEffectsForSources([query, query])).toEqual(expected)
    }
    expect(getCombatActionEffectDefinition("unknown")).toBeUndefined()
    const selectedIds = [all.at(-1)!.id, all[0]!.id, "unknown"]
    expect(listCombatActionEffectsForSources([], selectedIds)).toEqual(all.filter(effect => selectedIds.includes(effect.id)))
  })

  it("does not expose shared writable list containers", () => {
    const before = listCombatActionEffects()
    const copy = listCombatActionEffects() as unknown[]
    copy.reverse(); copy.pop()
    expect(listCombatActionEffects()).toEqual(before)
    const source = { characterId: "RaidenShogun", weaponId: "EngulfingLightning", artifactSetIds: ["EmblemOfSeveredFate"] }
    const selected = listCombatActionEffectsForSources([source])
    ;(selected as unknown[]).splice(0)
    expect(listCombatActionEffectsForSources([source]).length).toBeGreaterThan(0)
  })
})
