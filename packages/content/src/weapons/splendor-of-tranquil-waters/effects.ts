import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const SPLENDOR_OF_TRANQUIL_WATERS_SKILL_DAMAGE_BONUS_PER_SELF_HP_CHANGE_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const SPLENDOR_OF_TRANQUIL_WATERS_HP_PERCENT_PER_TEAMMATE_HP_CHANGE_STACK = [0.14, 0.175, 0.21, 0.245, 0.28] as const

const selfHpChangeStackCounts = [0, 1, 2, 3] as const
const teammateHpChangeStackCounts = [0, 1, 2] as const

function getValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => value * stackCount)
}

function createSelfHpChangeEffect(stackCount: (typeof selfHpChangeStackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    weaponChoice: { group: "splendor-of-tranquil-waters-self-hp-change", label: "自身生命变化层数", variant: `${stackCount}-stack`,
      variantLabel: `${stackCount}层`, defaultVariant: "0-stack",
      automaticVariant: { variant: "3-stack", capability: { kind: "hp_loss", provider: "party", recipient: "source" } } },
    exclusivity: { group: "splendor-of-tranquil-waters-self-hp-change", variant: `${stackCount}-stack` },
    id: `weapon.splendor-of-tranquil-waters.self-hp-change.${stackCount}-stack.skill-damage-bonus`,
    label: `静水流涌之辉 · 自身生命值变动后的${stackCount}层元素战技伤害`,
    source: { kind: "weapon", weaponId: "SplendorOfTranquilWaters" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: {
      kind: "refinement_table",
      values: getValues(SPLENDOR_OF_TRANQUIL_WATERS_SKILL_DAMAGE_BONUS_PER_SELF_HP_CHANGE_STACK, stackCount)
    }
  }
}

function createTeammateHpChangeEffect(stackCount: (typeof teammateHpChangeStackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    lifecycle: prepareWeaponEffect({ kind: "damage_hit", provider: "party", recipient: "recipient", recipientOtherThanSource: true }, "至少有一位其他队员，才存在其他队员生命变化"),
    weaponChoice: { group: "splendor-of-tranquil-waters-teammate-hp-change", label: "队友生命变化层数", variant: `${stackCount}-stack`,
      variantLabel: `${stackCount}层`, defaultVariant: "0-stack",
      automaticVariant: { variant: "2-stack", capability: { kind: "hp_loss", provider: "party", recipient: "recipient", recipientOtherThanSource: true } } },
    exclusivity: { group: "splendor-of-tranquil-waters-teammate-hp-change", variant: `${stackCount}-stack` },
    id: `weapon.splendor-of-tranquil-waters.teammate-hp-change.${stackCount}-stack.hp-percent`,
    label: `静水流涌之辉 · 其他队友生命值变动后的${stackCount}层生命值`,
    source: { kind: "weapon", weaponId: "SplendorOfTranquilWaters" },
    target: "hpPercent",
    value: {
      kind: "refinement_table",
      values: getValues(SPLENDOR_OF_TRANQUIL_WATERS_HP_PERCENT_PER_TEAMMATE_HP_CHANGE_STACK, stackCount)
    }
  }
}

/** Typed independent self and teammate health-change stack contributions of Splendor of Tranquil Waters. */
export const splendorOfTranquilWatersCombatActionEffects: readonly CombatActionEffect[] = [
  ...selfHpChangeStackCounts.map(createSelfHpChangeEffect),
  ...teammateHpChangeStackCounts.map(createTeammateHpChangeEffect)
]
