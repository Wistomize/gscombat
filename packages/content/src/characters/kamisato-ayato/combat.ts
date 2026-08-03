import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kamisatoAyatoDefinition } from "./definition.js"

export const kamisatoAyatoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "KamisatoAyato",
      damageKind: "direct",
      damageParts: [
        {
          id: "shunsuiken-first-hit",
          scalingTerms: [
            {
              coefficientParameterId: "shunsuiken-first-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.5289, talentLevel: 1 },
                { expectedCoefficient: 1.0455, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "namisen-stack-count",
              coefficientParameterId: "namisen-damage-increase-per-stack",
              snapshotChecks: [
                { expectedCoefficient: 0.005611, talentLevel: 1 },
                { expectedCoefficient: 0.011091, talentLevel: 10 }
              ],
              stat: "hp"
            }
          ]
        }
      ],
      element: kamisatoAyatoDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "shunsuiken-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "namisen-damage-increase-per-stack",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3, 4],
          defaultValue: 4,
          id: "namisen-stack-count",
          label: "当前浪闪层数",
          maximumValue: 4,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "kamisato_ayato.constellation.1.kyoika_fushi.low_hp_target.shunsuiken.damage_bonus",
      label: "镜华风姿 · C1 敌人生命值不高于50%（瞬水剑伤害提高40%）",
      source: { characterId: "KamisatoAyato", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "KamisatoAyato",
  metrics: [
    {
      actionId: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      characterId: "KamisatoAyato",
      id: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      kind: "damage",
      label: "神里流·镜花 / 四层浪闪瞬水剑首段（C0、无反应）",
      sourceActionId: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One C0 Shunsuiken first hit during Kamisato Art: Kyouka is the selected no-reaction Hydro metric. It uses skill[0] times Attack plus the selected Namisen stack count times skill[4] times max HP; C0 permits zero through four stacks and defaults to four. C1 can be selected as an explicit snapshot when the target is already at or below 50% HP and adds 40% Damage Bonus only to that Shunsuiken hit; the model does not infer target HP. The result is a current-action snapshot only: it does not generate Namisen, validate the Kyouka stance, model the stance duration, the dash and cast hit, C2/C6, burst-field effects, reactions, timing, or a rotation.",
  label: kamisatoAyatoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
