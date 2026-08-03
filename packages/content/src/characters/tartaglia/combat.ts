import type { CharacterCombatCoverage } from "../../combat/types.js"

import { tartagliaDefinition } from "./definition.js"

export const tartagliaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Tartaglia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.4128, talentLevel: 1 },
            { expectedCoefficient: 0.816, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "tartaglia.normal.auto.first_hit",
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
      characterId: "Tartaglia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "foul-legacy-raging-tide-stance-activation-damage",
          id: "foul-legacy-raging-tide-stance-activation",
          snapshotChecks: [
            { expectedCoefficient: 0.72, talentLevel: 1 },
            { expectedCoefficient: 1.296, talentLevel: 10 }
          ]
        }
      ],
      element: tartagliaDefinition.element,
      evaluator: "declared_direct",
      id: "tartaglia.skill.foul_legacy_raging_tide.stance_activation",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "foul-legacy-raging-tide-stance-activation-damage",
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
      attackKind: "normal",
      characterId: "Tartaglia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "foul-legacy-raging-tide-melee-normal-first-hit-damage",
          id: "foul-legacy-raging-tide-melee-normal-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.38872, talentLevel: 1 },
            { expectedCoefficient: 0.7684, talentLevel: 10 }
          ]
        }
      ],
      element: tartagliaDefinition.element,
      evaluator: "declared_direct",
      id: "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "foul-legacy-raging-tide-melee-normal-first-hit-damage",
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
      characterId: "Tartaglia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "havoc-obliteration-melee-burst-damage",
          id: "havoc-obliteration-melee-burst",
          snapshotChecks: [
            { expectedCoefficient: 4.64, talentLevel: 1 },
            { expectedCoefficient: 8.352, talentLevel: 10 }
          ]
        }
      ],
      element: tartagliaDefinition.element,
      evaluator: "declared_direct",
      id: "tartaglia.burst.havoc_obliteration.melee_burst",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "havoc-obliteration-melee-burst-damage",
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
      amplifyingReaction: { bonus: 0, kind: "vaporize_forward" },
      characterId: "Tartaglia",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "havoc-obliteration-melee-burst-damage",
          id: "havoc-obliteration-melee-burst",
          snapshotChecks: [
            { expectedCoefficient: 4.64, talentLevel: 1 },
            { expectedCoefficient: 8.352, talentLevel: 10 }
          ]
        }
      ],
      element: tartagliaDefinition.element,
      evaluator: "declared_direct",
      id: "tartaglia.burst.havoc_obliteration.melee_burst.pyro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "havoc-obliteration-melee-burst-damage",
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
  characterId: "Tartaglia",
  metrics: [
    {
      actionId: "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit",
      characterId: "Tartaglia",
      id: "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit",
      kind: "damage",
      label: "魔王武装·狂澜 / 近战一段（C0，无预设反应）",
      sourceActionId: "tartaglia.skill.foul_legacy_raging_tide.melee_normal.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "tartaglia.burst.havoc_obliteration.melee_burst.pyro_aura_vaporize",
      characterId: "Tartaglia",
      id: "tartaglia.burst.havoc_obliteration.melee_burst.pyro_aura_vaporize",
      kind: "damage",
      label: "极恶技·尽灭闪 / 近战火底蒸发",
      sourceActionId: "tartaglia.burst.havoc_obliteration.melee_burst.pyro_aura_vaporize",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and Foul Legacy: Raging Tide's immediate stance-activation hit remain verified raw hits. The selected C0 core metrics are one Melee Stance Normal Attack first hit, skill[1] or 38.872% Attack at Talent Level 1 and 76.84% at Level 10, and one Havoc: Obliteration Melee Burst hit, burst[0] or 464.0% Attack at Level 1 and 835.2% at Level 10. The latter declares Hydro-on-Pyro forward Vaporize: the target must already have a Pyro aura, and its setup, aura consumption, and timing are not inferred. Melee Stance charged attacks, stance duration and cooldown, Riptide application and all Flash, Burst, and Slash payloads, Ranged Burst and Riptide Blast, energy return, passive Normal Attack level and Riptide-duration effects, external infusions, all constellations including inferred C3 Skill and C5 Burst levels, and character states remain unmodeled.",
  label: tartagliaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
