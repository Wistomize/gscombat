import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xiaoDefinition } from "./definition.js"

export const xiaoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xiao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lemniscatic-wind-cycling-damage",
          id: "lemniscatic-wind-cycling",
          snapshotChecks: [
            { expectedCoefficient: 2.528, talentLevel: 1 },
            { expectedCoefficient: 4.5504, talentLevel: 10 }
          ]
        }
      ],
      element: xiaoDefinition.element,
      evaluator: "declared_direct",
      id: "xiao.skill.lemniscatic_wind_cycling",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lemniscatic-wind-cycling-damage",
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
      characterId: "Xiao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.27544, talentLevel: 1 },
            { expectedCoefficient: 0.49141, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xiao.normal.auto.first_hit",
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
      attackKind: "plunge",
      characterId: "Xiao",
      damageKind: "direct",
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      damageParts: [
        {
          coefficientParameterId: "high-plunge-damage",
          id: "bane-of-all-evil-high-plunge",
          snapshotChecks: [
            { expectedCoefficient: 1.21088, talentLevel: 1 },
            { expectedCoefficient: 2.16032, talentLevel: 10 }
          ]
        }
      ],
      element: xiaoDefinition.element,
      evaluator: "declared_direct",
      id: "xiao.burst.bane_of_all_evil.high_plunge",
      intrinsicEffects: [
        {
          coefficientParameterId: "bane-of-all-evil-damage-bonus",
          kind: "flat",
          snapshotChecks: [
            { expectedCoefficient: 0.5845, talentLevel: 1 },
            { expectedCoefficient: 0.952, talentLevel: 10 }
          ],
          target: "damageBonus"
        },
        {
          coefficientParameterId: "a1-bane-damage-bonus-per-stage",
          kind: "flat",
          minimumSourceAscension: 1,
          scenarioParameterMultiplier: {
            parameterId: "a1-bane-extra-stage-count",
            values: [
              { multiplier: 1, parameterValue: 0 },
              { multiplier: 2, parameterValue: 1 },
              { multiplier: 3, parameterValue: 2 },
              { multiplier: 4, parameterValue: 3 },
              { multiplier: 5, parameterValue: 4 }
            ]
          },
          snapshotChecks: [{ expectedCoefficient: 0.05, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "high-plunge-damage",
          parameterIndex: 8,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "bane-of-all-evil-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive1",
          id: "a1-bane-damage-bonus-per-stage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3, 4],
          defaultValue: 0,
          id: "a1-bane-extra-stage-count",
          label: "A1 靖妖傩舞额外层数（每3秒+5%）",
          maximumValue: 4,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  characterId: "Xiao",
  metrics: [
    {
      actionId: "xiao.burst.bane_of_all_evil.high_plunge",
      characterId: "Xiao",
      id: "xiao.burst.bane_of_all_evil.high_plunge",
      kind: "damage",
      label: "靖妖傩舞 / 高空下落攻击（C0，无预设反应）",
      sourceActionId: "xiao.burst.bane_of_all_evil.high_plunge",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Lemniscatic Wind Cycling hit and one uninfused first normal hit remain verified baseline C0 attack-scaling damage. The selected core metric is one High Plunge during Bane of All Evil: Attack × auto[8], with burst[0] added in the damage-bonus multiplier rather than the base coefficient. The pinned snapshot gives auto[8] as 121.088% at Normal Talent Level 1 and 216.032% at Level 10, and burst[0] as 58.45% at Burst Talent Level 1 and 95.2% at Level 10. At ascension 1+, the action-owned hand-selected A1 extra-stage count adds 5–25% all damage from 0–4 additional three-second stages; A4 remains excluded. It does not preset a target aura or reaction. The action excludes low plunge and collision damage, burst HP drain, constellations, charge availability, timing, external effects, and rotation behavior.",
  label: xiaoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
