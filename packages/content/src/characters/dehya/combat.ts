import type { CharacterCombatCoverage } from "../../combat/types.js"

import { dehyaDefinition } from "./definition.js"

export const dehyaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Dehya",
      damageKind: "direct",
      damageParts: [
        {
          id: "flame-manes-fist",
          scalingTerms: [
            {
              coefficientParameterId: "flame-manes-fist-attack",
              snapshotChecks: [
                { expectedCoefficient: 0.987, talentLevel: 1 },
                { expectedCoefficient: 1.7766, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "flame-manes-fist-hp",
              snapshotChecks: [
                { expectedCoefficient: 0.01692, talentLevel: 1 },
                { expectedCoefficient: 0.030456, talentLevel: 10 }
              ],
              stat: "hp"
            }
          ]
        }
      ],
      element: dehyaDefinition.element,
      evaluator: "declared_direct",
      id: "dehya.burst.flame_manes_fist",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "flame-manes-fist-attack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "flame-manes-fist-hp",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "dehya.constellation.1.the-brilliant-sun.max_hp_percent",
      label: "皎洁之火铓辉灿漫 · C1 生命值上限提高20%",
      source: { characterId: "Dehya", kind: "character", minimumSourceConstellation: 1 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      id: "dehya.constellation.1.the-brilliant-sun.flame_manes_fist.hp_additive_damage",
      label: "皎洁之火铓辉灿漫 · C1 炎啸狮子咬（生命值上限6%同一命中加算）",
      source: { characterId: "Dehya", kind: "character", minimumSourceConstellation: 1 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["dehya.burst.flame_manes_fist"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.06 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    },
    {
      activation: "automatic",
      id: "dehya.constellation.6.the-burning-claws.flame_manes_fist.crit_rate",
      label: "燎燃利爪裂帛斫金 · C6 炎啸狮子咬暴击率提高10%",
      source: { characterId: "Dehya", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: {
        actionIds: ["dehya.burst.flame_manes_fist"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "active",
      id: "dehya.constellation.6.the-burning-claws.full_stacks.flame_manes_fist.crit_damage",
      label: "燎燃利爪裂帛斫金 · C6 炽鬃拳已暴击4次（炎啸狮子咬暴击伤害提高60%）",
      source: { characterId: "Dehya", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["dehya.burst.flame_manes_fist"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.6 }
    }
  ],
  characterId: "Dehya",
  metrics: [
    {
      actionId: "dehya.burst.flame_manes_fist",
      characterId: "Dehya",
      id: "dehya.burst.flame_manes_fist",
      kind: "damage",
      label: "炎啸狮子咬 / 炽鬃之拳单次命中（C0、无反应）",
      sourceActionId: "dehya.burst.flame_manes_fist",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Flame-Mane's Fist hit is the selected no-reaction, dual-scaling Pyro damage metric. It uses attack and max-health terms: 98.7% ATK + 1.692% Max HP at talent level 1, and 177.66% ATK + 3.0456% Max HP at level 10. C1 automatically adds 20% Max HP and, only to this hit, one 6% Max HP same-hit term. C6 automatically adds 10% Crit Rate to this hit; its separately selected full-stack snapshot represents four prior Flame-Mane's Fist critical hits in the same Lioness' Bite and adds 60% Crit DMG. Neither burst sequencing, stack generation, C6 duration extension, Incineration Drive, Molten Inferno, elemental aura and reactions, external buffs, timing, nor rotation behavior is inferred.",
  label: dehyaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
