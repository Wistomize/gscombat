import type { CombatActionEffect } from "../../combat/types.js"

export const CRIMSON_WITCH_OF_FLAMES_PYRO_DAMAGE_BONUS = 0.15
export const CRIMSON_WITCH_OF_FLAMES_SKILL_CAST_EXTRA_PYRO_DAMAGE_BONUS_PER_STACK = 0.075
export const CRIMSON_WITCH_OF_FLAMES_VAPORIZE_AND_MELT_REACTION_BONUS = 0.15
export const CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS = 0.4

const skillCastStacks = [1, 2, 3] as const

function createSkillCastStackEffect(stackCount: (typeof skillCastStacks)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "crimson-witch-of-flames-skill-cast", variant: `${stackCount}-stack` },
    id: `artifact.crimson-witch-of-flames.4pc.skill-cast.${stackCount}-stack.extra-pyro-damage-bonus`,
    label: `炽烈的炎之魔女 · 当前核心动作前已持有${stackCount}层元素战技施放后的二件套额外火元素伤害（10秒内）`,
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
    label: "炽烈的炎之魔女 · 四件套（超载、燃烧、烈绽放反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "CrimsonWitchOfFlames" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["overload", "burning", "burgeon"] },
    value: { kind: "fixed", value: CRIMSON_WITCH_OF_FLAMES_TRANSFORMATIVE_REACTION_DAMAGE_BONUS }
  },
  ...skillCastStacks.map(createSkillCastStackEffect)
]
