import type { CombatActionEffect } from "../../combat/types.js"

export const FINALE_OF_THE_DEEP_GALLERIES_CRYO_DAMAGE_BONUS = 0.15
export const FINALE_OF_THE_DEEP_GALLERIES_ZERO_ENERGY_DAMAGE_BONUS = 0.6

/** Typed selected zero-energy normal and Burst contributions of Finale of the Deep Galleries. */
export const finaleOfTheDeepGalleriesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.finale-of-the-deep-galleries.2pc.cryo-damage-bonus",
    label: "深廊终曲 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "FinaleOfTheDeepGalleries" },
    target: "damageBonus",
    targetFilter: { elements: ["cryo"] },
    value: { kind: "fixed", value: FINALE_OF_THE_DEEP_GALLERIES_CRYO_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.finale-of-the-deep-galleries.4pc.zero-energy.normal-damage-bonus",
    label: "深廊终曲 · 四件套（元素能量为0时的普通攻击伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "FinaleOfTheDeepGalleries" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "fixed", value: FINALE_OF_THE_DEEP_GALLERIES_ZERO_ENERGY_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.finale-of-the-deep-galleries.4pc.zero-energy.burst-damage-bonus",
    label: "深廊终曲 · 四件套（元素能量为0时的元素爆发伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "FinaleOfTheDeepGalleries" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "fixed", value: FINALE_OF_THE_DEEP_GALLERIES_ZERO_ENERGY_DAMAGE_BONUS }
  }
]
