import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kaedeharaKazuhaDefinition } from "./definition.js"

export const kaedeharaKazuhaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "chihayaburu-press-skill-damage",
          id: "chihayaburu-press-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.92, talentLevel: 1 },
            { expectedCoefficient: 3.456, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.skill.chihayaburu.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "chihayaburu-press-skill-damage",
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
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kazuha-slash-initial-slash-damage",
          id: "kazuha-slash-initial-slash",
          snapshotChecks: [
            { expectedCoefficient: 2.624, talentLevel: 1 },
            { expectedCoefficient: 4.7232, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.burst.kazuha_slash.initial_slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kazuha-slash-initial-slash-damage",
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
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
      label: "风物之诗咏 · 对应元素伤害加成",
      source: { characterId: "KaedeharaKazuha", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro", "hydro", "electro", "cryo"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.0004 } }
    },
    {
      activation: "active",
      id: "kaedehara_kazuha.constellation.2.yamaarashi_tailwind.field.elemental_mastery",
      label: "山岚残芯 · C2 流风秋野持续期间且角色位于其中（元素精通提高200点）",
      source: { characterId: "KaedeharaKazuha", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 200 }
    }
  ],
  characterId: "KaedeharaKazuha",
  metrics: [
    {
      characterId: "KaedeharaKazuha",
      id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
      kind: "scalar",
      label: "风物之诗咏 / 对应元素伤害加成",
      recipientRequirements: [],
      ratio: 0.0004,
      scalingStat: "elementalMastery",
      semantic: "damage_bonus",
      sourceActionId: "kaedehara_kazuha.skill.chihayaburu.press",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "Chihayaburu's press damage and Kazuha Slash's initial Anemo slash are verified as baseline C0 attack-scaling Anemo hits. The selected support profile exposes Poetics of Fuubutsu's 0.04% corresponding-element damage bonus per point of Kazuha's Elemental Mastery after he triggers Swirl, without converting it into recipient damage. The swirled element and its eight-second active window remain explicit effect-state choices. C2 is an explicit current-action snapshot after the user confirms Kazuha's field remains active and the evaluated on-field character is inside it; it adds 200 Elemental Mastery to Kazuha or that on-field recipient without inferring field location or duration. The burst excludes its damage-over-time ticks, conversion bonus damage, Swirl damage, other constellations, duration, energy availability, and other character states. Hold damage, Midare Ranzan, and absorption remain unmodeled.",
  label: kaedeharaKazuhaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
