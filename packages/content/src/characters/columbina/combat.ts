import type { CharacterCombatCoverage } from "../../combat/types.js"

import { columbinaDefinition } from "./definition.js"

export const columbinaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.46792, talentLevel: 1 },
            { expectedCoefficient: 0.842256, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.normal.auto.first_hit",
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
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "eternal-tides-skill-damage",
          id: "eternal-tides-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.1672, talentLevel: 1 },
            { expectedCoefficient: 0.30096, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.skill.eternal_tides.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "eternal-tides-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Columbina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "eternal-tides-gravity-ripple-continuous-damage",
          id: "eternal-tides-gravity-ripple-tick",
          snapshotChecks: [
            { expectedCoefficient: 0.0936, talentLevel: 1 },
            { expectedCoefficient: 0.16848, talentLevel: 10 }
          ]
        }
      ],
      element: columbinaDefinition.element,
      evaluator: "declared_direct",
      id: "columbina.skill.eternal_tides.gravity_ripple.tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "eternal-tides-gravity-ripple-continuous-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "columbina.constellation.2.illumine_the_night.gravity_interference.radiant_moon.hp_percent",
      label: "为夜增辉，与君遥伴 · C2 引力干涉触发后的皎辉（生命值上限提高40%，8秒）",
      source: { characterId: "Columbina", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: {
        actionIds: ["columbina.skill.eternal_tides.gravity_ripple.tick"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "columbina.constellation.6.follow_the_moon.lunar_reaction_hydro.crit_damage",
      label: "夜昏且暗，且随月光 · C6 月之领域内含水元素的月曜反应后（水元素伤害暴击伤害提高80%，8秒）",
      source: { characterId: "Columbina", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.8 }
    }
  ],
  characterId: "Columbina",
  metrics: [
    {
      actionId: "columbina.skill.eternal_tides.gravity_ripple.tick",
      characterId: "Columbina",
      id: "columbina.skill.eternal_tides.gravity_ripple.tick",
      kind: "damage",
      label: "万古潮汐 / 引力涟漪单次伤害（C0、无反应）",
      sourceActionId: "columbina.skill.eternal_tides.gravity_ripple.tick",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Eternal Tides initial hit and one Gravity Ripple tick are verified C0 max-health-scaling Hydro actions. The selected no-reaction metric is one Gravity Ripple tick against one target: Skill parameter skill[1], or 9.36% Max HP at Talent Level 1 and 16.848% at Level 10. C2 can be selected after Gravity Interference triggers while its eight-second Radiant Moon state remains: it adds 40% Max HP to this tick only. C6 can be selected after a Moon Reaction involving Hydro triggers within the Lunar Domain: it adds 80% Crit DMG to Hydro damage for eight seconds, without inferring either prerequisite or the separate non-Hydro teammate branches. It excludes initial-hit aggregation, Gravity Ripple cadence and target count, Moon Sign and Lunar-reaction-derived Gravity and its damage variants, elemental aura and reactions, passives, other constellations, external buffs, timing, and rotation behavior. One first normal-attack hit remains separately verified as baseline C0 damage.",
  label: columbinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
