import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lyneyDefinition } from "./definition.js"

export const lyneyCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.38786, talentLevel: 1 },
            { expectedCoefficient: 0.7667, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "lyney.normal.auto.first_hit",
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
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "bewildering-lights-base-hit-damage",
          id: "bewildering-lights-base-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.672, talentLevel: 1 },
            { expectedCoefficient: 3.0096, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.skill.bewildering_lights.base_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "bewildering-lights-base-hit-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      attackKind: "charged",
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prop-arrow-damage",
          id: "prop-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.728, talentLevel: 1 },
            { expectedCoefficient: 3.1104, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "prop-arrow-damage",
          parameterIndex: 10,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      attackKind: "charged",
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prop-arrow-damage",
          id: "prop-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.728, talentLevel: 1 },
            { expectedCoefficient: 3.1104, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "prop-arrow-damage",
          parameterIndex: 10,
          source: "talent",
          talentSlot: "normal"
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
      id: "lyney.constellation.2.conclusive_ovation.full_stacks.crit_damage",
      label: "巧言贴耳的诱引 · C2 在场满3层集意专注（林尼暴击伤害提高60%）",
      source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "lyney.constellation.4.well_versed_well_rehearsed.pyro_charged_attack.pyro_resistance_reduction",
      label: "熟稔习练的筹谋 · C4 火元素重击已命中目标（火元素抗性降低 20%，6秒）",
      source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Lyney",
  metrics: [
    {
      actionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      characterId: "Lyney",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      kind: "damage",
      label: "普通攻击·迫牌易位 / 二段蓄力 Prop Arrow·水底蒸发",
      sourceActionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      characterId: "Lyney",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      kind: "damage",
      label: "普通攻击·迫牌易位 / 二段蓄力 Prop Arrow·冰底融化",
      sourceActionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal hit and Bewildering Lights base hit remain verified raw actions. The selected core hit is the Pyro Prop Arrow from one second-stage charged attack: Attack × auto[10], or 172.8% Attack at Normal Attack Level 1 and 311.04% at Level 10 in the pinned 6.7 snapshot. Hydro-aura Vaporize and Cryo-aura Melt are mutually exclusive alternatives for that exact projectile, not a sequence. C2 can be selected as a manual full three-stack Concentration snapshot while Lyney remains on field and adds 60% Crit DMG only to Lyney; the model does not infer its two-second acquisition cadence. C4 can be selected as an explicit current-action snapshot after the user confirms that Lyney's Pyro charged attack already hit the target: the target's Pyro Resistance is reduced by 20%. It does not apply that debuff to the triggering hit or infer the hit, target, six-second duration, timing, or a rotation. The action otherwise excludes the separately created Grin-Malkin Hat or its Pyrotechnic Strike, A1's HP-consumption-conditioned 80% Attack addendum, A4's party-Pyro bonus, Prop Surplus skill damage, recovery, infusions, external effects, other constellations, and character states.",
  label: lyneyDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
