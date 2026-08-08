import type { CharacterCombatCoverage } from "../../combat/types.js"

import { wriothesleyDefinition } from "./definition.js"

export const wriothesleyCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.533596, talentLevel: 1 },
            { expectedCoefficient: 1.054782, talentLevel: 10 }
          ]
        }
      ],
      element: wriothesleyDefinition.element,
      evaluator: "declared_direct",
      id: "wriothesley.normal.auto.first_hit",
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
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "darkgold-wolfbite-single-hit-damage",
          id: "darkgold-wolfbite-single-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.272, talentLevel: 1 },
            { expectedCoefficient: 2.2896, talentLevel: 10 }
          ]
        }
      ],
      element: "cryo",
      evaluator: "declared_direct",
      id: "wriothesley.burst.darkgold_wolfbite.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "darkgold-wolfbite-single-hit-damage",
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
  characterId: "Wriothesley",
  metrics: [
    {
      actionId: "wriothesley.burst.darkgold_wolfbite.single_hit",
      characterId: "Wriothesley",
      id: "wriothesley.burst.darkgold_wolfbite.single_hit",
      kind: "damage",
      label: "黑金狼噬 / 单次主段命中（C0，无反应）",
      sourceActionId: "wriothesley.burst.darkgold_wolfbite.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Darkgold Wolfbite main hit are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Darkgold Wolfbite main hit against one target: Burst parameter burst[0], or 127.2% Attack at Talent Level 1 and 228.96% at Level 10. It declares no target aura, Melt, Freeze, or other fixed reaction. The other four main hits, Flowing Blade burst[1], Icefang Rush's Cryo infusion and HP cost, A1/A4, HP statuses, all constellations including inferred C5 Burst levels, external infusions, timing, and character states remain unmodeled.",
  label: wriothesleyDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
