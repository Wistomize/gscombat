import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"

const elementalHitPreparation: CombatEffectLifecycle = {
  kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
  trigger: { event: "capability", sourceFieldPresence: "any", capability: {
    kind: "damage_hit", provider: "source", recipient: "source", elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"]
  } }, explanation: "装备者自身可造成元素伤害，默认取得崇信；前后台均生效，同种月辉去重"
}

export const SILKEN_MOONS_SERENADE_ENERGY_RECHARGE = 0.2
export const SILKEN_MOONS_SERENADE_INITIAL_MOONSIGN_PARTY_ELEMENTAL_MASTERY = 60
export const SILKEN_MOONS_SERENADE_FULL_MOONSIGN_PARTY_ELEMENTAL_MASTERY = 120
export const SILKEN_MOONS_SERENADE_MOONGLEAM_LUNAR_REACTION_DAMAGE_BONUS = 0.1

/** Typed two-piece energy recharge contribution of Silken Moon's Serenade to maintained core actions. */
export const silkenMoonsSerenadeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.silken-moons-serenade.2pc.energy-recharge",
    label: "纺月的夜歌 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "SilkenMoonsSerenade" },
    target: "energyRecharge",
    value: { kind: "fixed", value: SILKEN_MOONS_SERENADE_ENERGY_RECHARGE }
  },
  {
    activation: "automatic",
    lifecycle: elementalHitPreparation,
    condition: { kind: "moonsign_level", minimum: "nascent_gleam", maximum: "nascent_gleam" },
    exclusivity: { group: "silken-moons-serenade-moonsign", variant: "initial" },
    id: "artifact.silken-moons-serenade.4pc.moonlit-glow.initial-moonsign.party-elemental-mastery",
    label: "纺月的夜歌 · 月辉明光·崇信（初辉，造成元素伤害后，8秒内）队伍元素精通",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "SilkenMoonsSerenade", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "fixed", value: SILKEN_MOONS_SERENADE_INITIAL_MOONSIGN_PARTY_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: elementalHitPreparation,
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    exclusivity: { group: "silken-moons-serenade-moonsign", variant: "full" },
    id: "artifact.silken-moons-serenade.4pc.moonlit-glow.full-moonsign.party-elemental-mastery",
    label: "纺月的夜歌 · 月辉明光·崇信（满辉，造成元素伤害后，8秒内）队伍元素精通",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "SilkenMoonsSerenade", resolveOneMatchingPartySource: true },
    target: "elementalMastery",
    value: { kind: "fixed", value: SILKEN_MOONS_SERENADE_FULL_MOONSIGN_PARTY_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    lifecycle: elementalHitPreparation,
    condition: { kind: "moonsign_level", minimum: "nascent_gleam" },
    id: "artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus",
    label: "纺月的夜歌 · 月辉明光·崇信（月曜反应伤害）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "SilkenMoonsSerenade", resolveOneMatchingPartySource: true },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_bloom", "lunar_charged", "lunar_crystallize"] },
    value: { kind: "fixed", value: SILKEN_MOONS_SERENADE_MOONGLEAM_LUNAR_REACTION_DAMAGE_BONUS }
  }
]
