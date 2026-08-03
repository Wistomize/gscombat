import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kamisatoAyakaDefinition } from "./definition.js"

export const kamisatoAyakaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-hyouka-damage",
          id: "kamisato-art-hyouka",
          snapshotChecks: [
            { expectedCoefficient: 2.392, talentLevel: 1 },
            { expectedCoefficient: 4.3056, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.skill.kamisato_art_hyouka",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "kamisato-art-hyouka-damage",
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
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-soumetsu-cutting-damage",
          id: "kamisato-art-soumetsu-cutting",
          snapshotChecks: [
            { expectedCoefficient: 1.123, talentLevel: 1 },
            { expectedCoefficient: 2.0214, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-senho-cryo-damage-bonus",
          kind: "flat",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.18, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kamisato-art-soumetsu-cutting-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-senho-cryo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-soumetsu-bloom-damage",
          id: "kamisato-art-soumetsu-bloom",
          snapshotChecks: [
            { expectedCoefficient: 1.6845, talentLevel: 1 },
            { expectedCoefficient: 3.0321, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-senho-cryo-damage-bonus",
          kind: "flat",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.18, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kamisato-art-soumetsu-bloom-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-senho-cryo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "KamisatoAyaka",
  actionEffects: [
    {
      activation: "active",
      id: "kamisato_ayaka.constellation.4.soumetsu.enemy_defense_reduction",
      label: "目标减防已生效：神里流·霜灭命中后 · C4 防御力降低（30%，6秒；不作用于触发命中）",
      source: { characterId: "KamisatoAyaka", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.3 }
    }
  ],
  metrics: [
    {
      actionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      characterId: "KamisatoAyaka",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      kind: "damage",
      label: "神里流·霜灭 / 单次切割伤害（C0、无反应）",
      sourceActionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      characterId: "KamisatoAyaka",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      kind: "damage",
      label: "神里流·霜灭 / 末端绽放伤害（C0、无反应）",
      sourceActionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected C0, no-reaction, attack-scaling Cryo metrics are one Kamisato Art: Soumetsu cutting hit, burst[0] (112.3% Attack at Talent Level 1; 202.14% at Level 10), and its one terminal bloom, burst[1] (168.45% Attack at Talent Level 1; 303.21% at Level 10). Each is an independent single hit: the evaluator does not sum Soumetsu's nineteen cutting hits, infer its timing, or simulate a rotation. At Ascension 4 or above, both conventional metrics include the 18% Cryo Damage Bonus after Senho's Cryo application. Kamisato Art: Hyouka remains a separately verified baseline hit. At C4, the separately selected target-debuff snapshot means the target was already struck by Soumetsu: Defense is reduced by 30% for 6 seconds, never for the triggering hit itself. The metrics otherwise exclude elemental aura and reactions, the skill's following normal/charged-attack passive, other constellations, external buffs, and other character states.",
  label: kamisatoAyakaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
