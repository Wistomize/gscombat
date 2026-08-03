import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kiraraDefinition } from "./definition.js"

export const kiraraCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Kirara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "meow-teorite-kick-tail-swipe-damage",
          id: "meow-teorite-kick-tail-swipe-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.04, talentLevel: 1 },
            { expectedCoefficient: 1.872, talentLevel: 10 }
          ]
        }
      ],
      element: kiraraDefinition.element,
      evaluator: "declared_direct",
      id: "kirara.skill.meow_teorite_kick.tail_swipe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "meow-teorite-kick-tail-swipe-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Kirara",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "secret-art-surprise-dispatch-initial-hit-damage",
          id: "secret-art-surprise-dispatch-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 5.7024, talentLevel: 1 },
            { expectedCoefficient: 10.26432, talentLevel: 10 }
          ]
        }
      ],
      element: kiraraDefinition.element,
      evaluator: "declared_direct",
      id: "kirara.burst.secret_art_surprise_dispatch.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "secret-art-surprise-dispatch-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Kirara",
      element: kiraraDefinition.element,
      id: "kirara.skill.meow_teorite_kick.curio_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "curio-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "curio-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "kirara.constellation.6.countless_sights_to_see.party_elemental_damage_bonus",
      label: "元素战技或元素爆发施放后 · C6 沿途百景会心（全队所有元素伤害加成，15秒）",
      source: { characterId: "Kirara", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] },
      value: { kind: "fixed", value: 0.12 }
    }
  ],
  characterId: "Kirara",
  metrics: [
    {
      characterId: "Kirara",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "curio-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 962.2313, talentLevel: 1 },
          { expectedValue: 2117.0693, talentLevel: 10 }
        ]
      },
      id: "kirara.skill.meow_teorite_kick.curio_shield.initial_absorption",
      kind: "scalar",
      label: "呜喵町飞足 / 猫又抓板护盾基础吸收量（C0、非草元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "curio-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.1, talentLevel: 1 },
          { expectedValue: 0.18, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "kirara.skill.meow_teorite_kick.curio_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "Meow-teorite Kick's Tail Swipe damage and Secret Art: Surprise Dispatch's initial hit are retained as verified lower-level actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but neither is a selected support output. The selected metric calculates one C0 initial Curio Shield's non-Dendro base absorption as max HP × skill[1] plus skill[2], before recipient Shield Strength; C3 adds three Skill levels. C6's 12% party elemental-damage bonus after an Elemental Skill or Burst is an explicit current-action snapshot for the seven elemental damage types, excluding Physical; it does not infer the trigger, its fifteen-second window, timing, or a rotation. Cat Grass Cardamom explosions, duration, and target count; Urgent Neko Parcel, stacked shield absorption, box-form duration and collisions, tail swipe and strike follow-ups; the 250% Dendro-damage absorption branch; the passive max-HP damage bonus; external infusions; other constellations including C1 additional cardamoms, C4 follow-up damage, and inferred C5 Burst levels; timing; and character states remain unmodeled.",
  label: kiraraDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
