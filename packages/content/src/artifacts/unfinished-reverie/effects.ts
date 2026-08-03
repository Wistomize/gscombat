import type { CombatActionEffect } from "../../combat/types.js"

export const UNFINISHED_REVERIE_ATTACK_PERCENT = 0.18
export const UNFINISHED_REVERIE_FULL_DAMAGE_BONUS = 0.5
export const UNFINISHED_REVERIE_POST_BURNING_GRACE_EXPIRY_STATES = [
  { damageBonus: 0.4, secondAfterGrace: 1 },
  { damageBonus: 0.3, secondAfterGrace: 2 },
  { damageBonus: 0.2, secondAfterGrace: 3 },
  { damageBonus: 0.1, secondAfterGrace: 4 }
] as const

function createPostBurningGraceExpiryEffect(
  state: (typeof UNFINISHED_REVERIE_POST_BURNING_GRACE_EXPIRY_STATES)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: {
      group: "unfinished-reverie-damage-bonus-state",
      variant: `post-burning-grace-expired-${state.secondAfterGrace}-second`
    },
    id: `artifact.unfinished-reverie.4pc.post-burning.grace-expired.${state.secondAfterGrace}-second.damage-bonus`,
    label: `未竟的遐思 · 四件套（附近无燃烧敌人超过6秒后的第${state.secondAfterGrace}秒：全伤害+${state.damageBonus * 100}%）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "UnfinishedReverie" },
    target: "damageBonus",
    value: { kind: "fixed", value: state.damageBonus }
  }
}

/** Typed two-piece and current-action visible state snapshots of Unfinished Reverie. */
export const unfinishedReverieCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.unfinished-reverie.2pc.attack-percent",
    label: "未竟的遐思 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "UnfinishedReverie" },
    target: "attackPercent",
    value: { kind: "fixed", value: UNFINISHED_REVERIE_ATTACK_PERCENT }
  },
  ...UNFINISHED_REVERIE_POST_BURNING_GRACE_EXPIRY_STATES.map(createPostBurningGraceExpiryEffect),
  {
    activation: "active",
    exclusivity: { group: "unfinished-reverie-damage-bonus-state", variant: "full" },
    id: "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus",
    label: "未竟的遐思 · 四件套（脱战3秒、附近存在燃烧敌人或无燃烧敌人未超过6秒：全伤害+50%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "UnfinishedReverie" },
    target: "damageBonus",
    value: { kind: "fixed", value: UNFINISHED_REVERIE_FULL_DAMAGE_BONUS }
  }
]
