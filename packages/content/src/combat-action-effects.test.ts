import { describe, expect, it } from "vitest"

import { listHealingEquipmentEffects } from "./artifacts/healing-bonus/effects.js"
import { listRecipientEquipmentEffects } from "./artifacts/recipient-bonus/effects.js"
import {
  CELESTIAL_GIFT_CELESTIAL_GUIDANCE_DAMAGE_BONUS,
  CELESTIAL_GIFT_MORTAL_HYMN_DAMAGE_BONUS
} from "./artifacts/celestial-gift/index.js"
import {
  CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS
} from "./artifacts/crimson-witch-of-flames/index.js"
import {
  DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_REACTION_DAMAGE_BONUS
} from "./artifacts/disenchantment-in-deep-shadow/index.js"
import {
  FLOWER_OF_PARADISE_LOST_BASE_REACTION_DAMAGE_BONUS,
  FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_BY_STACK,
  FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_STACK_MULTIPLIER
} from "./artifacts/flower-of-paradise-lost/index.js"
import {
  NIGHT_OF_THE_SKYS_UNVEILING_FULL_MOONSIGN_CRIT_RATE,
  NIGHT_OF_THE_SKYS_UNVEILING_INITIAL_MOONSIGN_CRIT_RATE,
  NIGHT_OF_THE_SKYS_UNVEILING_TWO_PIECE_ELEMENTAL_MASTERY
} from "./artifacts/night-of-the-skys-unveiling/index.js"
import {
  SILKEN_MOONS_SERENADE_FULL_MOONSIGN_PARTY_ELEMENTAL_MASTERY,
  SILKEN_MOONS_SERENADE_INITIAL_MOONSIGN_PARTY_ELEMENTAL_MASTERY
} from "./artifacts/silken-moons-serenade/index.js"
import {
  THUNDERING_FURY_AGGRAVATE_REACTION_DAMAGE_BONUS,
  THUNDERING_FURY_TRANSFORMATIVE_REACTION_DAMAGE_BONUS
} from "./artifacts/thundering-fury/index.js"
import {
  UNFINISHED_REVERIE_FULL_DAMAGE_BONUS,
  UNFINISHED_REVERIE_POST_BURNING_GRACE_EXPIRY_STATES
} from "./artifacts/unfinished-reverie/index.js"
import { VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS } from "./artifacts/viridescent-venerer/index.js"
import {
  VERMILLION_HEREAFTER_AFTER_HP_LOSS_ATTACK_PERCENT
} from "./artifacts/vermillion-hereafter/index.js"
import {
  VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS_PER_DAMAGE_TAKEN_STACK
} from "./artifacts/vourukashas-glow/index.js"
import { getCombatActionDefinition } from "./combat-registry.js"
import { supportedArtifactSets, supportedWeapons } from "./catalog.js"
import {
  isCombatActionEffectApplicable,
  isCombatActionEffectDeterministicallyActive,
  listCombatEquipmentEffectCoverage,
  listActiveCombatActionEffectsForAction,
  listActiveCombatActionEffectOptionsForAction,
  listActiveScenarioEffectOptionsForAction,
  listCombatActionEffects
} from "./combat-action-effects.js"
import { equipmentCoverageLedger } from "./equipment-coverage-ledger.js"

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing action ${actionId}`)
  return action
}

describe("combat action effects", () => {
  it("exports stack-snapshot constants from the three artifact module boundaries", () => {
    expect(VERMILLION_HEREAFTER_AFTER_HP_LOSS_ATTACK_PERCENT).toEqual([0.18, 0.28, 0.38, 0.48])
    expect(VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS_PER_DAMAGE_TAKEN_STACK).toBeCloseTo(0.08)
    expect(UNFINISHED_REVERIE_FULL_DAMAGE_BONUS).toBeCloseTo(0.5)
    expect(UNFINISHED_REVERIE_POST_BURNING_GRACE_EXPIRY_STATES).toEqual([
      { damageBonus: 0.4, secondAfterGrace: 1 },
      { damageBonus: 0.3, secondAfterGrace: 2 },
      { damageBonus: 0.2, secondAfterGrace: 3 },
      { damageBonus: 0.1, secondAfterGrace: 4 }
    ])
  })

  it("declares The Catch, Emblem, and Xiangling's explicit current-action snapshots by source", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const effects = listCombatActionEffects()

    expect(effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.the-catch.burst-crit-rate", target: "critRate" }),
        expect.objectContaining({ id: "weapon.the-catch.burst-damage-bonus", target: "damageBonus" }),
        expect.objectContaining({ id: "artifact.emblem-of-severed-fate.2pc.energy-recharge", target: "energyRecharge" }),
        expect.objectContaining({ id: "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus", target: "damageBonus" })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(pyronado)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "xiangling.guoba.chili.attack" }),
        expect.objectContaining({ id: "xiangling.guoba.c1.pyro_resistance_shred" })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(pyronado)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "xiangling.pyronado.c6.pyro_damage_bonus" })])
    )
    expect(
      isCombatActionEffectApplicable(
        effects.find((effect) => effect.id === "weapon.the-catch.burst-crit-rate")!,
        pyronado
      )
    ).toBe(true)
  })

  it("declares Crimson Witch's Vaporize and Melt bonus at the reaction-multiplier stage", () => {
    const vaporize = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const nonReaction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const dynamicVaporize = requireAction("mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum")
    const effect = listCombatActionEffects().find(
      (candidate) => candidate.id === "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"
    )

    expect(effect).toEqual({
      activation: "automatic",
      id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
      label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
      target: "amplifyingReactionBonus",
      targetFilter: {
        amplifyingReactionKinds: ["melt_forward", "melt_reverse", "vaporize_forward", "vaporize_reverse"]
      },
      value: { kind: "fixed", value: 0.15 }
    })
    expect(isCombatActionEffectApplicable(effect!, vaporize)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, nonReaction)).toBe(false)
    expect(
      isCombatActionEffectApplicable(effect!, dynamicVaporize, [dynamicVaporize.element], undefined, ["vaporize_forward"])
    ).toBe(true)
  })

  it("declares ordinary reaction-only weapon snapshots in their own formula stage", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))

    expect([
      effectsById.get("weapon.blackmarrow-lantern.bloom.reaction-damage-bonus"),
      effectsById.get("weapon.prospectors-shovel.electro-charged.reaction-damage-bonus"),
      effectsById.get("weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus"),
      effectsById.get("weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus")
    ]).toEqual([
      {
        activation: "active",
        id: "weapon.blackmarrow-lantern.bloom.reaction-damage-bonus",
        label: "乌髓孑灯 · 绽放反应伤害",
        source: { kind: "weapon", weaponId: "BlackmarrowLantern" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["bloom"] },
        value: { kind: "refinement_table", values: [0.48, 0.6, 0.72, 0.84, 0.96] }
      },
      {
        activation: "active",
        id: "weapon.prospectors-shovel.electro-charged.reaction-damage-bonus",
        label: "掘金之锹 · 感电反应伤害",
        source: { kind: "weapon", weaponId: "ProspectorsShovel" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["electro_charged"] },
        value: { kind: "refinement_table", values: [0.48, 0.6, 0.72, 0.84, 0.96] }
      },
      {
        activation: "active",
        id: "weapon.nightweavers-looking-glass.both-states.party-bloom.reaction-damage-bonus",
        label: "纺夜天镜 · 终北圣言与朔月诗篇同时存在时，队伍绽放反应伤害",
        source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["bloom"] },
        value: { kind: "refinement_table", values: [1.2, 1.5, 1.8, 2.1, 2.4] }
      },
      {
        activation: "active",
        id: "weapon.nightweavers-looking-glass.both-states.party-hyperbloom-burgeon.reaction-damage-bonus",
        label: "纺夜天镜 · 终北圣言与朔月诗篇同时存在时，队伍超绽放、烈绽放反应伤害",
        source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["hyperbloom", "burgeon"] },
        value: { kind: "refinement_table", values: [0.8, 1, 1.2, 1.4, 1.6] }
      }
    ])
  })

  it("keeps dedicated Moon and Stellar reaction bonuses out of ordinary action formulas", () => {
    const ordinaryAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const stellarSuperconduct = requireAction("sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct")
    const lunarCrystallize = requireAction("zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize")
    const effects = listCombatActionEffects()
    const specialReactionEffects = effects.filter((effect) => effect.target === "specialReactionDamageBonus")
    const teaspoonEffect = effects.find(
      (effect) => effect.id === "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus"
    )
    const nocturneEffect = effects.find(
      (effect) => effect.id === "weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage"
    )

    expect(specialReactionEffects.length).toBeGreaterThan(0)
    for (const effect of specialReactionEffects) {
      expect(effect.targetFilter?.specialReactionKinds?.length).toBeGreaterThan(0)
      expect(isCombatActionEffectApplicable(effect, ordinaryAction)).toBe(false)
    }
    expect(teaspoonEffect).toBeDefined()
    expect(isCombatActionEffectApplicable(teaspoonEffect!, stellarSuperconduct)).toBe(true)
    expect(isCombatActionEffectApplicable(teaspoonEffect!, lunarCrystallize)).toBe(false)
    expect(nocturneEffect).toBeDefined()
    expect(isCombatActionEffectApplicable(nocturneEffect!, ordinaryAction)).toBe(false)
    expect(isCombatActionEffectApplicable(nocturneEffect!, stellarSuperconduct)).toBe(false)
    expect(isCombatActionEffectApplicable(nocturneEffect!, lunarCrystallize)).toBe(true)
  })

  it("declares every audited Moon and Stellar weapon value as an explicit current-action snapshot", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const specialDamageBonusEffects = [
      {
        id: "weapon.a-teaspoon-of-transcendence.charged-hit.1-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.16, 0.2, 0.24, 0.28, 0.32]
      },
      {
        id: "weapon.a-teaspoon-of-transcendence.charged-hit.2-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.32, 0.4, 0.48, 0.56, 0.64]
      },
      {
        id: "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.48, 0.6, 0.72, 0.84, 0.96]
      },
      {
        id: "weapon.blackmarrow-lantern.lunar-bloom.reaction-damage-bonus",
        kinds: ["lunar_bloom"],
        values: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        id: "weapon.blackmarrow-lantern.full-moonsign.lunar-bloom.reaction-damage-bonus",
        kinds: ["lunar_bloom"],
        values: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        id: "weapon.bloodsoaked-ruins.after-burst.lunar-charged.reaction-damage-bonus",
        kinds: ["lunar_charged"],
        values: [0.36, 0.48, 0.6, 0.72, 0.84]
      },
      {
        id: "weapon.cashflow-supervision.hp-change.1-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.14, 0.175, 0.21, 0.245, 0.28]
      },
      {
        id: "weapon.cashflow-supervision.hp-change.2-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.28, 0.35, 0.42, 0.49, 0.56]
      },
      {
        id: "weapon.cashflow-supervision.hp-change.3-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.42, 0.525, 0.63, 0.735, 0.84]
      },
      {
        id: "weapon.fractured-halo.after-shield.party-lunar-charged.reaction-damage-bonus",
        kinds: ["lunar_charged"],
        values: [0.4, 0.5, 0.6, 0.7, 0.8]
      },
      {
        id: "weapon.golden-frostbound-oath.frost-fairys-requital.lunar-crystallize.reaction-damage-bonus",
        kinds: ["lunar_crystallize"],
        values: [0.4, 0.5, 0.6, 0.7, 0.8]
      },
      {
        id: "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus",
        kinds: ["lunar_crystallize"],
        values: [0.2, 0.25, 0.3, 0.35, 0.4]
      },
      {
        id: "weapon.kaguras-verity.kagura-dance.1-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        id: "weapon.kaguras-verity.kagura-dance.2-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.24, 0.3, 0.36, 0.42, 0.48]
      },
      {
        id: "weapon.kaguras-verity.kagura-dance.3-stack.star-superconduct-damage-bonus",
        kinds: ["stellar_superconduct"],
        values: [0.36, 0.45, 0.54, 0.63, 0.72]
      },
      {
        id: "weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus",
        kinds: ["lunar_crystallize"],
        values: [0.64, 0.8, 0.96, 1.12, 1.28]
      },
      {
        id: "weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus",
        kinds: ["lunar_bloom"],
        values: [0.4, 0.5, 0.6, 0.7, 0.8]
      },
      {
        id: "weapon.prospectors-shovel.lunar-charged.reaction-damage-bonus",
        kinds: ["lunar_charged"],
        values: [0.12, 0.15, 0.18, 0.21, 0.24]
      },
      {
        id: "weapon.prospectors-shovel.full-moonsign.lunar-charged.reaction-damage-bonus",
        kinds: ["lunar_charged"],
        values: [0.12, 0.15, 0.18, 0.21, 0.24]
      }
    ] as const

    for (const expected of specialDamageBonusEffects) {
      const effect = effectsById.get(expected.id)
      expect(effect).toMatchObject({
        target: "specialReactionDamageBonus",
        targetFilter: { specialReactionKinds: expected.kinds }
      })
      if (!effect || effect.target === "additionalDamageEvent" || effect.target === "matchedActionAdditiveDamageTerm") {
        throw new Error(`Missing stat effect ${expected.id}`)
      }
      expect(effect.value.kind).toBe("refinement_table")
      if (effect.value.kind !== "refinement_table") throw new Error(`Unexpected value kind for ${expected.id}`)
      expect(effect.value.values).toHaveLength(expected.values.length)
      for (const [index, value] of expected.values.entries()) {
        expect(effect.value.values[index]).toBeCloseTo(value)
      }
    }
    expect(effectsById.get("weapon.fractured-halo.after-shield.party-lunar-charged.reaction-damage-bonus")).toMatchObject({
      source: { holder: "party_member", kind: "weapon", weaponId: "FracturedHalo" }
    })
    expect(
      effectsById.get(
        "weapon.golden-frostbound-oath.frost-fairys-mischief.active.mooncage-nearby-other-party-lunar-crystallize.reaction-damage-bonus"
      )
    ).toMatchObject({
      source: { holder: "party_member", kind: "weapon", weaponId: "GoldenFrostboundOath" },
      targetFilter: { recipientSourceRelation: "not_source", specialReactionKinds: ["lunar_crystallize"] }
    })
    expect(effectsById.get("weapon.nightweavers-looking-glass.both-states.party-lunar-bloom.reaction-damage-bonus")).toMatchObject({
      source: { holder: "party_member", kind: "weapon", weaponId: "NightweaversLookingGlass" }
    })
    expect(effectsById.get("weapon.nocturnes-curtain-call.after-lunar-reaction.lunar-crit-damage")).toMatchObject({
      target: "critDamage",
      targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
      value: { kind: "refinement_table", values: [0.6, 0.8, 1, 1.2, 1.4] }
    })
  })

  it("declares ordinary artifact reaction bonuses and Flower of Paradise Lost's explicit stack snapshots", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const flowerStackIds = [0, 1, 2, 3, 4].map(
      (stackCount) => `artifact.flower-of-paradise-lost.4pc.reaction-trigger.${stackCount}-stack.reaction-damage-bonus`
    )

    expect(CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS).toBeCloseTo(0.4)
    expect(VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS).toBeCloseTo(0.6)
    expect(THUNDERING_FURY_TRANSFORMATIVE_REACTION_DAMAGE_BONUS).toBeCloseTo(0.4)
    expect(THUNDERING_FURY_AGGRAVATE_REACTION_DAMAGE_BONUS).toBeCloseTo(0.2)
    expect(FLOWER_OF_PARADISE_LOST_BASE_REACTION_DAMAGE_BONUS).toBeCloseTo(0.4)
    expect(FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_STACK_MULTIPLIER).toBeCloseTo(0.25)
    expect(FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_BY_STACK).toEqual([0.4, 0.5, 0.6, 0.7, 0.8])

    expect(effectsById.get("artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus"))
      .toEqual({
        activation: "automatic",
        id: "artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus",
        label: "炽烈的炎之魔女 · 四件套（超载、燃烧、烈绽放反应伤害）",
        source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["overload", "burning", "burgeon"] },
        value: { kind: "fixed", value: 0.4 }
      })
    expect(effectsById.get("artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus")).toEqual({
      activation: "automatic",
      id: "artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus",
      label: "翠绿之影 · 四件套（扩散反应伤害）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "ViridescentVenerer" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["swirl"] },
      value: { kind: "fixed", value: 0.6 }
    })
    expect(
      effectsById.get(
        "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus"
      )
    ).toEqual({
      activation: "automatic",
      id: "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus",
      label: "如雷的盛怒 · 四件套（超载、感电、超导、超绽放反应伤害）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "ThunderingFury" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["overload", "electro_charged", "superconduct", "hyperbloom"] },
      value: { kind: "fixed", value: 0.4 }
    })
    expect(effectsById.get("artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus")).toEqual({
      activation: "automatic",
      id: "artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus",
      label: "如雷的盛怒 · 四件套（超激化附加伤害）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "ThunderingFury" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["aggravate"] },
      value: { kind: "fixed", value: 0.2 }
    })
    expect(flowerStackIds.map((id) => effectsById.get(id))).toEqual(
      FLOWER_OF_PARADISE_LOST_REACTION_DAMAGE_BONUS_BY_STACK.map((value, stackCount) => ({
        activation: "active",
        exclusivity: { group: "flower-of-paradise-lost-reaction-trigger", variant: `${stackCount}-stack` },
        id: flowerStackIds[stackCount],
        label: `乐园遗落之花 · 四件套（绽放、超绽放、烈绽放反应触发${stackCount}层；10秒内）`,
        source: { kind: "artifact_set", minimumPieces: 4, setId: "FlowerOfParadiseLost" },
        target: "reactionDamageBonus",
        targetFilter: { reactionKinds: ["bloom", "hyperbloom", "burgeon"] },
        value: { kind: "fixed", value }
      }))
    )
  })

  it("declares Disenchantment in Deep Shadow's ordinary Superconduct branch without claiming Star Superconduct", () => {
    const nonReaction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const effect = listCombatActionEffects().find(
      (candidate) => candidate.id === "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus"
    )

    expect(DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_REACTION_DAMAGE_BONUS).toBeCloseTo(0.8)
    expect(effect).toEqual({
      activation: "automatic",
      id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus",
      label: "影中沉凝的幻灭 · 四件套（超导反应伤害）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "DisenchantmentInDeepShadow" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["superconduct"] },
      value: { kind: "fixed", value: 0.8 }
    })
    expect(isCombatActionEffectApplicable(effect!, nonReaction, [nonReaction.element], undefined, [], ["superconduct"])).toBe(
      true
    )
    expect(isCombatActionEffectApplicable(effect!, nonReaction, [nonReaction.element], undefined, [], ["overload"])).toBe(
      false
    )
  })

  it("declares Cinnabar Spindle only for Albedo's cooldown-ready single Transient Blossom", () => {
    const transientBlossom = requireAction("albedo.skill.transient_blossom")
    const solarIsotoma = requireAction("albedo.skill.abiogenesis_solar_isotoma.initial_hit")
    const effectId = "weapon.cinnabar-spindle.skill-hit-ready.albedo-transient-blossom.defense-additive-damage"
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "辰砂之纺锤 · 阿贝多单次刹那之花（本次武器冷却就绪）防御力同一命中加算",
      source: { holder: "primary", kind: "weapon", weaponId: "CinnabarSpindle" },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["albedo.skill.transient_blossom"],
        recipientCharacterIds: ["Albedo"]
      },
      value: {
        coefficient: { kind: "refinement_table", values: [0.4, 0.5, 0.6, 0.7, 0.8] },
        kind: "matched_action_additive_damage_term",
        scalingStat: "defense"
      }
    })
    expect(isCombatActionEffectApplicable(effect!, transientBlossom)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, solarIsotoma)).toBe(false)
    expect(listActiveCombatActionEffectsForAction(transientBlossom)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectsForAction(solarIsotoma)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })

  it("declares Night of the Sky's Unveiling's mutually exclusive lunar-reaction crit snapshots", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const initialId = "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate"
    const fullId = "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"

    expect(NIGHT_OF_THE_SKYS_UNVEILING_TWO_PIECE_ELEMENTAL_MASTERY).toBe(80)
    expect(NIGHT_OF_THE_SKYS_UNVEILING_INITIAL_MOONSIGN_CRIT_RATE).toBeCloseTo(0.15)
    expect(NIGHT_OF_THE_SKYS_UNVEILING_FULL_MOONSIGN_CRIT_RATE).toBeCloseTo(0.3)
    expect([effectsById.get(initialId), effectsById.get(fullId)]).toEqual([
      {
        activation: "active",
        condition: { kind: "moonsign_level", minimum: "nascent_gleam" },
        exclusivity: { group: "night-of-the-skys-unveiling-moonsign", variant: "initial" },
        id: initialId,
        label: "穹境示现之夜 · 附近队伍触发月曜反应后（初辉，装备者在场，4秒内）",
        source: { kind: "artifact_set", minimumPieces: 4, setId: "NightOfTheSkysUnveiling" },
        target: "critRate",
        value: { kind: "fixed", value: 0.15 }
      },
      {
        activation: "active",
        condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
        exclusivity: { group: "night-of-the-skys-unveiling-moonsign", variant: "full" },
        id: fullId,
        label: "穹境示现之夜 · 附近队伍触发月曜反应后（满辉，装备者在场，4秒内）",
        source: { kind: "artifact_set", minimumPieces: 4, setId: "NightOfTheSkysUnveiling" },
        target: "critRate",
        value: { kind: "fixed", value: 0.3 }
      }
    ])
  })

  it("declares Silken Moon's Serenade's mutually exclusive party moonsign mastery snapshots", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const initialId = "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery"
    const fullId = "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery"

    expect(SILKEN_MOONS_SERENADE_INITIAL_MOONSIGN_PARTY_ELEMENTAL_MASTERY).toBe(60)
    expect(SILKEN_MOONS_SERENADE_FULL_MOONSIGN_PARTY_ELEMENTAL_MASTERY).toBe(120)
    expect([effectsById.get(initialId), effectsById.get(fullId)]).toEqual([
      {
        activation: "active",
        condition: { kind: "moonsign_level", minimum: "nascent_gleam" },
        exclusivity: { group: "silken-moons-serenade-moonsign", variant: "initial" },
        id: initialId,
        label: "纺月的夜歌 · 月辉明光·崇信（初辉，造成元素伤害后，8秒内）队伍元素精通",
        source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "SilkenMoonsSerenade" },
        target: "elementalMastery",
        value: { kind: "fixed", value: 60 }
      },
      {
        activation: "active",
        condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
        exclusivity: { group: "silken-moons-serenade-moonsign", variant: "full" },
        id: fullId,
        label: "纺月的夜歌 · 月辉明光·崇信（满辉，造成元素伤害后，8秒内）队伍元素精通",
        source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "SilkenMoonsSerenade" },
        target: "elementalMastery",
        value: { kind: "fixed", value: 120 }
      }
    ])
  })

  it("declares Blackcliff Agate's mutually exclusive defeated-enemy stack snapshots", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))

    expect([
      effectsById.get("weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent"),
      effectsById.get("weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent"),
      effectsById.get("weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent")
    ]).toEqual([
      {
        activation: "active",
        exclusivity: { group: "blackcliff-agate-defeated-enemy", variant: "one-stack" },
        id: "weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent",
        label: "黑岩绯玉 · 击败敌人后的1层攻击力",
        source: { holder: "primary", kind: "weapon", weaponId: "BlackcliffAgate" },
        target: "attackPercent",
        value: { kind: "refinement_table", values: [0.12, 0.15, 0.18, 0.21, 0.24] }
      },
      {
        activation: "active",
        exclusivity: { group: "blackcliff-agate-defeated-enemy", variant: "two-stack" },
        id: "weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent",
        label: "黑岩绯玉 · 击败敌人后的2层攻击力",
        source: { holder: "primary", kind: "weapon", weaponId: "BlackcliffAgate" },
        target: "attackPercent",
        value: { kind: "refinement_table", values: [0.24, 0.3, 0.36, 0.42, 0.48] }
      },
      {
        activation: "active",
        exclusivity: { group: "blackcliff-agate-defeated-enemy", variant: "three-stack" },
        id: "weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent",
        label: "黑岩绯玉 · 击败敌人后的3层攻击力",
        source: { holder: "primary", kind: "weapon", weaponId: "BlackcliffAgate" },
        target: "attackPercent",
        value: { kind: "refinement_table", values: [0.36, 0.45, 0.54, 0.63, 0.72] }
      }
    ])
  })

  it("declares Ballad of the Boundless Blue's pre-existing Azure Skies snapshots by attack kind", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const normalAttack = requireAction("bennett.normal.auto.first_hit")
    const chargedAttack = requireAction("ningguang.normal.charged_attack.with_star_jades")

    expect([
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus"),
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus"),
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus"),
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus"),
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus"),
      effectsById.get("weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus")
    ]).toEqual([
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "1-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus",
        label: "无垠蔚蓝之歌 · 普通攻击命中前已持有的1层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["normal"] },
        value: { kind: "refinement_table", values: [0.08, 0.1, 0.12, 0.14, 0.16] }
      },
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "1-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus",
        label: "无垠蔚蓝之歌 · 重击命中前已持有的1层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["charged"] },
        value: { kind: "refinement_table", values: [0.06, 0.075, 0.09, 0.105, 0.12] }
      },
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "2-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus",
        label: "无垠蔚蓝之歌 · 普通攻击命中前已持有的2层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["normal"] },
        value: { kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.28, 0.32] }
      },
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "2-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus",
        label: "无垠蔚蓝之歌 · 重击命中前已持有的2层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["charged"] },
        value: { kind: "refinement_table", values: [0.12, 0.15, 0.18, 0.21, 0.24] }
      },
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "3-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus",
        label: "无垠蔚蓝之歌 · 普通攻击命中前已持有的3层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["normal"] },
        value: { kind: "refinement_table", values: [0.24, 0.3, 0.36, 0.42, 0.48] }
      },
      {
        activation: "active",
        exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: "3-stack" },
        id: "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus",
        label: "无垠蔚蓝之歌 · 重击命中前已持有的3层伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
        target: "damageBonus",
        targetFilter: { attackKinds: ["charged"] },
        value: { kind: "refinement_table", values: [0.18, 0.225, 0.27, 0.315, 0.36] }
      }
    ])
    expect(listActiveCombatActionEffectsForAction(normalAttack)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.normal-damage-bonus"
        }),
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.normal-damage-bonus"
        }),
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.normal-damage-bonus"
        })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(chargedAttack)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.1-stack.charged-damage-bonus"
        }),
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.2-stack.charged-damage-bonus"
        }),
        expect.objectContaining({
          id: "weapon.ballad-of-the-boundless-blue.azure-skies.3-stack.charged-damage-bonus"
        })
      ])
    )
  })

  it("declares same-hit weapon terms with their exact stat source and current-action filters", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const tighnariCharged = requireAction("tighnari.normal.wreath_arrow.single_hit.spread")
    const alhaithamNormal = requireAction("alhaitham.normal.auto.first_hit")
    const noelleNormal = requireAction("noelle.normal.auto.first_hit")
    const alhaithamSkill = requireAction(
      "alhaitham.skill.particular_field_fetters_of_phenomena.chisel_light_mirror_projection_attack.spread"
    )

    expect(effectsById.get("weapon.redhorn-stonethresher.normal-charged-defense-additive-damage")).toEqual(
      expect.objectContaining({
        activation: "automatic",
        target: "matchedActionAdditiveDamageTerm",
        targetFilter: { attackKinds: ["normal", "charged"] },
        value: {
          coefficient: { kind: "refinement_table", values: [0.4, 0.5, 0.6, 0.7, 0.8] },
          kind: "matched_action_additive_damage_term",
          scalingStat: "defense"
        }
      })
    )
    expect(effectsById.get("weapon.everlasting-moonglow.normal-hp-additive-damage")).toEqual(
      expect.objectContaining({
        activation: "automatic",
        target: "matchedActionAdditiveDamageTerm",
        targetFilter: { attackKinds: ["normal"] },
        value: {
          coefficient: { kind: "refinement_table", values: [0.01, 0.015, 0.02, 0.025, 0.03] },
          kind: "matched_action_additive_damage_term",
          scalingStat: "hp"
        }
      })
    )
    expect(effectsById.get("weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage")).toEqual({
      activation: "active",
      id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
      label: "弥坚骨 · 冲刺后的18次普通攻击（7秒内）攻击力同一命中加算",
      source: { holder: "primary", kind: "weapon", weaponId: "SturdyBone" },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { attackKinds: ["normal"] },
      value: {
        coefficient: { kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.28, 0.32] },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    })
    expect(listActiveCombatActionEffectsForAction(tighnariCharged)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.hunters-path.tireless-hunt.charged-em-additive-damage",
          target: "matchedActionAdditiveDamageTerm"
        })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(alhaithamNormal)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.light-of-foliar-incision.foliar-incisiveness.normal-em-additive-damage",
          target: "matchedActionAdditiveDamageTerm"
        })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(alhaithamSkill)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.light-of-foliar-incision.foliar-incisiveness.skill-em-additive-damage",
          target: "matchedActionAdditiveDamageTerm"
        })
      ])
    )
    expect(listActiveCombatActionEffectsForAction(noelleNormal)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.sturdy-bone.sprint-followup.normal-attack-additive-damage",
          target: "matchedActionAdditiveDamageTerm"
        })
      ])
    )
  })

  it("declares Staff of Homa's final-HP attack bonuses as primary-only current-action effects", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))

    expect(effectsById.get("weapon.staff-of-homa.hp-percent")).toEqual({
      activation: "automatic",
      id: "weapon.staff-of-homa.hp-percent",
      label: "护摩之杖 · 生命值",
      source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
      target: "hpPercent",
      value: { kind: "refinement_table", values: [0.2, 0.25, 0.3, 0.35, 0.4] }
    })
    expect(effectsById.get("weapon.staff-of-homa.hp-sourced-flat-attack")).toEqual({
      activation: "automatic",
      id: "weapon.staff-of-homa.hp-sourced-flat-attack",
      label: "护摩之杖 · 生命值上限转固定攻击力",
      source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
      target: "finalHpToFlatAttack",
      value: { kind: "refinement_table", values: [0.008, 0.01, 0.012, 0.014, 0.016] }
    })
    expect(effectsById.get("weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack")).toEqual({
      activation: "active",
      id: "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack",
      label: "护摩之杖 · 当前生命值低于50%时的额外固定攻击力",
      source: { holder: "primary", kind: "weapon", weaponId: "StaffOfHoma" },
      target: "finalHpToFlatAttack",
      value: { kind: "refinement_table", values: [0.01, 0.012, 0.014, 0.016, 0.018] }
    })
  })

  it("offers only the matching Archaic Petra crystallize snapshot for the selected elemental action", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const scenarioEffects = listActiveScenarioEffectOptionsForAction(pyronado, "polearm")

    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.archaic-petra.4pc.crystallize.pyro-damage-bonus",
          source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "ArchaicPetra" }
        })
      ])
    )
    expect(scenarioEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "artifact.archaic-petra.4pc.crystallize.hydro-damage-bonus" })])
    )
  })

  it("offers only the matching Scroll of the Hero of Cinder City reaction-element snapshots", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const scenarioEffects = listActiveScenarioEffectOptionsForAction(pyronado, "polearm")
    const standardEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus"
    const nightsoulEffectId = "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
    const standardEffect = listCombatActionEffects().find((effect) => effect.id === standardEffectId)
    const nightsoulEffect = listCombatActionEffects().find((effect) => effect.id === nightsoulEffectId)

    expect(standardEffect).toEqual({
      activation: "active",
      exclusivity: { group: "scroll-of-the-hero-of-cinder-city-reaction-element-pyro", variant: "standard" },
      id: standardEffectId,
      label: "烬城勇者绘卷 · 火元素关联反应已触发（触发者未处于夜魂加持）",
      source: {
        holder: "party_member",
        kind: "artifact_set",
        minimumPieces: 4,
        setId: "ScrollOfTheHeroOfCinderCity"
      },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.12 }
    })
    expect(nightsoulEffect).toEqual(
      expect.objectContaining({
        exclusivity: { group: "scroll-of-the-hero-of-cinder-city-reaction-element-pyro", variant: "nightsoul" },
        value: { kind: "fixed", value: 0.4 }
      })
    )
    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: standardEffectId }),
        expect.objectContaining({ id: nightsoulEffectId })
      ])
    )
    expect(scenarioEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.standard.damage-bonus"
        })
      ])
    )
  })

  it("offers Celestial Gift's explicit matching team-buff snapshots with their mutually exclusive values", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const scenarioEffects = listActiveScenarioEffectOptionsForAction(pyronado, "polearm")
    const celestialGuidanceEffectId = "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus"
    const mortalHymnEffectId = "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
    const hydroEffectId = "artifact.celestial-gift.4pc.celestial-guidance.hydro.damage-bonus"
    const celestialGuidanceEffect = listCombatActionEffects().find((effect) => effect.id === celestialGuidanceEffectId)
    const mortalHymnEffect = listCombatActionEffects().find((effect) => effect.id === mortalHymnEffectId)

    expect(celestialGuidanceEffect).toEqual({
      activation: "active",
      exclusivity: { group: "celestial-gift-4pc-pyro-damage-bonus", variant: "celestial-guidance" },
      id: celestialGuidanceEffectId,
      label: "天之美赐 · 天光之引（已完成魔女的课业，装备者为火元素；施放元素战技后20秒内）",
      source: {
        holder: "party_member",
        kind: "artifact_set",
        minimumPieces: 4,
        setId: "CelestialGift"
      },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: CELESTIAL_GIFT_CELESTIAL_GUIDANCE_DAMAGE_BONUS }
    })
    expect(mortalHymnEffect).toEqual({
      activation: "active",
      condition: { kind: "hexerei_secret_rite" },
      exclusivity: { group: "celestial-gift-4pc-pyro-damage-bonus", variant: "mortal-hymn" },
      id: mortalHymnEffectId,
      label:
        "天之美赐 · 凡世颂歌（已完成魔女的课业且队伍拥有魔导·秘仪，装备者或当前前台为火元素；施放元素战技后20秒内）",
      source: {
        holder: "party_member",
        kind: "artifact_set",
        minimumPieces: 4,
        setId: "CelestialGift"
      },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: CELESTIAL_GIFT_MORTAL_HYMN_DAMAGE_BONUS }
    })
    expect(scenarioEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: celestialGuidanceEffectId }),
        expect.objectContaining({ id: mortalHymnEffectId })
      ])
    )
    expect(scenarioEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: hydroEffectId })]))
  })

  it("keeps every positive or excluded action filter bound to a declared action without contradictory membership", () => {
    for (const effect of listCombatActionEffects()) {
      const targetFilter = effect.targetFilter
      if (!targetFilter) continue
      const includedActionIds = targetFilter.actionIds ?? []
      const excludedActionIds = targetFilter.excludedActionIds ?? []
      expect(includedActionIds.some((actionId) => excludedActionIds.includes(actionId))).toBe(false)
      for (const actionId of [...includedActionIds, ...excludedActionIds]) {
        expect(getCombatActionDefinition(actionId)).toBeDefined()
      }
    }
  })

  it("declares source-gated constellation snapshots with their exact current-action values", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const expectedEffects = [
      {
        id: "xiangling.pyronado.c6.pyro_damage_bonus",
        label: "旋火轮持续期间 · C6 火元素伤害加成",
        source: { characterId: "Xiangling", kind: "character", minimumSourceConstellation: 6 },
        target: "damageBonus",
        targetFilter: {
          elements: ["pyro"],
          excludedActionIds: ["xiangling.burst.pyronado.reverse_vaporize"]
        },
        value: { kind: "fixed", value: 0.15 }
      },
      {
        id: "raiden.constellation.4.pledge_of_propriety.attack_percent",
        label: "梦想一心结束后 · C4 其他队友攻击力提升",
        source: { characterId: "RaidenShogun", kind: "character", minimumSourceConstellation: 4 },
        target: "attackPercent",
        targetFilter: { recipientSourceRelation: "not_source" },
        value: { kind: "fixed", value: 0.3 }
      },
      {
        id: "beidou.stormbreaker.c6.electro_resistance_shred",
        label: "斫雷持续期间 · C6 雷元素抗性降低",
        source: { characterId: "Beidou", kind: "character", minimumSourceConstellation: 6 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["electro"] },
        value: { kind: "fixed", value: 0.15 }
      },
      {
        id: "ganyu.frostflake_arrow.c1.cryo_resistance_shred",
        label: "霜华矢及霜华绽发命中后 · C1 冰元素抗性降低（6秒）",
        source: { characterId: "Ganyu", kind: "character", minimumSourceConstellation: 1 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["cryo"] },
        value: { kind: "fixed", value: 0.15 }
      },
      {
        id: "xingqiu.raincutter.c2.hydro_resistance_shred",
        label: "古华剑·裁雨留虹的剑雨命中后 · C2 水元素抗性降低",
        source: { characterId: "Xingqiu", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["hydro"] },
        value: { kind: "fixed", value: 0.15 }
      },
      {
        id: "rosaria.ravaging_confession.c6.physical_resistance_shred",
        label: "终命的圣礼命中后 · C6 物理抗性降低（10秒）",
        source: { characterId: "Rosaria", kind: "character", minimumSourceConstellation: 6 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["physical"] },
        value: { kind: "fixed", value: 0.2 }
      },
      {
        id: "venti.skyward_sonnet.c2.anemo_resistance_shred",
        label: "高天之歌命中后 · C2 风元素抗性降低（10秒，基础效果）",
        source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["anemo"] },
        value: { kind: "fixed", value: 0.12 }
      },
      {
        id: "venti.skyward_sonnet.c2.physical_resistance_shred",
        label: "高天之歌命中后 · C2 物理抗性降低（10秒，基础效果）",
        source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["physical"] },
        value: { kind: "fixed", value: 0.12 }
      },
      {
        id: "venti.windriders.c6.anemo_resistance_shred",
        label: "风神之诗的暴风之眼造成伤害后 · C6 风元素抗性降低（10秒）",
        source: { characterId: "Venti", kind: "character", minimumSourceConstellation: 6 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["anemo"] },
        value: { kind: "fixed", value: 0.2 }
      },
      ...(["cryo", "electro", "hydro", "pyro"] as const).map((element) => ({
        id: `venti.windriders.c6.${element}_resistance_shred`,
        label: `风神之诗的暴风之眼造成伤害后 · C6 ${
          { cryo: "冰", electro: "雷", hydro: "水", pyro: "火" }[element]
        }元素转化抗性降低（10秒）`,
        source: { characterId: "Venti", kind: "character" as const, minimumSourceConstellation: 6 },
        target: "enemyResistanceReduction" as const,
        exclusivity: { group: "venti-windriders-c6-absorbed-element", variant: element },
        targetFilter: { elements: [element] },
        value: { kind: "fixed" as const, value: 0.2 }
      })),
      {
        id: "emilie.fragrance.c2.dendro_resistance_shred",
        label: "香韵命中后 · C2 草元素抗性降低（10秒）",
        source: { characterId: "Emilie", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["dendro"] },
        value: { kind: "fixed", value: 0.3 }
      },
      {
        id: "kinich.scalespiker_cannon.c2.dendro_resistance_shred",
        label: "迴猎贯鳞炮命中后 · C2 草元素抗性降低（6秒）",
        source: { characterId: "Kinich", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyResistanceReduction",
        targetFilter: { elements: ["dendro"] },
        value: { kind: "fixed", value: 0.3 }
      },
      {
        id: "navia.burst.c4.geo_resistance_shred",
        label: "如同晴天般的霰落命中后 · C4 岩元素抗性降低（8秒）",
        source: { characterId: "Navia", kind: "character", minimumSourceConstellation: 4 },
        target: "enemyResistanceReduction",
        targetFilter: {
          elements: ["geo"],
          excludedActionIds: ["navia.burst.as_the_sunlit_skys_singing_salute.initial_aoe"]
        },
        value: { kind: "fixed", value: 0.2 }
      },
      {
        id: "kamisato_ayaka.constellation.4.soumetsu.enemy_defense_reduction",
        label: "目标减防已生效：神里流·霜灭命中后 · C4 防御力降低（30%，6秒；不作用于触发命中）",
        source: { characterId: "KamisatoAyaka", kind: "character", minimumSourceConstellation: 4 },
        target: "enemyDefenseReduction",
        value: { kind: "fixed", value: 0.3 }
      },
      {
        id: "klee.constellation.2.sparkling_burst.enemy_defense_reduction",
        label: "目标减防已生效：蹦蹦炸弹诡雷爆炸命中后 · C2 防御力降低（23%，10秒；不作用于触发命中）",
        source: { characterId: "Klee", kind: "character", minimumSourceConstellation: 2 },
        target: "enemyDefenseReduction",
        value: { kind: "fixed", value: 0.23 }
      },
      {
        id: "razor.constellation.4.claw_and_thunder_press.enemy_defense_reduction",
        label: "目标减防已生效：利爪与苍雷点按命中后 · C4 防御力降低（15%，7秒；不作用于触发命中）",
        source: { characterId: "Razor", kind: "character", minimumSourceConstellation: 4 },
        target: "enemyDefenseReduction",
        value: { kind: "fixed", value: 0.15 }
      }
    ]

    expect(expectedEffects).toHaveLength(19)
    for (const expectedEffect of expectedEffects) {
      expect(effectsById.get(expectedEffect.id)).toEqual(expect.objectContaining(expectedEffect))
    }
  })

  it("declares Kuki Shinobu C6's low-HP mastery as a self-owned single-Hyperbloom snapshot", () => {
    const hyperbloom = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const skillDamage = requireAction("kuki_shinobu.skill.sanctifying_ring.skill_damage")
    const effectId = "kuki_shinobu.constellation.6.to_ward_weakness.low_hp.elemental_mastery"
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "割舍软弱之心 · C6 生命值低于25%时的元素精通",
      source: { characterId: "KukiShinobu", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      targetFilter: { actionIds: [hyperbloom.id], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 150 }
    })
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, hyperbloom)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, skillDamage)).toBe(false)
    expect(listActiveCombatActionEffectOptionsForAction(hyperbloom)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          recipientSourceRelation: "source",
          source: { characterId: "KukiShinobu", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )
  })

  it("gives every selectable weapon and artifact set an explicit coverage status", () => {
    const effects = listCombatActionEffects()
    const typedEquipmentEffects = [
      ...effects.filter((effect) => effect.source.kind !== "character"),
      ...listHealingEquipmentEffects(),
      ...listRecipientEquipmentEffects()
    ]
    const effectsById = new Map(typedEquipmentEffects.map((effect) => [effect.id, effect]))
    const coverage = listCombatEquipmentEffectCoverage()
    const implementedEffectIds = new Set(
      coverage.flatMap((entry) => (entry.status === "implemented" ? entry.effectIds : []))
    )
    const allImplementedEffectIds = new Set(
      equipmentCoverageLedger.flatMap((entry) =>
        entry.clauses.flatMap((clause) => (clause.status === "implemented" ? clause.effectIds : []))
      )
    )
    const typedEquipmentEffectIds = new Set(typedEquipmentEffects.map((effect) => effect.id))
    const weaponIds = new Set(
      coverage.flatMap((entry) => (entry.source.kind === "weapon" ? [entry.source.weaponId] : []))
    )
    const artifactSetIds = new Set(
      coverage.flatMap((entry) => (entry.source.kind === "artifact_set" ? [entry.source.setId] : []))
    )

    for (const weapon of supportedWeapons) {
      expect(weaponIds.has(weapon.weaponId)).toBe(true)
    }
    expect(artifactSetIds).toEqual(new Set(supportedArtifactSets.map((artifactSet) => artifactSet.setId)))
    expect([...implementedEffectIds].every((effectId) => typedEquipmentEffectIds.has(effectId))).toBe(true)
    expect(allImplementedEffectIds).toEqual(typedEquipmentEffectIds)
    for (const entry of coverage) {
      if (entry.status === "implemented") {
        expect(entry.effectIds.length).toBeGreaterThan(0)
        for (const effectId of entry.effectIds) {
          const effect = effectsById.get(effectId)

          expect(effect).toBeDefined()
          expect(effect?.source).toMatchObject(entry.source)
        }
        continue
      }
      expect(entry.reason.length).toBeGreaterThan(0)
    }
  })

  it("limits Yae Miko's C6 defense ignore to the declared level-three Sesshou Sakura bolt", () => {
    const levelOneBolt = requireAction("yae_miko.skill.yakan_evocation.sesshou_sakura.level_one_bolt")
    const levelThreeBolt = requireAction("yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt")
    const normalAttack = requireAction("yae_miko.normal.auto.first_hit")
    const effect = listCombatActionEffects().find(
      (entry) => entry.id === "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore"
    )

    expect(effect).toEqual(
      expect.objectContaining({
        activation: "automatic",
        source: { characterId: "YaeMiko", kind: "character", minimumSourceConstellation: 6 },
        target: "enemyDefenseIgnore",
        targetFilter: { actionIds: [levelThreeBolt.id] },
        value: { kind: "fixed", value: 0.6 }
      })
    )
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, levelThreeBolt)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, levelOneBolt)).toBe(false)
    expect(isCombatActionEffectApplicable(effect!, normalAttack)).toBe(false)
  })

  it("projects active snapshots with a typed source requirement", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const guoba = requireAction("xiangling.skill.guoba.single_flame_breath")
    const engulfingPostBurst = listCombatActionEffects().find(
      (effect) => effect.id === "weapon.engulfing-lightning.post-burst-energy-recharge"
    )

    expect(listActiveCombatActionEffectOptionsForAction(pyronado)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "xiangling.guoba.chili.attack",
          source: { characterId: "Xiangling", kind: "character" }
        }),
        expect.objectContaining({
          id: "artifact.noblesse-oblige.4pc-attack",
          source: {
            holder: "party_member",
            kind: "artifact_set",
            minimumPieces: 4,
            setId: "NoblesseOblige"
          }
        }),
        expect.objectContaining({
          id: "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent",
          recipientSourceRelation: "not_source"
        })
      ])
    )
    expect(listActiveCombatActionEffectOptionsForAction(pyronado)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge" })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(guoba)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge" })])
    )
    expect(engulfingPostBurst).toBeDefined()
    expect(isCombatActionEffectDeterministicallyActive(engulfingPostBurst!, pyronado)).toBe(true)
    expect(isCombatActionEffectDeterministicallyActive(engulfingPostBurst!, guoba)).toBe(false)
  })

  it("projects Skyward Spine's cooldown-ready Vacuum Blade only for normal and charged attacks", () => {
    const normalAttack = requireAction("xiangling.normal.auto.first_hit")
    const chargedAttack = requireAction(
      "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )
    const plungeAttack = requireAction("xiao.burst.bane_of_all_evil.high_plunge")

    expect(listActiveCombatActionEffectOptionsForAction(normalAttack)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.skyward-spine.vacuum-blade" })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(chargedAttack)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.skyward-spine.vacuum-blade" })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(plungeAttack)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.skyward-spine.vacuum-blade" })])
    )
  })

  it("declares Messenger's weak-point snapshot as a charged-only guaranteed-critical physical event", () => {
    const chargedAttack = requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize")
    const normalAttack = requireAction("amber.normal.auto.first_hit")
    const effect = listCombatActionEffects().find(
      (entry) => entry.id === "weapon.messenger.weak-point-guaranteed-crit.additional-damage"
    )

    expect(effect).toEqual({
      activation: "active",
      id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage",
      label: "信使 · 本次瞄准射击命中要害且冷却已就绪，触发必定暴击的物理附加伤害",
      source: { holder: "primary", kind: "weapon", weaponId: "Messenger" },
      target: "additionalDamageEvent",
      targetFilter: { attackKinds: ["charged"] },
      value: {
        canCrit: true,
        coefficient: { kind: "refinement_table", values: [1, 1.25, 1.5, 1.75, 2] },
        critPolicy: "guaranteed",
        element: "physical",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack"
      }
    })
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, chargedAttack)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, normalAttack)).toBe(false)
    expect(listActiveCombatActionEffectOptionsForAction(chargedAttack)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage" })
      ])
    )
    expect(listActiveCombatActionEffectOptionsForAction(normalAttack)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.messenger.weak-point-guaranteed-crit.additional-damage" })
      ])
    )
  })

  it("declares Flowing Purity's mutually exclusive complete-thousand Bond-of-Life clear snapshots", () => {
    const pyroAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const effectId = "weapon.flowing-purity.bond-of-life-cleared.6-thousand-points.all-element-damage-bonus"
    const effect = listCombatActionEffects().find((entry) => entry.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      exclusivity: { group: "flowing-purity-bond-of-life-cleared", variant: "6-thousand-points" },
      id: effectId,
      label: "纯水流华 · 清除生命之契后已获得6个完整千点（6000点）的额外所有元素伤害",
      source: { kind: "weapon", weaponId: "FlowingPurity" },
      target: "damageBonus",
      targetFilter: { elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] },
      value: { kind: "refinement_table", values: [0.12, 0.15, 0.18, 0.21, 0.24] }
    })
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, pyroAction)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, physicalAction)).toBe(false)
    expect(listActiveCombatActionEffectOptionsForAction(pyroAction)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(physicalAction)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })

  it("declares Echoes of an Offering's selected Valley Rite as a normal same-hit term", () => {
    const normalAttack = requireAction("tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit")
    const skill = requireAction("tartaglia.skill.foul_legacy_raging_tide.stance_activation")
    const effectId = "artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"
    const effect = listCombatActionEffects().find((entry) => entry.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "来歆余响 · 四件套（本次普通攻击触发幽谷祝祀）",
      source: { kind: "artifact_set", minimumPieces: 4, setId: "EchoesOfAnOffering" },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { attackKinds: ["normal"] },
      value: {
        coefficient: { kind: "fixed", value: 0.7 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    })
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, normalAttack)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, skill)).toBe(false)
    expect(listActiveCombatActionEffectOptionsForAction(normalAttack)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(skill)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })

  it("limits Daybreak Chronicles' normal-attack Radiance to normal attacks, not charged attacks", () => {
    const normalAttack = requireAction("amber.normal.auto.first_hit")
    const chargedAttack = requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize")
    const skillSlotNormalAttack = requireAction("tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit")
    const effect = listCombatActionEffects().find(
      (entry) => entry.id === "weapon.the-daybreak-chronicles.radiance.normal.1-stack.damage-bonus"
    )

    expect(effect).toEqual(expect.objectContaining({ targetFilter: { attackKinds: ["normal"] } }))
    expect(effect).toBeDefined()
    expect(isCombatActionEffectApplicable(effect!, normalAttack)).toBe(true)
    expect(isCombatActionEffectApplicable(effect!, chargedAttack)).toBe(false)
    expect(isCombatActionEffectApplicable(effect!, skillSlotNormalAttack)).toBe(true)
  })

  it("filters Gladiator's Finale and Wanderer's Troupe four-piece bonuses by recipient weapon type", () => {
    const polearmNormal = requireAction("xiangling.normal.auto.first_hit")
    const catalystCharged = requireAction("ningguang.normal.charged_attack.with_star_jades")
    const gladiatorsFinale = listCombatActionEffects().find(
      (effect) => effect.id === "artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus"
    )
    const wanderersTroupe = listCombatActionEffects().find(
      (effect) => effect.id === "artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus"
    )

    expect(gladiatorsFinale).toEqual(
      expect.objectContaining({
        activation: "automatic",
        targetFilter: { attackKinds: ["normal"], recipientWeaponTypes: ["sword", "claymore", "polearm"] },
        value: { kind: "fixed", value: 0.35 }
      })
    )
    expect(wanderersTroupe).toEqual(
      expect.objectContaining({
        activation: "automatic",
        targetFilter: { attackKinds: ["charged"], recipientWeaponTypes: ["bow", "catalyst"] },
        value: { kind: "fixed", value: 0.35 }
      })
    )
    expect(isCombatActionEffectApplicable(gladiatorsFinale!, polearmNormal, [polearmNormal.element], "polearm")).toBe(
      true
    )
    expect(isCombatActionEffectApplicable(gladiatorsFinale!, polearmNormal, [polearmNormal.element], "catalyst")).toBe(
      false
    )
    expect(
      isCombatActionEffectApplicable(wanderersTroupe!, catalystCharged, [catalystCharged.element], "catalyst")
    ).toBe(true)
    expect(isCombatActionEffectApplicable(wanderersTroupe!, catalystCharged, [catalystCharged.element], "polearm")).toBe(
      false
    )
  })

  it("projects source-owned normal-attack overrides alongside action snapshots for eligible weapon families", () => {
    const bennettNormal = requireAction("bennett.normal.auto.first_hit")
    const bennettBurst = requireAction("bennett.burst.initial_hit")
    const options = listActiveScenarioEffectOptionsForAction(bennettNormal, "sword")

    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bennett.constellation.6.pyro_infusion",
          requiredActiveEffectIds: ["bennett.burst.field"],
          source: { characterId: "Bennett", kind: "character", minimumSourceConstellation: 6 }
        })
      ])
    )
    expect(options.filter((option) => option.id === "bennett.constellation.6.pyro_infusion")).toHaveLength(1)
    expect(listActiveScenarioEffectOptionsForAction(bennettNormal, "sword")).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "chongyun.skill.chonghuas_frost_field" })])
    )
    expect(listActiveScenarioEffectOptionsForAction(bennettNormal, "bow")).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "chongyun.skill.chonghuas_frost_field" })])
    )
    expect(listActiveScenarioEffectOptionsForAction(bennettBurst, "sword")).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "chongyun.skill.chonghuas_frost_field" })])
    )
  })

  it("matches element-filtered effects against an override's final element", () => {
    const bennettNormal = requireAction("bennett.normal.auto.first_hit")
    const crimsonWitch = listCombatActionEffects().find(
      (effect) => effect.id === "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus"
    )

    expect(crimsonWitch).toBeDefined()
    expect(isCombatActionEffectApplicable(crimsonWitch!, bennettNormal)).toBe(false)
    expect(isCombatActionEffectApplicable(crimsonWitch!, bennettNormal, ["pyro"])).toBe(true)
  })

  it("declares Deathmatch's two-or-more-enemies defense bonus alongside its attack bonus", () => {
    const effects = listCombatActionEffects()

    expect(effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          condition: { kind: "enemy_count", minimum: 2 },
          id: "weapon.deathmatch.multi-target.attack",
          target: "attackPercent",
          value: { kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.28, 0.32] }
        }),
        expect.objectContaining({
          condition: { kind: "enemy_count", minimum: 2 },
          id: "weapon.deathmatch.multi-target.defense",
          target: "defensePercent",
          value: { kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.28, 0.32] }
        })
      ])
    )
  })

  it("declares Absolution's selected Bond-of-Life increase snapshots without inferring their trigger", () => {
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")

    expect(effectsById.get("weapon.absolution.crit-damage")).toEqual({
      activation: "automatic",
      id: "weapon.absolution.crit-damage",
      label: "赦罪 · 暴击伤害",
      source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
      target: "critDamage",
      value: { kind: "refinement_table", values: [0.2, 0.25, 0.3, 0.35, 0.4] }
    })
    expect([
      effectsById.get("weapon.absolution.bond-of-life-increase.1-stack.damage-bonus"),
      effectsById.get("weapon.absolution.bond-of-life-increase.2-stack.damage-bonus"),
      effectsById.get("weapon.absolution.bond-of-life-increase.3-stack.damage-bonus")
    ]).toEqual([
      {
        activation: "active",
        exclusivity: { group: "absolution-bond-of-life-increase", variant: "1-stack" },
        id: "weapon.absolution.bond-of-life-increase.1-stack.damage-bonus",
        label: "赦罪 · 本次命中前已持有的1层生命之契数值增加伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
        target: "damageBonus",
        value: { kind: "refinement_table", values: [0.16, 0.2, 0.24, 0.28, 0.32] }
      },
      {
        activation: "active",
        exclusivity: { group: "absolution-bond-of-life-increase", variant: "2-stack" },
        id: "weapon.absolution.bond-of-life-increase.2-stack.damage-bonus",
        label: "赦罪 · 本次命中前已持有的2层生命之契数值增加伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
        target: "damageBonus",
        value: { kind: "refinement_table", values: [0.32, 0.4, 0.48, 0.56, 0.64] }
      },
      {
        activation: "active",
        exclusivity: { group: "absolution-bond-of-life-increase", variant: "3-stack" },
        id: "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus",
        label: "赦罪 · 本次命中前已持有的3层生命之契数值增加伤害提升（6秒内）",
        source: { holder: "primary", kind: "weapon", weaponId: "Absolution" },
        target: "damageBonus",
        value: { kind: "refinement_table", values: [0.48, 0.6, 0.72, 0.84, 0.96] }
      }
    ])
    expect(listActiveCombatActionEffectsForAction(pyronado)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.absolution.bond-of-life-increase.1-stack.damage-bonus" }),
        expect.objectContaining({ id: "weapon.absolution.bond-of-life-increase.2-stack.damage-bonus" }),
        expect.objectContaining({ id: "weapon.absolution.bond-of-life-increase.3-stack.damage-bonus" })
      ])
    )
  })

  it("declares Peak Patrol Song's full-stack party snapshot with source-only self effects", () => {
    const xilonenDash = requireAction("xilonen.skill.yohuals_scratch.dash")
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const options = listActiveCombatActionEffectOptionsForAction(xilonenDash)
    const partyEffectId = "weapon.peak-patrol-song.2-stack.source-final-defense-to-party-all-element-damage-bonus"

    expect(effectsById.get(partyEffectId)).toEqual({
      activation: "active",
      id: partyEffectId,
      label: "岩峰巡歌 · 2层荣花之歌触发的队伍所有元素伤害",
      source: { holder: "party_member", kind: "weapon", weaponId: "PeakPatrolSong" },
      target: "sourceFinalDefenseToDamageBonus",
      targetFilter: { elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] },
      value: {
        kind: "source_final_defense",
        maximumValue: { kind: "refinement_table", values: [0.256, 0.32, 0.384, 0.448, 0.512] },
        multiplier: { kind: "refinement_table", values: [0.00008, 0.0001, 0.00012, 0.00014, 0.00016] },
        sourceDefenseSnapshotEffectIds: [
          "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent",
          "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus"
        ]
      }
    })
    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.peak-patrol-song.ode-to-flowers.2-stack.defense-percent",
          recipientSourceRelation: "source"
        }),
        expect.objectContaining({
          id: "weapon.peak-patrol-song.ode-to-flowers.2-stack.all-element-damage-bonus",
          recipientSourceRelation: "source"
        }),
        expect.objectContaining({ id: partyEffectId })
      ])
    )
  })

  it("declares Angelos Heptades' mutually exclusive current-on-field and Magic Secret snapshots", () => {
    const pyronado = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const currentOnFieldEffectId = "weapon.angelos-heptades.after-shield.source-final-attack-to-current-on-field-damage-bonus"
    const magicSecretOffFieldEffectId =
      "weapon.angelos-heptades.magic-secret.after-shield.source-final-attack-to-off-field-magic-recipient-damage-bonus"

    expect([effectsById.get(currentOnFieldEffectId), effectsById.get(magicSecretOffFieldEffectId)]).toEqual([
      {
        activation: "active",
        exclusivity: { group: "angelos-heptades-guiding-light-recipient-position", variant: "current-on-field" },
        id: currentOnFieldEffectId,
        label: "尘光七谕 · 创造护盾后的先导之光（当前场上角色伤害）",
        source: { holder: "party_member", kind: "weapon", weaponId: "AngelosHeptades" },
        target: "sourceFinalAttackToDamageBonus",
        value: {
          kind: "source_final_attack",
          maximumValue: { kind: "refinement_table", values: [0.26, 0.34, 0.42, 0.5, 0.58] },
          multiplier: { kind: "refinement_table", values: [0.0001, 0.00013, 0.00016, 0.00019, 0.00022] }
        }
      },
      {
        activation: "active",
        condition: { kind: "hexerei_secret_rite" },
        exclusivity: { group: "angelos-heptades-guiding-light-recipient-position", variant: "magic-secret-off-field" },
        id: magicSecretOffFieldEffectId,
        label: "尘光七谕 · 魔导·秘仪下后台魔导角色的先导之光（50%伤害）",
        source: { holder: "party_member", kind: "weapon", weaponId: "AngelosHeptades" },
        target: "sourceFinalAttackToDamageBonus",
        value: {
          kind: "source_final_attack",
          maximumValue: { kind: "refinement_table", values: [0.13, 0.17, 0.21, 0.25, 0.29] },
          multiplier: { kind: "refinement_table", values: [0.00005, 0.000065, 0.00008, 0.000095, 0.00011] }
        }
      }
    ])
    expect(listActiveCombatActionEffectOptionsForAction(pyronado)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: currentOnFieldEffectId }),
        expect.objectContaining({ id: magicSecretOffFieldEffectId })
      ])
    )
  })

  it("limits the PlayStation fixed-attack snapshots to Aloy and the Traveler", () => {
    const aloyBurst = requireAction("aloy.burst.prophecies_of_dawn.explosion")
    const ganyuSkill = requireAction("ganyu.skill.trail_of_the_qilin.skill_damage")
    const travelerSkill = requireAction("traveler.anemo.skill.palm_vortex.initial_gust")
    const bennettSkill = requireAction("bennett.skill.passion_overload.press")
    const effectsById = new Map(listCombatActionEffects().map((effect) => [effect.id, effect]))
    const predatorEffectId = "weapon.predator.playstation.aloy.flat-attack"
    const swordEffectId = "weapon.sword-of-descension.playstation.traveler.flat-attack"
    const predatorFlatAttack = effectsById.get(predatorEffectId)
    const swordFlatAttack = effectsById.get(swordEffectId)

    expect(predatorFlatAttack).toEqual({
      activation: "active",
      id: predatorEffectId,
      label: "掠食者 · PlayStation Network 被动已生效且埃洛伊装备时的固定攻击力",
      source: { kind: "weapon", weaponId: "Predator" },
      target: "flatAttack",
      targetFilter: { recipientCharacterIds: ["Aloy"] },
      value: { kind: "fixed", value: 66 }
    })
    expect(swordFlatAttack).toEqual({
      activation: "active",
      id: swordEffectId,
      label: "降临之剑 · PlayStation Network 被动已生效且旅行者装备时的固定攻击力",
      source: { kind: "weapon", weaponId: "SwordOfDescension" },
      target: "flatAttack",
      targetFilter: { recipientCharacterIds: ["Traveler"] },
      value: { kind: "fixed", value: 66 }
    })
    expect(isCombatActionEffectApplicable(predatorFlatAttack!, aloyBurst)).toBe(true)
    expect(isCombatActionEffectApplicable(predatorFlatAttack!, ganyuSkill)).toBe(false)
    expect(isCombatActionEffectApplicable(swordFlatAttack!, travelerSkill)).toBe(true)
    expect(isCombatActionEffectApplicable(swordFlatAttack!, bennettSkill)).toBe(false)
    expect(listActiveCombatActionEffectOptionsForAction(aloyBurst)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: predatorEffectId })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(ganyuSkill)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: predatorEffectId })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(travelerSkill)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: swordEffectId })])
    )
    expect(listActiveCombatActionEffectOptionsForAction(bennettSkill)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: swordEffectId })])
    )
  })

  it("declares Finale of the Deep's selected capped Bond-of-Life attack snapshot", () => {
    const effectId = "weapon.finale-of-the-deep.bond-of-life-cleared.at-cap.flat-attack"
    const effect = listCombatActionEffects().find((candidate) => candidate.id === effectId)

    expect(effect).toEqual({
      activation: "active",
      id: effectId,
      label: "海渊终曲 · 清除生命之契后攻击力达到上限（15秒内）",
      source: { kind: "weapon", weaponId: "FinaleOfTheDeep" },
      target: "flatAttack",
      value: { kind: "refinement_table", values: [150, 188, 225, 263, 300] }
    })
  })
})
