import type { CharacterCombatCoverage } from "../../combat/types.js"

import { fischlDefinition } from "./definition.js"

export const fischlCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44118, talentLevel: 1 },
            { expectedCoefficient: 0.8721, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "fischl.normal.auto.first_hit",
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
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "nightrider-oz-level-one-attack-damage",
          id: "nightrider-oz-level-one-bolt",
          snapshotChecks: [
            { expectedCoefficient: 0.888, talentLevel: 1 },
            { expectedCoefficient: 1.5984, talentLevel: 10 }
          ]
        }
      ],
      element: fischlDefinition.element,
      evaluator: "declared_direct",
      id: "fischl.skill.nightrider.oz.level_one_bolt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "nightrider-oz-level-one-attack-damage",
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
      characterId: "Fischl",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "midnight-phantasmagoria-initial-lightning-damage",
          id: "midnight-phantasmagoria-initial-lightning",
          snapshotChecks: [
            { expectedCoefficient: 2.08, talentLevel: 1 },
            { expectedCoefficient: 3.744, talentLevel: 10 }
          ]
        }
      ],
      element: fischlDefinition.element,
      evaluator: "declared_direct",
      id: "fischl.burst.midnight_phantasmagoria.initial_lightning",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "midnight-phantasmagoria-initial-lightning-damage",
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
  characterId: "Fischl",
  metrics: [
    {
      actionId: "fischl.skill.nightrider.oz.level_one_bolt",
      characterId: "Fischl",
      id: "fischl.skill.nightrider.oz.level_one_bolt",
      kind: "damage",
      label: "夜巡影翼 / 奥兹单次攻击（后台，C0，无预设反应）",
      sourceActionId: "fischl.skill.nightrider.oz.level_one_bolt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, one level-one Oz bolt, and one Midnight Phantasmagoria lightning are verified as baseline C0 attack-scaling damage. The selected Oz metric reuses one ordinary post-deployment Oz attack against a nearby target; Nightrider's Oz snapshot is taken at the Elemental Skill cast, and no reaction is predeclared. It excludes the summoning hit, later recurrence and duration, target selection, energy availability, and all other timing. A1, A4, C1, C2, C3, C4, C6, other constellations, external infusions, and reaction-trigger conditions are not included. The burst excludes Oz's later presence and attacks, traversal through enemies, C4 additional damage, constellations, reactions, timing, energy availability, and character states.",
  label: fischlDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
