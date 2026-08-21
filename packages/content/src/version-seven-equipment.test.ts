import { describe, expect, it } from "vitest"

import { isCombatActionEffectApplicable, listCombatActionEffects } from "./combat-action-effects.js"
import { equipmentCoverageLedger } from "./equipment-coverage-ledger.js"
import type { CombatActionMetadata } from "./combat/types.js"

const stellarSwirlAction: CombatActionMetadata = {
  characterId: "Odette",
  damageKind: "special_reaction",
  damageParts: [{ coefficientParameterId: "test", id: "hit" }],
  element: "cryo",
  evaluator: "declared_special_reaction",
  id: "test.odette.stellar-swirl",
  kind: "damage",
  specialReaction: { kind: "stellar_swirl" },
  status: "draft",
  talentSlot: "skill"
}

const stellarSuperconductAction: CombatActionMetadata = {
  ...stellarSwirlAction,
  id: "test.odette.stellar-superconduct",
  specialReaction: { kind: "stellar_superconduct", stellarStoredElementalApplicationsParameterId: "applications" }
}

const versionSevenWeaponIds = new Set([
  "BladeOfAtonement",
  "ClashOfKings",
  "CovenantOfFrostAndSnow",
  "EchoesOfTheHeart",
  "Emberwell",
  "ExaiphanesBlade",
  "ForgedByTheGoldenMelody",
  "Frostbreath",
  "HereticsMoltenBlade",
  "JadeVista",
  "SongOfTheVigil",
  "WhitelakeFrostfeather"
])
const versionSevenArtifactIds = new Set(["HeartOfTheFurnace", "ScarletProof"])

function isVersionSevenEffect(effect: ReturnType<typeof listCombatActionEffects>[number]): boolean {
  if (effect.source.kind === "weapon") return versionSevenWeaponIds.has(effect.source.weaponId)
  return effect.source.kind === "artifact_set" && versionSevenArtifactIds.has(effect.source.setId)
}

describe("7.0 equipment registry", () => {
  it("publishes twelve weapons and two artifact sets in the pinned inventory", () => {
    const versionSevenCoverage = equipmentCoverageLedger.filter((entry) =>
      entry.kind === "weapon"
        ? versionSevenWeaponIds.has(entry.equipmentId)
        : versionSevenArtifactIds.has(entry.equipmentId)
    )

    expect(versionSevenCoverage.filter((entry) => entry.kind === "weapon")).toHaveLength(12)
    expect(versionSevenCoverage.filter((entry) => entry.kind === "artifact_set")).toHaveLength(2)
    expect(versionSevenCoverage.every((entry) => entry.clauses.every((clause) => clause.status !== "unreviewed")))
      .toBe(true)
  })

  it("maps every implemented 7.0 coverage clause to one executable effect", () => {
    const versionSevenEffects = listCombatActionEffects().filter(isVersionSevenEffect)
    const versionSevenEffectIds = new Set(versionSevenEffects.map((effect) => effect.id))
    const coveredEffectIds = equipmentCoverageLedger
      .filter((entry) => versionSevenWeaponIds.has(entry.equipmentId) || versionSevenArtifactIds.has(entry.equipmentId))
      .flatMap((entry) =>
      entry.clauses.flatMap((clause) => clause.status === "implemented" ? clause.effectIds : [])
    )

    expect(new Set(coveredEffectIds)).toEqual(versionSevenEffectIds)
  })

  it("keeps every refinement table complete and finite", () => {
    const refinementTables = listCombatActionEffects().filter(isVersionSevenEffect).flatMap((effect) =>
      effect.value.kind === "refinement_table" ? [effect.value.values] : []
    )

    expect(refinementTables.length).toBeGreaterThan(0)
    for (const values of refinementTables) {
      expect(values).toHaveLength(5)
      expect(values.every(Number.isFinite)).toBe(true)
    }
  })

  it("places Stellar-only bonuses in the dedicated special-reaction stage", () => {
    const stellarEffects = listCombatActionEffects().filter(isVersionSevenEffect).filter(
      (effect) => effect.target === "specialReactionDamageBonus"
    )

    expect(stellarEffects.length).toBeGreaterThan(0)
    for (const effect of stellarEffects) {
      expect(effect.targetFilter?.specialReactionKinds).toBeDefined()
      expect(isCombatActionEffectApplicable(effect, stellarSwirlAction)).toBe(
        effect.targetFilter?.specialReactionKinds?.includes("stellar_swirl") ?? false
      )
      expect(isCombatActionEffectApplicable(effect, stellarSuperconductAction)).toBe(
        effect.targetFilter?.specialReactionKinds?.includes("stellar_superconduct") ?? false
      )
    }
  })

  it("pins the two signature passives and artifact-set values to the reviewed 7.0 snapshot", () => {
    const effectsById = new Map(listCombatActionEffects().filter(isVersionSevenEffect).map((effect) => [effect.id, effect]))

    expect(effectsById.get("weapon.whitelake-frostfeather.lake-hued-lament.3-stack.attack-percent")?.value)
      .toEqual({ kind: "refinement_table", values: [0.24, 0.3, 0.36, 0.42, 0.48] })
    expect(effectsById.get("weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage")?.value)
      .toEqual({ kind: "refinement_table", values: [0.5, 0.65, 0.8, 0.95, 1.1] })
    expect(effectsById.get("weapon.exaiphanes-blade.after-hit.traveler.attack-percent")?.value)
      .toEqual({ kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.32, 0.4] })
    expect(effectsById.get("weapon.exaiphanes-blade.traveler.resonated-elements.crit-damage")?.value)
      .toEqual({ kind: "refinement_table", values: [0, 0.42, 0.42, 0.42, 0.42] })
    expect(effectsById.get("artifact.scarlet-proof.4pc.after-stellar-swirl.crit-rate")?.value)
      .toEqual({ kind: "fixed", value: 0.16 })
    expect(effectsById.get("artifact.scarlet-proof.4pc.after-stellar-swirl.reaction-damage-bonus")?.value)
      .toEqual({ kind: "fixed", value: 0.4 })
    expect(effectsById.get("artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus")?.value)
      .toEqual({ kind: "fixed", value: 0.5 })
  })

  it("declares Heart of the Furnace party damage as a single non-stacking source", () => {
    const effect = listCombatActionEffects().find(
      (candidate) => candidate.id === "artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus"
    )

    expect(effect?.source).toEqual({
      holder: "party_member",
      kind: "artifact_set",
      minimumPieces: 4,
      resolveOneMatchingPartySource: true,
      setId: "HeartOfTheFurnace"
    })
  })
})
