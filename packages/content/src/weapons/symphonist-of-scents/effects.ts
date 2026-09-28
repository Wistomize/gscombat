import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatCapabilityRequirement, CombatEffectLifecycle } from "../../combat/capabilities.js"

function afterOwnHealing(capability: CombatCapabilityRequirement): CombatEffectLifecycle {
  return { kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "any", capability }, explanation: "本人可治疗该对象；满血治疗尝试亦可，不改变实际前后台" }
}

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
    activation: "automatic",
    lifecycle: { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceFieldPresence: "off_field" }, explanation: "仅装备者实际后台时生效" },
    id: "weapon.symphonist-of-scents.off-field.extra-attack-percent",
    label: "香韵奏者 · 后台时的额外攻击力",
    source: { kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_OFF_FIELD_EXTRA_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "any_of", alternatives: [
      afterOwnHealing({ kind: "healing", provider: "source", recipient: "source" }),
      afterOwnHealing({ kind: "healing", provider: "source", recipient: "recipient", recipientOtherThanSource: true })
    ] },
    id: "weapon.symphonist-of-scents.sweet-echoes.self.attack-percent",
    exclusivity: { group: "symphonist-sweet-echoes", variant: "self", automaticPriority: "refinement" },
    label: "香韵奏者 · 持有者治疗后自身甘美回奏（3秒内）",
    source: { kind: "weapon", weaponId: "SymphonistOfScents" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_SWEET_ECHOES_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: afterOwnHealing({ kind: "healing", provider: "source", recipient: "recipient" }),
    id: "weapon.symphonist-of-scents.sweet-echoes.healed-recipient.attack-percent",
    exclusivity: { group: "symphonist-sweet-echoes", variant: "recipient", automaticPriority: "refinement" },
    label: "香韵奏者 · 持有者治疗当前主角色后的甘美回奏（3秒内）",
    source: { holder: "party_member", kind: "weapon", weaponId: "SymphonistOfScents", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: SYMPHONIST_OF_SCENTS_SWEET_ECHOES_ATTACK_PERCENT }
  }
]
