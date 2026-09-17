import type { CombatActionEffect } from "../../combat/types.js"

export const CRIMSON_WITCH_OF_FLAMES_PYRO_DAMAGE_BONUS = 0.15
export const CRIMSON_WITCH_OF_FLAMES_SKILL_CAST_EXTRA_PYRO_DAMAGE_BONUS_PER_STACK = 0.075
export const CRIMSON_WITCH_OF_FLAMES_VAPORIZE_AND_MELT_REACTION_BONUS = 0.15
export const CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS = 0.4

const skillCastStacks = [1, 2, 3] as const

function createSkillCastStackEffect(stackCount: (typeof skillCastStacks)[number]): CombatActionEffect {
  return {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "retain_on_exit",
      trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
        kind: "skill_cast", recipient: "source", provider: "source",
        opportunityWindow: { seconds: 10, measure: "casts", minimum: stackCount, ...(stackCount < 3 ? { maximum: stackCount } : {}) }
      } }, explanation: "按装备者十秒内战技冷却、充能/连段及合法祭礼重置推导，最多三层；持续命中不增加施放次数"
    },
    exclusivity: { group: "crimson-witch-of-flames-skill-cast", variant: `${stackCount}-stack` },
    id: `artifact.crimson-witch-of-flames.4pc.skill-cast.${stackCount}-stack.extra-pyro-damage-bonus`,
    label: `炽烈的炎之魔女 · 十秒内可施放战技自动准备${stackCount}层（冷却/充能/连段/重置）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
    target: "damageBonus",
    targetFilter: { elements: ["pyro"] },
    value: { kind: "fixed", value: CRIMSON_WITCH_OF_FLAMES_SKILL_CAST_EXTRA_PYRO_DAMAGE_BONUS_PER_STACK * stackCount }
  }
}

/** Typed two-piece, ordinary-reaction, and selected skill-cast stack contributions of Crimson Witch of Flames. */
export const crimsonWitchOfFlamesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus",
    label: "炽烈的炎之魔女 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "CrimsonWitchOfFlames" },
    target: "damageBonus",
    targetFilter: { elements: ["pyro"] },
    value: { kind: "fixed", value: CRIMSON_WITCH_OF_FLAMES_PYRO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
    lifecycle: { kind: "constant" },
    label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
    target: "amplifyingReactionBonus",
    targetFilter: {
      amplifyingReactionKinds: ["melt_forward", "melt_reverse", "vaporize_forward", "vaporize_reverse"]
    },
    value: { kind: "fixed", value: CRIMSON_WITCH_OF_FLAMES_VAPORIZE_AND_MELT_REACTION_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus",
    lifecycle: { kind: "constant" },
    label: "炽烈的炎之魔女 · 四件套（超载、燃烧、烈绽放反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["overload", "burning", "burgeon"] },
    value: { kind: "fixed", value: CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS }
  },
  ...skillCastStacks.map(createSkillCastStackEffect)
]
