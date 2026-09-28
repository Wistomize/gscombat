import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

const ownPreparation = prepareWeaponEffect({ kind: "damage_hit", hitKinds: ["burst"], provider: "source", recipient: "source" }, "本人爆发命中后准备")
const ownHomework: CombatEffectLifecycle = { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceHomework: true }, explanation: "用户确认的装备者本人魔导资格" }

export const ATHAME_ARTIS_BURST_CRIT_DAMAGE = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const ATHAME_ARTIS_AFTER_BURST_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const ATHAME_ARTIS_MAGIC_AFTER_BURST_ATTACK_PERCENT = [0.15, 0.1875, 0.225, 0.2625, 0.3] as const
export const ATHAME_ARTIS_DAYLIGHT_BLADE_OTHER_CURRENT_CHARACTER_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const ATHAME_ARTIS_MAGIC_DAYLIGHT_BLADE_OTHER_CURRENT_CHARACTER_EXTRA_ATTACK_PERCENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed self and selected other-current-character contributions of Athame Artis. */
export const athameArtisCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.athame-artis.burst-crit-damage",
    label: "黑蚀 · 元素爆发造成的暴击伤害",
    source: { kind: "weapon", weaponId: "AthameArtis" },
    target: "critDamage",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "refinement_table", values: ATHAME_ARTIS_BURST_CRIT_DAMAGE }
  },
  {
    activation: "automatic",
    lifecycle: ownPreparation,
    id: "weapon.athame-artis.after-burst-hit.self-attack-percent",
    label: "黑蚀 · 元素爆发命中后的装备者攻击力",
    source: { kind: "weapon", weaponId: "AthameArtis" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ATHAME_ARTIS_AFTER_BURST_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [ownPreparation, ownHomework] },
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.athame-artis.magic-secret.after-burst-hit.self-extra-attack-percent",
    label: "黑蚀 · 魔导·秘仪下元素爆发命中后的装备者额外攻击力",
    source: { kind: "weapon", weaponId: "AthameArtis" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ATHAME_ARTIS_MAGIC_AFTER_BURST_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: ownPreparation,
    requiresRecipientOnField: true,
    id: "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
    label: "黑蚀 · 元素爆发命中后3秒内其他当前场上角色攻击力",
    source: { holder: "party_member", kind: "weapon", weaponId: "AthameArtis", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: ATHAME_ARTIS_DAYLIGHT_BLADE_OTHER_CURRENT_CHARACTER_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "all_of", alternatives: [ownPreparation, ownHomework] },
    requiresRecipientOnField: true,
    condition: { kind: "hexerei_secret_rite" },
    id: "weapon.athame-artis.magic-secret.daylight-blade.other-current-character.extra-attack-percent",
    label: "黑蚀 · 魔导·秘仪下元素爆发命中后3秒内其他当前场上角色额外攻击力",
    source: { holder: "party_member", kind: "weapon", weaponId: "AthameArtis", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: {
      kind: "refinement_table",
      values: ATHAME_ARTIS_MAGIC_DAYLIGHT_BLADE_OTHER_CURRENT_CHARACTER_EXTRA_ATTACK_PERCENT
    }
  }
]
