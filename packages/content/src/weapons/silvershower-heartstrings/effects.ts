import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

const skill = prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "本人施放战技取得疗护")
const healing: CombatEffectLifecycle = { kind: "any_of", alternatives: [
  prepareWeaponEffect({ kind: "healing", provider: "source", recipient: "source" }, "本人进行治疗取得疗护"),
  prepareWeaponEffect({ kind: "healing", provider: "source", recipient: "recipient", recipientOtherThanSource: true }, "本人治疗队友取得疗护")
] }
const bond = prepareWeaponEffect({ kind: "bond_of_life_gain", provider: "party", recipient: "source" }, "确实作用于装备者的生命之契增加取得疗护")
const one: CombatEffectLifecycle = { kind: "any_of", alternatives: [skill, healing, bond] }
const two: CombatEffectLifecycle = { kind: "any_of", alternatives: [
  { kind: "all_of", alternatives: [skill, healing] },
  { kind: "all_of", alternatives: [skill, bond] },
  { kind: "all_of", alternatives: [healing, bond] }
] }
const three: CombatEffectLifecycle = { kind: "all_of", alternatives: [skill, healing, bond] }

export const SILVERSHOWER_HEARTSTRINGS_ONE_STACK_HP_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const SILVERSHOWER_HEARTSTRINGS_TWO_STACK_HP_PERCENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const
export const SILVERSHOWER_HEARTSTRINGS_THREE_STACK_HP_PERCENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const
export const SILVERSHOWER_HEARTSTRINGS_THREE_STACK_BURST_CRIT_RATE = [0.28, 0.35, 0.42, 0.49, 0.56] as const

/** Typed selected Bond of Life stack contributions of Silvershower Heartstrings. */
export const silvershowerHeartstringsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: one,
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "one-stack", automaticPriority: 1 },
    id: "weapon.silvershower-heartstrings.bond.1-stack.hp-percent",
    label: "白雨心弦 · 一层疗护生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_ONE_STACK_HP_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: two,
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "two-stack", automaticPriority: 2 },
    id: "weapon.silvershower-heartstrings.bond.2-stack.hp-percent",
    label: "白雨心弦 · 两层疗护生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_TWO_STACK_HP_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: three,
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "three-stack", automaticPriority: 3 },
    id: "weapon.silvershower-heartstrings.bond.3-stack.hp-percent",
    label: "白雨心弦 · 三层疗护生命值",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_THREE_STACK_HP_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: three,
    selectionMode: "optional",
    exclusivity: { group: "silvershower-heartstrings-bond", variant: "three-stack", automaticPriority: 3 },
    id: "weapon.silvershower-heartstrings.bond.3-stack.burst-crit-rate",
    label: "白雨心弦 · 三层疗护元素爆发暴击率",
    source: { kind: "weapon", weaponId: "SilvershowerHeartstrings" },
    target: "critRate",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: SILVERSHOWER_HEARTSTRINGS_THREE_STACK_BURST_CRIT_RATE }
  }
]
