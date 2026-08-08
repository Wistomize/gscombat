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
  characterId: "Kaveh",
  metrics: [
    {
      actionId: "kaveh.burst.painted_dome.normal_attack.first_hit",
      characterId: "Kaveh",
      id: "kaveh.burst.painted_dome.normal_attack.first_hit",
      kind: "damage",
      label: "繁绘隅穹状态普攻一段（C0，无反应）",
      sourceActionId: "kaveh.burst.painted_dome.normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Artistic Ingenuity's direct hit and Painted Dome's initial burst hit remain separately verified raw actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 core action is exactly Kaveh's first Normal Attack hit while the Painted Dome burst state is already active: Attack × auto[0], treated as one Dendro Normal Attack. The pinned values are 76.1857% Attack at Normal Talent Level 1 and 150.5996% at Level 10. It assumes the burst state is manually active and declares no target aura or reaction. No Dendro Core or Bloom damage bonus is attached to this direct normal hit. It excludes Artistic Ingenuity's immediate Dendro Core bursts, normal-attack follow-ups, Painted Dome's initial hit, state duration and attack-area changes, Dendro Core bonus, interruption resistance, passive Elemental Mastery stacks and Dendro Core self-healing, constellations, reactions, timing, external effects, and other character states.",
  label: kavehDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
