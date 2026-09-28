import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const WOLFS_GRAVESTONE_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const WOLFS_GRAVESTONE_LOW_HEALTH_TARGET_PARTY_ATTACK_PERCENT = [0.4, 0.5, 0.6, 0.7, 0.8] as const

/** Typed self and selected team contributions of Wolf's Gravestone to maintained core actions. */
const authoredEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.wolfs-gravestone.attack-percent",
    label: "狼的末路 · 攻击力",
    source: { kind: "weapon", weaponId: "WolfsGravestone" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WOLFS_GRAVESTONE_ATTACK_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.wolfs-gravestone.after-low-health-target-hit.party-attack-percent",
    label: "狼的末路 · 命中生命值低于30%的敌人后12秒内（当前动作前已生效）",
    source: { holder: "party_member", kind: "weapon", weaponId: "WolfsGravestone", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WOLFS_GRAVESTONE_LOW_HEALTH_TARGET_PARTY_ATTACK_PERCENT }
  }
]

export const wolfsGravestoneCombatActionEffects: readonly CombatActionEffect[] = authoredEffects.flatMap((effect) =>
  effect.activation === "active" ? withWeaponToggle(effect, "wolfs-gravestone-team-attack", "全队加攻", false) : [effect]
)
