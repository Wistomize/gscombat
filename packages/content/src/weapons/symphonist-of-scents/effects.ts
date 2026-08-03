import type { CombatActionEffect } from "../../combat/types.js"

export const SYMPHONIST_OF_SCENTS_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const SYMPHONIST_OF_SCENTS_OFF_FIELD_EXTRA_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const SYMPHONIST_OF_SCENTS_SWEET_ECHOES_ATTACK_PERCENT = [0.32, 0.4, 0.48, 0.56, 0.64] as const

/** Typed automatic and selected Sweet Echoes attack contributions of Symphonist of Scents. */
export const symphonistOfScentsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.symphonist-of-scents.attack-percent",
    label: "香韵奏者 · 攻击力",
    source: { kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.symphonist-of-scents.off-field.extra-attack-percent",
    label: "香韵奏者 · 后台时的额外攻击力",
    source: { kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_OFF_FIELD_EXTRA_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.symphonist-of-scents.sweet-echoes.self.attack-percent",
    label: "香韵奏者 · 持有者治疗后自身甘美回奏（3秒内）",
    source: { kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_SWEET_ECHOES_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent",
    label: "香韵奏者 · 持有者治疗当前主角色后的甘美回奏（3秒内）",
    source: { holder: "party_member", kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_SWEET_ECHOES_ATTACK_PERCENT }
  }
]
