import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xingqiuDefinition } from "./definition.js"

export const xingqiuCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xingqiu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "first-hit-multiplier",
          id: "first-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.68, talentLevel: 1 },
            { expectedCoefficient: 3.024, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "second-hit-multiplier",
          id: "second-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.912, talentLevel: 1 },
            { expectedCoefficient: 3.4416, talentLevel: 10 }
          ]
        }
      ],
      element: xingqiuDefinition.element,
      evaluator: "declared_direct",
      id: "xingqiu.skill.fatal_rainscreen",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "second-hit-multiplier",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_forward" },
      characterId: "Xingqiu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "first-hit-multiplier",
          id: "first-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.68, talentLevel: 1 },
            { expectedCoefficient: 3.024, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "second-hit-multiplier",
          id: "second-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.912, talentLevel: 1 },
            { expectedCoefficient: 3.4416, talentLevel: 10 }
          ]
        }
      ],
      element: xingqiuDefinition.element,
      evaluator: "declared_direct",
      id: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      intrinsicEffects: [
        {
          fixedValue: 0.2,
          kind: "flat",
          minimumSourceAscension: 4,
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "first-hit-multiplier",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "second-hit-multiplier",
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
      characterId: "Xingqiu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "rain-sword-damage",
          id: "rain-sword",
          snapshotChecks: [
            { expectedCoefficient: 0.54272, talentLevel: 1 },
            { expectedCoefficient: 0.976896, talentLevel: 10 }
          ]
        }
      ],
      element: xingqiuDefinition.element,
      evaluator: "declared_direct",
      id: "xingqiu.burst.raincutter.rain_sword.single_volley",
      intrinsicEffects: [
        {
          fixedValue: 0.2,
          kind: "flat",
          minimumSourceAscension: 4,
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "rain-sword-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [2, 3, 5],
          defaultValue: 3,
          id: "rain-sword-hit-count",
          label: "本次雨帘剑数量",
          maximumValue: 5,
          minimumSourceConstellationByValue: [{ minimumSourceConstellation: 6, value: 5 }],
          minimumValue: 2
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "rain-sword",
            hitCount: { kind: "scenario_parameter", parameterId: "rain-sword-hit-count" },
            id: "rain-sword-volley",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Xingqiu",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.46612, talentLevel: 1 },
            { expectedCoefficient: 0.9214, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xingqiu.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "xingqiu.raincutter.c2.hydro_resistance_shred",
      label: "古华剑·裁雨留虹的剑雨命中后 · C2 水元素抗性降低",
      source: { characterId: "Xingqiu", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "active",
      id: "xingqiu.raincutter.c4.fatal_rainscreen.damage_bonus",
      label: "古华剑·裁雨留虹持续期间 · C4 画雨笼山伤害提升",
      source: { characterId: "Xingqiu", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "xingqiu.skill.fatal_rainscreen",
          "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize"
        ]
      },
      value: { kind: "fixed", value: 0.5 }
    }
  ],
  characterId: "Xingqiu",
  metrics: [
    {
      actionId: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      characterId: "Xingqiu",
      id: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      kind: "damage",
      label: "画雨笼山 / 双段火底蒸发",
      sourceActionId: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "xingqiu.burst.raincutter.rain_sword.single_volley",
      characterId: "Xingqiu",
      id: "xingqiu.burst.raincutter.rain_sword.single_volley",
      kind: "damage",
      label: "古华剑·裁雨留虹 / 一次雨帘剑齐射（手填数量）",
      sourceActionId: "xingqiu.burst.raincutter.rain_sword.single_volley",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The two Fatal Rainscreen hits are verified as a baseline direct action. A separate double Pyro-aura action declares both hits as Hydro-on-Pyro Vaporizes; it requires two correctly timed Pyro applications with no interfering aura and does not model the setup itself. At ascension 4+, the reviewed fixed A4 20% Hydro bonus is included for both selected E and Q metrics; the pinned local passive table is empty, so this is retained as an explicit source-reviewed constant rather than a fabricated parameter reference. One Raincutter coordinated-attack volley is burst[0] Hydro damage per Rain Sword, evaluated at hit time and multiplied by a caller-selected current sword count of two or three, plus the five-sword third volley at C6. That input is a manual snapshot and does not infer its sequence or cadence. One uninfused normal first hit is separately verified as baseline Physical damage. C2 Hydro resistance reduction after a Rain Sword hit and C4 Fatal Rainscreen damage bonus while Raincutter remains active are explicit current-action snapshots. Rain Sword damage reduction/healing, Raincutter triggering and cadence, elemental infusions, the Pyro-application setup, and other conditional effects remain in progress.",
  label: xingqiuDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
