import type { CombatActionEffect } from "../../combat/types.js"

export const VOURUKASHAS_GLOW_HP_PERCENT = 0.2
export const VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS = 0.1
export const VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS_PER_DAMAGE_TAKEN_STACK = 0.08

const damageTakenStackCounts = [0, 1, 2, 3, 4, 5] as const
const stackEffectIds = damageTakenStackCounts.map((count) =>
  `artifact.vourukashas-glow.4pc.taking-damage.${count}-stack.skill-burst-damage-bonus`)

function createDamageTakenEffect(stackCount: (typeof damageTakenStackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    selectionMode: "optional",
    lifecycle: {
      kind: "conditional", preparation: stackCount === 5 ? "qualified_or_selected" : "selected",
      defaultCapability: { kind: "damage_taken", recipient: "source", provider: "source", sustained: true },
      manualAlternatives: stackEffectIds,
      retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" },
      explanation: "自身持续承伤机制默认五层；其他默认零层，显式层数优先，前后台均保留"
    },
    exclusivity: { group: "vourukashas-glow-taking-damage", variant: `${stackCount}-stack` },
    id: `artifact.vourukashas-glow.4pc.taking-damage.${stackCount}-stack.skill-burst-damage-bonus`,
    label: `花海甘露之光 · 四件套（受伤${stackCount}层后的元素战技与元素爆发伤害）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "VourukashasGlow" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: {
      kind: "fixed",
      value: VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS_PER_DAMAGE_TAKEN_STACK * stackCount
    }
  }
}

/** Typed two-piece and current-action damage-taken snapshots of Vourukasha's Glow. */
export const vourukashasGlowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.vourukashas-glow.2pc.hp-percent",
    label: "花海甘露之光 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "VourukashasGlow" },
    target: "hpPercent",
    value: { kind: "fixed", value: VOURUKASHAS_GLOW_HP_PERCENT }
  },
  {
    activation: "automatic",
    id: "artifact.vourukashas-glow.4pc.skill-burst-damage-bonus",
    lifecycle: { kind: "constant" },
    label: "花海甘露之光 · 四件套（基础元素战技与元素爆发伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "VourukashasGlow" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill", "burst"] },
    value: { kind: "fixed", value: VOURUKASHAS_GLOW_SKILL_BURST_DAMAGE_BONUS }
  },
  ...damageTakenStackCounts.map(createDamageTakenEffect)
]
