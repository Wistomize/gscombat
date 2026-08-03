import type { CharacterCombatCoverage } from "../../combat/types.js"

import { sethosDefinition } from "./definition.js"

export const sethosCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Sethos",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ancient-rite-the-thundering-sand-skill-damage",
          id: "ancient-rite-the-thundering-sand-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.156, talentLevel: 1 },
            { expectedCoefficient: 2.0808, talentLevel: 10 }
          ]
        }
      ],
      element: sethosDefinition.element,
      evaluator: "declared_direct",
      id: "sethos.skill.ancient_rite_the_thundering_sand.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "ancient-rite-the-thundering-sand-skill-damage",
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
      attackKind: "charged",
      characterId: "Sethos",
      damageKind: "direct",
      damageParts: [
        {
          id: "shadowpiercing-shot",
          scalingTerms: [
            {
              coefficientParameterId: "shadowpiercing-shot-attack-scaling",
              snapshotChecks: [
                { expectedCoefficient: 1.4, talentLevel: 1 },
                { expectedCoefficient: 2.52, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "shadowpiercing-shot-elemental-mastery-scaling",
              snapshotChecks: [
                { expectedCoefficient: 1.3456, talentLevel: 1 },
                { expectedCoefficient: 2.42208, talentLevel: 10 }
              ],
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: sethosDefinition.element,
      evaluator: "declared_direct",
      id: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "shadowpiercing-shot-attack-scaling",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "shadowpiercing-shot-elemental-mastery-scaling",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "sethos.constellation.1.seal_of_the_forbidden_rite.shadowpiercing_shot.crit_rate",
      label: "C1 · 封龛谒灵歌：贯影箭暴击率 +15%",
      source: { characterId: "Sethos", kind: "character", minimumSourceConstellation: 1 },
      target: "critRate",
      targetFilter: {
        actionIds: ["sethos.normal.royal_reed_archery.shadowpiercing_shot"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      exclusivity: { group: "sethos-c2-electro-damage-bonus-stacks", variant: "one-stack" },
      id: "sethos.constellation.2.secret_rite_papyrus.one_stack.electro_damage_bonus",
      label: "寂秘纸草经 · C2 当前1层（雷元素伤害加成提高15%，每层独立计时）",
      source: { characterId: "Sethos", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      exclusivity: { group: "sethos-c2-electro-damage-bonus-stacks", variant: "two-stacks" },
      id: "sethos.constellation.2.secret_rite_papyrus.two_stacks.electro_damage_bonus",
      label: "寂秘纸草经 · C2 当前2层（雷元素伤害加成提高30%，每层独立计时）",
      source: { characterId: "Sethos", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["electro"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  characterId: "Sethos",
  metrics: [
    {
      actionId: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
      characterId: "Sethos",
      id: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
      kind: "damage",
      label: "王家苇箭术 / 贯影箭单次伤害（C0、无反应）",
      sourceActionId: "sethos.normal.royal_reed_archery.shadowpiercing_shot",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Ancient Rite: The Thundering Sand's skill damage remains a verified baseline C0 attack-scaling Electro hit. The selected C0 metric is one fixed Shadowpiercing Shot from Royal Reed Archery, modeled as its two base terms before shared damage multipliers: 140% ATK + 134.56% Elemental Mastery at talent level 1, and 252% ATK + 242.208% Elemental Mastery at level 10. C1 automatically adds 15% Crit Rate only to this action. C2 supplies two mutually exclusive manually selected snapshots: one current independent stack gives 15% Electro damage bonus, and two give 30%. It does not infer the three possible triggers, individual stack expiration, Energy consumption, reduced charge time, how the shot was reached, a target aura, reactions, passives, other constellations, external effects, timing, or rotation behavior.",
  label: sethosDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
