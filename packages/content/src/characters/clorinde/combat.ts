import type { CharacterCombatCoverage } from "../../combat/types.js"

import { clorindeDefinition } from "./definition.js"

export const clorindeCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Clorinde",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.540596, talentLevel: 1 },
            { expectedCoefficient: 1.06862, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "clorinde.normal.auto.first_hit",
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
      characterId: "Clorinde",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "night-vigil-normal-attack-damage",
          id: "night-vigil-normal-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.267632, talentLevel: 1 },
            { expectedCoefficient: 0.52904, talentLevel: 10 }
          ]
        }
      ],
      element: clorindeDefinition.element,
      evaluator: "declared_direct",
      id: "clorinde.skill.hunter_vigil.night_vigil.normal_attack",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-lawful-remuneration-crit-rate-per-stack",
          kind: "flat",
          label: "固有天赋 · 契令的酬偿",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.1, talentLevel: 1 }],
          target: "critRate",
          valueMultiplier: 2
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "night-vigil-normal-attack-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-lawful-remuneration-crit-rate-per-stack",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Clorinde",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "last-lightfall-single-hit-damage",
          id: "last-lightfall-single-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.2688, talentLevel: 1 },
            { expectedCoefficient: 2.28384, talentLevel: 10 }
          ]
        }
      ],
      element: "electro",
      evaluator: "declared_direct",
      id: "clorinde.burst.last_lightfall.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "last-lightfall-single-hit-damage",
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
      activation: "automatic",
      id: "clorinde.constellation.6.hence_never_shall_hope_perish.after_hunter_vigil.crit_rate",
      label: "「为此，勿将希望弃扬」· C6 施放狩夜之巡后12秒内暴击率提升10%",
      source: { characterId: "Clorinde", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: {
        actionIds: ["clorinde.skill.hunter_vigil.night_vigil.normal_attack"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "automatic",
      id: "clorinde.constellation.6.hence_never_shall_hope_perish.after_hunter_vigil.crit_damage",
      label: "「为此，勿将希望弃扬」· C6 施放狩夜之巡后12秒内暴击伤害提升70%",
      source: { characterId: "Clorinde", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["clorinde.skill.hunter_vigil.night_vigil.normal_attack"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.7 }
    }
  ],
  characterId: "Clorinde",
  metrics: [
    {
      actionId: "clorinde.skill.hunter_vigil.night_vigil.normal_attack",
      characterId: "Clorinde",
      id: "clorinde.skill.hunter_vigil.night_vigil.normal_attack",
      kind: "damage",
      label: "狩夜之巡 / 夜巡状态普通攻击（无反应）",
      sourceActionId: "clorinde.skill.hunter_vigil.night_vigil.normal_attack",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One uninfused first normal-attack hit and one Last Lightfall hit remain verified baseline attack-scaling actions. The selected core action is exactly one Normal Attack during Hunter's Vigil's Night Vigil state: Attack × skill[0]. At Ascension 4 or above, the conventional full two-stack Lawful Remuneration state adds 20% Critical Rate. Because the action itself is inside the post-cast Night Vigil state, C6 automatically adds its twelve-second 10% Crit Rate and 70% Crit DMG bonuses. The separately triggered 200% Attack Glimbright-Shade pursuit is not part of an ordinary Night Vigil shot and remains outside this one-hit metric. The action declares no target aura or reaction and does not infer Bond of Life changes, Impale the Night, pursuit triggers, or a rotation.",
  label: clorindeDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
