import type { CombatActionEffect } from "../../combat/types.js"

export const BALLAD_OF_THE_BOUNDLESS_BLUE_NORMAL_DAMAGE_BONUS_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const BALLAD_OF_THE_BOUNDLESS_BLUE_CHARGED_DAMAGE_BONUS_PER_STACK = [0.06, 0.075, 0.09, 0.105, 0.12] as const

const stackCounts = [1, 2, 3] as const

function getStackValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => Number((value * stackCount).toFixed(12)))
}

function createAzureSkiesStackEffect(
  stackCount: (typeof stackCounts)[number],
  attackKind: "normal" | "charged",
  values: readonly number[]
): CombatActionEffect {
  const actionLabel = attackKind === "normal" ? "普通攻击" : "重击"
  return {
    activation: "active",
    exclusivity: { group: "ballad-of-the-boundless-blue-azure-skies", variant: `${stackCount}-stack` },
    id: `weapon.ballad-of-the-boundless-blue.azure-skies.${stackCount}-stack.${attackKind}-damage-bonus`,
    label: `无垠蔚蓝之歌 · ${actionLabel}命中前已持有的${stackCount}层伤害提升（6秒内）`,
    source: { holder: "primary", kind: "weapon", weaponId: "BalladOfTheBoundlessBlue" },
    target: "damageBonus",
    targetFilter: { attackKinds: [attackKind] },
    value: { kind: "refinement_table", values: getStackValues(values, stackCount) }
  }
}

/** Typed selected pre-existing Azure Skies stack contributions of Ballad of the Boundless Blue. */
export const balladOfTheBoundlessBlueCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(
  (stackCount) => [
    createAzureSkiesStackEffect(stackCount, "normal", BALLAD_OF_THE_BOUNDLESS_BLUE_NORMAL_DAMAGE_BONUS_PER_STACK),
    createAzureSkiesStackEffect(stackCount, "charged", BALLAD_OF_THE_BOUNDLESS_BLUE_CHARGED_DAMAGE_BONUS_PER_STACK)
  ]
)
