import type { CharacterCombatCoverage } from "../../combat/types.js"

import { doriDefinition } from "./definition.js"

export const doriCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Dori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.90214, talentLevel: 1 },
            { expectedCoefficient: 1.7833, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "dori.normal.auto.first_hit",
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
      characterId: "Dori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "troubleshooter-cannon-initial-shot-damage",
          id: "troubleshooter-cannon-initial-shot",
          snapshotChecks: [
            { expectedCoefficient: 1.4728, talentLevel: 1 },
            { expectedCoefficient: 2.65104, talentLevel: 10 }
          ]
        }
      ],
      element: doriDefinition.element,
      evaluator: "declared_direct",
      id: "dori.skill.spirit_warding_lamp_troubleshooter_cannon.initial_shot",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "troubleshooter-cannon-initial-shot-damage",
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
      characterId: "Dori",
      element: doriDefinition.element,
      id: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "jinni-continuous-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "jinni-continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Dori",
  metrics: [
    {
      characterId: "Dori",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "jinni-continuous-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 641.97955, talentLevel: 1 },
          { expectedValue: 1412.4622, talentLevel: 10 }
        ]
      },
      id: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "卡萨扎莱宫的无微不至 / 镇灵单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "jinni-continuous-healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.0667, talentLevel: 1 },
          { expectedValue: 0.12006, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为与镇灵相连的当前场上角色" }
      ],
      scalingStat: "hp",
      sourceActionId: "dori.burst.alcazarzarays_exactitude.jinni.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit and one initial Spirit-Warding Lamp: Troubleshooter Cannon shot remain verified lower-level damage actions, but neither is a selected display metric because Dori's role-correct output is healing. The selected support metric is one Jinni healing tick for the current on-field character linked to Jinni: Dori's max HP × burst[1] + burst[2], then Dori's Healing Bonus and that recipient's Incoming Healing Bonus. The pinned 6.7 snapshot gives burst[1] as 0.0667 at Talent Level 1 and 0.12006 at Level 10, and burst[2] as 641.97955 and 1412.4622; the fixed Genshin Optimizer sheet maps those two parameters to Jinni's heal multiplier and flat healing value. C3 adds three Burst levels. The metric emits no damage or reaction event and excludes connector damage, Elemental Energy restoration, duration and tick count, C4's conditional Healing Bonus and Energy Recharge, C6 healing, passives, other constellations, external effects, timing, and all other character states.",
  label: doriDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
