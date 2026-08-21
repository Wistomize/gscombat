import {
  listCombatActionEffects,
  type CombatActionMetadata,
  xianglingNationalBuiltinBuild
} from "@gscombat/content"
import { describe, expect, it } from "vitest"

import { resolveCombatActionEffectsForCandidates } from "../../../src/effects/action-effects.js"

const stellarSwirlAction: CombatActionMetadata = {
  characterId: "Odette",
  damageKind: "special_reaction",
  damageParts: [{ coefficientParameterId: "preview", id: "hit" }],
  element: "cryo",
  evaluator: "declared_special_reaction",
  id: "preview.odette.stellar-swirl",
  kind: "damage",
  specialReaction: { kind: "stellar_swirl" },
  status: "draft",
  talentSlot: "skill"
}

function withWeapon(weaponId: string, refinement = 1) {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `version-seven.weapon.${weaponId}.${refinement}`,
    weapon: { ascension: 6, level: 90, refinement, weaponId }
  }
}

function withArtifactSet(setId: string, buildId = `version-seven.artifact.${setId}`) {
  return {
    ...withWeapon("TestNoWeapon"),
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId })),
    buildId
  }
}

function resolveVersionSevenEffects(
  primary: ReturnType<typeof withWeapon>,
  activeEffectIds: readonly string[],
  teammates: readonly ReturnType<typeof withWeapon>[] = []
) {
  return resolveCombatActionEffectsForCandidates(
    {
      action: stellarSwirlAction,
      activeEffectIds,
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary,
      primaryDifferentElementTeammateCount: 2,
      primarySameElementTeammateCount: 1,
      teammates
    },
    listCombatActionEffects()
  )
}

describe("7.0 equipment effect integration", () => {
  it("resolves Whitelake Frostfeather's full R5 three-stack snapshot", () => {
    const effects = resolveVersionSevenEffects(withWeapon("WhitelakeFrostfeather", 5), [
      "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.attack-percent",
      "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage"
    ])

    expect(effects.attackPercent).toBeCloseTo(0.48)
    expect(effects.critDamage).toBeCloseTo(1.1)
  })

  it("resolves Scarlet Proof's general CRIT Rate and Stellar-Swirl-only damage bonus", () => {
    const effects = resolveVersionSevenEffects(withArtifactSet("ScarletProof"), [
      "artifact.scarlet-proof.4pc.after-stellar-swirl.crit-rate",
      "artifact.scarlet-proof.4pc.after-stellar-swirl.reaction-damage-bonus"
    ])

    expect(effects.attackPercent).toBeCloseTo(0.18)
    expect(effects.critRate).toBeCloseTo(0.16)
    expect(effects.specialReactionDamageBonus).toBeCloseTo(0.4)
  })

  it("applies one Heart of the Furnace party bonus when two teammates hold the same set", () => {
    const holderOne = withArtifactSet("HeartOfTheFurnace", "version-seven.artifact.heart.one")
    const holderTwo = withArtifactSet("HeartOfTheFurnace", "version-seven.artifact.heart.two")
    const effects = resolveVersionSevenEffects(withArtifactSet("TestNoArtifactSet"), [
      "artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus"
    ], [holderOne, holderTwo])

    expect(effects.specialReactionDamageBonus).toBeCloseTo(0.5)
    expect(effects.appliedEffects.filter((effect) => effect.id.includes("heart-of-the-furnace"))).toHaveLength(1)
  })

  it("resolves Jade Vista's same- and different-element teammate stacks without exceeding three", () => {
    const effects = resolveVersionSevenEffects(withWeapon("JadeVista", 5), [])

    expect(effects.elementalMastery).toBeCloseTo(128)
    expect(effects.attackPercent).toBeCloseTo(0.48)
  })

  it("resolves the doubled Stellar song of Forged by the Golden Melody at R5", () => {
    const effects = resolveVersionSevenEffects(withWeapon("ForgedByTheGoldenMelody", 5), [
      "weapon.forged-by-the-golden-melody.current-song-and-counterpoint.stellar-reaction-damage-bonus"
    ])

    expect(effects.specialReactionDamageBonus).toBeCloseTo(1.12)
  })
})
