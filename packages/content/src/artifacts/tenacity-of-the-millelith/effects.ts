import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"

export const TENACITY_OF_THE_MILLELITH_TWO_PIECE_HP_PERCENT = 0.2
export const TENACITY_OF_THE_MILLELITH_PARTY_ATTACK_PERCENT = 0.2

/** Both party attack and recipient shield strength use the same prepared skill-hit qualification. */
export const tenacityPreparation: CombatEffectLifecycle = {
  kind: "conditional", preparation: "qualified_or_selected", retention: "retain_on_exit",
  trigger: { event: "capability", sourceFieldPresence: "any", capability: {
    kind: "damage_hit", recipient: "source", provider: "source", hitKinds: ["skill"]
  } },
  defaultCapability: { kind: "damage_hit", recipient: "source", provider: "source", hitKinds: ["skill"], sustained: true },
  explanation: "实际站位下具备持续战技命中能力时默认生效；仅单次命中需显式选择，队友不能代为触发"
}

/** Typed two-piece and selected team-window four-piece contributions of Tenacity of the Millelith. */
export const tenacityOfTheMillelithCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.tenacity-of-the-millelith.2pc.hp-percent",
    label: "千岩牢固 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "TenacityOfTheMillelith" },
    target: "hpPercent",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_TWO_PIECE_HP_PERCENT }
  },
  {
    activation: "active",
    selectionMode: "optional",
    lifecycle: tenacityPreparation,
    id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-attack-percent",
    label: "千岩牢固 · 四件套（队伍中装备者元素战技命中后3秒内）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "TenacityOfTheMillelith", resolveOneMatchingPartySource: true },
    target: "attackPercent",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_PARTY_ATTACK_PERCENT }
  }
]
