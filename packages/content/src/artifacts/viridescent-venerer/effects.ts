import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"

export const VIRIDESCENT_VENERER_ANEMO_DAMAGE_BONUS = 0.15
export const VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS = 0.6
export const VIRIDESCENT_VENERER_STELLAR_SWIRL_REACTION_DAMAGE_BONUS = 0.2
export const VIRIDESCENT_VENERER_SWIRLED_ELEMENT_RESISTANCE_REDUCTION = 0.4

const swirledElements = ["pyro", "hydro", "electro", "cryo"] as const

function resistancePreparation(element: typeof swirledElements[number]): CombatEffectLifecycle {
  const ordinary: CombatEffectLifecycle = {
    kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
      kind: "reaction_trigger", recipient: "source", provider: "source", reactionFamily: "swirl", counterpartElements: [element]
    } }, explanation: "装备者具备对应元素扩散资格，默认前台触发后退场保留；同元素减抗不叠加"
  }
  if (element !== "cryo") return ordinary
  return { kind: "any_of", alternatives: [{
    kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
      kind: "reaction_trigger", recipient: "source", provider: "source", reactionFamily: "stellar_swirl"
    } }, explanation: "装备者具备星扩散反应触发资格，默认前台触发后退场保留40%冰减抗；与冰扩散减抗同名不叠加"
  }, ordinary] }
}

/** Typed two-piece, Swirl reaction-damage, and selected resistance-reduction contributions of Viridescent Venerer. */
export const viridescentVenererCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.viridescent-venerer.2pc.anemo-damage-bonus",
    label: "翠绿之影 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ViridescentVenerer" },
    target: "damageBonus",
    targetFilter: { elements: ["anemo"] },
    value: { kind: "fixed", value: VIRIDESCENT_VENERER_ANEMO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus",
    lifecycle: { kind: "constant" },
    label: "翠绿之影 · 四件套（扩散反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ViridescentVenerer" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["swirl"] },
    value: { kind: "fixed", value: VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: { kind: "constant" },
    id: "artifact.viridescent-venerer.4pc.stellar-swirl.reaction-damage-bonus",
    label: "翠绿之影 · 四件套（星扩散反应伤害，前后台均保留）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ViridescentVenerer" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_swirl"] },
    value: { kind: "fixed", value: VIRIDESCENT_VENERER_STELLAR_SWIRL_REACTION_DAMAGE_BONUS }
  },
  ...swirledElements.map((element): CombatActionEffect => ({
    activation: "automatic",
    lifecycle: resistancePreparation(element),
    id: `artifact.viridescent-venerer.4pc.after-${element}-swirl.${element}-resistance-shred`,
    label: `翠绿之影 · 四件套（装备者扩散${
      { cryo: "冰", electro: "雷", hydro: "水", pyro: "火" }[element]
    }元素后）`,
    source: {
      holder: "party_member" as const,
      kind: "artifact_set" as const,
      minimumPieces: 4,
      setId: "ViridescentVenerer",
      resolveOneMatchingPartySource: true
    },
    target: "enemyResistanceReduction" as const,
    targetFilter: { elements: [element] },
    value: { kind: "fixed" as const, value: VIRIDESCENT_VENERER_SWIRLED_ELEMENT_RESISTANCE_REDUCTION }
  }))
]
