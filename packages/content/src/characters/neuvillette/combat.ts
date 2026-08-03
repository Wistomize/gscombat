import type { CharacterCombatCoverage } from "../../combat/types.js"

import { neuvilletteDefinition } from "./definition.js"

export const neuvilletteCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Neuvillette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "o-tears-i-shall-repay-water-cascade-damage",
          id: "o-tears-i-shall-repay-water-cascade",
          snapshotChecks: [
            { expectedCoefficient: 0.12864, talentLevel: 1 },
            { expectedCoefficient: 0.231552, talentLevel: 10 }
          ]
        }
      ],
      element: neuvilletteDefinition.element,
      evaluator: "declared_direct",
      id: "neuvillette.skill.o_tears_i_shall_repay.water_cascade",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "o-tears-i-shall-repay-water-cascade-damage",
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
      characterId: "Neuvillette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "o-tides-i-have-returned-initial-wave-damage",
          id: "o-tides-i-have-returned-initial-wave",
          snapshotChecks: [
            { expectedCoefficient: 0.222578, talentLevel: 1 },
            { expectedCoefficient: 0.400641, talentLevel: 10 }
          ]
        }
      ],
      element: neuvilletteDefinition.element,
      evaluator: "declared_direct",
      id: "neuvillette.burst.o_tides_i_have_returned.initial_wave",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "o-tides-i-have-returned-initial-wave-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "charged",
      characterId: "Neuvillette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "equitable-judgment-continuous-damage",
          id: "equitable-judgment-tick",
          snapshotChecks: [
            { expectedCoefficient: 0.073186, talentLevel: 1 },
            { expectedCoefficient: 0.14467, talentLevel: 10 }
          ]
        }
      ],
      element: neuvilletteDefinition.element,
      evaluator: "declared_direct",
      id: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      intrinsicEffects: [
        {
          fixedValue: 0.3,
          kind: "flat",
          minimumSourceAscension: 4,
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "equitable-judgment-continuous-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "hp",
      scenarioParameters: [
        {
          defaultValue: 3,
          id: "past-draconic-glories-stack-count",
          label: "古海孑遗的权柄层数（不同水相关反应）",
          maximumValue: 3,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "past-draconic-glories-stack-count",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.1, parameterValue: 1 },
                { multiplier: 1.25, parameterValue: 2 },
                { multiplier: 1.6, parameterValue: 3 }
              ]
            },
            damagePartId: "equitable-judgment-tick",
            id: "equitable-judgment-tick",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "neuvillette.constellation.2.judicial_exhortation.full_past_draconic_glories.crit_damage",
      label: "律法的命诫 · C2 满3层遗龙之荣（衡平推裁暴击伤害提高42%）",
      source: { characterId: "Neuvillette", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["neuvillette.normal.charged_attack.equitable_judgment.single_tick"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.42 }
    }
  ],
  characterId: "Neuvillette",
  metrics: [
    {
      actionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      characterId: "Neuvillette",
      id: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      kind: "damage",
      label: "如水从平 / 衡平推裁单次命中",
      sourceActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "O Tears, I Shall Repay's Water Cascade and O Tides, I Have Returned's opening wave are verified as baseline C0 health-scaling Hydro hits. One Charged Attack: Equitable Judgment tick is verified as a hit-time Hydro hit scaling from max HP. Its selected 0–3 Past Draconic Glories stacks apply the documented 100/110/125/160% special multiplier, defaulting to three C0 stacks from distinct Hydro-related reactions. C2 is a separate explicit full-three-stack snapshot for the same tick and adds 42% Crit DMG; it does not derive the stack count from reactions. At ascension 4 and above, the metric also includes Discipline of the Supreme Judicator's conventional full 30% Hydro damage bonus without exposing current HP as a manual input. The burst excludes waterfalls and Sourcewater Droplets. The full beam duration and tick count, sourcewater absorption, HP restore/loss, reactions, C1/C6, timing outside the selected tick, and other character states remain unmodeled.",
  label: neuvilletteDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
