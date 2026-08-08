import type { CharacterCombatCoverage } from "../../combat/types.js"

import { gamingDefinition } from "./definition.js"

export const gamingCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      attackKind: "plunge",
      characterId: "Gaming",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "plunging-attack-charmed-cloudstrider-damage",
          id: "plunging-attack-charmed-cloudstrider",
          snapshotChecks: [
            { expectedCoefficient: 2.304, talentLevel: 1 },
            { expectedCoefficient: 4.1472, talentLevel: 10 }
          ]
        }
      ],
      element: gamingDefinition.element,
      evaluator: "declared_direct",
      id: "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-charmed-cloudstrider-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 祥烟瑞气",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.2, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "plunging-attack-charmed-cloudstrider-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-charmed-cloudstrider-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Gaming",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "suannis-gilded-dance-man-chai-smash-damage",
          id: "suannis-gilded-dance-man-chai-smash",
          snapshotChecks: [
            { expectedCoefficient: 3.704, talentLevel: 1 },
            { expectedCoefficient: 6.6672, talentLevel: 10 }
          ]
        }
      ],
      element: gamingDefinition.element,
      evaluator: "declared_direct",
      id: "gaming.burst.suannis_gilded_dance.man_chai_smash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "suannis-gilded-dance-man-chai-smash-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "gaming.constellation.2.plum_blossom_step.overheal.attack_percent",
      label: "步踏梅花 · C2 治疗量溢出后（嘉明攻击力提高20%，5秒）",
      source: { characterId: "Gaming", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      id: "gaming.constellation.6.charmed_cloudstrider.crit_damage",
      label: "C6 · 踏云献瑞暴击伤害 +40%",
      source: { characterId: "Gaming", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider"],
        attackKinds: ["plunge"]
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "automatic",
      id: "gaming.constellation.6.charmed_cloudstrider.crit_rate",
      label: "C6 · 踏云献瑞暴击率 +20%",
      source: { characterId: "Gaming", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: {
        actionIds: ["gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider"],
        attackKinds: ["plunge"]
      },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Gaming",
  metrics: [
    {
      actionId: "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider",
      characterId: "Gaming",
      id: "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider",
      kind: "damage",
      label: "瑞兽登高楼 / 踏云献瑞单次下落命中（C0，无反应）",
      sourceActionId: "gaming.skill.bestial_ascent.plunging_attack_charmed_cloudstrider",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Charmed Cloudstrider plunging attack hit and Suanni's Gilded Dance's startup Man Chai smash are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected metric is one Charmed Cloudstrider plunge against one target: Skill parameter skill[0], or 230.4% Attack at Talent Level 1 and 414.72% at Level 10. At Ascension 4 or above, it includes Charmed Cloudstrider's conventional full 20% Damage Bonus without asking for a current HP snapshot. C2 can be selected as a manual snapshot after a healing instance overflows and adds 20% Attack only to Gaming for five seconds. C3/C5 use the shared source-mapped talent levels, and C6 adds its unconditional +20% Crit Rate and +40% Crit DMG only to Charmed Cloudstrider. It declares no target aura, Vaporize, Melt, or other fixed reaction. HP cost, Suanni's Gilded Dance state, later Man Chai returns and attacks, healing, external infusions, timing, energy availability, and other character states remain unmodeled.",
  label: gamingDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
