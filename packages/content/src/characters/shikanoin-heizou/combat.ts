import type { CharacterCombatCoverage } from "../../combat/types.js"

import { shikanoinHeizouDefinition } from "./definition.js"

export const shikanoinHeizouCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "ShikanoinHeizou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.374736, talentLevel: 1 },
            { expectedCoefficient: 0.674525, talentLevel: 10 }
          ]
        }
      ],
      element: shikanoinHeizouDefinition.element,
      evaluator: "declared_direct",
      id: "shikanoin_heizou.normal.auto.first_hit",
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
      characterId: "ShikanoinHeizou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "heartstopper-strike-tap-damage",
          id: "heartstopper-strike-tap",
          snapshotChecks: [
            { expectedCoefficient: 2.2752, talentLevel: 1 },
            { expectedCoefficient: 4.09536, talentLevel: 10 }
          ]
        }
      ],
      element: shikanoinHeizouDefinition.element,
      evaluator: "declared_direct",
      id: "shikanoin_heizou.skill.heartstopper_strike.tap",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "heartstopper-strike-tap-damage",
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
      characterId: "ShikanoinHeizou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "windmuster-kick-vacuum-slug-damage",
          id: "windmuster-kick-vacuum-slug",
          snapshotChecks: [
            { expectedCoefficient: 3.14688, talentLevel: 1 },
            { expectedCoefficient: 5.664384, talentLevel: 10 }
          ]
        }
      ],
      element: shikanoinHeizouDefinition.element,
      evaluator: "declared_direct",
      id: "shikanoin_heizou.burst.windmuster_kick.vacuum_slug",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "windmuster-kick-vacuum-slug-damage",
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
      characterId: "ShikanoinHeizou",
      damageKind: "direct",
      damageParts: [
        {
          id: "heartstopper-strike-four-declension-conviction",
          scalingTerms: [
            {
              coefficientParameterId: "heartstopper-strike-tap-damage",
              snapshotChecks: [
                { expectedCoefficient: 2.2752, talentLevel: 1 },
                { expectedCoefficient: 4.09536, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "declension-stack-count",
              coefficientParameterId: "heartstopper-strike-declension-damage-bonus-per-stack",
              snapshotChecks: [
                { expectedCoefficient: 0.5688, talentLevel: 1 },
                { expectedCoefficient: 1.02384, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "heartstopper-strike-conviction-damage-bonus",
              snapshotChecks: [
                { expectedCoefficient: 1.1376, talentLevel: 1 },
                { expectedCoefficient: 2.04768, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: shikanoinHeizouDefinition.element,
      evaluator: "declared_direct",
      id: "shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "heartstopper-strike-tap-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "heartstopper-strike-declension-damage-bonus-per-stack",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "heartstopper-strike-conviction-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [4],
          defaultValue: 4,
          id: "declension-stack-count",
          label: "变格层数（本指标固定四层）",
          maximumValue: 4,
          minimumValue: 4
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "shikanoin_heizou.constellation.6.arresting_mystery.four_declension_conviction.crit_rate",
      label: "奇想天开捕物帐 · C6 四层变格·正论暴击率提高16%",
      source: { characterId: "ShikanoinHeizou", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: {
        actionIds: ["shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.16 }
    },
    {
      activation: "automatic",
      id: "shikanoin_heizou.constellation.6.arresting_mystery.four_declension_conviction.crit_damage",
      label: "奇想天开捕物帐 · C6 四层变格·正论暴击伤害提高32%",
      source: { characterId: "ShikanoinHeizou", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.32 }
    }
  ],
  characterId: "ShikanoinHeizou",
  metrics: [
    {
      actionId: "shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction",
      characterId: "ShikanoinHeizou",
      id: "shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction",
      kind: "damage",
      label: "勠心拳 / 四层变格·正论（C0，无预设反应）",
      sourceActionId: "shikanoin_heizou.skill.heartstopper_strike.four_declension_conviction",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one Heartstopper Strike tap at zero Declension stacks, and Windmuster Kick's Vacuum Slug remain verified baseline C0 attack-scaling Anemo damage. The selected C0 metric is one Heartstopper Strike at exactly four Declension stacks with Conviction: skill[0] plus four times skill[1] plus skill[2], all times Attack. That is 568.8% Attack at Talent Level 1 and 1023.84% at Level 10. The fixed four-stack input does not infer stack generation, hold timing, or Conviction activation. Because the selected action already fixes all four Declension stacks, C6 automatically adds its corresponding 16% Crit Rate and 32% Crit DMG to that action only. It does not preset a target aura or reaction, so it excludes Windmuster Iris, its later elemental explosion, and target count. No external infusion, passives, other constellations, timing, external effects, or other character states are modeled.",
  label: shikanoinHeizouDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
