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
    activation: "automatic",
    lifecycle: { kind: "excluded", reason: "旧脱战/衰减档位仅兼容解析；现按队伍火草资格自动判定" },
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
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { teamElements: ["pyro", "dendro"] },
      explanation: "用户确认：队伍同时有火、草时默认满额；前后台均生效，不推断敌人燃烧状态"
    },
    exclusivity: { group: "unfinished-reverie-damage-bonus-state", variant: "full" },
    id: "artifact.unfinished-reverie.4pc.out-of-combat-nearby-burning-or-post-burning-grace.damage-bonus",
    label: "未竟的遐思 · 四件套（队伍火草准备，增伤 50%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "UnfinishedReverie" },
    target: "damageBonus",
    value: { kind: "fixed", value: UNFINISHED_REVERIE_FULL_DAMAGE_BONUS }
  }
]
