import type { CharacterCombatCoverage } from "../../combat/types.js"

import { huTaoDefinition } from "./definition.js"

export const huTaoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "HuTao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.468864, talentLevel: 1 },
            { expectedCoefficient: 0.836496, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "hu_tao.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "HuTao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spirit-soother-base-hit-damage",
          id: "spirit-soother-base-hit",
          snapshotChecks: [
            { expectedCoefficient: 3.03272, talentLevel: 1 },
            { expectedCoefficient: 4.93952, talentLevel: 10 }
          ]
        }
      ],
      element: huTaoDefinition.element,
      evaluator: "declared_direct",
      id: "hu_tao.burst.spirit_soother.base_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "spirit-soother-base-hit-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      attackKind: "charged",
      cappedStatToAttackConversion: {
        capRatioParameterId: "paramita-papilio-max-attack-increase",
        capRatioSnapshotChecks: [
          { expectedCoefficient: 4, talentLevel: 1 },
          { expectedCoefficient: 4, talentLevel: 10 }
        ],
        ratioParameterId: "paramita-papilio-attack-increase",
        ratioSnapshotChecks: [
          { expectedCoefficient: 0.03841, talentLevel: 1 },
          { expectedCoefficient: 0.06256, talentLevel: 10 }
        ],
        scalingStat: "hp"
      },
      characterId: "HuTao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "paramita-papilio-charged-attack-multiplier",
          id: "paramita-papilio-charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.859584, talentLevel: 1 },
            { expectedCoefficient: 1.533576, talentLevel: 10 }
          ]
        }
      ],
      element: huTaoDefinition.element,
      evaluator: "declared_direct",
      id: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sanguine-rouge-pyro-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 血之灶火",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.33, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "paramita-papilio-charged-attack-multiplier",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "paramita-papilio-attack-increase",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "paramita-papilio-max-attack-increase",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-sanguine-rouge-pyro-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      attackKind: "charged",
      cappedStatToAttackConversion: {
        capRatioParameterId: "paramita-papilio-max-attack-increase",
        capRatioSnapshotChecks: [
          { expectedCoefficient: 4, talentLevel: 1 },
          { expectedCoefficient: 4, talentLevel: 10 }
        ],
        ratioParameterId: "paramita-papilio-attack-increase",
        ratioSnapshotChecks: [
          { expectedCoefficient: 0.03841, talentLevel: 1 },
          { expectedCoefficient: 0.06256, talentLevel: 10 }
        ],
        scalingStat: "hp"
      },
      characterId: "HuTao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "paramita-papilio-charged-attack-multiplier",
          id: "paramita-papilio-charged-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.859584, talentLevel: 1 },
            { expectedCoefficient: 1.533576, talentLevel: 10 }
          ]
        }
      ],
      element: huTaoDefinition.element,
      evaluator: "declared_direct",
      id: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sanguine-rouge-pyro-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 血之灶火",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.33, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "paramita-papilio-charged-attack-multiplier",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "skill",
          id: "paramita-papilio-attack-increase",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "paramita-papilio-max-attack-increase",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-sanguine-rouge-pyro-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "hu_tao.constellation.4.garden_of_eternal_rest.blood_blossom_defeated.party_crit_rate",
      label: "伴君眠花房 · C4 血梅香敌人被击败后队友暴击率提高（12%，15秒）",
      source: { characterId: "HuTao", kind: "character", minimumSourceConstellation: 4 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 0.12 }
    },
    {
      activation: "active",
      id: "hu_tao.constellation.6.butterflys_rest.post_trigger.crit_rate",
      label: "幽蝶能留一缕芳 · C6 已触发后的10秒内（胡桃暴击率提高100%）",
      source: { characterId: "HuTao", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 1 }
    }
  ],
  characterId: "HuTao",
  metrics: [
    {
      actionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
      characterId: "HuTao",
      id: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
      kind: "damage",
      label: "蝶引来生 / 重击·水底蒸发",
      sourceActionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt",
      characterId: "HuTao",
      id: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt",
      kind: "damage",
      label: "蝶引来生 / 重击·冰底融化",
      sourceActionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected C0 core action is one Paramita Papilio Pyro charged hit. Its pre-multiplier is auto[6] × [Attack + min(HP × skill[1], base Attack × skill[6])]: auto[6] is 0.859584 at Normal Attack Level 1 and 1.533576 at Level 10; skill[1] is 0.03841 and 0.06256; skill[6] is 4.0 at both Skill Levels 1 and 10. Two mutually exclusive target-aura alternatives reuse the same single hit: Hydro aura produces Pyro-on-Hydro Vaporize and Cryo aura produces Pyro-on-Cryo Melt. They do not form a sequence or rotation. At Ascension 4 or above, the conventional low-HP Sanguine Rouge state adds 33% Pyro Damage Bonus without a current-HP input. C4 can be selected as an explicit current-action snapshot after an enemy marked by Hu Tao's Blood Blossom is defeated: nearby teammates other than Hu Tao gain 12% Crit Rate. C6 is another explicit snapshot only after its low-HP or lethal-damage trigger has already occurred; it gives Hu Tao 100% Crit Rate for the following ten seconds and not the triggering hit. The model does not infer the mark, defeat, trigger, range, duration, timing, or a rotation. Blood Blossom's delayed ticks, C1 stamina behavior, other passives, other constellations, external buffs, and all other character states remain excluded. Spirit Soother's baseline hit and an uninfused normal hit remain available as separately verified lower-level actions.",
  label: huTaoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
