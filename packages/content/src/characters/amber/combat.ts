import type { CharacterCombatCoverage } from "../../combat/types.js"

import { amberDefinition } from "./definition.js"

export const amberCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Amber",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.3612, talentLevel: 1 },
            { expectedCoefficient: 0.714, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "amber.normal.auto.first_hit",
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
      characterId: "Amber",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "baron-bunny-explosion-damage",
          id: "baron-bunny-explosion",
          snapshotChecks: [
            { expectedCoefficient: 1.232, talentLevel: 1 },
            { expectedCoefficient: 2.2176, talentLevel: 10 }
          ]
        }
      ],
      element: "pyro",
      evaluator: "declared_direct",
      id: "amber.skill.explosive_puppet.baron_bunny.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "baron-bunny-explosion-damage",
          parameterIndex: 1,
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
      characterId: "Amber",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "fully-charged-aimed-shot-damage",
          id: "fully-charged-aimed-shot",
          snapshotChecks: [
            { expectedCoefficient: 1.24, talentLevel: 1 },
            { expectedCoefficient: 2.232, talentLevel: 10 }
          ]
        }
      ],
      element: amberDefinition.element,
      evaluator: "declared_direct",
      id: "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "fully-charged-aimed-shot-damage",
          parameterIndex: 6,
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
      characterId: "Amber",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "fully-charged-aimed-shot-damage",
          id: "fully-charged-aimed-shot",
          snapshotChecks: [
            { expectedCoefficient: 1.24, talentLevel: 1 },
            { expectedCoefficient: 2.232, talentLevel: 10 }
          ]
        }
      ],
      element: amberDefinition.element,
      evaluator: "declared_direct",
      id: "amber.normal.sharpshooter.fully_charged.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "fully-charged-aimed-shot-damage",
          parameterIndex: 6,
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
      id: "amber.constellation.2.bunny_triggered.manual_baron_bunny_detonation.damage_bonus",
      label: "一触即发 · C2 满蓄力瞄准射击命中兔兔伯爵脚部并主动引爆（本次爆炸伤害加成200%）",
      source: { characterId: "Amber", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["amber.skill.explosive_puppet.baron_bunny.explosion"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 2 }
    },
    {
      activation: "active",
      id: "amber.constellation.6.wildfire.party_attack_percent",
      label: "箭雨施放后 · C6 疾如野火（全队攻击力提升，10秒）",
      source: { characterId: "Amber", kind: "character", minimumSourceConstellation: 6 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Amber",
  metrics: [
    {
      actionId: "amber.skill.explosive_puppet.baron_bunny.explosion",
      characterId: "Amber",
      id: "amber.skill.explosive_puppet.baron_bunny.explosion",
      kind: "damage",
      label: "爆弹玩偶 / 兔兔伯爵单次爆炸伤害（C0、无反应）",
      sourceActionId: "amber.skill.explosive_puppet.baron_bunny.explosion",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize",
      characterId: "Amber",
      id: "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize",
      kind: "damage",
      label: "神射手 / 满蓄力箭·水底蒸发",
      sourceActionId: "amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "amber.normal.sharpshooter.fully_charged.cryo_aura_melt",
      characterId: "Amber",
      id: "amber.normal.sharpshooter.fully_charged.cryo_aura_melt",
      kind: "damage",
      label: "神射手 / 满蓄力箭·冰底融化",
      sourceActionId: "amber.normal.sharpshooter.fully_charged.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One uninfused first normal hit and one Baron Bunny explosion are verified C0 actions. The selected core hits are the explosion, exactly Attack × skill[1] (123.2% Attack at Talent Level 1 and 221.76% at Level 10), and one fully charged Pyro aimed shot, Attack × auto[6] (124% Attack at Level 1 and 223.2% at Level 10) in the pinned 6.7 snapshot. Hydro-aura Vaporize and Cryo-aura Melt are mutually exclusive alternatives for that exact aimed-shot hit, not a sequence. At C2, a separately selected current-action snapshot means Amber's fully charged aimed shot already hit the foot of her Baron Bunny and manually detonated it: that one Baron Bunny explosion receives 200% Damage Bonus. It is a damage-bonus multiplier stage, not a separate hit or talent-multiplier increase; it never applies to the triggering aimed shot, a timed-out explosion, or another Amber's Bunny. It uses the configured build Crit Rate and Crit DMG; weak-point guaranteed crit is deliberately not assumed. C6's 15% party Attack bonus after Fiery Rain is an explicit current-action snapshot that can affect Amber or a teammate; it does not infer Fiery Rain casting, its ten-second window, timing, or a rotation. Its Movement SPD bonus is not a damage-stage effect. Baron Bunny deployment, Fiery Rain damage, A4's post-hit Attack bonus, infusions, external effects, remaining constellations, and all other character states remain excluded.",
  label: amberDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
