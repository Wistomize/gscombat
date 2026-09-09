import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kavehDefinition } from "./definition.js"

export const kavehCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Kaveh",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "painted-dome-damage",
          id: "painted-dome",
          snapshotChecks: [
            { expectedCoefficient: 2.04, talentLevel: 1 },
            { expectedCoefficient: 3.672, talentLevel: 10 }
          ]
        }
      ],
      element: kavehDefinition.element,
      evaluator: "declared_direct",
      id: "kaveh.skill.painted_dome",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "painted-dome-damage",
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
      characterId: "Kaveh",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "painted-dome-initial-hit-damage",
          id: "painted-dome-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.6, talentLevel: 1 },
            { expectedCoefficient: 2.88, talentLevel: 10 }
          ]
        }
      ],
      element: kavehDefinition.element,
      evaluator: "declared_direct",
      id: "kaveh.burst.painted_dome.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "painted-dome-initial-hit-damage",
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
      characterId: "Kaveh",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "painted-dome-normal-attack-first-hit-damage",
          id: "painted-dome-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.761857, talentLevel: 1 },
            { expectedCoefficient: 1.505996, talentLevel: 10 }
          ]
        }
      ],
      element: kavehDefinition.element,
      evaluator: "declared_direct",
      id: "kaveh.burst.painted_dome.normal_attack.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "painted-dome-normal-attack-first-hit-damage",
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
      activation: "maximum_reachable",
      id: "kaveh.constellation.6.pairidaeza_dreams.light_of_pairidaeza",
      label: "天园的理想 · C6 繁绘隅穹期间普攻命中释放天园之光（61.8%攻击力草元素伤害）",
      source: { characterId: "Kaveh", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["kaveh.burst.painted_dome.normal_attack.first_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        canCrit: true,
        coefficient: { kind: "fixed", value: 0.618 },
        element: "dendro",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack"
      }
    }
  ],
  characterId: "Kaveh",
  metrics: [
    {
      actionId: "kaveh.burst.painted_dome.normal_attack.first_hit",
      characterId: "Kaveh",
      id: "kaveh.burst.painted_dome.normal_attack.first_hit",
      kind: "damage",
      label: "繁绘隅穹状态普攻一段（无反应）",
      sourceActionId: "kaveh.burst.painted_dome.normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Artistic Ingenuity's direct hit and Painted Dome's initial burst hit remain separately verified raw actions. The selected core action is Kaveh's first Normal Attack hit while Painted Dome is active, treated as one Dendro Normal Attack. At C6 and with its three-second trigger ready, the maximum-reachable snapshot appends one independently calculated 61.8% Attack Light of Pairidaeza Dendro event. Its accompanying Dendro-Core detonation is not invented without a configured core count or ownership. Neither direct hit presets a target aura or reaction. State duration, passive Elemental Mastery stacks, Dendro-Core self-healing, timing, and rotation remain outside this metric.",
  label: kavehDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
